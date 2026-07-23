import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { hasRight } from "@/lib/requireRight";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; role?: string; permissions?: string[] | null; canCreate?: boolean; canEdit?: boolean; canDelete?: boolean };

// A reefer connection may be edited/deleted by an admin, or by a user the admin
// assigned to reefer management (i.e. who has the reefer-management permission).
function canManage(user: SessionUser): boolean {
  if (user.role === "ADMIN") return true;
  if (user.permissions == null) return true; // legacy full-access
  return user.permissions.includes("reefer-management");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (!canManage(user) || !hasRight(user, "edit")) return NextResponse.json({ error: "Not permitted to edit reefer connections." }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.plugNumber !== undefined) data.plugNumber = body.plugNumber || null;
  if (body.connectionTime !== undefined) data.connectionTime = body.connectionTime ? new Date(body.connectionTime) : null;
  if (body.disconnectionTime !== undefined) data.disconnectionTime = body.disconnectionTime ? new Date(body.disconnectionTime) : null;
  if (body.connectedBy !== undefined) data.connectedBy = body.connectedBy || null;
  if (body.disconnectedBy !== undefined) data.disconnectedBy = body.disconnectedBy || null;
  if (body.powerStatus !== undefined) data.powerStatus = body.powerStatus;
  if (body.remarks !== undefined) data.remarks = body.remarks || null;

  const connection = await prisma.reeferConnection.update({ where: { id }, data });
  await logAudit({ userId: user.id, action: "REEFER_CONNECTION_UPDATE", entity: "ReeferConnection", entityId: id, meta: { changed: Object.keys(data) } });
  return NextResponse.json({ connection });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (!canManage(user) || !hasRight(user, "delete")) return NextResponse.json({ error: "Not permitted to delete reefer connections." }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.reeferConnection.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit({ userId: user.id, action: "REEFER_CONNECTION_DELETE", entity: "ReeferConnection", entityId: id, meta: { referenceNo: existing.referenceNo, containerId: existing.containerId } });
  await prisma.reeferConnection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
