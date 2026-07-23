import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRight } from "@/lib/requireRight";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { forbidden } = await requireRight("edit");
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();

  const repair = await prisma.repair.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.component !== undefined ? { component: body.component || null } : {}),
      ...(body.damageType !== undefined ? { damageType: body.damageType } : {}),
      ...(body.severity !== undefined ? { severity: body.severity || null } : {}),
      ...(body.repairMethod !== undefined ? { repairMethod: body.repairMethod || null } : {}),
      ...(body.repairResponsibility !== undefined ? { repairResponsibility: body.repairResponsibility || null } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.estimatedCost !== undefined
        ? { estimatedCost: body.estimatedCost === "" ? null : Number(body.estimatedCost) }
        : {}),
    },
  });

  // A repaired container returns to service; a non-repairable one is blocked.
  if (body.status === "REPAIRED") {
    await prisma.container.update({ where: { id: repair.containerId }, data: { status: "EMPTY" } });
  } else if (body.status === "NOT_REPAIRABLE") {
    await prisma.container.update({ where: { id: repair.containerId }, data: { status: "BLOCKED" } });
  }

  return NextResponse.json({ repair });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { forbidden } = await requireRight("delete");
  if (forbidden) return forbidden;

  const { id } = await params;
  await prisma.repair.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
