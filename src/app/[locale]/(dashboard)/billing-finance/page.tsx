import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InvoiceForm } from "@/components/billing/InvoiceForm";
import { InvoiceStatusSelect } from "@/components/billing/InvoiceStatusSelect";
import { EditInvoiceButton } from "@/components/billing/EditInvoiceButton";
import { WaiverApproval } from "@/components/billing/WaiverApproval";
import { VoidInvoiceButton, RestoreInvoiceButton, PurgeInvoiceButton } from "@/components/billing/InvoiceSandboxActions";
import { BillingDateRangeFilter } from "@/components/billing/BillingDateRangeFilter";
import { RevenueTrendChart } from "@/components/billing/RevenueTrendChart";
import { SearchBox } from "@/components/shared/SearchBox";
import { FormModal } from "@/components/shared/FormModal";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate, formatDateTime } from "@/lib/utils";
import { formatXaf } from "@/lib/billing";
import { Receipt, Wallet, TrendingUp, AlertCircle, FileText, Archive } from "lucide-react";

export default async function BillingFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; q?: string }>;
}) {
  const { from, to, q } = await searchParams;
  const t = await getTranslations("billing");
  const tc = await getTranslations("common");
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN";
  const isFinance = role === "FINANCE";

  const dateFilter =
    from || to
      ? {
          issuedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {};

  const searchFilter = q
    ? {
        OR: [
          { invoiceNumber: { contains: q } },
          { description: { contains: q } },
          { customer: { name: { contains: q } } },
        ],
      }
    : {};

  const [invoicesInRange, allUnpaid, customers, billingRates, sandbox] = await Promise.all([
    prisma.invoice.findMany({
      where: { archived: false, ...dateFilter, ...searchFilter },
      include: { customer: true },
      omit: { receiptData: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.invoice.findMany({ where: { archived: false, status: "UNPAID" }, include: { customer: true }, omit: { receiptData: true } }),
    prisma.customer.findMany(),
    prisma.billingRate.findMany({ where: { active: true }, orderBy: { category: "asc" } }),
    prisma.invoice.findMany({ where: { archived: true }, include: { customer: true }, omit: { receiptData: true }, orderBy: { voidedAt: "desc" } }),
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
    { header: t("amount"), accessor: (r) => formatXaf(r.amount) },
    {
      header: t("waiverColumn"),
      accessor: (r) =>
        r.discountPending ? (
          isAdmin ? (
            <WaiverApproval
              id={r.id}
              requestedBy={r.discountRequestedBy ?? "-"}
              detail={r.discountPercent > 0 ? `${r.discountPercent}%` : formatXaf(r.discountAmount)}
            />
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold px-2 py-0.5">
              {t("waiverPendingBadge")}
            </span>
          )
        ) : r.discountAmount > 0 ? (
          <span className="text-xs text-emerald-600">
            − {r.discountPercent > 0 ? `${r.discountPercent}%` : formatXaf(r.discountAmount)}
          </span>
        ) : (
          <span className="text-fg-subtle">-</span>
        ),
    },
    {
      header: "Status",
      accessor: (r) => (
        <InvoiceStatusSelect
          id={r.id}
          status={r.status}
          hasReceipt={r.receiptUploadedAt != null}
          receiptVerified={r.receiptVerified}
        />
      ),
    },
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
      header: tc("actions"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <a
            href={`/api/invoices/${r.id}/pdf`}
            target="_blank"
            className="flex items-center gap-1 text-brand-100 hover:underline"
            title={tc("print")}
          >
            <FileText size={14} />
          </a>
          <EditInvoiceButton
            invoice={{
              id: r.id,
              customerId: r.customerId,
              description: r.description,
              amount: r.amount,
              dueAt: r.dueAt ? r.dueAt.toISOString() : null,
            }}
            customers={customers.map((c) => ({ id: c.id, label: c.name }))}
          />
          <VoidInvoiceButton id={r.id} invoiceNumber={r.invoiceNumber} />
        </div>
      ),
    },
  ];

  // Sandbox (voided/archived) invoices — nothing is ever hard-deleted by staff.
  const sandboxCols: Column<(typeof sandbox)[number]>[] = [
    { header: "Invoice No", accessor: (r) => r.invoiceNumber },
    { header: t("customer"), accessor: (r) => r.customer.name },
    { header: t("amount"), accessor: (r) => formatXaf(r.amount) },
    { header: "Voided by", accessor: (r) => r.voidedBy ?? "-" },
    { header: "Voided at", accessor: (r) => (r.voidedAt ? formatDateTime(r.voidedAt) : "-") },
    { header: "Reason", accessor: (r) => <span className="text-xs text-fg-muted">{r.voidReason ?? "-"}</span> },
    {
      header: tc("actions"),
      accessor: (r) =>
        isAdmin ? (
          <div className="flex items-center gap-3">
            <a href={`/api/invoices/${r.id}/pdf`} target="_blank" className="text-brand-100" title={tc("print")}><FileText size={14} /></a>
            <RestoreInvoiceButton id={r.id} />
            <PurgeInvoiceButton id={r.id} invoiceNumber={r.invoiceNumber} />
          </div>
        ) : (
          <span className="text-xs text-fg-subtle">Admin only</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <SearchBox initialQuery={q} extraParams={{ from, to }} />
            <FormModal triggerLabel={t("newInvoice")} title={t("newInvoice")} maxWidth="max-w-3xl">
              <InvoiceForm
                customers={customers.map((c) => ({ id: c.id, label: c.name }))}
                rates={billingRates.map((r) => ({ code: r.code, service: r.service, rateXaf: r.rateXaf }))}
                isAdmin={isAdmin}
                isFinance={isFinance}
              />
            </FormModal>
          </>
        }
      />

      <BillingDateRangeFilter initialFrom={from} initialTo={to} initialQuery={q} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t("totalOutstanding")} value={formatXaf(totalOutstanding)} icon={Receipt} accentIndex={1} />
        <KPICard title={t("totalPaid")} value={formatXaf(totalPaidRange)} icon={Wallet} accentIndex={5} />
        <KPICard title={t("netIncome")} value={formatXaf(netIncome)} icon={TrendingUp} accentIndex={4} />
        <KPICard title={t("overdueAmount")} value={formatXaf(overdueAmount)} icon={AlertCircle} accentIndex={2} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg-muted mb-2">
          {t("revenueTrend")} · {t("collectionRate")}: {collectionRate}%
        </h3>
        <RevenueTrendChart data={revenueTrendData} />
      </div>

      <DataTable columns={cols} rows={invoicesInRange} />

      {/* Sandbox — voided invoices are retained here, never hard-deleted. */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Archive size={16} className="text-amber-600" />
          <h3 className="text-sm font-semibold text-fg-muted">
            Sandbox — Voided invoices ({sandbox.length})
          </h3>
        </div>
        <p className="text-xs text-fg-subtle">
          Invoices moved here are retained for review. Restoring or permanent deletion is restricted to an
          administrator; permanent deletion requires password confirmation and is recorded in the audit trail.
        </p>
        {sandbox.length > 0 ? (
          <DataTable columns={sandboxCols} rows={sandbox} />
        ) : (
          <p className="text-sm text-fg-subtle rounded-lg border border-border-color p-4">No voided invoices.</p>
        )}
      </section>
    </div>
  );
}
