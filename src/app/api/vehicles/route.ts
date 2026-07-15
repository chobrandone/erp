import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    include: { documents: true },
    orderBy: { plateNumber: "asc" },
  });
  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const vehicle = await prisma.vehicle.create({
    data: {
      plateNumber: body.plateNumber,
      make: body.make || null,
      model: body.model || null,
      type: body.type || "TRUCK",
      driverName: body.driverName || null,
      driverPhone: body.driverPhone || null,
      status: body.status || "ACTIVE",
      ...(Array.isArray(body.documents) && body.documents.length > 0
        ? {
            documents: {
              create: body.documents
                .filter((d: { docType?: string; expiryDate?: string }) => d.docType && d.expiryDate)
                .map((d: { docType: string; reference?: string; issuedDate?: string; expiryDate: string; remarks?: string }) => ({
                  docType: d.docType,
                  reference: d.reference || null,
                  issuedDate: d.issuedDate ? new Date(d.issuedDate) : null,
                  expiryDate: new Date(d.expiryDate),
                  remarks: d.remarks || null,
                })),
            },
          }
        : {}),
    },
    include: { documents: true },
  });
  return NextResponse.json({ vehicle });
}
