import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PTICertificateClient } from "./PTICertificateClient";

export default async function PTICertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inspectionId?: string }>;
}) {
  const { id } = await params;
  const { inspectionId } = await searchParams;
  const t = await getTranslations("pti");

  const request_ = await prisma.pTIRequest.findUnique({
    where: { id },
    include: { container: { include: { containerType: true } }, inspection: true },
  });
  if (!request_?.inspection) notFound();

  const finalInspectionId = inspectionId ?? request_.inspection.id;

  return (
    <div>
      <PageHeader title={t("certificate")} subtitle={request_.container.containerNumber} />
      <div className="rounded-xl border border-border-color bg-surface p-5 max-w-2xl space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">{t("result")}</span>
          <StatusBadge status={request_.inspection.result} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">Container Type</span>
          <span className="font-medium text-fg">{request_.container.containerType.code}</span>
        </div>
        <PTICertificateClient id={finalInspectionId} />
      </div>
    </div>
  );
}
