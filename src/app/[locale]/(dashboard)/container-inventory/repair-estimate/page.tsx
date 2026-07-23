import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RepairEstimateForm } from "@/components/repair/RepairEstimateForm";
import { FormModal } from "@/components/shared/FormModal";
import { prisma } from "@/lib/prisma";
import { formatXaf } from "@/lib/billing";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function RepairEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("repairEstimate");
  const tc = await getTranslations("common");

  const [estimates, containers] = await Promise.all([
    prisma.repairEstimate.findMany({
      where: q
        ? {
            OR: [
              { estimateNo: { contains: q } },
              { workDescription: { contains: q } },
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

  const cols: Column<(typeof estimates)[number]>[] = [
    { header: t("estimateNo"), accessor: (r) => r.estimateNo },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    {
      header: t("totalCost"),
      accessor: (r) => formatXaf(r.laborCost + r.materialCost + r.equipmentCost),
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
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>            <FormModal triggerLabel={t("newEstimate")} title={t("newEstimate")}>
              <RepairEstimateForm containers={containerOpts} containerTypes={typeOpts} />
            </FormModal>
          </>
        }
      />
      <DataTable columns={cols} rows={estimates} />
    </div>
  );
}
