import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PTIRequestForm } from "@/components/pti/PTIRequestForm";
import { prisma } from "@/lib/prisma";

export default async function NewPTIRequestPage() {
  const t = await getTranslations("pti");
  const containers = await prisma.container.findMany({ include: { containerType: true } });

  return (
    <div>
      <PageHeader title={t("newRequest")} />
      <PTIRequestForm
        containers={containers.map((c) => ({
          id: c.id,
          label: `${c.containerNumber} (${c.containerType.code})`,
        }))}
      />
    </div>
  );
}
