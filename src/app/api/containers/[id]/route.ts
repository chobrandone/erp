import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; role?: string };

// Update a container, including its container number (unique). Used by the gate
// edit modal so an operator can correct a container's number in place.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.container.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Container not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.containerNumber !== undefined) {
    const next = String(body.containerNumber).trim().toUpperCase();
    if (!next) return NextResponse.json({ error: "Container number is required." }, { status: 400 });
    if (next !== existing.containerNumber) {
      const clash = await prisma.container.findUnique({ where: { containerNumber: next } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: `Container number "${next}" already exists.` }, { status: 409 });
      }
      data.containerNumber = next;
    }
  }
  if (body.containerTypeId) data.containerTypeId = body.containerTypeId;
  if (body.shippingLineId !== undefined) data.shippingLineId = body.shippingLineId || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.isoCode !== undefined) data.isoCode = body.isoCode || null;

  if (Object.keys(data).length === 0) return NextResponse.json({ container: existing });

  const container = await prisma.container.update({ where: { id }, data });
  await logAudit({ userId: user.id, action: "CONTAINER_UPDATE", entity: "Container", entityId: id, meta: { changed: Object.keys(data) } });
  return NextResponse.json({ container });
}
