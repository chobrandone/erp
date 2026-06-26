import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchBox } from "@/components/shared/SearchBox";
import { prisma } from "@/lib/prisma";

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("yard");

  const inventory = await prisma.inventory.findMany({
    where: q
      ? {
          OR: [
            { container: { containerNumber: { contains: q } } },
            { location: { code: { contains: q } } },
          ],
        }
      : {},
    include: { container: { include: { containerType: true, shippingLine: true } }, location: true },
    orderBy: { enteredAt: "desc" },
  });

  const cols: Column<(typeof inventory)[number]>[] = [
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: "Type", accessor: (r) => r.container.containerType.code },
    { header: "Shipping Line", accessor: (r) => r.container.shippingLine?.name ?? "-" },
    { header: "Location", accessor: (r) => r.location.code },
    { header: "Status", accessor: (r) => <StatusBadge status={r.container.status} /> },
  ];

  return (
    <div>
      <PageHeader title={t("positions")} actions={<SearchBox initialQuery={q} />} />
      <DataTable columns={cols} rows={inventory} />
    </div>
  );
}
