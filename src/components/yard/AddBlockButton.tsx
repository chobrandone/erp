"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClass } from "@/components/shared/FormSection";
import { Plus, X } from "lucide-react";

export function AddBlockButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ block: "", rows: "5", bays: "8", tiers: "20", isReefer: false });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const positions = (Number(form.rows) || 0) * (Number(form.bays) || 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/yard/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block: form.block,
          rows: Number(form.rows),
          bays: Number(form.bays),
          tiers: Number(form.tiers),
          isReefer: form.isReefer,
        }),
      });
      if (res.ok) {
        setOpen(false);
        setForm({ block: "", rows: "5", bays: "8", tiers: "20", isReefer: false });
        router.refresh();
      } else {
        setError((await res.json().catch(() => null))?.error ?? "Failed to create block.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
      >
        <Plus size={16} /> Add Block
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-xl bg-surface border border-border-color p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-fg">Add a yard block</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-fg-muted"><X size={18} /></button>
            </div>

            <FormField label="Block name (e.g. D)">
              <input required className={inputClass} value={form.block} onChange={(e) => set("block", e.target.value.toUpperCase())} placeholder="D" maxLength={10} />
            </FormField>
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Rows"><input type="number" min="1" max="50" className={inputClass} value={form.rows} onChange={(e) => set("rows", e.target.value)} /></FormField>
              <FormField label="Bays / row"><input type="number" min="1" max="50" className={inputClass} value={form.bays} onChange={(e) => set("bays", e.target.value)} /></FormField>
              <FormField label="Height (tiers)"><input type="number" min="1" max="40" className={inputClass} value={form.tiers} onChange={(e) => set("tiers", e.target.value)} /></FormField>
            </div>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" checked={form.isReefer} onChange={(e) => set("isReefer", e.target.checked)} />
              Reefer block (powered slots)
            </label>
            <p className="text-xs text-fg-muted">
              Creates <strong>{positions}</strong> positions × {form.tiers || 0} tiers = <strong>{positions * (Number(form.tiers) || 0)}</strong> slots.
            </p>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">Cancel</button>
              <button type="submit" disabled={busy || !form.block || positions < 1} className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60">
                {busy ? "Creating…" : "Create block"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
