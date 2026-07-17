import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReportsToolbar } from "@/components/reporting/ReportsToolbar";
import { DailyRecordPicker } from "@/components/reporting/DailyRecordPicker";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { formatXaf } from "@/lib/billing";
import { FileSpreadsheet } from "lucide-react";
import type { Prisma } from "@prisma/client";

function ExportBtn({ type, q, from, to }: { type: string; q?: string; from?: string; to?: string }) {
  const params = new URLSearchParams({ type });
  if (q) params.set("q", q);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return (
    <a href={`/api/reports/export?${params.toString()}`} target="_blank" className="flex items-center gap-1.5 text-xs rounded-lg border border-border-color px-2.5 py-1.5 hover:bg-surface-alt">
      <FileSpreadsheet size={14} /> Export Excel
    </a>
  );
}

export default async function ReportingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; date?: string }>;
}) {
  const { q, from, to, date } = await searchParams;
  const t = await getTranslations("reporting");

  const insensitive = "insensitive" as const;
  const like = (s: string) => ({ contains: s, mode: insensitive });
  const dateRange = from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(`${to}T23:59:59`) : undefined } : undefined;

  const gateWhere: Prisma.GateTransactionWhereInput = {
    ...(dateRange ? { createdAt: dateRange } : {}),
    ...(q ? { OR: [{ docNumber: like(q) }, { truckPlate: like(q) }, { container: { containerNumber: like(q) } }] } : {}),
  };
  const invWhere: Prisma.InventoryWhereInput = q ? { container: { containerNumber: like(q) } } : {};
  const ptiWhere: Prisma.PTIRequestWhereInput = q ? { OR: [{ docNumber: like(q) }, { container: { containerNumber: like(q) } }] } : {};
  const finWhere: Prisma.InvoiceWhereInput = {
    ...(dateRange ? { issuedAt: dateRange } : {}),
    ...(q ? { OR: [{ invoiceNumber: like(q) }, { customer: { name: like(q) } }] } : {}),
  };

  const [gateTx, inventory, ptiRequests, invoices] = await Promise.all([
    prisma.gateTransaction.findMany({ where: gateWhere, include: { container: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.inventory.findMany({ where: invWhere, include: { container: { include: { containerType: true } }, location: true }, take: 30 }),
    prisma.pTIRequest.findMany({ where: ptiWhere, include: { container: true, inspection: true }, orderBy: { requestedAt: "desc" }, take: 30 }),
    prisma.invoice.findMany({ where: finWhere, include: { customer: true }, orderBy: { issuedAt: "desc" }, take: 30 }),
  ]);

  // --- Daily records (only when a date is chosen) ---
  let dailyRows: { id: string; time: string; activity: string; ref: string; detail: string }[] = [];
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);
    const range = { gte: start, lte: end };
    const [g, mv, inv, tr] = await Promise.all([
      prisma.gateTransaction.findMany({ where: { createdAt: range }, include: { container: true } }),
      prisma.containerMovement.findMany({ where: { createdAt: range }, include: { container: true, toLocation: true } }),
      prisma.invoice.findMany({ where: { issuedAt: range }, include: { customer: true } }),
      prisma.vehicleTrip.findMany({ where: { departureTime: range }, include: { vehicle: true } }),
    ]);
    const tm = (x: Date) => new Date(x).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    dailyRows = [
      ...g.map((x) => ({ id: x.id, time: tm(x.createdAt), activity: x.type === "GATE_IN" ? "Entrée" : "Sortie", ref: x.docNumber, detail: `${x.container.containerNumber} · ${x.truckPlate}` })),
      ...mv.map((x) => ({ id: x.id, time: tm(x.createdAt), activity: "Mouvement", ref: x.docNumber, detail: `${x.container.containerNumber} → ${x.toLocation.code}` })),
      ...inv.map((x) => ({ id: x.id, time: tm(x.issuedAt), activity: "Facture", ref: x.invoiceNumber, detail: `${x.customer.name} · ${formatXaf(x.amount)}` })),
      ...tr.map((x) => ({ id: x.id, time: tm(x.departureTime), activity: "Mission", ref: x.tripNo, detail: `${x.vehicle.plateNumber} → ${x.destination}` })),
    ].sort((a, b) => a.time.localeCompare(b.time));
  }

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
    { header: "Result", accessor: (r) => r.inspection?.result ?? "-" },
  ];
  const financeCols: Column<(typeof invoices)[number]>[] = [
    { header: "Invoice No", accessor: (r) => r.invoiceNumber },
    { header: "Customer", accessor: (r) => r.customer.name },
    { header: "Amount", accessor: (r) => formatXaf(r.amount) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Date", accessor: (r) => formatDate(r.issuedAt) },
  ];
  const dailyCols: Column<(typeof dailyRows)[number]>[] = [
    { header: "Heure", accessor: (r) => r.time },
    { header: "Activité", accessor: (r) => <StatusBadge status={r.activity} /> },
    { header: "Référence", accessor: (r) => r.ref },
    { header: "Détail", accessor: (r) => r.detail },
  ];

  const Section = ({ title, type, children }: { title: string; type: string; children: React.ReactNode }) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">{title}</h3>
        <ExportBtn type={type} q={q} from={from} to={to} />
      </div>
      {children}
    </section>
  );

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <ReportsToolbar q={q} from={from} to={to} />

      {/* Daily records */}
      <section className="space-y-3 rounded-xl border border-border-color bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">Journal quotidien (Daily Records)</h3>
        <DailyRecordPicker date={date} />
        {date && (
          dailyRows.length > 0 ? (
            <DataTable columns={dailyCols} rows={dailyRows} />
          ) : (
            <p className="text-sm text-fg-subtle">Aucune activité enregistrée le {date}.</p>
          )
        )}
      </section>

      <Section title={`${t("operational")} — ${t("gateActivity")}`} type="gate">
        <DataTable columns={gateCols} rows={gateTx} />
      </Section>
      <Section title={`${t("operational")} — ${t("inventoryReport")}`} type="inventory">
        <DataTable columns={inventoryCols} rows={inventory} />
      </Section>
      <Section title={`${t("ptiReports")} — ${t("ptiTurnaround")}`} type="pti">
        <DataTable columns={ptiCols} rows={ptiRequests} />
      </Section>
      <Section title={`${t("financial")} — ${t("revenueReport")}`} type="invoices">
        <DataTable columns={financeCols} rows={invoices} />
      </Section>
    </div>
  );
}
