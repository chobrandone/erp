import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const surveys = await prisma.damageSurvey.findMany({
    include: { container: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ surveys });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const count = await prisma.damageSurvey.count();
  const surveyNo = `DSR-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const survey = await prisma.damageSurvey.create({
    data: {
      surveyNo,
      containerId: body.containerId,
      location: body.location || null,
      surveyor: body.surveyor || null,
      frontEnd: body.frontEnd || null,
      rearEnd: body.rearEnd || null,
      roof: body.roof || null,
      floor: body.floor || null,
      leftSide: body.leftSide || null,
      rightSide: body.rightSide || null,
      severity: body.severity || "MINOR",
      photosAttached: !!body.photosAttached,
      repairRecommended: !!body.repairRecommended,
      remarks: body.remarks || null,
    },
  });
  return NextResponse.json({ survey });
}
