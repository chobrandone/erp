"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function WorkOrderStatusSelect({ id, status }: { id: string; status: string }) {
  const tc = useTranslations("common");
  const router = useRouter();

  async function update(next: string) {
    await fetch(`/api/repair-work-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completionStatus: next }),
    });
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value)}
      className="rounded-lg border border-border-color bg-surface-alt px-2 py-1 text-xs text-fg"
    >
      <option value="OPEN">{tc("open")}</option>
      <option value="IN_PROGRESS">{tc("inProgress")}</option>
      <option value="COMPLETED">{tc("completed")}</option>
    </select>
  );
}
