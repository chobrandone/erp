import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.reeferMonitoring.findMany({
    include: { container: { include: { inventory: { include: { location: true } } } } },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const log = await prisma.reeferMonitoring.create({
    data: {
      containerId: body.containerId,
      setTempC: Number(body.setTempC),
      actualTempC: Number(body.actualTempC),
      humidity: body.humidity ? Number(body.humidity) : null,
      powerStatus: body.powerStatus,
    },
  });
  return NextResponse.json({ log });
}
