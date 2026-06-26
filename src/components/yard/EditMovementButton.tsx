"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, X } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";

type Reason = "YARD_ALLOCATION" | "YARD_REPOSITION" | "PTI" | "REEFER_CONNECTION" | "REPAIR" | "GATE_OUT";

export function EditMovementButton({
  movement,
}: {
  movement: {
    id: string;
    reason: string;
    equipment: string | null;
    operator: string | null;
    supervisorName: string | null;
    completed: boolean;
    remarks: string | null;
  };
}) {
  const t = useTranslations("yard");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    reason: movement.reason as Reason,
    equipment: movement.equipment ?? "",
    operator: movement.operator ?? "",
    supervisorName: movement.supervisorName ?? "",
    completed: movement.completed,
    remarks: movement.remarks ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/movements/${movement.id}`, {
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
              <span className="text-sm font-semibold text-fg">{t("movementOrder")}</span>
              <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("reason")}</label>
                <select
                  className={inputClass}
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value as Reason }))}
                >
                  <option value="YARD_ALLOCATION">{t("reasonYardAllocation")}</option>
                  <option value="YARD_REPOSITION">{t("reasonYardReposition")}</option>
                  <option value="PTI">{t("reasonPTI")}</option>
                  <option value="REEFER_CONNECTION">{t("reasonReeferConnection")}</option>
                  <option value="REPAIR">{t("reasonRepair")}</option>
                  <option value="GATE_OUT">{t("reasonGateOut")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("equipment")}</label>
                <input className={inputClass} value={form.equipment} onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("operator")}</label>
                <input className={inputClass} value={form.operator} onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("supervisorName")}</label>
                <input className={inputClass} value={form.supervisorName} onChange={(e) => setForm((f) => ({ ...f, supervisorName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("movementCompleted")}</label>
                <select
                  className={inputClass}
                  value={form.completed ? "yes" : "no"}
                  onChange={(e) => setForm((f) => ({ ...f, completed: e.target.value === "yes" }))}
                >
                  <option value="no">{tc("no")}</option>
                  <option value="yes">{tc("yes")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{tc("remarks")}</label>
                <textarea className={inputClass} rows={3} value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />
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
