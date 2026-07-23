"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const OPTIONS = ["CONNECTED", "NOT_CONNECTED", "DAMAGED", "IN_REPAIRS"] as const;

const CLS: Record<string, string> = {
  CONNECTED: "text-emerald-700 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-300/50",
  NOT_CONNECTED: "text-slate-600 bg-slate-100 dark:bg-slate-500/10 dark:text-slate-300 border-slate-300/50",
  DAMAGED: "text-red-700 bg-red-100 dark:bg-red-500/10 dark:text-red-400 border-red-300/50",
  IN_REPAIRS: "text-amber-700 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 border-amber-300/50",
};

// Inline toggle for a reefer log's power status. Disabled for users who can't
// manage reefer records (renders a static badge instead).
export function ReeferPowerStatusSelect({ id, status, canManage }: { id: string; status: string; canManage: boolean }) {
  const t = useTranslations("reefer");
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  const labels: Record<string, string> = {
    CONNECTED: t("connected"),
    NOT_CONNECTED: t("notConnected"),
    DAMAGED: t("damaged"),
    IN_REPAIRS: t("inRepairs"),
  };

  if (!canManage) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CLS[status] ?? "bg-surface-alt text-fg-muted border-border-color"}`}>
        {labels[status] ?? status}
      </span>
    );
  }

  async function update(next: string) {
    const prev = value;
    setValue(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/reefer-monitoring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ powerStatus: next }),
      });
      if (res.ok) router.refresh();
      else setValue(prev);
    } catch {
      setValue(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => update(e.target.value)}
      className={`rounded-full border px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60 ${CLS[value] ?? "bg-surface-alt text-fg border-border-color"}`}
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{labels[o]}</option>
      ))}
    </select>
  );
}
