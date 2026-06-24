"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, X } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";

export function EditRepairButton({
  repair,
}: {
  repair: { id: string; damageType: string; description: string | null; estimatedCost: number | null };
}) {
  const t = useTranslations("repair");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    damageType: repair.damageType,
    description: repair.description ?? "",
    estimatedCost: repair.estimatedCost != null ? String(repair.estimatedCost) : "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/repairs/${repair.id}`, {
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
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-fg-muted hover:text-fg" title={tc("save")}>
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl w-full max-w-md border border-border-color">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
              <span className="text-sm font-semibold text-fg">{t("newRepair")}</span>
              <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("damageType")}</label>
                <input
                  required
                  className={inputClass}
                  value={form.damageType}
                  onChange={(e) => setForm((f) => ({ ...f, damageType: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("description")}</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("estimatedCost")}</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.estimatedCost}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-fg-muted hover:text-fg px-4 py-2 rounded-lg">
                  {tc("cancel")}
                </button>
                <button type="submit" disabled={submitting} className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60">
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
