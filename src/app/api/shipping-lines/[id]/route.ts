import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const shippingLine = await prisma.shippingLine.update({
    where: { id },
    data: {
      ...(body.code !== undefined ? { code: body.code } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
    },
  });

  return NextResponse.json({ shippingLine });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.shippingLine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "This shipping line has related containers or transactions and cannot be deleted." },
      { status: 409 }
    );
  }
}
