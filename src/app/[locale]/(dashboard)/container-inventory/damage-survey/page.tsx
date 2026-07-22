import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DamageSurveyForm } from "@/components/repair/DamageSurveyForm";
import { SearchBox } from "@/components/shared/SearchBox";
import { FormModal } from "@/components/shared/FormModal";
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
  const containerTypes = await prisma.containerType.findMany({ orderBy: { code: "asc" } });
  const containerOpts = containers.map((c) => ({ id: c.id, label: `${c.containerNumber} (${c.containerType.code})` }));
  const typeOpts = containerTypes.map((ct) => ({ id: ct.id, label: `${ct.code} — ${ct.description}` }));

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
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <SearchBox initialQuery={q} />
            <FormModal triggerLabel={t("newSurvey")} title={t("newSurvey")}>
              <DamageSurveyForm containers={containerOpts} containerTypes={typeOpts} />
            </FormModal>
          </>
        }
      />
      <DataTable columns={cols} rows={surveys} />
    </div>
  );
}
