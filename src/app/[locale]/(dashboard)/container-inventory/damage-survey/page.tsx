import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DamageSurveyForm } from "@/components/repair/DamageSurveyForm";
import { SearchBox } from "@/components/shared/SearchBox";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function DamageSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("damageSurvey");
  const tc = await getTranslations("common");

  const [surveys, containers] = await Promise.all([
    prisma.damageSurvey.findMany({
      where: q
        ? {
            OR: [
              { surveyNo: { contains: q } },
              { surveyor: { contains: q } },
              { container: { containerNumber: { contains: q } } },
            ],
          }
        : {},
      include: { container: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.container.findMany({ include: { containerType: true } }),
  ]);

  const cols: Column<(typeof surveys)[number]>[] = [
    { header: t("surveyNo"), accessor: (r) => r.surveyNo },
    { header: "Container", accessor: (r) => r.container.containerNumber },
    { header: t("severity"), accessor: (r) => <StatusBadge status={r.severity} /> },
    { header: t("repairRecommended"), accessor: (r) => (r.repairRecommended ? tc("yes") : tc("no")) },
    { header: tc("date"), accessor: (r) => formatDate(r.surveyDate) },
    {
      header: tc("actions"),
      accessor: (r) => (
        <a
          href={`/api/damage-surveys/${r.id}/pdf`}
          target="_blank"
          className="flex items-center gap-1 text-brand-100 hover:underline"
        >
          <FileText size={14} /> {tc("print")}
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} actions={<SearchBox initialQuery={q} />} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border-color bg-surface p-5">
          <DamageSurveyForm
            containers={containers.map((c) => ({
              id: c.id,
              label: `${c.containerNumber} (${c.containerType.code})`,
            }))}
          />
        </div>
        <div className="lg:col-span-2">
          <DataTable columns={cols} rows={surveys} />
        </div>
      </div>
    </div>
  );
}
