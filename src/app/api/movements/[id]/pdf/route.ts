import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { MovementOrder } from "@/lib/pdf/templates/MovementOrder";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movement = await prisma.containerMovement.findUnique({
    where: { id },
    include: { container: { include: { containerType: true } }, fromLocation: true, toLocation: true },
  });
  if (!movement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(movement.docNumber);
  return pdfResponse(
    MovementOrder({
      docNumber: movement.docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      dateTime: movement.createdAt.toLocaleString(),
      containerNumber: movement.container.containerNumber,
      containerType: movement.container.containerType.code,
      fromLocation: movement.fromLocation?.code ?? "-",
      toLocation: movement.toLocation.code,
      reason: movement.reason,
      equipment: movement.equipment ?? "-",
      operator: movement.operator ?? "-",
      supervisorName: movement.supervisorName ?? "-",
      completed: movement.completed,
      completionTime: movement.completionTime ? movement.completionTime.toLocaleString() : "-",
      remarks: movement.remarks ?? "-",
    }),
    movement.docNumber
  );
}
