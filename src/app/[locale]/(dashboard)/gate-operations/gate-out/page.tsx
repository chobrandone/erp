import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { GateOutForm } from "@/components/gate/GateOutForm";
import { prisma } from "@/lib/prisma";

export default async function GateOutPage() {
  const t = await getTranslations("gateOut");
  const containers = await prisma.container.findMany({
    where: { inventory: { isNot: null } },
    include: { containerType: true },
  });

  return (
    <div>
      <PageHeader title={t("pageTitle")} />
      <GateOutForm
        containers={containers.map((c) => ({
          id: c.id,
          label: `${c.containerNumber} (${c.containerType.code})`,
        }))}
      />
    </div>
  );
}
