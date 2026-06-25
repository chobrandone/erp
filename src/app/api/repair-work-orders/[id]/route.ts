import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const workOrder = await prisma.repairWorkOrder.update({
    where: { id },
    data: {
      ...(body.completionStatus !== undefined ? { completionStatus: body.completionStatus } : {}),
    },
  });

  return NextResponse.json({ workOrder });
}
