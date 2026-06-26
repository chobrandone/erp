import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReeferLogForm } from "@/components/reefer/ReeferLogForm";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { SearchBox } from "@/components/shared/SearchBox";
import { FileText, Plug } from "lucide-react";

export default async function ReeferMonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("reefer");
  const tc = await getTranslations("common");

  const [logs, containers] = await Promise.all([
    prisma.reeferMonitoring.findMany({
      where: q
        ? {
            OR: [
              { reportNo: { contains: q } },
              { plugNumber: { contains: q } },
              { technician: { contains: q } },
              { container: { containerNumber: { contains: q } } },
            ],
          }
        : {},
      include: { container: { include: { inventory: { include: { location: true } } } } },
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ where: { containerType: { isReefer: true } }, include: { containerType: true } }),
  ]);

  const cols: Column<(typeof logs)[number]>[] = [
    { header: t("reportNo"), accessor: (r) => r.reportNo ?? "-" },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("plugNumber"), accessor: (r) => r.plugNumber ?? "-" },
    { header: t("setPoint"), accessor: (r) => `${r.setTempC}°C` },
    { header: t("actualTemp"), accessor: (r) => `${r.actualTempC}°C` },
    { header: t("alarmStatus"), accessor: (r) => <StatusBadge status={r.alarmStatus} /> },
    { header: t("recordedAt"), accessor: (r) => formatDateTime(r.recordedAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={`/api/reefer-monitoring/${r.id}/pdf`}
          target="_blank"
          className="flex items-center gap-1 text-brand-100 hover:underline"
        >
          <FileText size={14} /> {tc("print")}
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("monitoringReportTitle")}
        subtitle={t("monitoringReportSubtitle")}
        actions={
          <>
            <SearchBox initialQuery={q} />
            <Link
              href="/container-inventory/reefer-monitoring/connections"
              className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
            >
              <Plug size={16} /> {t("connectionFormTitle")}
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border-color bg-surface p-5">
          <ReeferLogForm
            containers={containers.map((c) => ({
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
