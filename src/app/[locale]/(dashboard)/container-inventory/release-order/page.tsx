import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReleaseOrderForm } from "@/components/yard/ReleaseOrderForm";
import { FormModal } from "@/components/shared/FormModal";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function ReleaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("releaseOrder");
  const tc = await getTranslations("common");

  const [releaseOrders, containers, customers, shippingLines] = await Promise.all([
    prisma.releaseOrder.findMany({
      where: q
        ? {
            OR: [
              { releaseNo: { contains: q } },
              { destination: { contains: q } },
              { approvedBy: { contains: q } },
              { container: { containerNumber: { contains: q } } },
              { customer: { name: { contains: q } } },
            ],
          }
        : {},
      include: { container: true, customer: true, shippingLine: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ include: { containerType: true } }),
    prisma.customer.findMany(),
    prisma.shippingLine.findMany(),
  ]);
  const containerTypes = await prisma.containerType.findMany({ orderBy: { code: "asc" } });
  const containerOpts = containers.map((c) => ({ id: c.id, label: `${c.containerNumber} (${c.containerType.code})` }));
  const typeOpts = containerTypes.map((ct) => ({ id: ct.id, label: `${ct.code} — ${ct.description}` }));

  const cols: Column<(typeof releaseOrders)[number]>[] = [
    { header: t("releaseNo"), accessor: (r) => r.releaseNo },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: "Customer", accessor: (r) => r.customer?.name ?? "-" },
    { header: t("destination"), accessor: (r) => r.destination ?? "-" },
    { header: t("gateAuthorization"), accessor: (r) => <StatusBadge status={r.gateAuthorization} /> },
    { header: tc("date"), accessor: (r) => formatDate(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={`/api/release-orders/${r.id}/pdf`}
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
          <>            <FormModal triggerLabel={t("newRelease")} title={t("newRelease")}>
              <ReleaseOrderForm
                containers={containerOpts}
                containerTypes={typeOpts}
                customers={customers.map((c) => ({ id: c.id, label: c.name }))}
                shippingLines={shippingLines.map((s) => ({ id: s.id, label: s.name }))}
              />
            </FormModal>
          </>
        }
      />
      <DataTable columns={cols} rows={releaseOrders} />
    </div>
  );
}
