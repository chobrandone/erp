"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, X } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function EditInvoiceButton({
  invoice,
  customers,
}: {
  invoice: {
    id: string;
    customerId: string;
    description: string | null;
    amount: number;
    dueAt: string | null;
  };
  customers: Option[];
}) {
  const t = useTranslations("billing");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerId: invoice.customerId,
    description: invoice.description ?? "",
    amount: String(invoice.amount),
    dueAt: invoice.dueAt ? invoice.dueAt.slice(0, 10) : "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-fg-muted hover:text-fg"
        title={tc("save")}
      >
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl w-full max-w-md border border-border-color">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
              <span className="text-sm font-semibold text-fg">{t("newInvoice")}</span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("customer")}</label>
                <select
                  className={inputClass}
                  value={form.customerId}
                  onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("description")}</label>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("amount")}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className={inputClass}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("dueOn")}</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.dueAt}
                  onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-fg-muted hover:text-fg px-4 py-2 rounded-lg"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {submitting ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
