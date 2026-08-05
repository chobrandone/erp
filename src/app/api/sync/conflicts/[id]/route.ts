import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

// Admin: resolve a sync conflict — either keep the server value (dismiss) or
// apply the device's value.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as { role?: string; name?: string | null };
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const resolution = body?.resolution === "USE_DEVICE" ? "USE_DEVICE" : "KEEP_SERVER";

  const conflict = await prisma.syncConflict.findUnique({ where: { id } });
  if (!conflict) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conflict.resolved) return NextResponse.json({ ok: true });

  if (resolution === "USE_DEVICE" && conflict.entity === "container") {
    const dv = JSON.parse(conflict.deviceValue || "{}");
    const data: Record<string, unknown> = {};
    if (typeof dv.status === "string") data.status = dv.status;
    if (Object.keys(data).length > 0) {
      await prisma.container.update({ where: { id: conflict.recordId }, data }).catch(() => {});
    }
  }

  await prisma.syncConflict.update({
    where: { id },
    data: { resolved: true, resolution, resolvedBy: user.name ?? "admin", resolvedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
