"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AlertTriangle, ServerCog, Smartphone, CheckCircle2 } from "lucide-react";

type Conflict = {
  id: string;
  entity: string;
  recordId: string;
  deviceValue: string;
  serverValue: string;
  deviceUpdatedAt: string | null;
  serverUpdatedAt: string | null;
  createdAt: string;
};

const short = (json: string) => {
  try { return Object.entries(JSON.parse(json)).map(([k, v]) => `${k}: ${String(v)}`).join(", "); }
  catch { return json; }
};

export function ConflictReview() {
  const router = useRouter();
  const [rows, setRows] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/conflicts");
      const data = await res.json().catch(() => ({}));
      setRows(res.ok ? (data.conflicts ?? []) : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function resolve(id: string, resolution: "KEEP_SERVER" | "USE_DEVICE") {
    setBusy(id);
    try {
      await fetch(`/api/sync/conflicts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });
      setRows((rs) => rs.filter((r) => r.id !== id));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-fg-subtle">Loading…</p>;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-color bg-surface p-12 text-center">
        <CheckCircle2 size={28} className="text-emerald-500" />
        <p className="text-sm text-fg-muted">No sync conflicts — everything is reconciled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <AlertTriangle size={16} /> {rows.length} conflict(s) to review — pick which value is correct. Nothing was overwritten.
      </div>
      {rows.map((c) => (
        <div key={c.id} className="rounded-xl border border-border-color bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-fg">{c.entity} · {c.recordId.slice(0, 8)}…</span>
            <span className="text-xs text-fg-subtle">{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border-color p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-fg-muted mb-1"><ServerCog size={13} /> Server value (current)</div>
              <div className="text-sm text-fg">{short(c.serverValue)}</div>
              <div className="text-[11px] text-fg-subtle mt-1">{c.serverUpdatedAt ? new Date(c.serverUpdatedAt).toLocaleString() : ""}</div>
            </div>
            <div className="rounded-lg border border-border-color p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-fg-muted mb-1"><Smartphone size={13} /> Device change (offline)</div>
              <div className="text-sm text-fg">{short(c.deviceValue)}</div>
              <div className="text-[11px] text-fg-subtle mt-1">{c.deviceUpdatedAt ? new Date(c.deviceUpdatedAt).toLocaleString() : ""}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => resolve(c.id, "KEEP_SERVER")} disabled={busy === c.id} className="text-sm px-3 py-1.5 rounded-lg border border-border-color disabled:opacity-60">Keep server</button>
            <button onClick={() => resolve(c.id, "USE_DEVICE")} disabled={busy === c.id} className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60">Use device value</button>
          </div>
        </div>
      ))}
    </div>
  );
}
