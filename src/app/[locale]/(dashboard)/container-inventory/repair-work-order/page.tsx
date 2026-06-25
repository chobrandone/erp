import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RepairWorkOrderForm } from "@/components/repair/RepairWorkOrderForm";
import { WorkOrderStatusSelect } from "@/components/repair/WorkOrderStatusSelect";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function RepairWorkOrderPage() {
  const t = await getTranslations("repairWorkOrder");
  const tc = await getTranslations("common");

  const [workOrders, containers] = await Promise.all([
    prisma.repairWorkOrder.findMany({
      include: { container: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ include: { containerType: true } }),
  ]);

  const cols: Column<(typeof workOrders)[number]>[] = [
    { header: t("workOrderNo"), accessor: (r) => r.workOrderNo },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("assignedTechnician"), accessor: (r) => r.assignedTechnician ?? "-" },
    { header: t("completionStatus"), accessor: (r) => <WorkOrderStatusSelect id={r.id} status={r.completionStatus} /> },
    { header: tc("date"), accessor: (r) => formatDate(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={`/api/repair-work-orders/${r.id}/pdf`}
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
          <RepairWorkOrderForm
            containers={containers.map((c) => ({
              id: c.id,
              label: `${c.containerNumber} (${c.containerType.code})`,
            }))}
          />
        </div>
        <div className="lg:col-span-2">
          <DataTable columns={cols} rows={workOrders} />
        </div>
      </div>
    </div>
  );
}
