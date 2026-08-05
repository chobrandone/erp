import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { formatDocNumber } from "@/lib/pdf/docNumber";

// Replays offline write operations queued on a device back to the server.
// Idempotent: records use client-generated ids, so replaying the same op twice
// is safe. Applies the approved conflict rules per entity.
//
// Op shape: { opId, entity, type, id, data, updatedAt }
type Op = {
  opId: string;
  entity: string;
  type: "create" | "update" | "delete";
  id: string;
  data?: Record<string, unknown>;
  updatedAt?: string; // ISO time the change was made on the device
};

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const ops: Op[] = Array.isArray(body?.ops) ? body.ops : [];
  const results: Array<Record<string, unknown>> = [];

  for (const op of ops) {
    try {
      // --- Container: operational data → LAST-EDIT-WINS ---
      if (op.entity === "container" && op.type === "update") {
        const existing = await prisma.container.findUnique({ where: { id: op.id } });
        if (!existing) {
          results.push({ opId: op.opId, status: "skipped", reason: "not found" });
          continue;
        }
        const incoming = op.updatedAt ? new Date(op.updatedAt) : new Date();
        // If the server copy is newer than this device's edit, don't overwrite —
        // record it for admin review so nothing is silently lost (approved rule).
        if (existing.updatedAt.getTime() > incoming.getTime()) {
          await prisma.syncConflict.create({
            data: {
              entity: "container",
              recordId: op.id,
              deviceValue: JSON.stringify(op.data ?? {}),
              serverValue: JSON.stringify({ status: existing.status }),
              deviceUpdatedAt: incoming,
              serverUpdatedAt: existing.updatedAt,
            },
          }).catch(() => {});
          results.push({
            opId: op.opId,
            status: "conflict",
            serverUpdatedAt: existing.updatedAt.toISOString(),
            serverValue: { status: existing.status },
          });
          continue;
        }
        const data: Record<string, unknown> = {};
        if (typeof op.data?.status === "string") data.status = op.data.status;
        if (Object.keys(data).length === 0) {
          results.push({ opId: op.opId, status: "ignored", reason: "no supported fields" });
          continue;
        }
        const updated = await prisma.container.update({ where: { id: op.id }, data });
        results.push({ opId: op.opId, status: "applied", updatedAt: updated.updatedAt.toISOString() });
        continue;
      }

      // --- Gate Out: create offline → server assigns EIR-OUT + release-order numbers ---
      if (op.entity === "gateTransaction" && op.type === "create" && op.data?.type === "GATE_OUT") {
        const already = await prisma.gateTransaction.findUnique({ where: { id: op.id } });
        if (already) {
          results.push({ opId: op.opId, status: "applied", recordId: op.id, docNumber: already.docNumber, releaseOrderNo: already.releaseOrderNo });
          continue;
        }
        const d = op.data ?? {};
        const containerNumber = String(d.containerNumber ?? "").trim().toUpperCase();
        const container = containerNumber ? await prisma.container.findUnique({ where: { containerNumber } }) : null;
        if (!container) {
          results.push({ opId: op.opId, status: "error", message: "container not found for gate out" });
          continue;
        }
        const condition = d.condition === "DAMAGED" ? "DAMAGED" : "GOOD";
        let docNumber = "";
        let releaseOrderNo = "";
        for (let attempt = 0; attempt < 4; attempt++) {
          const count = await prisma.gateTransaction.count({ where: { type: "GATE_OUT" } });
          docNumber = formatDocNumber("EIR-OUT", count + 1 + attempt);
          releaseOrderNo = d.releaseOrderNo ? String(d.releaseOrderNo) : formatDocNumber("RO", count + 1 + attempt);
          try {
            await prisma.gateTransaction.create({
              data: {
                id: op.id,
                docNumber,
                type: "GATE_OUT",
                containerId: container.id,
                truckPlate: String(d.truckPlate ?? "-"),
                driverName: String(d.driverName ?? "-"),
                destination: d.destination ? String(d.destination) : null,
                releaseOrderNo,
                condition,
                remarks: d.remarks ? String(d.remarks) : null,
              },
            });
            break;
          } catch (e) {
            if (attempt === 3) throw e;
          }
        }
        // The container has left the yard.
        await prisma.inventory.updateMany({ where: { containerId: container.id }, data: { status: "GATE_OUT" } }).catch(() => {});
        results.push({ opId: op.opId, status: "applied", recordId: op.id, docNumber, releaseOrderNo });
        continue;
      }

      // --- Gate In: create offline → server assigns the final document number ---
      if (op.entity === "gateTransaction" && op.type === "create") {
        // Idempotent: if this device's record already synced, return its number.
        const already = await prisma.gateTransaction.findUnique({ where: { id: op.id } });
        if (already) {
          results.push({ opId: op.opId, status: "applied", recordId: op.id, docNumber: already.docNumber });
          continue;
        }
        const d = op.data ?? {};
        const containerNumber = String(d.containerNumber ?? "").trim().toUpperCase();
        const containerTypeId = String(d.containerTypeId ?? "");
        if (!containerNumber || !containerTypeId) {
          results.push({ opId: op.opId, status: "error", message: "container number and type required" });
          continue;
        }
        const condition = d.condition === "DAMAGED" ? "DAMAGED" : "GOOD";
        // Find-or-create the container (dedupe by number).
        let container = await prisma.container.findUnique({ where: { containerNumber } });
        if (!container) {
          container = await prisma.container.create({
            data: {
              containerNumber,
              containerTypeId,
              status: condition === "DAMAGED" ? "DAMAGED" : String(d.status ?? "FULL"),
            },
          });
        }
        // Allocate a free yard slot (reefer slot for reefer types), if any.
        const ct = await prisma.containerType.findUnique({ where: { id: containerTypeId } });
        const freeLocation = await prisma.location.findFirst({
          where: { isReeferSlot: ct?.isReefer ?? false, inventory: { is: null } },
        });

        // Assign the sequential document number, retrying on a rare collision.
        let docNumber = "";
        for (let attempt = 0; attempt < 4; attempt++) {
          const count = await prisma.gateTransaction.count({ where: { type: "GATE_IN" } });
          docNumber = formatDocNumber("EIR-IN", count + 1 + attempt);
          try {
            await prisma.gateTransaction.create({
              data: {
                id: op.id, // client-generated id → idempotent
                docNumber,
                type: "GATE_IN",
                containerId: container.id,
                truckPlate: String(d.truckPlate ?? "-"),
                driverName: String(d.driverName ?? "-"),
                sealNumber: d.sealNumber ? String(d.sealNumber) : null,
                grossWeightKg: d.grossWeightKg != null && d.grossWeightKg !== "" ? Number(d.grossWeightKg) : null,
                navire: d.navire ? String(d.navire) : null,
                condition,
                remarks: d.remarks ? String(d.remarks) : null,
              },
            });
            break;
          } catch (e) {
            if (attempt === 3) throw e; // give up after retries
          }
        }
        if (freeLocation) {
          const inv = await prisma.inventory.findUnique({ where: { containerId: container.id } });
          if (!inv) {
            await prisma.inventory.create({
              data: { containerId: container.id, locationId: freeLocation.id, status: "IN_YARD" },
            }).catch(() => {});
          }
        }
        results.push({ opId: op.opId, status: "applied", recordId: op.id, docNumber });
        continue;
      }

      results.push({ opId: op.opId, status: "ignored", reason: `unsupported ${op.entity}/${op.type}` });
    } catch (e) {
      results.push({ opId: op.opId, status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ results });
}
