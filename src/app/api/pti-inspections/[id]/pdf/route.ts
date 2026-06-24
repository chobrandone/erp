import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = await prisma.pTIInspection.findUnique({ where: { id } });
  if (!inspection?.certificatePdfPath) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }
  const buffer = await fs.readFile(path.join(process.cwd(), inspection.certificatePdfPath));
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pti-certificate.pdf"`,
    },
  });
}
