import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MovementForm } from "@/components/yard/MovementForm";
import { prisma } from "@/lib/prisma";

export default async function NewMovementPage() {
  const t = await getTranslations("yard");

  const [containers, locations] = await Promise.all([
    prisma.container.findMany({ where: { inventory: { isNot: null } }, include: { containerType: true } }),
    prisma.location.findMany({ orderBy: [{ block: "asc" }, { row: "asc" }, { bay: "asc" }, { tier: "asc" }] }),
  ]);

  return (
    <div>
      <PageHeader title={t("newMovement")} />
      <MovementForm
        containers={containers.map((c) => ({
          id: c.id,
          label: `${c.containerNumber} (${c.containerType.code})`,
        }))}
        locations={locations.map((l) => ({ id: l.id, label: l.code }))}
      />
    </div>
  );
}
