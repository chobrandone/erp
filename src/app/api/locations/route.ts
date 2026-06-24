import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    include: { inventory: { include: { container: true } } },
    orderBy: [{ block: "asc" }, { row: "asc" }, { bay: "asc" }, { tier: "asc" }],
  });
  return NextResponse.json({ locations });
}
