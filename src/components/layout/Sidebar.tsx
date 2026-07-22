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
  Users,
} from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "dashboard", href: "/", slug: "", icon: LayoutDashboard, placeholder: false, adminOnly: false },
  { key: "masterData", href: "/master-data", slug: "master-data", icon: Database, placeholder: false, adminOnly: false },
  { key: "gateOperations", href: "/gate-operations", slug: "gate-operations", icon: DoorOpen, placeholder: false, adminOnly: false },
  { key: "yardManagement", href: "/yard-management", slug: "yard-management", icon: Map, placeholder: false, adminOnly: false },
  { key: "containerInventory", href: "/container-inventory", slug: "container-inventory", icon: Boxes, placeholder: false, adminOnly: false },
  { key: "reeferManagement", href: "/reefer-management", slug: "reefer-management", icon: Snowflake, placeholder: false, adminOnly: false },
  { key: "ptiManagement", href: "/pti-management", slug: "pti-management", icon: ClipboardCheck, placeholder: false, adminOnly: false },
  { key: "maintenanceRepair", href: "/maintenance-repair", slug: "maintenance-repair", icon: Wrench, placeholder: false, adminOnly: false },
  { key: "fleetManagement", href: "/fleet-management", slug: "fleet-management", icon: Truck, placeholder: false, adminOnly: false },
  { key: "documentManagement", href: "/document-management", slug: "document-management", icon: FileText, placeholder: false, adminOnly: false },
  { key: "billingFinance", href: "/billing-finance", slug: "billing-finance", icon: Receipt, placeholder: false, adminOnly: false },
  { key: "reportingDashboard", href: "/reporting-dashboard", slug: "reporting-dashboard", icon: BarChart3, placeholder: false, adminOnly: false },
  { key: "mobileYardOps", href: "/mobile-yard-ops", slug: "mobile-yard-ops", icon: Smartphone, placeholder: true, adminOnly: false },
  { key: "userManagement", href: "/user-management", slug: "user-management", icon: Users, placeholder: false, adminOnly: true },
] as const;

export function Sidebar({ role, allowed }: { role?: string; allowed: string[] }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isAdmin = role === "ADMIN";

  const items = NAV_ITEMS.filter((item) => {
    if (item.slug === "") return true; // dashboard home always visible
    if (item.adminOnly) return isAdmin;
    return isAdmin || allowed.includes(item.slug);
  });

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
          {items.map((item) => {
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
