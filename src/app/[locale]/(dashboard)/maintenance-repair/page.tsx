import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RepairForm } from "@/components/repair/RepairForm";
import { RepairStatusSelect } from "@/components/repair/RepairStatusSelect";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function MaintenanceRepairPage() {
  const t = await getTranslations("repair");

  const [repairs, containers] = await Promise.all([
    prisma.repair.findMany({
      include: { container: { include: { containerType: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.container.findMany({ include: { containerType: true } }),
  ]);

  const cols: Column<(typeof repairs)[number]>[] = [
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("damageType"), accessor: (r) => r.damageType },
    {
      header: t("estimatedCost"),
      accessor: (r) => (r.estimatedCost != null ? `$${r.estimatedCost.toFixed(2)}` : "-"),
    },
    { header: "Status", accessor: (r) => <RepairStatusSelect id={r.id} status={r.status} /> },
    { header: "Date", accessor: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border-color bg-surface p-5">
          <RepairForm
            containers={containers.map((c) => ({
              id: c.id,
              label: `${c.containerNumber} (${c.containerType.code})`,
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
