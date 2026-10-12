import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { GateInForm } from "@/components/gate/GateInForm";
import { prisma } from "@/lib/prisma";
import { formatDocNumber } from "@/lib/pdf/docNumber";

export default async function GateInPage() {
  const t = await getTranslations("gateIn");
  const [containerTypes, shippingLines, customers, gateInCount] = await Promise.all([
    prisma.containerType.findMany(),
    prisma.shippingLine.findMany(),
    prisma.customer.findMany(),
    prisma.gateTransaction.count({ where: { type: "GATE_IN" } }),
  ]);
  const defaultEirId = formatDocNumber("EIR-IN", gateInCount + 1);

  return (
    <div>
      <PageHeader title={t("pageTitle")} />
      <GateInForm
        containerTypes={containerTypes.map((c) => ({ id: c.id, label: `${c.code} — ${c.description}` }))}
        shippingLines={shippingLines.map((s) => ({ id: s.id, label: s.name }))}
        customers={customers.map((c) => ({ id: c.id, label: c.name }))}
        defaultEirId={defaultEirId}
      />
    </div>
  );
}
