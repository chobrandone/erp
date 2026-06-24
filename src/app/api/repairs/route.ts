import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const repairs = await prisma.repair.findMany({
    include: { container: { include: { containerType: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ repairs });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const repair = await prisma.repair.create({
    data: {
      containerId: body.containerId,
      damageType: body.damageType,
      description: body.description || null,
      estimatedCost: body.estimatedCost ? Number(body.estimatedCost) : null,
      status: "OPEN",
    },
  });
  if (body.containerId) {
    await prisma.container.update({ where: { id: body.containerId }, data: { status: "IN_REPAIR" } });
  }
  return NextResponse.json({ repair });
}
