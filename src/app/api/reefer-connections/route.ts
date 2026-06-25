import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const connections = await prisma.reeferConnection.findMany({
    include: { container: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ connections });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const count = await prisma.reeferConnection.count();
  const referenceNo = `RCR-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const connection = await prisma.reeferConnection.create({
    data: {
      referenceNo,
      containerId: body.containerId,
      plugNumber: body.plugNumber || null,
      connectionTime: body.connectionTime ? new Date(body.connectionTime) : null,
      disconnectionTime: body.disconnectionTime ? new Date(body.disconnectionTime) : null,
      connectedBy: body.connectedBy || null,
      disconnectedBy: body.disconnectedBy || null,
      powerStatus: body.powerStatus || "OPERATIONAL",
      remarks: body.remarks || null,
    },
  });
  return NextResponse.json({ connection });
}
