import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const workOrders = await prisma.repairWorkOrder.findMany({
    include: { container: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ workOrders });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const count = await prisma.repairWorkOrder.count();
  const workOrderNo = `WO-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const workOrder = await prisma.repairWorkOrder.create({
    data: {
      workOrderNo,
      containerId: body.containerId,
      assignedTechnician: body.assignedTechnician || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      expectedCompletion: body.expectedCompletion ? new Date(body.expectedCompletion) : null,
      workToBeDone: body.workToBeDone || "",
      materialsRequired: body.materialsRequired || null,
      completionStatus: "OPEN",
    },
  });
  return NextResponse.json({ workOrder });
}
