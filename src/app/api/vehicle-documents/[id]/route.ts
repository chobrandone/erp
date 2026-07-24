import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRight } from "@/lib/requireRight";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string };

// Renew / edit a vehicle document (e.g. new expiry after a renewal).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, forbidden } = await requireRight("edit");
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.docType !== undefined) data.docType = body.docType;
  if (body.reference !== undefined) data.reference = body.reference || null;
  if (body.issuedDate !== undefined) data.issuedDate = body.issuedDate ? new Date(body.issuedDate) : null;
  if (body.expiryDate !== undefined && body.expiryDate) data.expiryDate = new Date(body.expiryDate);
  if (body.remarks !== undefined) data.remarks = body.remarks || null;

  const doc = await prisma.vehicleDocument.update({ where: { id }, data });
  await logAudit({ userId: (session!.user as SessionUser).id, action: "VEHICLE_DOC_UPDATE", entity: "VehicleDocument", entityId: id, meta: { changed: Object.keys(data) } });
  return NextResponse.json({ document: doc });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, forbidden } = await requireRight("delete");
  if (forbidden) return forbidden;

  const { id } = await params;
  const existing = await prisma.vehicleDocument.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.vehicleDocument.delete({ where: { id } });
  await logAudit({ userId: (session!.user as SessionUser).id, action: "VEHICLE_DOC_DELETE", entity: "VehicleDocument", entityId: id, meta: { vehicleId: existing.vehicleId, docType: existing.docType } });
  return NextResponse.json({ success: true });
}
