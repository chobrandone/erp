import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { formatDocNumber } from "@/lib/pdf/docNumber";

export async function GET() {
  const logs = await prisma.reeferMonitoring.findMany({
    include: { container: { include: { inventory: { include: { location: true } } } } },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const count = await prisma.reeferMonitoring.count();
  const reportNo = formatDocNumber("RMR", count + 1);

  const log = await prisma.reeferMonitoring.create({
    data: {
      reportNo,
      containerId: body.containerId,
      plugNumber: body.plugNumber || null,
      setTempC: Number(body.setTempC),
      actualTempC: Number(body.actualTempC),
      supplyAirTempC: body.supplyAirTempC ? Number(body.supplyAirTempC) : null,
      returnAirTempC: body.returnAirTempC ? Number(body.returnAirTempC) : null,
      ambientTempC: body.ambientTempC ? Number(body.ambientTempC) : null,
      humidity: body.humidity ? Number(body.humidity) : null,
      powerStatus: body.powerStatus,
      alarmStatus: body.alarmStatus || "NORMAL",
      alarmDescription: body.alarmDescription || null,
      technician: body.technician || null,
      remarks: body.remarks || null,
    },
  });
  return NextResponse.json({ log });
}
