"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function InvoiceStatusSelect({ id, status }: { id: string; status: string }) {
  const t = useTranslations("billing");
  const router = useRouter();

  async function update(next: string) {
    await fetch(`/api/invoices/${id}`, {
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
      <option value="UNPAID">{t("statusUnpaid")}</option>
      <option value="PAID">{t("statusPaid")}</option>
    </select>
  );
}
