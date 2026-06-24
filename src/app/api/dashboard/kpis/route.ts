import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    containersInYard,
    totalSlots,
    reeferSlotsTotal,
    reeferSlotsUsed,
    ptiCompletedToday,
    gateMovesToday,
    byType,
    last7DaysGateMoves,
  ] = await Promise.all([
    prisma.inventory.count(),
    prisma.location.count(),
    prisma.location.count({ where: { isReeferSlot: true } }),
    prisma.inventory.count({ where: { location: { isReeferSlot: true } } }),
    prisma.pTIInspection.count({
      where: { inspectedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.gateTransaction.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.container.groupBy({ by: ["containerTypeId"], _count: true }),
    prisma.gateTransaction.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, type: true },
    }),
  ]);

  const containerTypes = await prisma.containerType.findMany();
  const inventoryByType = byType.map((b) => ({
    type: containerTypes.find((t) => t.id === b.containerTypeId)?.code ?? "Unknown",
    count: b._count,
  }));

  const days: { date: string; moves: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    const count = last7DaysGateMoves.filter(
      (m) => m.createdAt.toDateString() === d.toDateString()
    ).length;
    days.push({ date: key, moves: count });
  }

  return NextResponse.json({
    yardOccupancyPct: totalSlots ? Math.round((containersInYard / totalSlots) * 100) : 0,
    reeferOccupancyPct: reeferSlotsTotal ? Math.round((reeferSlotsUsed / reeferSlotsTotal) * 100) : 0,
    ptiCompletedToday,
    gateMovesToday,
    containersInYard,
    inventoryByType,
    gateMovesChart: days,
  });
}
