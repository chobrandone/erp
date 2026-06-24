import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { InventoryExplorer } from "@/components/inventory/InventoryExplorer";
import { prisma } from "@/lib/prisma";
import { Boxes } from "lucide-react";

export default async function ContainerInventoryPage() {
  const t = await getTranslations("containerInventory");

  const inventory = await prisma.inventory.findMany({
    include: {
      container: { include: { containerType: true, shippingLine: true } },
      location: true,
    },
    orderBy: { enteredAt: "desc" },
  });

  const rows = inventory.map((inv) => ({
    id: inv.id,
    containerNumber: inv.container.containerNumber,
    typeCode: inv.container.containerType.code,
    lineName: inv.container.shippingLine?.name ?? "-",
    status: inv.container.status,
    locationCode: inv.location.code,
    enteredAt: inv.enteredAt.toISOString(),
  }));

  const shippingLines = Array.from(new Set(rows.map((r) => r.lineName).filter((l) => l !== "-")));
  const containerTypes = Array.from(new Set(rows.map((r) => r.typeCode)));

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mb-5">
        <KPICard title={t("totalContainers")} value={rows.length} icon={Boxes} accentIndex={3} />
      </div>
      <InventoryExplorer rows={rows} shippingLines={shippingLines} containerTypes={containerTypes} />
    </div>
  );
}
