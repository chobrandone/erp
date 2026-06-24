import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const shippingLines = await prisma.shippingLine.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ shippingLines });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const shippingLine = await prisma.shippingLine.create({
    data: { code: body.code, name: body.name },
  });
  return NextResponse.json({ shippingLine });
}
