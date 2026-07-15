import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { ReeferMonitoringReportPdf } from "@/lib/pdf/templates/ReeferMonitoringReport";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await prisma.reeferMonitoring.findUnique({
    where: { id },
    include: { container: { include: { inventory: { include: { location: true } } } } },
  });
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const docNumber = log.reportNo ?? `RMR-${log.id.slice(0, 8)}`;
  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));

  return pdfResponse(
    ReeferMonitoringReportPdf({
      docNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: log.container.containerNumber,
      location: log.container.inventory?.location.code ?? "-",
      plugNumber: log.plugNumber ?? "-",
      monitoringDate: log.recordedAt.toLocaleDateString(),
      monitoringTime: log.recordedAt.toLocaleTimeString(),
      setPointTemp: `${log.setTempC}°C`,
      supplyAirTemp: log.supplyAirTempC != null ? `${log.supplyAirTempC}°C` : "-",
      returnAirTemp: log.returnAirTempC != null ? `${log.returnAirTempC}°C` : "-",
      ambientTemp: log.ambientTempC != null ? `${log.ambientTempC}°C` : "-",
      alarmStatus: log.alarmStatus as "NORMAL" | "ALARM",
      alarmDescription: log.alarmDescription ?? "-",
      technician: log.technician ?? "-",
      remarks: log.remarks ?? "-",
    }),
    docNumber
  );
}
