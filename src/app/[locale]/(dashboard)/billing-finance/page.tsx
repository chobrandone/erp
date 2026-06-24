import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InvoiceForm } from "@/components/billing/InvoiceForm";
import { InvoiceStatusSelect } from "@/components/billing/InvoiceStatusSelect";
import { BillingDateRangeFilter } from "@/components/billing/BillingDateRangeFilter";
import { RevenueTrendChart } from "@/components/billing/RevenueTrendChart";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Receipt, Wallet, TrendingUp, AlertCircle, FileText } from "lucide-react";

export default async function BillingFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const t = await getTranslations("billing");

  const dateFilter =
    from || to
      ? {
          issuedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {};

  const [invoicesInRange, allUnpaid, customers] = await Promise.all([
    prisma.invoice.findMany({
      where: dateFilter,
      include: { customer: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.invoice.findMany({ where: { status: "UNPAID" }, include: { customer: true } }),
    prisma.customer.findMany(),
  ]);

  const totalBilledRange = invoicesInRange.reduce((s, i) => s + i.amount, 0);
  const totalPaidRange = invoicesInRange
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.amount, 0);
  const netIncome = totalPaidRange;

  const totalOutstanding = allUnpaid.reduce((s, i) => s + i.amount, 0);
  const today = new Date();
  const overdueInvoices = allUnpaid.filter((i) => i.dueAt && i.dueAt < today);
  const overdueAmount = overdueInvoices.reduce((s, i) => s + i.amount, 0);
  const collectionRate = totalBilledRange > 0 ? Math.round((totalPaidRange / totalBilledRange) * 100) : 0;

  const revenueByDay = new Map<string, number>();
  for (const inv of invoicesInRange) {
    if (inv.status !== "PAID" || !inv.paidAt) continue;
    const key = inv.paidAt.toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + inv.amount);
  }
  const revenueTrendData = Array.from(revenueByDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, amount]) => ({ date: date.slice(5), amount }));

  const cols: Column<(typeof invoicesInRange)[number]>[] = [
    { header: "Invoice No", accessor: (r) => r.invoiceNumber },
    { header: t("customer"), accessor: (r) => r.customer.name },
    { header: t("description"), accessor: (r) => r.description ?? "-" },
    { header: t("amount"), accessor: (r) => `$${r.amount.toFixed(2)}` },
    { header: "Status", accessor: (r) => <InvoiceStatusSelect id={r.id} status={r.status} /> },
    { header: t("issuedOn"), accessor: (r) => formatDate(r.issuedAt) },
    {
      header: t("dueOn"),
      accessor: (r) => {
        if (!r.dueAt) return "-";
        const isOverdue = r.status === "UNPAID" && r.dueAt < today;
        return isOverdue ? (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <AlertCircle size={13} /> {formatDate(r.dueAt)}
          </span>
        ) : (
          formatDate(r.dueAt)
        );
      },
    },
    {
      header: "PDF",
      accessor: (r) => (
        <a
          href={`/api/invoices/${r.id}/pdf`}
          target="_blank"
          className="flex items-center gap-1 text-brand-100 hover:underline"
        >
          <FileText size={14} />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <BillingDateRangeFilter initialFrom={from} initialTo={to} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t("totalOutstanding")} value={`$${totalOutstanding.toFixed(2)}`} icon={Receipt} accentIndex={1} />
        <KPICard title={t("totalPaid")} value={`$${totalPaidRange.toFixed(2)}`} icon={Wallet} accentIndex={5} />
        <KPICard title={t("netIncome")} value={`$${netIncome.toFixed(2)}`} icon={TrendingUp} accentIndex={4} />
        <KPICard title={t("overdueAmount")} value={`$${overdueAmount.toFixed(2)}`} icon={AlertCircle} accentIndex={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-fg-muted mb-2">
            {t("revenueTrend")} · {t("collectionRate")}: {collectionRate}%
          </h3>
          <RevenueTrendChart data={revenueTrendData} />
        </div>
        <div className="rounded-xl border border-border-color bg-surface p-5">
          <InvoiceForm customers={customers.map((c) => ({ id: c.id, label: c.name }))} />
        </div>
      </div>

      <DataTable columns={cols} rows={invoicesInRange} />
    </div>
  );
}
