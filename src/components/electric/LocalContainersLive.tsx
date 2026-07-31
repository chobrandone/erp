"use client";

import { useEffect, useState } from "react";
import { HardDrive, WifiOff, Wifi } from "lucide-react";

type Row = {
  id: string;
  containerNumber: string | null;
  status: string | null;
  isoCode: string | null;
};

// Increment 1 of the offline build: sync the Container table into a PERSISTENT
// on-device database (PGlite, stored in the browser's IndexedDB) via Electric,
// then read from that local database. Because the data lives on the device, it
// stays readable even with no internet — the foundation for offline mode.
export function LocalContainersLive() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<"booting" | "syncing" | "ready" | "error">("booting");
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    let unsubLive: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        // Import PGlite + extensions in the browser only (never on the server).
        const [{ PGlite }, { live }, { electricSync }] = await Promise.all([
          import("@electric-sql/pglite"),
          import("@electric-sql/pglite/live"),
          import("@electric-sql/pglite-sync"),
        ]);

        // Persistent local database on this device (survives reloads / offline).
        const db = await PGlite.create({
          dataDir: "idb://negoce-erp",
          extensions: { live, electric: electricSync() },
        });
        if (cancelled) return;

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
        `);

        setStatus("syncing");

        // Stream the Container shape from our secure proxy INTO the local table.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).electric.syncShapeToTable({
          shape: {
            url: `${window.location.origin}/api/electric/v1/shape`,
            params: { table: '"Container"' },
          },
          table: "containers",
          primaryKey: ["id"],
          shapeKey: "containers",
          onInitialSync: () => setStatus("ready"),
        });

        // Reactive read FROM the local database.
        const live_ = await db.live.query<Row>(
          `SELECT "id","containerNumber","status","isoCode" FROM containers ORDER BY "containerNumber"`,
          [],
          (res) => setRows(res.rows as Row[]),
        );
        unsubLive = live_.unsubscribe;
        setStatus((s) => (s === "syncing" ? "ready" : s));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      unsubLive?.();
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100/10 text-brand-100 px-2.5 py-1 font-medium">
          <HardDrive size={13} /> Reading from this device&apos;s local database
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
            online ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-600"
          }`}
        >
          {online ? <Wifi size={13} /> : <WifiOff size={13} />} {online ? "Online — syncing" : "Offline — still working"}
        </span>
        <span className="text-fg-muted">
          {status === "booting" && "starting local database…"}
          {status === "syncing" && "syncing from cloud…"}
          {status === "ready" && `${rows.length} container(s) stored locally`}
          {status === "error" && "error"}
        </span>
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-500">
          Local sync error: {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border-color bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-color bg-surface-alt text-fg-muted">
              <th className="text-left px-4 py-2.5 font-medium">Container No</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">ISO</th>
              <th className="text-left px-4 py-2.5 font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-fg-subtle">{status === "ready" ? "No containers yet." : "Loading local data…"}</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border-color last:border-0">
                  <td className="px-4 py-2.5 font-medium">{r.containerNumber ?? "-"}</td>
                  <td className="px-4 py-2.5">{r.status ?? "-"}</td>
                  <td className="px-4 py-2.5">{r.isoCode ?? "-"}</td>
                  <td className="px-4 py-2.5 text-xs text-fg-subtle">{r.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-fg-subtle">
        Test offline: let it load, then turn off Wi-Fi (or DevTools → Network → Offline) and reload — the data is still
        here because it&apos;s stored on this device.
      </p>
    </div>
  );
}
