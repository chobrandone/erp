import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const equipment = await prisma.equipment.update({
    where: { id },
    data: {
      ...(body.code !== undefined ? { code: body.code } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });

  return NextResponse.json({ equipment });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.equipment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
