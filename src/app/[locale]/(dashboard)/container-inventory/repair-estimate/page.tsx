import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RepairEstimateForm } from "@/components/repair/RepairEstimateForm";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function RepairEstimatePage() {
  const t = await getTranslations("repairEstimate");
  const tc = await getTranslations("common");

  const [estimates, containers] = await Promise.all([
    prisma.repairEstimate.findMany({
      include: { container: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ include: { containerType: true } }),
  ]);

  const cols: Column<(typeof estimates)[number]>[] = [
    { header: t("estimateNo"), accessor: (r) => r.estimateNo },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    {
      header: t("totalCost"),
      accessor: (r) => `$${(r.laborCost + r.materialCost + r.equipmentCost).toFixed(2)}`,
    },
    { header: t("customerApproved"), accessor: (r) => (r.customerApproved ? tc("yes") : tc("no")) },
    { header: tc("date"), accessor: (r) => formatDate(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={`/api/repair-estimates/${r.id}/pdf`}
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
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border-color bg-surface p-5">
          <RepairEstimateForm
            containers={containers.map((c) => ({
              id: c.id,
              label: `${c.containerNumber} (${c.containerType.code})`,
            }))}
          />
        </div>
        <div className="lg:col-span-2">
          <DataTable columns={cols} rows={estimates} />
        </div>
      </div>
    </div>
  );
}
