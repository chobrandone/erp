import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { FileText } from "lucide-react";

type DocRow = {
  id: string;
  type: string;
  reference: string;
  generatedOn: Date;
  pdfUrl: string;
};

export default async function DocumentManagementPage() {
  const t = await getTranslations("documents");
  const tc = await getTranslations("common");

  const [gateTx, movements, inspections] = await Promise.all([
    prisma.gateTransaction.findMany({
      where: { pdfPath: { not: null } },
      include: { container: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.containerMovement.findMany({
      where: { pdfPath: { not: null } },
      include: { container: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pTIInspection.findMany({
      where: { certificatePdfPath: { not: null } },
      include: { ptiRequest: { include: { container: true } } },
      orderBy: { inspectedAt: "desc" },
    }),
  ]);

  const rows: DocRow[] = [
    ...gateTx.map((g) => ({
      id: `gt-${g.id}`,
      type: g.type === "GATE_IN" ? "GATE_IN_EIR" : "GATE_OUT_EIR",
      reference: `${g.docNumber} — ${g.container.containerNumber}`,
      generatedOn: g.createdAt,
      pdfUrl: `/api/gate-transactions/${g.id}/pdf`,
    })),
    ...movements.map((m) => ({
      id: `mv-${m.id}`,
      type: "MOVEMENT_ORDER",
      reference: `${m.docNumber} — ${m.container.containerNumber}`,
      generatedOn: m.createdAt,
      pdfUrl: `/api/movements/${m.id}/pdf`,
    })),
    ...inspections.map((i) => ({
      id: `pti-${i.id}`,
      type: "PTI_CERTIFICATE",
      reference: `${i.ptiRequest.docNumber} — ${i.ptiRequest.container.containerNumber}`,
      generatedOn: i.inspectedAt,
      pdfUrl: `/api/pti-inspections/${i.id}/pdf`,
    })),
  ].sort((a, b) => b.generatedOn.getTime() - a.generatedOn.getTime());

  const cols: Column<DocRow>[] = [
    { header: t("type"), accessor: (r) => r.type.replace(/_/g, " ") },
    { header: t("reference"), accessor: (r) => r.reference },
    { header: t("generatedOn"), accessor: (r) => formatDateTime(r.generatedOn) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={r.pdfUrl}
          target="_blank"
          className="flex items-center gap-1 text-brand-100 hover:underline"
        >
          <FileText size={14} /> {tc("print")}
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DataTable columns={cols} rows={rows} />
    </div>
  );
}
