import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { InventoryExplorer } from "@/components/inventory/InventoryExplorer";
import { DropdownMenu } from "@/components/shared/DropdownMenu";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FREE_DAYS } from "@/lib/billing";
import { Boxes, AlertTriangle } from "lucide-react";

export default async function ContainerInventoryPage() {
  const t = await getTranslations("containerInventory");
  const tForms = await getTranslations("forms");

  const inventory = await prisma.inventory.findMany({
    include: {
      container: {
        include: {
          containerType: true,
          shippingLine: true,
          gateTransactions: { where: { type: "GATE_IN" }, orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
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
    freeDays: inv.container.gateTransactions[0]?.freeDays ?? DEFAULT_FREE_DAYS,
  }));

  const overdueCount = rows.filter(
    (r) => Math.floor((Date.now() - new Date(r.enteredAt).getTime()) / 86400000) > r.freeDays
  ).length;

  const shippingLines = Array.from(new Set(rows.map((r) => r.lineName).filter((l) => l !== "-")));
  const containerTypes = Array.from(new Set(rows.map((r) => r.typeCode)));

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <DropdownMenu
            label={tForms("menuLabel")}
            icon="fileStack"
            items={[
              { label: tForms("movementForm"), href: "/yard-management/movements/new", icon: "clipboardList" },
              { label: tForms("ptiRequestForm"), href: "/pti-management/new", icon: "clipboardCheck" },
              { label: tForms("reeferMonitoringReport"), href: "/container-inventory/reefer-monitoring", icon: "snowflake" },
              { label: tForms("damageSurveyReport"), href: "/container-inventory/damage-survey", icon: "alertTriangle" },
              { label: tForms("repairEstimateForm"), href: "/container-inventory/repair-estimate", icon: "wrench" },
              { label: tForms("repairWorkOrderForm"), href: "/container-inventory/repair-work-order", icon: "clipboardX" },
              { label: tForms("releaseOrderForm"), href: "/container-inventory/release-order", icon: "logOut" },
            ]}
          />
        }
      />
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard title={t("totalContainers")} value={rows.length} icon={Boxes} accentIndex={3} />
        <KPICard title="Surestaries (dépassement)" value={overdueCount} icon={AlertTriangle} accentIndex={1} />
      </div>
      <InventoryExplorer rows={rows} shippingLines={shippingLines} containerTypes={containerTypes} />
    </div>
  );
}
