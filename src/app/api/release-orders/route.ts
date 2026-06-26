import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const releaseOrders = await prisma.releaseOrder.findMany({
    include: { container: true, customer: true, shippingLine: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ releaseOrders });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const count = await prisma.releaseOrder.count();
  const releaseNo = `REL-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const releaseOrder = await prisma.releaseOrder.create({
    data: {
      releaseNo,
      containerId: body.containerId,
      customerId: body.customerId || null,
      shippingLineId: body.shippingLineId || null,
      authorizedReleaseDate: body.authorizedReleaseDate ? new Date(body.authorizedReleaseDate) : null,
      destination: body.destination || null,
      approvedBy: body.approvedBy || null,
      gateAuthorization: body.gateAuthorization || "APPROVED",
      remarks: body.remarks || null,
    },
  });
  return NextResponse.json({ releaseOrder });
}
