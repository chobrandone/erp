import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { GateMovesChart } from "@/components/dashboard/GateMovesChart";
import { Warehouse, Snowflake, ClipboardCheck, DoorOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  const [containersInYard, totalSlots, reeferSlotsTotal, reeferSlotsUsed, ptiCompletedToday, gateMovesToday, byType, gateMovesRaw] =
    await Promise.all([
      prisma.inventory.count(),
      prisma.location.count(),
      prisma.location.count({ where: { isReeferSlot: true } }),
      prisma.inventory.count({ where: { location: { isReeferSlot: true } } }),
      prisma.pTIInspection.count({ where: { inspectedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.gateTransaction.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.container.groupBy({ by: ["containerTypeId"], _count: true }),
      prisma.gateTransaction.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true },
      }),
    ]);

  const containerTypes = await prisma.containerType.findMany();
  const inventoryByType = byType.map((b) => ({
    type: containerTypes.find((ct) => ct.id === b.containerTypeId)?.code ?? "Unknown",
    count: b._count,
  }));

  const gateMovesChartData: { date: string; moves: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    const count = gateMovesRaw.filter((m) => m.createdAt.toDateString() === d.toDateString()).length;
    gateMovesChartData.push({ date: label, moves: count });
  }

  const yardOccupancyPct = totalSlots ? Math.round((containersInYard / totalSlots) * 100) : 0;
  const reeferOccupancyPct = reeferSlotsTotal ? Math.round((reeferSlotsUsed / reeferSlotsTotal) * 100) : 0;

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title={t("yardOccupancy")} value={yardOccupancyPct} suffix="%" icon={Warehouse} accentIndex={0} />
        <KPICard title={t("reeferSlotsUsed")} value={reeferOccupancyPct} suffix="%" icon={Snowflake} accentIndex={4} />
        <KPICard title={t("ptiCompletedToday")} value={ptiCompletedToday} icon={ClipboardCheck} accentIndex={2} />
        <KPICard title={t("gateMovesToday")} value={gateMovesToday} icon={DoorOpen} accentIndex={1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-fg-muted mb-2">{t("occupancyChart")}</h3>
          <OccupancyChart data={inventoryByType} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-fg-muted mb-2">{t("gateMovesChart")}</h3>
          <GateMovesChart data={gateMovesChartData} />
        </div>
      </div>
    </div>
  );
}
