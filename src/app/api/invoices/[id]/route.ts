import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: body.status,
      paidAt: body.status === "PAID" ? new Date() : null,
    },
  });

  return NextResponse.json({ invoice });
}
