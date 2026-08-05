import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

// Admin: list unresolved sync conflicts for review.
export async function GET() {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  if ((session!.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const conflicts = await prisma.syncConflict.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ conflicts });
}
