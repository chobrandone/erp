import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { DailyYardStockReportPdf } from "@/lib/pdf/templates/DailyYardStockReport";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const generatedBy = session?.user?.name ?? "System";

  const [containers, byTypeRaw, containerTypes, underPtiContainerIds] = await Promise.all([
    prisma.container.findMany(),
    prisma.container.groupBy({ by: ["containerTypeId"], _count: true }),
    prisma.containerType.findMany(),
    prisma.pTIRequest.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
      select: { containerId: true },
    }),
  ]);

  const byType = byTypeRaw.map((b) => ({
    code: containerTypes.find((t) => t.id === b.containerTypeId)?.code ?? "Unknown",
    count: b._count,
  }));

  const reeferCount = containers.filter((c) =>
    containerTypes.find((t) => t.id === c.containerTypeId)?.isReefer
  ).length;

  const empty = containers.filter((c) => c.status === "EMPTY").length;
  const full = containers.filter((c) => c.status === "FULL").length;
  const underRepair = containers.filter((c) => c.status === "IN_REPAIR").length;
  const underPti = new Set(underPtiContainerIds.map((p) => p.containerId)).size;

  const docNumber = `DYR-${new Date().toISOString().slice(0, 10)}`;
  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));

  return pdfResponse(
    DailyYardStockReportPdf({
      docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      reportDate: new Date().toLocaleDateString(),
      byType,
      reeferCount,
      totalStock: containers.length,
      empty,
      full,
      underPti,
      underRepair,
      readyForRelease: full,
      generatedBy,
    }),
    docNumber
  );
}
