import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; role?: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.gateTransaction.findUnique({
    where: { id },
    include: { container: { include: { containerType: true } }, customer: true, shippingLine: true },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ transaction });
}

// Delete a gate transaction (EIR document). Admin only; recorded in the audit trail.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Only an administrator can delete a gate document." }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.gateTransaction.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit({ userId: user.id, action: "GATE_TX_DELETE", entity: "GateTransaction", entityId: id, meta: { docNumber: existing.docNumber, type: existing.type } });
  await prisma.gateTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  // Optional field setters: empty string clears to null; absent key is untouched.
  const str = (k: string) => (body[k] !== undefined ? { [k]: body[k] === "" || body[k] == null ? null : String(body[k]) } : {});
  const num = (k: string) => (body[k] !== undefined ? { [k]: body[k] === "" || body[k] == null ? null : Number(body[k]) } : {});

  // Changing the EIR ID (docNumber) must stay unique.
  let docPatch: Record<string, unknown> = {};
  if (body.eirId !== undefined) {
    const next = String(body.eirId).trim();
    if (next) {
      const clash = await prisma.gateTransaction.findUnique({ where: { docNumber: next } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: `EIR ID "${next}" already exists. Please use a different one.` }, { status: 409 });
      }
      docPatch = { docNumber: next };
    }
  }

  const transaction = await prisma.gateTransaction.update({
    where: { id },
    data: {
      ...(body.type === "GATE_IN" || body.type === "GATE_OUT" ? { type: body.type } : {}),
      ...(body.containerId ? { container: { connect: { id: body.containerId } } } : {}),
      ...docPatch,
      ...str("truckPlate"),
      ...str("driverName"),
      ...str("driverIdNumber"),
      ...str("sealNumber"),
      ...str("sealNumber2"),
      ...str("condition"),
      ...str("damageRemarks"),
      ...str("destination"),
      ...str("releaseOrderNo"),
      ...str("remarks"),
      ...str("deliveryHeading"),
      ...str("statut"),
      ...str("documentType"),
      ...str("documentNumber"),
      ...str("navire"),
      ...str("voyage"),
      ...str("pod"),
      ...str("isoCode"),
      ...str("acconier"),
      ...str("agent"),
      ...str("transitaire"),
      ...str("marchandise"),
      ...str("imdg"),
      ...str("region"),
      ...str("gatePost"),
      ...str("bookingNo"),
      ...str("acceptanceRef"),
      ...str("sealType"),
      ...str("newEquipmentNo"),
      ...num("grossWeightKg"),
      ...num("payloadKg"),
      ...num("tempGate"),
      ...num("freeDays"),
      // Operator may correct the gate date/time (stored as createdAt).
      ...(body.occurredAt ? { createdAt: new Date(body.occurredAt) } : {}),
    },
  });

  return NextResponse.json({ transaction });
}
