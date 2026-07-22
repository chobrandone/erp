import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReeferConnectionForm } from "@/components/reefer/ReeferConnectionForm";
import { ReeferConnectionActions } from "@/components/reefer/ReeferConnectionActions";
import { SearchBox } from "@/components/shared/SearchBox";
import { FormModal } from "@/components/shared/FormModal";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDateTime } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function ReeferConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("reefer");
  const tc = await getTranslations("common");
  const session = await auth();
  const u = session?.user as { role?: string; permissions?: string[] | null } | undefined;
  const canManage = u?.role === "ADMIN" || u?.permissions == null || (u?.permissions?.includes("reefer-management") ?? false);

  const [connections, containers] = await Promise.all([
    prisma.reeferConnection.findMany({
      where: q
        ? {
            OR: [
              { referenceNo: { contains: q } },
              { plugNumber: { contains: q } },
              { connectedBy: { contains: q } },
              { container: { containerNumber: { contains: q } } },
            ],
          }
        : {},
      include: { container: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ where: { containerType: { isReefer: true } }, include: { containerType: true } }),
  ]);
  const reeferTypes = await prisma.containerType.findMany({ where: { isReefer: true }, orderBy: { code: "asc" } });
  const typeOpts = reeferTypes.map((ct) => ({ id: ct.id, label: `${ct.code} — ${ct.description}` }));
  const containerOpts = containers.map((c) => ({ id: c.id, label: `${c.containerNumber} (${c.containerType.code})` }));

  const cols: Column<(typeof connections)[number]>[] = [
    { header: t("referenceNo"), accessor: (r) => r.referenceNo },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("plugNumber"), accessor: (r) => r.plugNumber ?? "-" },
    { header: t("powerStatus"), accessor: (r) => <StatusBadge status={r.powerStatus} /> },
    { header: tc("date"), accessor: (r) => formatDateTime(r.createdAt) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <a
            href={`/api/reefer-connections/${r.id}/pdf`}
            target="_blank"
            className="flex items-center gap-1 text-brand-100 hover:underline"
          >
            <FileText size={14} /> {tc("print")}
          </a>
          <ReeferConnectionActions
            canManage={canManage}
            record={{
              id: r.id,
              plugNumber: r.plugNumber,
              connectionTime: r.connectionTime ? r.connectionTime.toISOString() : null,
              disconnectionTime: r.disconnectionTime ? r.disconnectionTime.toISOString() : null,
              connectedBy: r.connectedBy,
              disconnectedBy: r.disconnectedBy,
              powerStatus: r.powerStatus,
              remarks: r.remarks,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("connectionFormTitle")}
        subtitle={t("connectionFormSubtitle")}
        actions={
          <>
            <SearchBox initialQuery={q} />
            <FormModal triggerLabel={t("newConnection")} title={t("newConnection")}>
              <ReeferConnectionForm containers={containerOpts} containerTypes={typeOpts} />
            </FormModal>
          </>
        }
      />
      <DataTable columns={cols} rows={connections} />
    </div>
  );
}
