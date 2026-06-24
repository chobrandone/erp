"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Download, CalendarRange } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";

export function BillingDateRangeFilter({
  initialFrom,
  initialTo,
}: {
  initialFrom?: string;
  initialTo?: string;
}) {
  const t = useTranslations("billing");
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState(initialFrom ?? "");
  const [to, setTo] = useState(initialTo ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const exportHref = `/api/invoices/export${
    from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}` : ""
  }`;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-color bg-surface p-4">
      <div className="flex items-center gap-2 text-fg-muted">
        <CalendarRange size={16} />
        <span className="text-sm font-medium">{t("dateRange")}</span>
      </div>
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1">{t("from")}</label>
        <input type="date" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1">{t("to")}</label>
        <input type="date" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <button
        onClick={apply}
        className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
      >
        {t("apply")}
      </button>
      <a
        href={exportHref}
        className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
      >
        <Download size={16} /> {t("exportCsv")}
      </a>
    </div>
  );
}
