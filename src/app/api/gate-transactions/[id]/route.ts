import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.gateTransaction.findUnique({
    where: { id },
    include: { container: { include: { containerType: true } }, customer: true, shippingLine: true },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ transaction });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const transaction = await prisma.gateTransaction.update({
    where: { id },
    data: {
      ...(body.truckPlate !== undefined ? { truckPlate: body.truckPlate } : {}),
      ...(body.driverName !== undefined ? { driverName: body.driverName } : {}),
      ...(body.driverIdNumber !== undefined ? { driverIdNumber: body.driverIdNumber || null } : {}),
      ...(body.sealNumber !== undefined ? { sealNumber: body.sealNumber || null } : {}),
      ...(body.condition !== undefined ? { condition: body.condition } : {}),
      ...(body.damageRemarks !== undefined ? { damageRemarks: body.damageRemarks || null } : {}),
      ...(body.destination !== undefined ? { destination: body.destination || null } : {}),
      ...(body.releaseOrderNo !== undefined ? { releaseOrderNo: body.releaseOrderNo || null } : {}),
    },
  });

  return NextResponse.json({ transaction });
}
