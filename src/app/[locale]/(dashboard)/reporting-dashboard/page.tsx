import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { formatXaf } from "@/lib/billing";

export default async function ReportingDashboardPage() {
  const t = await getTranslations("reporting");

  const [gateTx, inventory, ptiRequests, invoices] = await Promise.all([
    prisma.gateTransaction.findMany({
      include: { container: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.inventory.findMany({
      include: { container: { include: { containerType: true } }, location: true },
      take: 20,
    }),
    prisma.pTIRequest.findMany({
      include: { container: true, inspection: true },
      orderBy: { requestedAt: "desc" },
      take: 20,
    }),
    prisma.invoice.findMany({ include: { customer: true }, orderBy: { issuedAt: "desc" }, take: 20 }),
  ]);

  const gateCols: Column<(typeof gateTx)[number]>[] = [
    { header: "Doc No", accessor: (r) => r.docNumber },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: "Type", accessor: (r) => <StatusBadge status={r.type} /> },
    { header: "Date", accessor: (r) => formatDateTime(r.createdAt) },
  ];

  const inventoryCols: Column<(typeof inventory)[number]>[] = [
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: "Type", accessor: (r) => r.container.containerType.code },
    { header: "Location", accessor: (r) => r.location.code },
    { header: "Status", accessor: (r) => <StatusBadge status={r.container.status} /> },
  ];

  const ptiCols: Column<(typeof ptiRequests)[number]>[] = [
    { header: "Doc No", accessor: (r) => r.docNumber },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Turnaround",
      accessor: (r) =>
        r.inspection
          ? `${Math.max(
              0,
              Math.round((r.inspection.inspectedAt.getTime() - r.requestedAt.getTime()) / 3600000)
            )}h`
          : "-",
    },
  ];

  const financeCols: Column<(typeof invoices)[number]>[] = [
    { header: "Invoice No", accessor: (r) => r.invoiceNumber },
    { header: "Customer", accessor: (r) => r.customer.name },
    { header: "Amount", accessor: (r) => formatXaf(r.amount) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Date", accessor: (r) => formatDate(r.issuedAt) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">
          {t("operational")} — {t("gateActivity")}
        </h3>
        <DataTable columns={gateCols} rows={gateTx} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">
          {t("operational")} — {t("inventoryReport")}
        </h3>
        <DataTable columns={inventoryCols} rows={inventory} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">
          {t("ptiReports")} — {t("ptiTurnaround")}
        </h3>
        <DataTable columns={ptiCols} rows={ptiRequests} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">
          {t("financial")} — {t("revenueReport")}
        </h3>
        <DataTable columns={financeCols} rows={invoices} />
      </section>
    </div>
  );
}
