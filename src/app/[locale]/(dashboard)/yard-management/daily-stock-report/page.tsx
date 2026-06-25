import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { prisma } from "@/lib/prisma";
import { Boxes, Snowflake, PackageCheck, Wrench, CheckCircle2, FileText } from "lucide-react";

export default async function DailyStockReportPage() {
  const t = await getTranslations("dailyStockReport");

  const [containers, byTypeRaw, containerTypes, underPtiContainerIds] = await Promise.all([
    prisma.container.findMany(),
    prisma.container.groupBy({ by: ["containerTypeId"], _count: true }),
    prisma.containerType.findMany(),
    prisma.pTIRequest.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
      select: { containerId: true },
    }),
  ]);

  const byType = byTypeRaw.map((b) => ({
    code: containerTypes.find((ct) => ct.id === b.containerTypeId)?.code ?? "Unknown",
    count: b._count,
  }));
  const reeferCount = containers.filter((c) => containerTypes.find((t) => t.id === c.containerTypeId)?.isReefer).length;
  const empty = containers.filter((c) => c.status === "EMPTY").length;
  const full = containers.filter((c) => c.status === "FULL").length;
  const underRepair = containers.filter((c) => c.status === "IN_REPAIR").length;
  const underPti = new Set(underPtiContainerIds.map((p) => p.containerId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <a
            href="/api/reports/daily-yard-stock/pdf"
            target="_blank"
            className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <FileText size={16} /> {t("print")}
          </a>
        }
      />

      <div>
        <h3 className="text-sm font-semibold text-fg-muted mb-2 uppercase tracking-wide">{t("summary")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {byType.map((b, i) => (
            <KPICard key={b.code} title={`${b.code} Containers`} value={b.count} icon={Boxes} accentIndex={i} />
          ))}
          <KPICard title="Reefers" value={reeferCount} icon={Snowflake} accentIndex={4} />
          <KPICard title={t("totalStock")} value={containers.length} icon={PackageCheck} accentIndex={5} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg-muted mb-2 uppercase tracking-wide">{t("statusBreakdown")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Empty" value={empty} icon={Boxes} accentIndex={2} />
          <KPICard title="Full" value={full} icon={PackageCheck} accentIndex={1} />
          <KPICard title="Under PTI" value={underPti} icon={CheckCircle2} accentIndex={3} />
          <KPICard title="Under Repair" value={underRepair} icon={Wrench} accentIndex={0} />
          <KPICard title="Ready for Release" value={full} icon={CheckCircle2} accentIndex={5} />
        </div>
      </div>
    </div>
  );
}
