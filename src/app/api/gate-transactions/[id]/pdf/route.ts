import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { GateInEIR } from "@/lib/pdf/templates/GateInEIR";
import { GateOutEIR } from "@/lib/pdf/templates/GateOutEIR";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.gateTransaction.findUnique({
    where: { id },
    include: {
      container: { include: { containerType: true, inventory: { include: { location: true } } } },
      customer: true,
      shippingLine: true,
    },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(transaction.docNumber);
  const generatedAt = new Date().toLocaleString();

  if (transaction.type === "GATE_IN") {
    return pdfResponse(
      GateInEIR({
        docNumber: transaction.docNumber,
        qrDataUrl,
        generatedAt,
        shippingLine: transaction.shippingLine?.name ?? "-",
        customer: transaction.customer?.name ?? "-",
        truckPlate: transaction.truckPlate,
        driverName: transaction.driverName,
        driverId: transaction.driverIdNumber ?? "-",
        containerNumber: transaction.container.containerNumber,
        isoType: transaction.container.containerType.code,
        size: `${transaction.container.containerType.lengthFt}ft`,
        status: transaction.container.status,
        condition: transaction.condition,
        damageRemarks: transaction.damageRemarks ?? "-",
        sealNumber: transaction.sealNumber ?? "-",
        locationAssigned: transaction.container.inventory?.location.code ?? "Unassigned",
      }),
      transaction.docNumber
    );
  }

  return pdfResponse(
    GateOutEIR({
      docNumber: transaction.docNumber,
      qrDataUrl,
      generatedAt,
      containerNumber: transaction.container.containerNumber,
      containerType: transaction.container.containerType.code,
      currentLocation: transaction.container.inventory?.location.code ?? "-",
      releaseOrderNo: transaction.releaseOrderNo ?? "-",
      destination: transaction.destination ?? "-",
      customer: transaction.customer?.name ?? "-",
      truckPlate: transaction.truckPlate,
      driverName: transaction.driverName,
      condition: transaction.condition,
      remarks: transaction.damageRemarks ?? "-",
    }),
    transaction.docNumber
  );
}
