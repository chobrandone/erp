"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, X } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";
import {
  REPAIR_COMPONENTS,
  REPAIR_DAMAGE_TYPES,
  REPAIR_SEVERITIES,
  REPAIR_METHODS,
  REPAIR_RESPONSIBILITIES,
  type RepairOption,
} from "@/lib/repairOptions";

export function EditRepairButton({
  repair,
}: {
  repair: {
    id: string;
    component: string | null;
    damageType: string;
    severity: string | null;
    repairMethod: string | null;
    repairResponsibility: string | null;
    description: string | null;
    estimatedCost: number | null;
  };
}) {
  const t = useTranslations("repair");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    component: repair.component ?? "",
    damageType: repair.damageType,
    severity: repair.severity ?? "",
    repairMethod: repair.repairMethod ?? "",
    repairResponsibility: repair.repairResponsibility ?? "",
    description: repair.description ?? "",
    estimatedCost: repair.estimatedCost != null ? String(repair.estimatedCost) : "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const label = (o: RepairOption) => (locale.startsWith("fr") ? o.fr : o.en);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-surface rounded-xl w-full max-w-md border border-border-color my-8">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
              <span className="text-sm font-semibold text-fg">{t("newRepair")}</span>
              <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("component")}</label>
                  <select className={inputClass} value={form.component} onChange={(e) => set("component", e.target.value)}>
                    <option value="">-</option>
                    {REPAIR_COMPONENTS.map((o) => (<option key={o.value} value={o.value}>{label(o)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("damageType")}</label>
                  <select required className={inputClass} value={form.damageType} onChange={(e) => set("damageType", e.target.value)}>
                    <option value="">-</option>
                    {REPAIR_DAMAGE_TYPES.map((o) => (<option key={o.value} value={o.value}>{label(o)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("severity")}</label>
                  <select className={inputClass} value={form.severity} onChange={(e) => set("severity", e.target.value)}>
                    <option value="">-</option>
                    {REPAIR_SEVERITIES.map((o) => (<option key={o.value} value={o.value}>{label(o)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("repairMethod")}</label>
                  <select className={inputClass} value={form.repairMethod} onChange={(e) => set("repairMethod", e.target.value)}>
                    <option value="">-</option>
                    {REPAIR_METHODS.map((o) => (<option key={o.value} value={o.value}>{label(o)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("repairResponsibility")}</label>
                  <select className={inputClass} value={form.repairResponsibility} onChange={(e) => set("repairResponsibility", e.target.value)}>
                    <option value="">-</option>
                    {REPAIR_RESPONSIBILITIES.map((o) => (<option key={o.value} value={o.value}>{label(o)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("estimatedCost")}</label>
                  <input type="number" className={inputClass} value={form.estimatedCost} onChange={(e) => set("estimatedCost", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("description")}</label>
                <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
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
