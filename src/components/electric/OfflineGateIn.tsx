"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, WifiOff, Wifi, Clock, CheckCircle2 } from "lucide-react";
import { getLocalDb, enqueue, syncPending, getDeviceId } from "@/lib/electric/localdb";
import { inputClass } from "@/components/shared/FormSection";

type CType = { id: string; code: string; description: string | null };
type GateRow = {
  id: string; doc_number: string | null; container_number: string | null;
  status: string | null; condition: string | null; synced: number; created_at: string;
};

// Offline Gate-In (core fields). Creates the record on the device's local
// database with a PROVISIONAL number, queues it, and — when back online —
// the server creates the container (if new), assigns the final EIR document
// number, and allocates a yard slot. The final number flows back to the row.
export function OfflineGateIn() {
  const [types, setTypes] = useState<CType[]>([]);
  const [rows, setRows] = useState<GateRow[]>([]);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbRef = useRef<any>(null);
  const [form, setForm] = useState({ containerNumber: "", containerTypeId: "", truckPlate: "", driverName: "", status: "FULL", condition: "GOOD" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function refreshList() {
    const db = dbRef.current;
    if (!db) return;
    const r = await db.query(`SELECT id, doc_number, container_number, status, condition, synced, created_at FROM gate_transactions ORDER BY created_at DESC LIMIT 20`);
    setRows(r.rows as GateRow[]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const db = dbRef.current;
    if (!db || !form.containerNumber.trim() || !form.containerTypeId) return;
    setBusy(true);
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const provisional = `TEMP-${getDeviceId()}-${Date.now().toString().slice(-5)}`;
      await db.query(
        `INSERT INTO gate_transactions (id, doc_number, type, container_number, container_type_id, truck_plate, driver_name, status, condition, remarks, synced, created_at)
         VALUES ($1,$2,'GATE_IN',$3,$4,$5,$6,$7,$8,NULL,0,$9)`,
        [id, provisional, form.containerNumber.trim().toUpperCase(), form.containerTypeId, form.truckPlate.trim(), form.driverName.trim(), form.status, form.condition, now],
      );
      await enqueue(db, {
        entity: "gateTransaction", type: "create", id, updatedAt: now,
        data: {
          containerNumber: form.containerNumber.trim().toUpperCase(),
          containerTypeId: form.containerTypeId,
          truckPlate: form.truckPlate.trim(),
          driverName: form.driverName.trim(),
          status: form.status,
          condition: form.condition,
        },
      });
      setForm((f) => ({ ...f, containerNumber: "", truckPlate: "", driverName: "" }));
      await refreshList();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => { setOnline(true); if (dbRef.current) syncPending(dbRef.current).then(refreshList); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const timer = setInterval(() => { if (dbRef.current) syncPending(dbRef.current).then(refreshList); }, 15000);

    let unsubTypes: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const db = await getLocalDb();
        if (cancelled) return;
        dbRef.current = db;
        const lt = await db.live.query(
          `SELECT "id","code","description" FROM container_types ORDER BY "code"`,
          [],
          (res: { rows: CType[] }) => {
            setTypes(res.rows);
            setForm((f) => (f.containerTypeId ? f : { ...f, containerTypeId: res.rows[0]?.id ?? "" }));
          },
        );
        unsubTypes = lt.unsubscribe;
        await refreshList();
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; unsubTypes?.(); clearInterval(timer); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100/10 text-brand-100 px-2.5 py-1 font-medium"><LogIn size={13} /> Offline Gate In</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${online ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-600"}`}>
          {online ? <Wifi size={13} /> : <WifiOff size={13} />} {online ? "Online" : "Offline — still working"}
        </span>
      </div>

      {error && <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-3 text-sm text-red-500">{error}</div>}

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border-color bg-surface p-4">
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Container Number</label>
          <input required className={inputClass} value={form.containerNumber} onChange={(e) => set("containerNumber", e.target.value.toUpperCase())} placeholder="MSCU1234567" />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Container Type</label>
          <select className={inputClass} value={form.containerTypeId} onChange={(e) => set("containerTypeId", e.target.value)}>
            {types.length === 0 && <option value="">{ready ? "no types synced" : "loading…"}</option>}
            {types.map((t) => <option key={t.id} value={t.id}>{t.code}{t.description ? ` — ${t.description}` : ""}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Truck Plate</label>
          <input className={inputClass} value={form.truckPlate} onChange={(e) => set("truckPlate", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Driver Name</label>
          <input className={inputClass} value={form.driverName} onChange={(e) => set("driverName", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="FULL">Full</option>
            <option value="EMPTY">Empty</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Condition</label>
          <select className={inputClass} value={form.condition} onChange={(e) => set("condition", e.target.value)}>
            <option value="GOOD">Good</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy || !ready} className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60">
            {busy ? "Saving…" : "Record Gate In (works offline)"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border-color bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-color bg-surface-alt text-fg-muted">
              <th className="text-left px-4 py-2.5 font-medium">Document No</th>
              <th className="text-left px-4 py-2.5 font-medium">Container</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Sync</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-fg-subtle">No gate-ins recorded on this device yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border-color last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{r.doc_number}</td>
                  <td className="px-4 py-2.5 font-medium">{r.container_number}</td>
                  <td className="px-4 py-2.5">{r.status} · {r.condition}</td>
                  <td className="px-4 py-2.5">
                    {r.synced ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-xs"><CheckCircle2 size={13} /> synced</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs"><Clock size={13} /> provisional</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-fg-subtle">
        Test: go offline, record a Gate In — it saves with a <span className="font-mono">TEMP-…</span> number marked
        &quot;provisional.&quot; Go back online — it syncs and the row flips to the real <span className="font-mono">EIR-IN-…</span> number.
      </p>
    </div>
  );
}
