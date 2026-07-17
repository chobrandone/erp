import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

// Complete or cancel a trip → vehicle returns to the park.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  const trip = await prisma.vehicleTrip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const nextStatus = body.status === "CANCELLED" ? "CANCELLED" : "COMPLETED";

  const updated = await prisma.vehicleTrip.update({
    where: { id },
    data: {
      status: nextStatus,
      returnTime: new Date(),
      ...(body.remarks !== undefined ? { remarks: body.remarks } : {}),
    },
  });

  // Return the vehicle to the park (unless it's flagged for maintenance).
  const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
  if (vehicle && vehicle.status !== "MAINTENANCE") {
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { operationalStatus: "IN_PARK" },
    });
  }

  return NextResponse.json({ trip: updated });
}
