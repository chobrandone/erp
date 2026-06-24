import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateInSchema, gateOutSchema } from "@/lib/validations/gate";
import { formatDocNumber } from "@/lib/pdf/docNumber";
import { generatePdfFile, generateQrDataUrl } from "@/lib/pdf/generatePdf";
import { GateInEIR } from "@/lib/pdf/templates/GateInEIR";
import { GateOutEIR } from "@/lib/pdf/templates/GateOutEIR";

export async function GET() {
  const transactions = await prisma.gateTransaction.findMany({
    include: { container: { include: { containerType: true } }, customer: true, shippingLine: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "GATE_IN") {
    const data = gateInSchema.parse(body);

    let container = await prisma.container.findUnique({ where: { containerNumber: data.containerNumber } });
    if (!container) {
      container = await prisma.container.create({
        data: {
          containerNumber: data.containerNumber,
          containerTypeId: data.containerTypeId,
          shippingLineId: data.shippingLineId || null,
          status: data.condition === "DAMAGED" ? "DAMAGED" : "FULL",
        },
      });
    }

    const containerType = await prisma.containerType.findUnique({ where: { id: data.containerTypeId } });
    const freeLocation = await prisma.location.findFirst({
      where: {
        isReeferSlot: containerType?.isReefer ?? false,
        inventory: { is: null },
      },
    });

    const count = await prisma.gateTransaction.count({ where: { type: "GATE_IN" } });
    const docNumber = formatDocNumber("EIR-IN", count + 1);

    const transaction = await prisma.gateTransaction.create({
      data: {
        docNumber,
        type: "GATE_IN",
        containerId: container.id,
        customerId: data.customerId || null,
        shippingLineId: data.shippingLineId || null,
        truckPlate: data.truckPlate,
        driverName: data.driverName,
        driverIdNumber: data.driverId,
        sealNumber: data.sealNumber,
        grossWeightKg: data.grossWeightKg,
        condition: data.condition,
        damageRemarks: data.damageRemarks,
      },
    });

    if (freeLocation) {
      await prisma.inventory.create({
        data: { containerId: container.id, locationId: freeLocation.id, status: "IN_YARD" },
      });
    }

    const customer = data.customerId ? await prisma.customer.findUnique({ where: { id: data.customerId } }) : null;
    const shippingLine = data.shippingLineId
      ? await prisma.shippingLine.findUnique({ where: { id: data.shippingLineId } })
      : null;

    const qrDataUrl = await generateQrDataUrl(docNumber);
    const pdfPath = await generatePdfFile(
      GateInEIR({
        docNumber,
        qrDataUrl,
        generatedAt: new Date().toLocaleString(),
        shippingLine: shippingLine?.name ?? "-",
        customer: customer?.name ?? "-",
        truckPlate: data.truckPlate,
        driverName: data.driverName,
        driverId: data.driverId ?? "-",
        containerNumber: data.containerNumber,
        isoType: containerType?.code ?? "-",
        size: `${containerType?.lengthFt ?? "-"}ft`,
        status: container.status,
        condition: data.condition,
        damageRemarks: data.damageRemarks ?? "-",
        sealNumber: data.sealNumber ?? "-",
        locationAssigned: freeLocation?.code ?? "Unassigned",
      }),
      "gate-in",
      docNumber
    );

    await prisma.gateTransaction.update({ where: { id: transaction.id }, data: { pdfPath } });

    return NextResponse.json({ transaction: { ...transaction, pdfPath } });
  }

  if (body.type === "GATE_OUT") {
    const data = gateOutSchema.parse(body);

    const container = await prisma.container.findUnique({
      where: { id: data.containerId },
      include: { containerType: true, inventory: { include: { location: true } } },
    });
    if (!container) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 });
    }

    const count = await prisma.gateTransaction.count({ where: { type: "GATE_OUT" } });
    const docNumber = formatDocNumber("EIR-OUT", count + 1);

    const transaction = await prisma.gateTransaction.create({
      data: {
        docNumber,
        type: "GATE_OUT",
        containerId: container.id,
        truckPlate: data.truckPlate,
        driverName: data.driverName,
        destination: data.destination,
        releaseOrderNo: data.releaseOrderNo,
        condition: data.condition,
        damageRemarks: data.damageRemarks,
      },
    });

    if (container.inventory) {
      await prisma.inventory.delete({ where: { id: container.inventory.id } });
    }
    await prisma.container.update({ where: { id: container.id }, data: { status: "EMPTY" } });

    const qrDataUrl = await generateQrDataUrl(docNumber);
    const pdfPath = await generatePdfFile(
      GateOutEIR({
        docNumber,
        qrDataUrl,
        generatedAt: new Date().toLocaleString(),
        containerNumber: container.containerNumber,
        containerType: container.containerType.code,
        currentLocation: container.inventory?.location.code ?? "-",
        releaseOrderNo: data.releaseOrderNo,
        destination: data.destination,
        customer: "-",
        truckPlate: data.truckPlate,
        driverName: data.driverName,
        condition: data.condition,
        remarks: data.damageRemarks ?? "-",
      }),
      "gate-out",
      docNumber
    );

    await prisma.gateTransaction.update({ where: { id: transaction.id }, data: { pdfPath } });

    return NextResponse.json({ transaction: { ...transaction, pdfPath } });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
