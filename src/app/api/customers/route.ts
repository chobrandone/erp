import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.customer.count();
  const customer = await prisma.customer.create({
    data: {
      code: body.code || `CUST-${String(count + 1).padStart(3, "0")}`,
      name: body.name,
      contactName: body.contactName || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
    },
  });
  return NextResponse.json({ customer });
}
