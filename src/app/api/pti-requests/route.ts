import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ptiRequestSchema } from "@/lib/validations/pti";
import { formatDocNumber } from "@/lib/pdf/docNumber";

export async function GET() {
  const requests = await prisma.pTIRequest.findMany({
    include: { container: { include: { containerType: true } }, inspection: true },
    orderBy: { requestedAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = ptiRequestSchema.parse(body);

  const count = await prisma.pTIRequest.count();
  const docNumber = formatDocNumber("PTI-REQ", count + 1);

  const request_ = await prisma.pTIRequest.create({
    data: {
      docNumber,
      containerId: data.containerId,
      priority: data.priority,
      status: "PENDING",
    },
  });

  return NextResponse.json({ request: request_ });
}
