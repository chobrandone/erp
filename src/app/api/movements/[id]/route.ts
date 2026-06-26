import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const movement = await prisma.containerMovement.update({
    where: { id },
    data: {
      ...(body.reason !== undefined ? { reason: body.reason } : {}),
      ...(body.equipment !== undefined ? { equipment: body.equipment || null } : {}),
      ...(body.operator !== undefined ? { operator: body.operator || null } : {}),
      ...(body.supervisorName !== undefined ? { supervisorName: body.supervisorName || null } : {}),
      ...(body.completed !== undefined
        ? { completed: body.completed, completionTime: body.completed ? new Date() : null }
        : {}),
      ...(body.remarks !== undefined ? { remarks: body.remarks || null } : {}),
    },
  });

  return NextResponse.json({ movement });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.containerMovement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
