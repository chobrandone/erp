import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ptiInspectionSchema } from "@/lib/validations/pti";
import { formatDocNumber } from "@/lib/pdf/docNumber";
import { generatePdfFile, generateQrDataUrl } from "@/lib/pdf/generatePdf";
import { PTICertificate } from "@/lib/pdf/templates/PTICertificate";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = ptiInspectionSchema.parse(body);

  const ptiRequest = await prisma.pTIRequest.findUnique({
    where: { id: data.ptiRequestId },
    include: { container: { include: { containerType: true } } },
  });
  if (!ptiRequest) return NextResponse.json({ error: "PTI request not found" }, { status: 404 });

  const overallResult = data.checklist.every((c) => c.result === "PASS") ? "PASS" : "FAIL";

  const inspection = await prisma.pTIInspection.create({
    data: {
      ptiRequestId: data.ptiRequestId,
      checklistJson: JSON.stringify(data.checklist),
      result: overallResult,
      remarks: data.remarks,
    },
  });

  await prisma.pTIRequest.update({
    where: { id: data.ptiRequestId },
    data: { status: overallResult === "PASS" ? "PASSED" : "FAILED" },
  });

  const count = await prisma.pTIInspection.count();
  const docNumber = formatDocNumber("PTI", count);

  const qrDataUrl = await generateQrDataUrl(docNumber);
  const pdfPath = await generatePdfFile(
    PTICertificate({
      docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: ptiRequest.container.containerNumber,
      containerType: ptiRequest.container.containerType.code,
      technician: "-",
      inspectionDate: new Date().toLocaleDateString(),
      checklist: data.checklist.map((c) => ({ label: c.label, result: c.result })),
      overallResult,
      remarks: data.remarks ?? "-",
    }),
    "pti-certificates",
    docNumber
  );

  await prisma.pTIInspection.update({ where: { id: inspection.id }, data: { certificatePdfPath: pdfPath } });

  return NextResponse.json({ inspection: { ...inspection, certificatePdfPath: pdfPath } });
}
