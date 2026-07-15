import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { RepairWorkOrderPdf } from "@/lib/pdf/templates/RepairWorkOrder";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workOrder = await prisma.repairWorkOrder.findUnique({
    where: { id },
    include: { container: true },
  });
  if (!workOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));
  return pdfResponse(
    RepairWorkOrderPdf({
      docNumber: workOrder.workOrderNo,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: workOrder.container.containerNumber,
      assignedTechnician: workOrder.assignedTechnician ?? "-",
      startDate: workOrder.startDate ? workOrder.startDate.toLocaleDateString() : "-",
      expectedCompletion: workOrder.expectedCompletion ? workOrder.expectedCompletion.toLocaleDateString() : "-",
      workToBeDone: workOrder.workToBeDone.split("\n").filter(Boolean),
      materialsRequired: workOrder.materialsRequired ?? "-",
      completionStatus: workOrder.completionStatus as "OPEN" | "IN_PROGRESS" | "COMPLETED",
      remarks: workOrder.remarks ?? "-",
    }),
    workOrder.workOrderNo
  );
}
