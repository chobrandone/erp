"use client";

import { useEffect, useRef, useState } from "react";
import { HardDrive, WifiOff, Wifi, RefreshCw, Clock } from "lucide-react";

type Row = {
  id: string;
  containerNumber: string | null;
  status: string | null;
  isoCode: string | null;
};

const STATUSES = ["EMPTY", "FULL", "DAMAGED", "IN_REPAIR", "BLOCKED"];

// Offline read + write demo. Increment 1: sync the Container table into a local
// PGlite database (readable offline). Increment 2: edit a container's status
// offline → the change is written locally and QUEUED, then replayed to the
// server when back online (last-edit-wins), and synced back via Electric.
export function LocalContainersLive() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, setPending] = useState(0);
  const [status, setStatus] = useState<"booting" | "syncing" | "ready" | "error">("booting");
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const dbRef = useRef<unknown>(null);

  // Read pending-op count from the local queue.
  async function refreshPending() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = dbRef.current as any;
    if (!db) return;
    const r = await db.query(`SELECT count(*)::int AS n FROM pending_ops WHERE status = 'pending'`);
    setPending(r.rows[0]?.n ?? 0);
  }

  // Replay queued offline writes to the server, then clear the ones that applied.
  async function syncPending() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = dbRef.current as any;
    if (!db || !navigator.onLine) return;
    const q = await db.query(`SELECT op_id, entity, type, record_id, data, updated_at FROM pending_ops WHERE status = 'pending'`);
    if (q.rows.length === 0) return;
    const ops = q.rows.map((o: Record<string, unknown>) => ({
      opId: o.op_id,
      entity: o.entity,
      type: o.type,
      id: o.record_id,
      data: JSON.parse(String(o.data)),
      updatedAt: o.updated_at,
    }));
    try {
      const res = await fetch("/api/sync/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops }),
      });
      if (!res.ok) return;
      const { results } = await res.json();
      for (const r of results as Array<Record<string, unknown>>) {
        if (r.status === "applied" || r.status === "skipped" || r.status === "ignored") {
          await db.query(`DELETE FROM pending_ops WHERE op_id = $1`, [r.opId]);
        } else if (r.status === "conflict") {
          await db.query(`UPDATE pending_ops SET status = 'conflict' WHERE op_id = $1`, [r.opId]);
        }
      }
      await refreshPending();
    } catch {
      /* stay queued; will retry */
    }
  }

  // Edit a container's status offline: write locally + enqueue for sync.
  async function editStatus(id: string, newStatus: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = dbRef.current as any;
    if (!db) return;
    const now = new Date().toISOString();
    await db.query(`UPDATE containers SET "status" = $1, "updatedAt" = $2 WHERE "id" = $3`, [newStatus, now, id]);
    const opId = crypto.randomUUID();
    await db.query(
      `INSERT INTO pending_ops (op_id, entity, type, record_id, data, updated_at, status, created_at)
       VALUES ($1,'container','update',$2,$3,$4,'pending',$5)`,
      [opId, id, JSON.stringify({ status: newStatus }), now, now],
    );
    await refreshPending();
    syncPending();
  }

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => { setOnline(true); syncPending(); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const timer = setInterval(syncPending, 15000);

    let unsubLive: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const [{ PGlite }, { live }, { electricSync }] = await Promise.all([
          import("@electric-sql/pglite"),
          import("@electric-sql/pglite/live"),
          import("@electric-sql/pglite-sync"),
        ]);

        const db = await PGlite.create({
          dataDir: "idb://negoce-erp",
          extensions: { live, electric: electricSync() },
        });
        if (cancelled) return;
        dbRef.current = db;

        await db.exec(`
          CREATE TABLE IF NOT EXISTS containers (
            "id" TEXT PRIMARY KEY,
            "containerNumber" TEXT,
            "containerTypeId" TEXT,
            "shippingLineId" TEXT,
            "status" TEXT,
            "isoCode" TEXT,
            "grossWeightKg" DOUBLE PRECISION,
            "tareWeightKg" DOUBLE PRECISION,
            "createdAt" TIMESTAMPTZ,
            "updatedAt" TIMESTAMPTZ
          );
          CREATE TABLE IF NOT EXISTS pending_ops (
            op_id TEXT PRIMARY KEY,
            entity TEXT NOT NULL,
            type TEXT NOT NULL,
            record_id TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL
          );
        `);

        setStatus("syncing");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).electric.syncShapeToTable({
          shape: { url: `${window.location.origin}/api/electric/v1/shape`, params: { table: '"Container"' } },
          table: "containers",
          primaryKey: ["id"],
          shapeKey: "containers",
          onInitialSync: () => setStatus("ready"),
        });

        const live_ = await db.live.query<Row>(
          `SELECT "id","containerNumber","status","isoCode" FROM containers ORDER BY "containerNumber"`,
          [],
          (res) => setRows(res.rows as Row[]),
        );
        unsubLive = live_.unsubscribe;
        setStatus((s) => (s === "syncing" ? "ready" : s));
        await refreshPending();
        syncPending();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      unsubLive?.();
      clearInterval(timer);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100/10 text-brand-100 px-2.5 py-1 font-medium">
          <HardDrive size={13} /> Local device database
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${online ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-600"}`}>
          {online ? <Wifi size={13} /> : <WifiOff size={13} />} {online ? "Online — syncing" : "Offline — still working"}
        </span>
        {pending > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 px-2.5 py-1 font-medium">
            <Clock size={13} /> {pending} change(s) waiting to sync
          </span>
        )}
        <button onClick={syncPending} disabled={!online} className="inline-flex items-center gap-1 text-xs text-brand-100 hover:underline disabled:opacity-40">
          <RefreshCw size={12} /> Sync now
        </button>
        <span className="text-fg-muted">
          {status === "booting" && "starting local database…"}
          {status === "syncing" && "syncing from cloud…"}
          {status === "ready" && `${rows.length} container(s) stored locally`}
        </span>
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-500">Local sync error: {error}</div>
      )}

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
              <tr><td colSpan={3} className="px-4 py-8 text-center text-fg-subtle">{status === "ready" ? "No containers yet." : "Loading local data…"}</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border-color last:border-0">
                  <td className="px-4 py-2.5 font-medium">{r.containerNumber ?? "-"}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={r.status ?? ""}
                      onChange={(e) => editStatus(r.id, e.target.value)}
                      className="rounded-lg border border-border-color bg-surface-alt px-2 py-1 text-xs text-fg"
                    >
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

      <p className="text-xs text-fg-subtle">
        Test offline write: go offline (DevTools → Network → Offline), change a container&apos;s status — it saves locally and
        shows &quot;waiting to sync&quot;. Go back online — it replays to the server automatically and the badge clears.
      </p>
    </div>
  );
}
