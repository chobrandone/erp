import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RepairWorkOrderForm } from "@/components/repair/RepairWorkOrderForm";
import { WorkOrderStatusSelect } from "@/components/repair/WorkOrderStatusSelect";
import { FormModal } from "@/components/shared/FormModal";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function RepairWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("repairWorkOrder");
  const tc = await getTranslations("common");

  const [workOrders, containers] = await Promise.all([
    prisma.repairWorkOrder.findMany({
      where: q
        ? {
            OR: [
              { workOrderNo: { contains: q } },
              { assignedTechnician: { contains: q } },
              { workToBeDone: { contains: q } },
              { container: { containerNumber: { contains: q } } },
            ],
          }
        : {},
      include: { container: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ include: { containerType: true } }),
  ]);
  const containerTypes = await prisma.containerType.findMany({ orderBy: { code: "asc" } });
  const containerOpts = containers.map((c) => ({ id: c.id, label: `${c.containerNumber} (${c.containerType.code})` }));
  const typeOpts = containerTypes.map((ct) => ({ id: ct.id, label: `${ct.code} — ${ct.description}` }));

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
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>            <FormModal triggerLabel={t("newWorkOrder")} title={t("newWorkOrder")}>
              <RepairWorkOrderForm containers={containerOpts} containerTypes={typeOpts} />
            </FormModal>
          </>
        }
      />
      <DataTable columns={cols} rows={workOrders} />
    </div>
  );
}
