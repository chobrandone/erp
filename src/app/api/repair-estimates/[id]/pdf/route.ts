import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { RepairEstimatePdf } from "@/lib/pdf/templates/RepairEstimate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const estimate = await prisma.repairEstimate.findUnique({
    where: { id },
    include: { container: true },
  });
  if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const total = estimate.laborCost + estimate.materialCost + estimate.equipmentCost;
  const qrDataUrl = await generateQrDataUrl(estimate.estimateNo);

  return pdfResponse(
    RepairEstimatePdf({
      docNumber: estimate.estimateNo,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: estimate.container.containerNumber,
      workDescription: estimate.workDescription.split("\n").filter(Boolean),
      laborCost: `$${estimate.laborCost.toFixed(2)}`,
      materialCost: `$${estimate.materialCost.toFixed(2)}`,
      equipmentCost: `$${estimate.equipmentCost.toFixed(2)}`,
      totalCost: `$${total.toFixed(2)}`,
      approvalDate: estimate.approvalDate ? estimate.approvalDate.toLocaleDateString() : "-",
      remarks: estimate.remarks ?? "-",
    }),
    estimate.estimateNo
  );
}
