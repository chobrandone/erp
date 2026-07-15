import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { ReeferConnectionReportPdf } from "@/lib/pdf/templates/ReeferConnectionReport";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const connection = await prisma.reeferConnection.findUnique({
    where: { id },
    include: { container: true },
  });
  if (!connection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));
  return pdfResponse(
    ReeferConnectionReportPdf({
      docNumber: connection.referenceNo,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: connection.container.containerNumber,
      plugNumber: connection.plugNumber ?? "-",
      connectionTime: connection.connectionTime ? connection.connectionTime.toLocaleString() : "-",
      disconnectionTime: connection.disconnectionTime ? connection.disconnectionTime.toLocaleString() : "-",
      connectedBy: connection.connectedBy ?? "-",
      disconnectedBy: connection.disconnectedBy ?? "-",
      powerStatus: connection.powerStatus as "OPERATIONAL" | "FAULT",
      remarks: connection.remarks ?? "-",
    }),
    connection.referenceNo
  );
}
