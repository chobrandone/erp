import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { ReportFilterBar } from "@/components/shared/ReportFilterBar";
import { DocDeleteButton } from "@/components/documents/DocDeleteButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDateTime } from "@/lib/utils";
import { FileText } from "lucide-react";

type DocKind = "GATE_IN" | "GATE_OUT" | "MOVEMENT" | "PTI" | "INVOICE";
type DocRow = {
  id: string;
  kind: DocKind;
  sourceId: string;
  type: string;
  reference: string;
  generatedOn: Date;
  pdfUrl: string;
};

export default async function DocumentManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const { q, from, to } = await searchParams;
  const t = await getTranslations("documents");
  const tc = await getTranslations("common");
  const session = await auth();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const fromTime = from ? new Date(from).getTime() : null;
  const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;

  const [gateTx, movements, inspections, invoices] = await Promise.all([
    prisma.gateTransaction.findMany({
      include: { container: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.containerMovement.findMany({
      include: { container: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pTIInspection.findMany({
      include: { ptiRequest: { include: { container: true } } },
      orderBy: { inspectedAt: "desc" },
    }),
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const rows: DocRow[] = [
    ...gateTx.map((g) => ({
      id: `gt-${g.id}`,
      kind: (g.type === "GATE_IN" ? "GATE_IN" : "GATE_OUT") as DocKind,
      sourceId: g.id,
      type: g.type === "GATE_IN" ? "GATE_IN_EIR" : "GATE_OUT_EIR",
      reference: `${g.docNumber} — ${g.container.containerNumber}`,
      generatedOn: g.createdAt,
      pdfUrl: `/api/gate-transactions/${g.id}/pdf`,
    })),
    ...movements.map((m) => ({
      id: `mv-${m.id}`,
      kind: "MOVEMENT" as DocKind,
      sourceId: m.id,
      type: "MOVEMENT_ORDER",
      reference: `${m.docNumber} — ${m.container.containerNumber}`,
      generatedOn: m.createdAt,
      pdfUrl: `/api/movements/${m.id}/pdf`,
    })),
    ...inspections.map((i) => ({
      id: `pti-${i.id}`,
      kind: "PTI" as DocKind,
      sourceId: i.id,
      type: "PTI_CERTIFICATE",
      reference: `${i.certificateNumber ?? i.id} — ${i.ptiRequest.container.containerNumber}`,
      generatedOn: i.inspectedAt,
      pdfUrl: `/api/pti-inspections/${i.id}/pdf`,
    })),
    ...invoices.map((inv) => ({
      id: `inv-${inv.id}`,
      kind: "INVOICE" as DocKind,
      sourceId: inv.id,
      type: "INVOICE",
      reference: `${inv.invoiceNumber} — ${inv.customer.name}`,
      generatedOn: inv.issuedAt,
      pdfUrl: `/api/invoices/${inv.id}/pdf`,
    })),
  ].sort((a, b) => b.generatedOn.getTime() - a.generatedOn.getTime());

  const filteredRows = rows.filter((r) => {
    if (q && !`${r.type} ${r.reference}`.toLowerCase().includes(q.toLowerCase())) return false;
    const t = r.generatedOn.getTime();
    if (fromTime != null && t < fromTime) return false;
    if (toTime != null && t > toTime) return false;
    return true;
  });

  const cols: Column<DocRow>[] = [
    { header: t("type"), accessor: (r) => r.type.replace(/_/g, " ") },
    { header: t("reference"), accessor: (r) => r.reference },
    { header: t("generatedOn"), accessor: (r) => formatDateTime(r.generatedOn) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <a
            href={r.pdfUrl}
            target="_blank"
            className="flex items-center gap-1 text-brand-100 hover:underline"
          >
            <FileText size={14} /> {tc("print")}
          </a>
          {isAdmin && <DocDeleteButton kind={r.kind} sourceId={r.sourceId} />}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ReportFilterBar exportType="documents" initialQuery={q} initialFrom={from} initialTo={to} />
      <DataTable columns={cols} rows={filteredRows} />
    </div>
  );
}
