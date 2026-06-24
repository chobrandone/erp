import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const containerTypes = await prisma.containerType.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ containerTypes });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const containerType = await prisma.containerType.create({
    data: {
      code: body.code,
      description: body.description,
      lengthFt: Number(body.lengthFt),
      isReefer: !!body.isReefer,
    },
  });
  return NextResponse.json({ containerType });
}
