import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const estimates = await prisma.repairEstimate.findMany({
    include: { container: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ estimates });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const count = await prisma.repairEstimate.count();
  const estimateNo = `EST-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const estimate = await prisma.repairEstimate.create({
    data: {
      estimateNo,
      containerId: body.containerId,
      workDescription: body.workDescription || "",
      laborCost: Number(body.laborCost) || 0,
      materialCost: Number(body.materialCost) || 0,
      equipmentCost: Number(body.equipmentCost) || 0,
      customerApproved: !!body.customerApproved,
      approvalDate: body.customerApproved ? new Date() : null,
    },
  });
  return NextResponse.json({ estimate });
}
