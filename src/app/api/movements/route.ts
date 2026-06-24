import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { movementSchema } from "@/lib/validations/movement";
import { formatDocNumber } from "@/lib/pdf/docNumber";
import { generatePdfFile, generateQrDataUrl } from "@/lib/pdf/generatePdf";
import { MovementOrder } from "@/lib/pdf/templates/MovementOrder";

export async function GET() {
  const movements = await prisma.containerMovement.findMany({
    include: { container: true, fromLocation: true, toLocation: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ movements });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = movementSchema.parse(body);

  const container = await prisma.container.findUnique({
    where: { id: data.containerId },
    include: { containerType: true, inventory: true },
  });
  if (!container) return NextResponse.json({ error: "Container not found" }, { status: 404 });

  const fromLocationId = container.inventory?.locationId ?? null;

  const count = await prisma.containerMovement.count();
  const docNumber = formatDocNumber("MOV", count + 1);

  const movement = await prisma.containerMovement.create({
    data: {
      docNumber,
      containerId: data.containerId,
      fromLocationId,
      toLocationId: data.toLocationId,
      reason: data.reason,
      equipment: data.equipment,
    },
  });

  if (container.inventory) {
    await prisma.inventory.update({
      where: { id: container.inventory.id },
      data: { locationId: data.toLocationId },
    });
  } else {
    await prisma.inventory.create({
      data: { containerId: container.id, locationId: data.toLocationId, status: "IN_YARD" },
    });
  }

  const [fromLocation, toLocation] = await Promise.all([
    fromLocationId ? prisma.location.findUnique({ where: { id: fromLocationId } }) : null,
    prisma.location.findUnique({ where: { id: data.toLocationId } }),
  ]);

  const qrDataUrl = await generateQrDataUrl(docNumber);
  const pdfPath = await generatePdfFile(
    MovementOrder({
      docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: container.containerNumber,
      containerType: container.containerType.code,
      fromLocation: fromLocation?.code ?? "-",
      toLocation: toLocation?.code ?? "-",
      reason: data.reason.replace(/_/g, " "),
      equipment: data.equipment ?? "-",
      operator: "-",
    }),
    "movement-orders",
    docNumber
  );

  await prisma.containerMovement.update({ where: { id: movement.id }, data: { pdfPath } });

  return NextResponse.json({ movement: { ...movement, pdfPath } });
}
