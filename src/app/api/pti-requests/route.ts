import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ptiRequestSchema } from "@/lib/validations/pti";
import { formatDocNumber } from "@/lib/pdf/docNumber";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const requests = await prisma.pTIRequest.findMany({
    include: { container: { include: { containerType: true } }, inspection: true },
    orderBy: { requestedAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const data = ptiRequestSchema.parse(body);

  // Resolve the container: use the selected existing one, or find/create it
  // from the typed-in container number + chosen container type.
  let containerId = data.containerId ?? "";
  if (!containerId) {
    const containerNumber = data.containerNumber!.trim().toUpperCase();
    const existing = await prisma.container.findUnique({ where: { containerNumber } });
    if (existing) {
      containerId = existing.id;
    } else {
      const created = await prisma.container.create({
        data: {
          containerNumber,
          containerTypeId: data.containerTypeId!,
          status: "EMPTY",
        },
      });
      containerId = created.id;
    }
  }

  const count = await prisma.pTIRequest.count();
  const docNumber = formatDocNumber("PTI-REQ", count + 1);

  const request_ = await prisma.pTIRequest.create({
    data: {
      docNumber,
      containerId,
      customerId: data.customerId || null,
      shippingLineId: data.shippingLineId || null,
      priority: data.priority,
      requiredDate: data.requiredDate ? new Date(data.requiredDate) : null,
      inspectionType: data.inspectionType,
      remarks: data.remarks || null,
      requestedBy: data.requestedBy || null,
      approvedBy: data.approvedBy || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ request: request_ });
}
