import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PTIInspectionChecklist } from "@/components/pti/PTIInspectionChecklist";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PTIInspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("pti");

  const request_ = await prisma.pTIRequest.findUnique({
    where: { id },
    include: { container: true },
  });
  if (!request_) notFound();

  return (
    <div>
      <PageHeader title={t("inspection")} subtitle={request_.container.containerNumber} />
      <PTIInspectionChecklist ptiRequestId={id} />
    </div>
  );
}
