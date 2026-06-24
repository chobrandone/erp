import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { GateInForm } from "@/components/gate/GateInForm";
import { prisma } from "@/lib/prisma";

export default async function GateInPage() {
  const t = await getTranslations("gateIn");
  const [containerTypes, shippingLines, customers] = await Promise.all([
    prisma.containerType.findMany(),
    prisma.shippingLine.findMany(),
    prisma.customer.findMany(),
  ]);

  return (
    <div>
      <PageHeader title={t("pageTitle")} />
      <GateInForm
        containerTypes={containerTypes.map((c) => ({ id: c.id, label: `${c.code} — ${c.description}` }))}
        shippingLines={shippingLines.map((s) => ({ id: s.id, label: s.name }))}
        customers={customers.map((c) => ({ id: c.id, label: c.name }))}
      />
    </div>
  );
}
