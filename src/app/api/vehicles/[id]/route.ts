import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRight } from "@/lib/requireRight";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string };

// Edit a vehicle's information and status.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, forbidden } = await requireRight("edit");
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.plateNumber !== undefined) data.plateNumber = String(body.plateNumber).toUpperCase().trim();
  if (body.make !== undefined) data.make = body.make || null;
  if (body.model !== undefined) data.model = body.model || null;
  if (body.type !== undefined) data.type = body.type;
  if (body.driverName !== undefined) data.driverName = body.driverName || null;
  if (body.driverPhone !== undefined) data.driverPhone = body.driverPhone || null;
  if (body.status !== undefined) data.status = body.status; // ACTIVE, MAINTENANCE, INACTIVE
  if (body.operationalStatus !== undefined) data.operationalStatus = body.operationalStatus;
  if (body.odometerKm !== undefined) data.odometerKm = body.odometerKm === "" || body.odometerKm == null ? null : Number(body.odometerKm);

  const vehicle = await prisma.vehicle.update({ where: { id }, data, include: { documents: true } });
  await logAudit({ userId: (session!.user as SessionUser).id, action: "VEHICLE_UPDATE", entity: "Vehicle", entityId: id, meta: { changed: Object.keys(data) } });
  return NextResponse.json({ vehicle });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, forbidden } = await requireRight("delete");
  if (forbidden) return forbidden;

  const { id } = await params;
  const existing = await prisma.vehicle.findUnique({ where: { id }, include: { trips: { where: { status: "ONGOING" } } } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.trips.length > 0) {
    return NextResponse.json({ error: "This vehicle is on an ongoing mission and cannot be deleted." }, { status: 409 });
  }

  await prisma.vehicle.delete({ where: { id } });
  await logAudit({ userId: (session!.user as SessionUser).id, action: "VEHICLE_DELETE", entity: "Vehicle", entityId: id, meta: { plate: existing.plateNumber } });
  return NextResponse.json({ success: true });
}
