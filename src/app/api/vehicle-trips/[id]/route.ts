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

  // Redispatch: the vehicle is sent onward to another location/customer without
  // returning to the park. Close the current leg and open a new ongoing leg.
  if (body.status === "REDISPATCH") {
    if (!body.destination) return NextResponse.json({ error: "Destination is required." }, { status: 400 });

    await prisma.vehicleTrip.update({
      where: { id },
      data: { status: "COMPLETED", returnTime: new Date() },
    });

    const count = await prisma.vehicleTrip.count();
    const tripNo = `TRIP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
    const onward = await prisma.vehicleTrip.create({
      data: {
        tripNo,
        vehicleId: trip.vehicleId,
        driverName: body.driverName || trip.driverName,
        driverPhone: trip.driverPhone,
        cargoType: body.cargoType || trip.cargoType,
        containerNumber: body.containerNumber ?? trip.containerNumber,
        cargoDescription: body.cargoDescription ?? trip.cargoDescription,
        origin: trip.destination, // the previous destination is the new origin
        destination: body.destination,
        expectedReturn: body.expectedReturn ? new Date(body.expectedReturn) : null,
        remarks: body.remarks || null,
      },
    });

    // Vehicle stays IN_USE.
    await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { operationalStatus: "IN_USE" } });
    return NextResponse.json({ trip: onward });
  }

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
