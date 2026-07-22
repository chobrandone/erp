import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

// Resolve a container to an id for forms that let the user either pick an
// existing container or type a new container number + choose its ISO/type.
// Returns { containerId }. Creates the container if the typed number is new.
export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();

  if (body.containerId) {
    return NextResponse.json({ containerId: body.containerId });
  }

  const containerNumber = String(body.containerNumber ?? "").trim().toUpperCase();
  if (!containerNumber) {
    return NextResponse.json({ error: "Container number is required." }, { status: 400 });
  }

  const existing = await prisma.container.findUnique({ where: { containerNumber } });
  if (existing) {
    return NextResponse.json({ containerId: existing.id });
  }

  if (!body.containerTypeId) {
    return NextResponse.json({ error: "Choose a container / ISO type for the new container." }, { status: 400 });
  }

  const created = await prisma.container.create({
    data: {
      containerNumber,
      containerTypeId: body.containerTypeId,
      isoCode: body.isoCode || null,
      status: body.status || "EMPTY",
    },
  });
  return NextResponse.json({ containerId: created.id });
}
