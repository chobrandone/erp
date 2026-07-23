import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "@/i18n/navigation";
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDateTime } from "@/lib/utils";
import { Plus, FileSpreadsheet } from "lucide-react";

export default async function GateOperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("gateOperations");
  const tc = await getTranslations("common");
  const isAdmin = (((await auth())?.user) as { role?: string } | undefined)?.role === "ADMIN";

  const transactions = await prisma.gateTransaction.findMany({
    where: q
      ? {
          OR: [
            { docNumber: { contains: q } },
            { truckPlate: { contains: q } },
            { driverName: { contains: q } },
            { sealNumber: { contains: q } },
            { container: { containerNumber: { contains: q } } },
          ],
        }
      : {},
    include: { container: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const cols: Column<(typeof transactions)[number]>[] = [
    { header: tc("documentNo"), accessor: (r) => r.docNumber },
    { header: t("type"), accessor: (r) => <StatusBadge status={r.type} /> },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("truck"), accessor: (r) => r.truckPlate },
    { header: tc("status"), accessor: (r) => <StatusBadge status={r.condition} /> },
    { header: tc("date"), accessor: (r) => formatDateTime(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <Link href={`/gate-operations/${r.id}`} className="text-brand-100 hover:underline">
            {tc("viewDetails")}
          </Link>
          {isAdmin && <ConfirmDeleteButton apiPath={`/api/gate-transactions/${r.id}`} />}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>            <a
              href="/api/reports/export?type=gate"
              target="_blank"
              className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
            >
              <FileSpreadsheet size={16} /> {tc("exportExcel")}
            </a>
            <Link
              href="/gate-operations/gate-in"
              className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              <Plus size={16} /> {t("newGateIn")}
            </Link>
            <Link
              href="/gate-operations/gate-out"
              className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
            >
              <Plus size={16} /> {t("newGateOut")}
            </Link>
          </>
        }
      />
      <DataTable columns={cols} rows={transactions} />
    </div>
  );
}
