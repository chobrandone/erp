import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { DamageSurveyPdf } from "@/lib/pdf/templates/DamageSurvey";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await prisma.damageSurvey.findUnique({
    where: { id },
    include: { container: { include: { inventory: { include: { location: true } } } } },
  });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(survey.surveyNo);
  return pdfResponse(
    DamageSurveyPdf({
      docNumber: survey.surveyNo,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      containerNumber: survey.container.containerNumber,
      location: survey.location ?? survey.container.inventory?.location.code ?? "-",
      surveyDate: survey.surveyDate.toLocaleDateString(),
      surveyor: survey.surveyor ?? "-",
      frontEnd: survey.frontEnd ?? "-",
      rearEnd: survey.rearEnd ?? "-",
      roof: survey.roof ?? "-",
      floor: survey.floor ?? "-",
      leftSide: survey.leftSide ?? "-",
      rightSide: survey.rightSide ?? "-",
      severity: survey.severity as "MINOR" | "MODERATE" | "MAJOR",
      photosAttached: survey.photosAttached,
      repairRecommended: survey.repairRecommended,
    }),
    survey.surveyNo
  );
}
