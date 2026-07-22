import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PTIRequestForm } from "@/components/pti/PTIRequestForm";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function NewPTIRequestPage() {
  const t = await getTranslations("pti");
  const tc = await getTranslations("common");
  const [containers, containerTypes, customers, shippingLines] = await Promise.all([
    prisma.container.findMany({ include: { containerType: true } }),
    prisma.containerType.findMany({ orderBy: { code: "asc" } }),
    prisma.customer.findMany(),
    prisma.shippingLine.findMany(),
  ]);

  return (
    <div>
      <PageHeader
        title={t("newRequest")}
        actions={
          <Link
            href="/pti-management"
            className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
          >
            <ArrowLeft size={16} /> {tc("back")}
          </Link>
        }
      />
      <PTIRequestForm
        containers={containers.map((c) => ({
          id: c.id,
          label: `${c.containerNumber} (${c.containerType.code})`,
        }))}
        containerTypes={containerTypes.map((ct) => ({
          id: ct.id,
          label: `${ct.code} — ${ct.description}`,
        }))}
        customers={customers.map((c) => ({ id: c.id, label: c.name }))}
        shippingLines={shippingLines.map((s) => ({ id: s.id, label: s.name }))}
      />
    </div>
  );
}
