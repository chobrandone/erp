"use client";

import {
  Construction,
  Database,
  Boxes,
  Snowflake,
  Wrench,
  FileText,
  Receipt,
  BarChart3,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS = {
  database: Database,
  boxes: Boxes,
  snowflake: Snowflake,
  wrench: Wrench,
  fileText: FileText,
  receipt: Receipt,
  barChart3: BarChart3,
  smartphone: Smartphone,
} as const;

export type ComingSoonIcon = keyof typeof ICONS;

export function ComingSoonPage({
  title,
  icon,
}: {
  title: string;
  icon?: ComingSoonIcon;
}) {
  const t = useTranslations("common");
  const Icon = icon ? ICONS[icon] : Construction;

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-xl border border-dashed border-border-color bg-surface">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl brand-gradient text-white mb-5">
        <Icon size={28} />
      </div>
      <h2 className="text-lg font-semibold text-fg mb-1">{title}</h2>
      <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-100 border border-brand-100/30 rounded-full px-3 py-1 mb-3">
        {t("comingSoon")}
      </span>
      <p className="text-sm text-fg-muted max-w-md">{t("comingSoonDesc")}</p>
    </div>
  );
}
