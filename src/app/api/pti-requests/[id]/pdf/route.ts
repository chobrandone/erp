import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { PTIRequestFormPdf } from "@/lib/pdf/templates/PTIRequestForm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request_ = await prisma.pTIRequest.findUnique({
    where: { id },
    include: {
      container: { include: { containerType: true } },
      customer: true,
      shippingLine: true,
    },
  });
  if (!request_) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));
  return pdfResponse(
    PTIRequestFormPdf({
      docNumber: request_.docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      customer: request_.customer?.name ?? "-",
      shippingLine: request_.shippingLine?.name ?? "-",
      containerNumber: request_.container.containerNumber,
      containerType: request_.container.containerType.code,
      requiredDate: request_.requiredDate ? request_.requiredDate.toLocaleDateString() : "-",
      inspectionType: request_.inspectionType as "STANDARD" | "SPECIAL",
      remarks: request_.remarks ?? "-",
      requestedBy: request_.requestedBy ?? "-",
      approvedBy: request_.approvedBy ?? "-",
    }),
    request_.docNumber
  );
}
