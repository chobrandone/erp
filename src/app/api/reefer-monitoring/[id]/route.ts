import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; role?: string; permissions?: string[] | null };

// A reefer record may be edited/deleted by an admin, or by a user the admin
// assigned to reefer management (i.e. who has the reefer-management permission).
function canManage(user: SessionUser): boolean {
  if (user.role === "ADMIN") return true;
  if (user.permissions == null) return true; // legacy full-access
  return user.permissions.includes("reefer-management");
}

const num = (v: unknown) => (v === "" || v == null ? null : Number(v));

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (!canManage(user)) return NextResponse.json({ error: "Not permitted to edit reefer records." }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.setTempC !== undefined) data.setTempC = Number(body.setTempC);
  if (body.actualTempC !== undefined) data.actualTempC = Number(body.actualTempC);
  if (body.supplyAirTempC !== undefined) data.supplyAirTempC = num(body.supplyAirTempC);
  if (body.returnAirTempC !== undefined) data.returnAirTempC = num(body.returnAirTempC);
  if (body.ambientTempC !== undefined) data.ambientTempC = num(body.ambientTempC);
  if (body.humidity !== undefined) data.humidity = num(body.humidity);
  if (body.plugNumber !== undefined) data.plugNumber = body.plugNumber || null;
  if (body.powerStatus !== undefined) data.powerStatus = body.powerStatus;
  if (body.alarmStatus !== undefined) data.alarmStatus = body.alarmStatus;
  if (body.alarmDescription !== undefined) data.alarmDescription = body.alarmDescription || null;
  if (body.technician !== undefined) data.technician = body.technician || null;
  if (body.remarks !== undefined) data.remarks = body.remarks || null;

  const log = await prisma.reeferMonitoring.update({ where: { id }, data });
  await logAudit({ userId: user.id, action: "REEFER_UPDATE", entity: "ReeferMonitoring", entityId: id, meta: { changed: Object.keys(data) } });
  return NextResponse.json({ log });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (!canManage(user)) return NextResponse.json({ error: "Not permitted to delete reefer records." }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.reeferMonitoring.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit({ userId: user.id, action: "REEFER_DELETE", entity: "ReeferMonitoring", entityId: id, meta: { reportNo: existing.reportNo, containerId: existing.containerId } });
  await prisma.reeferMonitoring.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
