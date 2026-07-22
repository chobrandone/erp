import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; role?: string };

// Delete a PTI inspection certificate. Admin only; recorded in the audit trail.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Only an administrator can delete this document." }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.pTIInspection.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit({ userId: user.id, action: "PTI_INSPECTION_DELETE", entity: "PTIInspection", entityId: id, meta: { certificateNumber: existing.certificateNumber } });
  await prisma.pTIInspection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
