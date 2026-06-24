import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.contactName !== undefined ? { contactName: body.contactName || null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
      ...(body.email !== undefined ? { email: body.email || null } : {}),
      ...(body.address !== undefined ? { address: body.address || null } : {}),
    },
  });

  return NextResponse.json({ customer });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "This customer has related records (gate transactions or invoices) and cannot be deleted." },
      { status: 409 }
    );
  }
}
