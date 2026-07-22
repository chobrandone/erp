import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RepairForm } from "@/components/repair/RepairForm";
import { RepairStatusSelect } from "@/components/repair/RepairStatusSelect";
import { EditRepairButton } from "@/components/repair/EditRepairButton";
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton";
import { SearchBox } from "@/components/shared/SearchBox";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { formatXaf } from "@/lib/billing";
import { formatDate } from "@/lib/utils";
import {
  REPAIR_COMPONENTS,
  REPAIR_DAMAGE_TYPES,
  REPAIR_SEVERITIES,
  REPAIR_RESPONSIBILITIES,
  repairLabel,
} from "@/lib/repairOptions";

export default async function MaintenanceRepairPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("repair");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  const [repairs, containers, containerTypes] = await Promise.all([
    prisma.repair.findMany({
      where: q
        ? {
            OR: [
              { damageType: { contains: q } },
              { component: { contains: q } },
              { description: { contains: q } },
              { container: { containerNumber: { contains: q } } },
            ],
          }
        : {},
      include: { container: { include: { containerType: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.container.findMany({ include: { containerType: true } }),
    prisma.containerType.findMany({ orderBy: { code: "asc" } }),
  ]);

  const cols: Column<(typeof repairs)[number]>[] = [
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("component"), accessor: (r) => repairLabel(REPAIR_COMPONENTS, r.component, locale) },
    { header: t("damageType"), accessor: (r) => repairLabel(REPAIR_DAMAGE_TYPES, r.damageType, locale) },
    { header: t("severity"), accessor: (r) => repairLabel(REPAIR_SEVERITIES, r.severity, locale) },
    { header: t("repairResponsibility"), accessor: (r) => repairLabel(REPAIR_RESPONSIBILITIES, r.repairResponsibility, locale) },
    {
      header: t("estimatedCost"),
      accessor: (r) => (r.estimatedCost != null ? formatXaf(r.estimatedCost) : "-"),
    },
    { header: t("repairStatus"), accessor: (r) => <RepairStatusSelect id={r.id} status={r.status} /> },
    { header: "Date", accessor: (r) => formatDate(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <EditRepairButton
            repair={{
              id: r.id,
              component: r.component,
              damageType: r.damageType,
              severity: r.severity,
              repairMethod: r.repairMethod,
              repairResponsibility: r.repairResponsibility,
              description: r.description,
              estimatedCost: r.estimatedCost,
            }}
          />
          <ConfirmDeleteButton apiPath={`/api/repairs/${r.id}`} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} actions={<SearchBox initialQuery={q} />} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border-color bg-surface p-5">
          <RepairForm
            containers={containers.map((c) => ({
              id: c.id,
              label: `${c.containerNumber} (${c.containerType.code})`,
            }))}
            containerTypes={containerTypes.map((ct) => ({
              id: ct.id,
              label: `${ct.code} — ${ct.description}`,
            }))}
          />
        </div>
        <div className="lg:col-span-2">
          <DataTable columns={cols} rows={repairs} />
        </div>
      </div>
    </div>
  );
}
