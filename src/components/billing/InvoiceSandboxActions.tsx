"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Archive, RotateCcw, ShieldAlert, X } from "lucide-react";

// Billing staff "delete" → void to sandbox (soft-delete) with a required reason.
export function VoidInvoiceButton({ id, invoiceNumber }: { id: string; invoiceNumber: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function voidInvoice() {
    const reason = window.prompt(`Move invoice ${invoiceNumber} to the sandbox.\n\nReason (required):`);
    if (reason == null) return;
    if (!reason.trim()) {
      window.alert("A reason is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (res.ok) router.refresh();
      else window.alert((await res.json().catch(() => null))?.error ?? "Failed to void invoice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={voidInvoice} disabled={busy} title="Move to sandbox (void)" className="flex items-center gap-1 text-fg-muted hover:text-amber-600 disabled:opacity-50">
      <Archive size={14} />
    </button>
  );
}

export function RestoreInvoiceButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function restore() {
    if (!window.confirm("Restore this invoice back to the active list?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${id}/restore`, { method: "POST" });
      if (res.ok) router.refresh();
      else window.alert((await res.json().catch(() => null))?.error ?? "Restore failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <button onClick={restore} disabled={busy} title="Restore" className="flex items-center gap-1 text-green-600 hover:underline text-xs font-medium disabled:opacity-50">
      <RotateCcw size={14} /> Restore
    </button>
  );
}

// Permanent deletion — admin only, requires password re-entry.
export function PurgeInvoiceButton({ id, invoiceNumber }: { id: string; invoiceNumber: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function purge(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setOpen(false);
        setPassword("");
        router.refresh();
      } else {
        setError((await res.json().catch(() => null))?.error ?? "Deletion failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title="Permanently delete" className="flex items-center gap-1 text-red-600 hover:underline text-xs font-medium">
        <ShieldAlert size={14} /> Delete
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={purge} className="w-full max-w-sm rounded-xl bg-surface border border-border-color p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-fg flex items-center gap-2 text-red-600"><ShieldAlert size={17} /> Permanent deletion</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-fg-muted"><X size={18} /></button>
            </div>
            <p className="text-xs text-fg-muted">
              You are about to <strong>permanently delete</strong> invoice <strong>{invoiceNumber}</strong>. This cannot be undone.
              A snapshot is kept in the audit trail. Enter your administrator password to confirm.
            </p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Administrator password"
              className="w-full rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">Cancel</button>
              <button type="submit" disabled={busy || !password} className="bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60">
                {busy ? "Verifying…" : "Delete permanently"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
