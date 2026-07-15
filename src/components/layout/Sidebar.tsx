"use client";

import {
  LayoutDashboard,
  Database,
  DoorOpen,
  Map,
  Boxes,
  Snowflake,
  ClipboardCheck,
  Wrench,
  FileText,
  Receipt,
  BarChart3,
  Smartphone,
  Container,
  Truck,
} from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "dashboard", href: "/", icon: LayoutDashboard, placeholder: false },
  { key: "masterData", href: "/master-data", icon: Database, placeholder: false },
  { key: "gateOperations", href: "/gate-operations", icon: DoorOpen, placeholder: false },
  { key: "yardManagement", href: "/yard-management", icon: Map, placeholder: false },
  { key: "containerInventory", href: "/container-inventory", icon: Boxes, placeholder: false },
  { key: "reeferManagement", href: "/reefer-management", icon: Snowflake, placeholder: false },
  { key: "ptiManagement", href: "/pti-management", icon: ClipboardCheck, placeholder: false },
  { key: "maintenanceRepair", href: "/maintenance-repair", icon: Wrench, placeholder: false },
  { key: "fleetManagement", href: "/fleet-management", icon: Truck, placeholder: false },
  { key: "documentManagement", href: "/document-management", icon: FileText, placeholder: false },
  { key: "billingFinance", href: "/billing-finance", icon: Receipt, placeholder: false },
  { key: "reportingDashboard", href: "/reporting-dashboard", icon: BarChart3, placeholder: false },
  { key: "mobileYardOps", href: "/mobile-yard-ops", icon: Smartphone, placeholder: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border-color bg-surface h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border-color">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg brand-gradient text-white">
          <Container size={20} />
        </div>
        <span className="font-semibold text-fg tracking-tight">N.S. SARL — ERP</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "brand-gradient text-white shadow-sm"
                      : "text-fg-muted hover:bg-surface-alt hover:text-fg"
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1 truncate">{t(item.key)}</span>
                  {item.placeholder && !isActive && (
                    <span className="text-[10px] uppercase tracking-wide text-fg-subtle border border-border-color rounded px-1.5 py-0.5">
                      {t("phase2")}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
