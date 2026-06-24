import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request_ = await prisma.pTIRequest.findUnique({
    where: { id },
    include: { container: { include: { containerType: true } }, inspection: true },
  });
  if (!request_) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ request: request_ });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const request_ = await prisma.pTIRequest.update({
    where: { id },
    data: {
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
    },
  });

  return NextResponse.json({ request: request_ });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const existing = await prisma.pTIRequest.findUnique({ where: { id }, include: { inspection: true } });
  if (existing?.inspection) {
    return NextResponse.json(
      { error: "This PTI request already has an inspection and cannot be deleted." },
      { status: 409 }
    );
  }
  await prisma.pTIRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
