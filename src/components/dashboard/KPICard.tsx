import { LucideIcon } from "lucide-react";
import { BRAND_GRADIENT_STEPS } from "@/lib/utils";

export function KPICard({
  title,
  value,
  icon: Icon,
  accentIndex = 0,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accentIndex?: number;
  suffix?: string;
}) {
  const color = BRAND_GRADIENT_STEPS[accentIndex % BRAND_GRADIENT_STEPS.length];

  return (
    <div className="rounded-xl border border-border-color bg-surface p-5 flex items-center gap-4">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-white"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-fg-muted truncate">{title}</p>
        <p className="text-2xl font-semibold text-fg leading-tight">
          {value}
          {suffix && <span className="text-sm text-fg-muted ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
