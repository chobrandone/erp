import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { ReleaseOrderPdf } from "@/lib/pdf/templates/ReleaseOrder";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const releaseOrder = await prisma.releaseOrder.findUnique({
    where: { id },
    include: { container: true, customer: true, shippingLine: true },
  });
  if (!releaseOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(releaseOrder.releaseNo);
  return pdfResponse(
    ReleaseOrderPdf({
      docNumber: releaseOrder.releaseNo,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      customer: releaseOrder.customer?.name ?? "-",
      shippingLine: releaseOrder.shippingLine?.name ?? "-",
      containerNumber: releaseOrder.container.containerNumber,
      authorizedReleaseDate: releaseOrder.authorizedReleaseDate
        ? releaseOrder.authorizedReleaseDate.toLocaleDateString()
        : "-",
      destination: releaseOrder.destination ?? "-",
      approvedBy: releaseOrder.approvedBy ?? "-",
      gateAuthorization: releaseOrder.gateAuthorization as "APPROVED" | "REJECTED",
      remarks: releaseOrder.remarks ?? "-",
    }),
    releaseOrder.releaseNo
  );
}
