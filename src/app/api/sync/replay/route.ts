import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

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
        // flag it so nothing is silently lost (per approved rules).
        if (existing.updatedAt.getTime() > incoming.getTime()) {
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

      results.push({ opId: op.opId, status: "ignored", reason: `unsupported ${op.entity}/${op.type}` });
    } catch (e) {
      results.push({ opId: op.opId, status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ results });
}
