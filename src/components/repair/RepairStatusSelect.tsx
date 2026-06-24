"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function RepairStatusSelect({ id, status }: { id: string; status: string }) {
  const t = useTranslations("repair");
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
      <option value="OPEN">{t("statusOpen")}</option>
      <option value="IN_PROGRESS">{t("statusInProgress")}</option>
      <option value="COMPLETED">{t("statusCompleted")}</option>
    </select>
  );
}
