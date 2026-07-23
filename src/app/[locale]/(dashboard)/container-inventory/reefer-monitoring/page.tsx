import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReeferLogForm } from "@/components/reefer/ReeferLogForm";
import { ReeferActions } from "@/components/reefer/ReeferActions";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { FormModal } from "@/components/shared/FormModal";
import { FileText, Plug } from "lucide-react";

export default async function ReeferMonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("reefer");
  const tc = await getTranslations("common");
  const session = await auth();
  const u = session?.user as { role?: string; permissions?: string[] | null } | undefined;
  const canManage = u?.role === "ADMIN" || u?.permissions == null || (u?.permissions?.includes("reefer-management") ?? false);

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
  const reeferTypes = await prisma.containerType.findMany({ where: { isReefer: true }, orderBy: { code: "asc" } });
  const typeOpts = reeferTypes.map((ct) => ({ id: ct.id, label: `${ct.code} — ${ct.description}` }));
  const containerOpts = containers.map((c) => ({ id: c.id, label: `${c.containerNumber} (${c.containerType.code})` }));

  const cols: Column<(typeof logs)[number]>[] = [
    { header: t("reportNo"), accessor: (r) => r.reportNo ?? "-" },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("plugNumber"), accessor: (r) => r.plugNumber ?? "-" },
    { header: t("setPoint"), accessor: (r) => `${r.setTempC}°C` },
    { header: t("actualTemp"), accessor: (r) => `${r.actualTempC}°C` },
    { header: t("powerStatus"), accessor: (r) => <StatusBadge status={r.powerStatus} /> },
    { header: t("alarmStatus"), accessor: (r) => <StatusBadge status={r.alarmStatus} /> },
    { header: t("recordedAt"), accessor: (r) => formatDateTime(r.recordedAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <a
            href={`/api/reefer-monitoring/${r.id}/pdf`}
            target="_blank"
            className="flex items-center gap-1 text-brand-100 hover:underline"
          >
            <FileText size={14} /> {tc("print")}
          </a>
          <ReeferActions
            canManage={canManage}
            record={{
              id: r.id, setTempC: r.setTempC, actualTempC: r.actualTempC, humidity: r.humidity,
              plugNumber: r.plugNumber, powerStatus: r.powerStatus, alarmStatus: r.alarmStatus,
              technician: r.technician, remarks: r.remarks,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("monitoringReportTitle")}
        subtitle={t("monitoringReportSubtitle")}
        actions={
          <>            <Link
              href="/container-inventory/reefer-monitoring/connections"
              className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
            >
              <Plug size={16} /> {t("connectionFormTitle")}
            </Link>
            <FormModal triggerLabel={t("logReading")} title={t("logReading")}>
              <ReeferLogForm containers={containerOpts} containerTypes={typeOpts} />
            </FormModal>
          </>
        }
      />
      <DataTable columns={cols} rows={logs} />
    </div>
  );
}
