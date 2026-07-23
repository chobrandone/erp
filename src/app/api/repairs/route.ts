import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRight } from "@/lib/requireRight";

export async function GET() {
  const repairs = await prisma.repair.findMany({
    include: { container: { include: { containerType: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ repairs });
}

export async function POST(req: NextRequest) {
  const { forbidden } = await requireRight("create");
  if (forbidden) return forbidden;

  const body = await req.json();

  // Resolve the container: use the selected existing one, or find/create it
  // from the typed-in container number + chosen container type.
  let containerId = body.containerId ?? "";
  if (!containerId) {
    const containerNumber = String(body.containerNumber ?? "").trim().toUpperCase();
    if (!containerNumber || !body.containerTypeId) {
      return NextResponse.json({ error: "Provide a container number and type, or select an existing container." }, { status: 400 });
    }
    const existing = await prisma.container.findUnique({ where: { containerNumber } });
    containerId = existing
      ? existing.id
      : (await prisma.container.create({ data: { containerNumber, containerTypeId: body.containerTypeId, status: "IN_REPAIR" } })).id;
  }

  const repair = await prisma.repair.create({
    data: {
      containerId,
      component: body.component || null,
      damageType: body.damageType,
      severity: body.severity || null,
      repairMethod: body.repairMethod || null,
      repairResponsibility: body.repairResponsibility || null,
      description: body.description || null,
      estimatedCost: body.estimatedCost ? Number(body.estimatedCost) : null,
      status: "PENDING",
    },
  });
  await prisma.container.update({ where: { id: containerId }, data: { status: "IN_REPAIR" } });
  return NextResponse.json({ repair });
}
