import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { PTICertificate } from "@/lib/pdf/templates/PTICertificate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = await prisma.pTIInspection.findUnique({
    where: { id },
    include: { ptiRequest: { include: { container: { include: { containerType: true } } } } },
  });
  if (!inspection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checklist: { key: string; label: string; result: "PASS" | "FAIL" }[] = JSON.parse(
    inspection.checklistJson
  );
  const docNumber = inspection.certificateNumber ?? `PTI-${inspection.id.slice(0, 8)}`;

  const qrDataUrl = await generateQrDataUrl(docNumber);
  return pdfResponse(
    PTICertificate({
      docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: inspection.ptiRequest.container.containerNumber,
      containerType: inspection.ptiRequest.container.containerType.code,
      technician: "-",
      inspectionDate: inspection.inspectedAt.toLocaleDateString(),
      checklist: checklist.map((c) => ({ label: c.label, result: c.result })),
      overallResult: inspection.result as "PASS" | "FAIL",
      remarks: inspection.remarks ?? "-",
    }),
    docNumber
  );
}
