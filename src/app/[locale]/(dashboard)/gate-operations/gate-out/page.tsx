import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { GateOutForm } from "@/components/gate/GateOutForm";
import { prisma } from "@/lib/prisma";

export default async function GateOutPage() {
  const t = await getTranslations("gateOut");
  const [containers, containerTypes] = await Promise.all([
    prisma.container.findMany({ where: { inventory: { isNot: null } }, include: { containerType: true } }),
    prisma.containerType.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title={t("pageTitle")} />
      <GateOutForm
        containers={containers.map((c) => ({
          id: c.id,
          label: `${c.containerNumber} (${c.containerType.code})`,
        }))}
        containerTypes={containerTypes.map((ct) => ({ id: ct.id, label: `${ct.code} — ${ct.description}` }))}
      />
    </div>
  );
}
