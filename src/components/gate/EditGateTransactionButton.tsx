"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, X } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";

type Transaction = {
  id: string;
  type: string;
  truckPlate: string;
  driverName: string;
  driverIdNumber: string | null;
  sealNumber: string | null;
  condition: string;
  damageRemarks: string | null;
  destination: string | null;
  releaseOrderNo: string | null;
};

export function EditGateTransactionButton({ transaction }: { transaction: Transaction }) {
  const tc = useTranslations("common");
  const tIn = useTranslations("gateIn");
  const tOut = useTranslations("gateOut");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    truckPlate: transaction.truckPlate,
    driverName: transaction.driverName,
    driverIdNumber: transaction.driverIdNumber ?? "",
    sealNumber: transaction.sealNumber ?? "",
    condition: transaction.condition as "GOOD" | "DAMAGED",
    damageRemarks: transaction.damageRemarks ?? "",
    destination: transaction.destination ?? "",
    releaseOrderNo: transaction.releaseOrderNo ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/gate-transactions/${transaction.id}`, {
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

  const isGateOut = transaction.type === "GATE_OUT";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
      >
        <Pencil size={14} /> {tc("save")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl w-full max-w-md border border-border-color">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
              <span className="text-sm font-semibold text-fg">{isGateOut ? tOut("title") : tIn("title")}</span>
              <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("truckPlate")}</label>
                <input className={inputClass} value={form.truckPlate} onChange={(e) => setForm((f) => ({ ...f, truckPlate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("driverName")}</label>
                <input className={inputClass} value={form.driverName} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} />
              </div>
              {!isGateOut && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("driverId")}</label>
                    <input className={inputClass} value={form.driverIdNumber} onChange={(e) => setForm((f) => ({ ...f, driverIdNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("sealNumber")}</label>
                    <input className={inputClass} value={form.sealNumber} onChange={(e) => setForm((f) => ({ ...f, sealNumber: e.target.value }))} />
                  </div>
                </>
              )}
              {isGateOut && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">{tOut("destination")}</label>
                    <input className={inputClass} value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">{tOut("releaseOrder")}</label>
                    <input className={inputClass} value={form.releaseOrderNo} onChange={(e) => setForm((f) => ({ ...f, releaseOrderNo: e.target.value }))} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("condition")}</label>
                <select
                  className={inputClass}
                  value={form.condition}
                  onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as "GOOD" | "DAMAGED" }))}
                >
                  <option value="GOOD">{tIn("good")}</option>
                  <option value="DAMAGED">{tIn("damaged")}</option>
                </select>
              </div>
              {form.condition === "DAMAGED" && (
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("damageRemarks")}</label>
                  <textarea className={inputClass} rows={3} value={form.damageRemarks} onChange={(e) => setForm((f) => ({ ...f, damageRemarks: e.target.value }))} />
                </div>
              )}
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
