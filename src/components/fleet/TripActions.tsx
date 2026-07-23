"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle, Send, X } from "lucide-react";
import { FormField, inputClass } from "@/components/shared/FormSection";

export function ReturnTripButton({
  tripId,
  label = "Return to park",
  confirmText = "Complete this trip?",
}: {
  tripId: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function complete() {
    if (!confirm(confirmText)) return;
    setBusy(true);
    try {
      await fetch(`/api/vehicle-trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={complete} disabled={busy} className="flex items-center gap-1 text-xs font-medium text-green-600 hover:underline disabled:opacity-60">
      <CheckCircle size={14} /> {busy ? "…" : label}
    </button>
  );
}

// Dispatch the vehicle onward to another location/customer without returning to
// the park: closes the current leg and opens a new ongoing one.
export function RedispatchButton({ tripId }: { tripId: string }) {
  const t = useTranslations("fleet");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // "RETURN" = the vehicle will come back to the park (expected date required);
  // "ONWARD" = dispatched without returning (no expected date).
  const [returnMode, setReturnMode] = useState<"RETURN" | "ONWARD">("RETURN");
  const [form, setForm] = useState({ destination: "", cargoDescription: "", expectedReturn: "", remarks: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.destination.trim()) return setError(t("destinationRequired"));
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicle-trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REDISPATCH",
          ...form,
          // Only carry an expected return when the vehicle is coming back.
          expectedReturn: returnMode === "RETURN" ? form.expectedReturn : "",
        }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-medium text-brand-100 hover:underline">
        <Send size={13} /> {t("redispatch")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => !busy && setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-xl bg-surface border border-border-color shadow-xl my-8">
            <div className="flex items-center justify-between px-5 h-14 border-b border-border-color">
              <span className="font-semibold text-fg">{t("redispatchTitle")}</span>
              <button type="button" onClick={() => setOpen(false)} className="text-fg-muted hover:text-fg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-fg-muted">{t("redispatchHint")}</p>
              <div className="grid grid-cols-1 gap-3">
                <FormField label={t("newDestination")} full>
                  <input required className={inputClass} value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Kribi / Client XYZ…" />
                </FormField>
                <FormField label={t("cargoDescription")} full>
                  <input className={inputClass} value={form.cargoDescription} onChange={(e) => set("cargoDescription", e.target.value)} />
                </FormField>
                <FormField label={t("returnModeLabel")} full>
                  <select className={inputClass} value={returnMode} onChange={(e) => setReturnMode(e.target.value as "RETURN" | "ONWARD")}>
                    <option value="RETURN">{t("returnComingBack")}</option>
                    <option value="ONWARD">{t("returnNotComingBack")}</option>
                  </select>
                </FormField>
                {returnMode === "RETURN" && (
                  <FormField label={t("expectedReturn")} full>
                    <input type="datetime-local" className={inputClass} value={form.expectedReturn} onChange={(e) => set("expectedReturn", e.target.value)} />
                  </FormField>
                )}
                <FormField label={tc("remarks")} full>
                  <input className={inputClass} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
                </FormField>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">{tc("cancel")}</button>
                <button type="submit" disabled={busy} className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60 flex items-center gap-1.5">
                  <Send size={14} /> {busy ? t("sending") : t("redispatchBtn")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
