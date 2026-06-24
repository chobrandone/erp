import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReeferLogForm } from "@/components/reefer/ReeferLogForm";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Snowflake, AlertTriangle } from "lucide-react";

export default async function ReeferManagementPage() {
  const t = await getTranslations("reefer");
  const tc = await getTranslations("common");

  const [logs, reeferContainers] = await Promise.all([
    prisma.reeferMonitoring.findMany({
      include: { container: { include: { inventory: { include: { location: true } } } } },
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({
      where: { containerType: { isReefer: true } },
      include: { containerType: true },
    }),
  ]);

  const connectedCount = logs.filter((l) => l.powerStatus === "CONNECTED").length;
  const alarmCount = logs.filter((l) => l.powerStatus === "ALARM").length;

  const cols: Column<(typeof logs)[number]>[] = [
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("setPoint"), accessor: (r) => `${r.setTempC}°C` },
    { header: t("actualTemp"), accessor: (r) => `${r.actualTempC}°C` },
    { header: t("humidity"), accessor: (r) => (r.humidity != null ? `${r.humidity}%` : "-") },
    { header: t("powerStatus"), accessor: (r) => <StatusBadge status={r.powerStatus} /> },
    { header: t("recordedAt"), accessor: (r) => formatDateTime(r.recordedAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard title={t("connectedReefers")} value={connectedCount} icon={Snowflake} accentIndex={4} />
        <KPICard title={t("alarms")} value={alarmCount} icon={AlertTriangle} accentIndex={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border-color bg-surface p-5">
          <ReeferLogForm
            containers={reeferContainers.map((c) => ({
              id: c.id,
              label: `${c.containerNumber} (${c.containerType.code})`,
            }))}
          />
        </div>
        <div className="lg:col-span-2">
          <DataTable columns={cols} rows={logs} />
        </div>
      </div>
    </div>
  );
}
