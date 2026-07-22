"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { REPAIR_STATUSES } from "@/lib/repairOptions";

export function RepairStatusSelect({ id, status }: { id: string; status: string }) {
  const locale = useLocale();
  const router = useRouter();

  async function update(next: string) {
    await fetch(`/api/repairs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value)}
      className="rounded-lg border border-border-color bg-surface-alt px-2 py-1 text-xs text-fg"
    >
      {REPAIR_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {locale.startsWith("fr") ? s.fr : s.en}
        </option>
      ))}
    </select>
  );
}
