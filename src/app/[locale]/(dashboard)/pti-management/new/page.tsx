import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PTIRequestForm } from "@/components/pti/PTIRequestForm";
import { prisma } from "@/lib/prisma";

export default async function NewPTIRequestPage() {
  const t = await getTranslations("pti");
  const [containers, customers, shippingLines] = await Promise.all([
    prisma.container.findMany({ include: { containerType: true } }),
    prisma.customer.findMany(),
    prisma.shippingLine.findMany(),
  ]);

  return (
    <div>
      <PageHeader title={t("newRequest")} />
      <PTIRequestForm
        containers={containers.map((c) => ({
          id: c.id,
          label: `${c.containerNumber} (${c.containerType.code})`,
        }))}
        customers={customers.map((c) => ({ id: c.id, label: c.name }))}
        shippingLines={shippingLines.map((s) => ({ id: s.id, label: s.name }))}
      />
    </div>
  );
}
