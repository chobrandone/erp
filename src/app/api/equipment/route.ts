import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const equipment = await prisma.equipment.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ equipment });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const equipment = await prisma.equipment.create({
    data: { code: body.code, type: body.type, status: body.status || "AVAILABLE" },
  });
  return NextResponse.json({ equipment });
}
