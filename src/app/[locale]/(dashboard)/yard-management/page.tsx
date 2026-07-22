import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { YardMapGrid } from "@/components/yard/YardMapGrid";
import { AddBlockButton } from "@/components/yard/AddBlockButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { FileSpreadsheet } from "lucide-react";

export default async function YardManagementPage() {
  const t = await getTranslations("yard");
  const tc = await getTranslations("common");
  const session = await auth();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const locations = await prisma.location.findMany({
    include: { inventory: { include: { container: true } } },
    orderBy: [{ block: "asc" }, { row: "asc" }, { bay: "asc" }, { tier: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title={t("yardMap")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Link
              href="/yard-management/positions"
              className="text-sm font-medium text-fg-muted hover:text-fg border border-border-color rounded-lg px-4 py-2"
            >
              {t("positions")}
            </Link>
            <Link
              href="/yard-management/movements"
              className="text-sm font-medium text-fg-muted hover:text-fg border border-border-color rounded-lg px-4 py-2"
            >
              {t("movements")}
            </Link>
            <Link
              href="/yard-management/daily-stock-report"
              className="text-sm font-medium text-fg-muted hover:text-fg border border-border-color rounded-lg px-4 py-2"
            >
              {t("dailyStockReport")}
            </Link>
            <a
              href="/api/reports/export?type=inventory"
              target="_blank"
              className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg border border-border-color rounded-lg px-4 py-2"
            >
              <FileSpreadsheet size={15} /> {tc("exportExcel")}
            </a>
            {isAdmin && <AddBlockButton />}
          </>
        }
      />
      <YardMapGrid locations={locations} />
    </div>
  );
}
