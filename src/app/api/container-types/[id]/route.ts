import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const containerType = await prisma.containerType.update({
    where: { id },
    data: {
      ...(body.code !== undefined ? { code: body.code } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.lengthFt !== undefined ? { lengthFt: Number(body.lengthFt) } : {}),
      ...(body.isReefer !== undefined ? { isReefer: !!body.isReefer } : {}),
    },
  });

  return NextResponse.json({ containerType });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.containerType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "This container type has related containers and cannot be deleted." },
      { status: 409 }
    );
  }
}
