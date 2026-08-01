"use client";

import { useEffect, useRef, useState } from "react";
import { HardDrive, WifiOff, Wifi, RefreshCw, Clock } from "lucide-react";
import { getLocalDb, enqueue, pendingCount, syncPending } from "@/lib/electric/localdb";

type Row = { id: string; containerNumber: string | null; status: string | null; isoCode: string | null };
const STATUSES = ["EMPTY", "FULL", "DAMAGED", "IN_REPAIR", "BLOCKED"];

// Offline read + write on the shared on-device database: read containers locally
// (works offline) and edit a container's status offline → queued → replayed to
// the server (last-edit-wins) when back online.
export function LocalContainersLive() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, setPending] = useState(0);
  const [status, setStatus] = useState<"booting" | "ready" | "error">("booting");
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbRef = useRef<any>(null);

  async function refreshPending() {
    if (dbRef.current) setPending(await pendingCount(dbRef.current));
  }

  async function editStatus(id: string, newStatus: string) {
    const db = dbRef.current;
    if (!db) return;
    const now = new Date().toISOString();
    await db.query(`UPDATE containers SET "status" = $1, "updatedAt" = $2 WHERE "id" = $3`, [newStatus, now, id]);
    await enqueue(db, { entity: "container", type: "update", id, data: { status: newStatus }, updatedAt: now });
    await refreshPending();
  }

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => { setOnline(true); if (dbRef.current) syncPending(dbRef.current).then(refreshPending); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const timer = setInterval(() => { if (dbRef.current) syncPending(dbRef.current).then(refreshPending); }, 15000);

    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const db = await getLocalDb();
        if (cancelled) return;
        dbRef.current = db;
        const live_ = await db.live.query(
          `SELECT "id","containerNumber","status","isoCode" FROM containers ORDER BY "containerNumber"`,
          [],
          (res: { rows: Row[] }) => setRows(res.rows),
        );
        unsub = live_.unsubscribe;
        setStatus("ready");
        await refreshPending();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();

    return () => { cancelled = true; unsub?.(); clearInterval(timer); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100/10 text-brand-100 px-2.5 py-1 font-medium">
          <HardDrive size={13} /> Local device database
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${online ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-600"}`}>
          {online ? <Wifi size={13} /> : <WifiOff size={13} />} {online ? "Online" : "Offline — still working"}
        </span>
        {pending > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 px-2.5 py-1 font-medium">
            <Clock size={13} /> {pending} waiting to sync
          </span>
        )}
        <button onClick={() => dbRef.current && syncPending(dbRef.current).then(refreshPending)} disabled={!online} className="inline-flex items-center gap-1 text-xs text-brand-100 hover:underline disabled:opacity-40">
          <RefreshCw size={12} /> Sync now
        </button>
        <span className="text-fg-muted">{status === "booting" ? "starting…" : `${rows.length} container(s) local`}</span>
      </div>

      {status === "error" && <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-500">Local sync error: {error}</div>}

      <div className="overflow-x-auto rounded-xl border border-border-color bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-color bg-surface-alt text-fg-muted">
              <th className="text-left px-4 py-2.5 font-medium">Container No</th>
              <th className="text-left px-4 py-2.5 font-medium">Status (edit offline →)</th>
              <th className="text-left px-4 py-2.5 font-medium">ISO</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-fg-subtle">{status === "ready" ? "No containers yet." : "Loading…"}</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border-color last:border-0">
                  <td className="px-4 py-2.5 font-medium">{r.containerNumber ?? "-"}</td>
                  <td className="px-4 py-2.5">
                    <select value={r.status ?? ""} onChange={(e) => editStatus(r.id, e.target.value)} className="rounded-lg border border-border-color bg-surface-alt px-2 py-1 text-xs text-fg">
                      {!STATUSES.includes(r.status ?? "") && r.status && <option value={r.status}>{r.status}</option>}
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">{r.isoCode ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
