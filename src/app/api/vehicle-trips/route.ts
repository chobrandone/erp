import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const trips = await prisma.vehicleTrip.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ trips });
}

// Dispatch a vehicle on a trip (marks it IN_USE).
export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: body.vehicleId },
    include: { trips: { where: { status: "ONGOING" } } },
  });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  if (vehicle.trips.length > 0) {
    return NextResponse.json({ error: "Vehicle already on an ongoing trip." }, { status: 409 });
  }
  if (!body.destination) {
    return NextResponse.json({ error: "Destination is required." }, { status: 400 });
  }

  const count = await prisma.vehicleTrip.count();
  const tripNo = `TRIP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const trip = await prisma.vehicleTrip.create({
    data: {
      tripNo,
      vehicleId: vehicle.id,
      driverName: body.driverName || vehicle.driverName || "-",
      driverPhone: body.driverPhone || vehicle.driverPhone || null,
      cargoType: body.cargoType || "CONTAINER",
      containerNumber: body.containerNumber || null,
      cargoDescription: body.cargoDescription || null,
      origin: body.origin || "Parc NS SARL — Port de Douala",
      destination: body.destination,
      expectedReturn: body.expectedReturn ? new Date(body.expectedReturn) : null,
      remarks: body.remarks || null,
    },
  });

  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: { operationalStatus: "IN_USE" },
  });

  return NextResponse.json({ trip });
}
