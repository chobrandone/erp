import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Plus, FileText } from "lucide-react";
import { EditPTIPriorityButton } from "@/components/pti/EditPTIPriorityButton";
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton";

export default async function PTIManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("pti");
  const tc = await getTranslations("common");

  const requests = await prisma.pTIRequest.findMany({
    where: q
      ? {
          OR: [
            { docNumber: { contains: q } },
            { requestedBy: { contains: q } },
            { approvedBy: { contains: q } },
            { container: { containerNumber: { contains: q } } },
          ],
        }
      : {},
    include: { container: { include: { containerType: true } }, inspection: true },
    orderBy: { requestedAt: "desc" },
  });

  const cols: Column<(typeof requests)[number]>[] = [
    { header: tc("documentNo"), accessor: (r) => r.docNumber },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: "Type", accessor: (r) => r.container.containerType.code },
    {
      header: t("priority"),
      accessor: (r) =>
        r.inspection ? (
          r.priority
        ) : (
          <EditPTIPriorityButton id={r.id} priority={r.priority} />
        ),
    },
    { header: tc("status"), accessor: (r) => <StatusBadge status={r.status} /> },
    { header: tc("date"), accessor: (r) => formatDateTime(r.requestedAt) },
    {
      header: tc("actions"),
      accessor: (r) =>
        r.inspection ? (
          <Link
            href={`/pti-management/${r.id}/certificate?inspectionId=${r.inspection.id}`}
            className="text-brand-100 hover:underline"
          >
            {t("viewCertificate")}
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href={`/pti-management/${r.id}/inspect`} className="text-brand-100 hover:underline">
              {t("inspection")}
            </Link>
            <a
              href={`/api/pti-requests/${r.id}/pdf`}
              target="_blank"
              className="flex items-center gap-1 text-brand-100 hover:underline"
            >
              <FileText size={14} /> {tc("print")}
            </a>
            <ConfirmDeleteButton apiPath={`/api/pti-requests/${r.id}`} />
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
          <>            <Link
              href="/pti-management/new"
              className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              <Plus size={16} /> {t("newRequest")}
            </Link>
          </>
        }
      />
      <DataTable columns={cols} rows={requests} />
    </div>
  );
}
