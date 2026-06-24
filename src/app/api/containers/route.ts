import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [containers, containerTypes, shippingLines, customers] = await Promise.all([
    prisma.container.findMany({
      include: { containerType: true, shippingLine: true, inventory: { include: { location: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.containerType.findMany(),
    prisma.shippingLine.findMany(),
    prisma.customer.findMany(),
  ]);

  return NextResponse.json({ containers, containerTypes, shippingLines, customers });
}
