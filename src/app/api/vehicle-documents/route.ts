import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRight } from "@/lib/requireRight";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string };

// Add a document (with its expiry) to a vehicle.
export async function POST(req: NextRequest) {
  const { session, forbidden } = await requireRight("create");
  if (forbidden) return forbidden;

  const body = await req.json();
  if (!body.vehicleId || !body.docType || !body.expiryDate) {
    return NextResponse.json({ error: "Vehicle, document type and expiry date are required." }, { status: 400 });
  }

  const doc = await prisma.vehicleDocument.create({
    data: {
      vehicleId: body.vehicleId,
      docType: body.docType,
      reference: body.reference || null,
      issuedDate: body.issuedDate ? new Date(body.issuedDate) : null,
      expiryDate: new Date(body.expiryDate),
      remarks: body.remarks || null,
    },
  });
  await logAudit({ userId: (session!.user as SessionUser).id, action: "VEHICLE_DOC_CREATE", entity: "VehicleDocument", entityId: doc.id, meta: { vehicleId: body.vehicleId, docType: body.docType } });
  return NextResponse.json({ document: doc });
}
