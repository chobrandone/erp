import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { TripSheet } from "@/lib/pdf/templates/TripSheet";

const CARGO_FR: Record<string, string> = {
  CONTAINER: "Conteneur", EQUIPMENT: "Équipement", GOODS: "Marchandise", EMPTY: "À vide",
};
const STATUS_FR: Record<string, string> = {
  ONGOING: "En cours", COMPLETED: "Terminée", CANCELLED: "Annulée",
};
const fmt = (d?: Date | null) => (d ? new Date(d).toLocaleString("fr-FR") : "-");

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.vehicleTrip.findUnique({ where: { id }, include: { vehicle: true } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));

  return pdfResponse(
    TripSheet({
      docNumber: trip.tripNo,
      qrDataUrl,
      generatedAt: new Date().toLocaleString("fr-FR"),
      plate: trip.vehicle.plateNumber,
      vehicle: `${trip.vehicle.make ?? ""} ${trip.vehicle.model ?? ""}`.trim() || "-",
      driverName: trip.driverName,
      driverPhone: trip.driverPhone ?? "-",
      cargoType: CARGO_FR[trip.cargoType] ?? trip.cargoType,
      containerNumber: trip.containerNumber ?? "-",
      cargoDescription: trip.cargoDescription ?? "-",
      origin: trip.origin ?? "-",
      destination: trip.destination,
      departure: fmt(trip.departureTime),
      expectedReturn: fmt(trip.expectedReturn),
      returnTime: fmt(trip.returnTime),
      status: STATUS_FR[trip.status] ?? trip.status,
      remarks: trip.remarks ?? "-",
    }),
    trip.tripNo
  );
}
