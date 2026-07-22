"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClass } from "@/components/shared/FormSection";
import { Pencil, Trash2, X } from "lucide-react";

export type ReeferConnectionRecord = {
  id: string;
  plugNumber: string | null;
  connectionTime: string | null;
  disconnectionTime: string | null;
  connectedBy: string | null;
  disconnectedBy: string | null;
  powerStatus: string;
  remarks: string | null;
};

// Format an ISO date string for a datetime-local input (YYYY-MM-DDTHH:mm).
const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

export function ReeferConnectionActions({ record, canManage }: { record: ReeferConnectionRecord; canManage: boolean }) {
  const t = useTranslations("reefer");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    plugNumber: record.plugNumber ?? "",
    connectionTime: toLocalInput(record.connectionTime),
    disconnectionTime: toLocalInput(record.disconnectionTime),
    connectedBy: record.connectedBy ?? "",
    disconnectedBy: record.disconnectedBy ?? "",
    powerStatus: record.powerStatus,
    remarks: record.remarks ?? "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  if (!canManage) return <span className="text-xs text-fg-subtle">—</span>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/reefer-connections/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setOpen(false); router.refresh(); }
      else alert((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
    } finally { setBusy(false); }
  }

  async function del() {
    if (!confirm(tc("confirmDelete"))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reefer-connections/${record.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert((await res.json().catch(() => null))?.error ?? tc("deleteFailed"));
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setOpen(true)} title={t("edit")} className="text-fg-muted hover:text-brand-100"><Pencil size={14} /></button>
      <button onClick={del} disabled={busy} title={tc("delete")} className="text-fg-muted hover:text-red-500 disabled:opacity-50"><Trash2 size={14} /></button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => !busy && setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-lg rounded-xl bg-surface border border-border-color p-5 space-y-3 my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-fg">{t("edit")} — {t("connectionFormTitle")}</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-fg-muted"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("plugNumber")}><input className={inputClass} value={form.plugNumber} onChange={(e) => set("plugNumber", e.target.value)} /></FormField>
              <FormField label={t("powerStatus")}>
                <select className={inputClass} value={form.powerStatus} onChange={(e) => set("powerStatus", e.target.value)}>
                  <option value="OPERATIONAL">{t("operational")}</option>
                  <option value="FAULT">{t("fault")}</option>
                </select>
              </FormField>
              <FormField label={t("connectionTime")}><input type="datetime-local" className={inputClass} value={form.connectionTime} onChange={(e) => set("connectionTime", e.target.value)} /></FormField>
              <FormField label={t("disconnectionTime")}><input type="datetime-local" className={inputClass} value={form.disconnectionTime} onChange={(e) => set("disconnectionTime", e.target.value)} /></FormField>
              <FormField label={t("connectedBy")}><input className={inputClass} value={form.connectedBy} onChange={(e) => set("connectedBy", e.target.value)} /></FormField>
              <FormField label={t("disconnectedBy")}><input className={inputClass} value={form.disconnectedBy} onChange={(e) => set("disconnectedBy", e.target.value)} /></FormField>
            </div>
            <FormField label={tc("remarks")}><textarea rows={2} className={inputClass} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} /></FormField>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">{tc("cancel")}</button>
              <button type="submit" disabled={busy} className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60">{busy ? tc("loading") : tc("save")}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
