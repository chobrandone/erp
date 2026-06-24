import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const current = await prisma.invoice.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextStatus = body.status ?? current.status;

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(body.customerId !== undefined ? { customerId: body.customerId } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
      ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
      status: nextStatus,
      paidAt: nextStatus === "PAID" ? current.paidAt ?? new Date() : null,
    },
    include: { customer: true },
  });

  return NextResponse.json({ invoice });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
