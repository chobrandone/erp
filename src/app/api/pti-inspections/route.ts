import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ptiInspectionSchema } from "@/lib/validations/pti";
import { formatDocNumber } from "@/lib/pdf/docNumber";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const data = ptiInspectionSchema.parse(body);

  const ptiRequest = await prisma.pTIRequest.findUnique({
    where: { id: data.ptiRequestId },
    include: { container: { include: { containerType: true } } },
  });
  if (!ptiRequest) return NextResponse.json({ error: "PTI request not found" }, { status: 404 });

  const overallResult = data.checklist.every((c) => c.result === "PASS") ? "PASS" : "FAIL";

  const count = await prisma.pTIInspection.count();
  const certificateNumber = formatDocNumber("PTI", count + 1);

  const inspection = await prisma.pTIInspection.create({
    data: {
      ptiRequestId: data.ptiRequestId,
      certificateNumber,
      checklistJson: JSON.stringify(data.checklist),
      result: overallResult,
      remarks: data.remarks,
    },
  });

  await prisma.pTIRequest.update({
    where: { id: data.ptiRequestId },
    data: { status: overallResult === "PASS" ? "PASSED" : "FAILED" },
  });

  return NextResponse.json({ inspection });
}
