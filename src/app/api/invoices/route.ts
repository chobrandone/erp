import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(from || to
        ? {
            issuedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: { customer: true },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: body.customerId,
      description: body.description || null,
      amount: Number(body.amount),
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
    },
    include: { customer: true },
  });

  return NextResponse.json({ invoice });
}
