import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Plus, FileText } from "lucide-react";

export default async function MovementsPage() {
  const t = await getTranslations("yard");
  const tc = await getTranslations("common");

  const movements = await prisma.containerMovement.findMany({
    include: { container: true, fromLocation: true, toLocation: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const cols: Column<(typeof movements)[number]>[] = [
    { header: tc("documentNo"), accessor: (r) => r.docNumber },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("from"), accessor: (r) => r.fromLocation?.code ?? "-" },
    { header: t("to"), accessor: (r) => r.toLocation.code },
    { header: t("reason"), accessor: (r) => r.reason.replace(/_/g, " ") },
    { header: tc("date"), accessor: (r) => formatDateTime(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={`/api/movements/${r.id}/pdf`}
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
      <PageHeader
        title={t("movements")}
        actions={
          <Link
            href="/yard-management/movements/new"
            className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> {t("newMovement")}
          </Link>
        }
      />
      <DataTable columns={cols} rows={movements} />
    </div>
  );
}
