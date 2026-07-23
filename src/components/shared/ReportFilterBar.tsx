"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Download, CalendarRange, Search } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";

/**
 * Search + date-range filter with an Excel export button. Navigation updates the
 * page's `q`/`from`/`to` search params; export hits
 * /api/reports/export?type=<exportType> with the same filters.
 */
export function ReportFilterBar({
  exportType,
  initialQuery,
  initialFrom,
  initialTo,
  showSearch = true,
}: {
  exportType: string;
  initialQuery?: string;
  initialFrom?: string;
  initialTo?: string;
  showSearch?: boolean;
}) {
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQuery ?? "");
  const [from, setFrom] = useState(initialFrom ?? "");
  const [to, setTo] = useState(initialTo ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const exportParams = new URLSearchParams({ type: exportType });
  if (q.trim()) exportParams.set("q", q.trim());
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  const exportHref = `/api/reports/export?${exportParams.toString()}`;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-color bg-surface p-4">
      {showSearch && (
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1">{tc("search")}</label>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input
              className={`${inputClass} pl-8 w-56`}
              placeholder={tc("searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-fg-muted self-end pb-2">
        <CalendarRange size={16} />
      </div>
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1">{tc("from")}</label>
        <input type="date" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1">{tc("to")}</label>
        <input type="date" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <button onClick={apply} className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg">
        {tc("apply")}
      </button>
      <a
        href={exportHref}
        className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
      >
        <Download size={16} /> {tc("exportExcel")}
      </a>
    </div>
  );
}
