"use client";

// Shared on-device database for the offline/local-first build.
// One PGlite instance (IndexedDB) is created lazily and shared by every
// component. Electric syncs read-only reference tables into it; local-first
// writes go to a pending-ops queue that is replayed to the server when online.
//
// Client-only: PGlite + extensions are imported dynamically so nothing touches
// the server bundle.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PendingOp = {
  entity: string;
  type: "create" | "update" | "delete";
  id: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

let dbPromise: Promise<any> | null = null;

export function getDeviceId(): string {
  const KEY = "ns_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? String(Math.random())).slice(0, 8);
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Create (once) the shared local database, its tables, and the Electric shapes.
export function getLocalDb(): Promise<any> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const [{ PGlite }, { live }, { electricSync }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("@electric-sql/pglite/live"),
      import("@electric-sql/pglite-sync"),
    ]);

    const db = await PGlite.create({
      dataDir: "idb://negoce-erp",
      extensions: { live, electric: electricSync() },
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS containers (
        "id" TEXT PRIMARY KEY, "containerNumber" TEXT, "containerTypeId" TEXT,
        "shippingLineId" TEXT, "status" TEXT, "isoCode" TEXT,
        "grossWeightKg" DOUBLE PRECISION, "tareWeightKg" DOUBLE PRECISION,
        "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS container_types (
        "id" TEXT PRIMARY KEY, "code" TEXT, "description" TEXT, "lengthFt" INTEGER,
        "isReefer" BOOLEAN, "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ
      );
      -- Locally-owned table for gate-ins created on this device (not synced from
      -- Electric). The server-assigned document number is written back on sync.
      CREATE TABLE IF NOT EXISTS gate_transactions (
        id TEXT PRIMARY KEY, doc_number TEXT, type TEXT, container_number TEXT,
        container_type_id TEXT, truck_plate TEXT, driver_name TEXT, status TEXT,
        condition TEXT, remarks TEXT, destination TEXT, release_order TEXT,
        synced INTEGER DEFAULT 0, created_at TEXT
      );
      -- Add newer columns to already-existing local databases.
      ALTER TABLE gate_transactions ADD COLUMN IF NOT EXISTS destination TEXT;
      ALTER TABLE gate_transactions ADD COLUMN IF NOT EXISTS release_order TEXT;
      CREATE TABLE IF NOT EXISTS pending_ops (
        op_id TEXT PRIMARY KEY, entity TEXT NOT NULL, type TEXT NOT NULL,
        record_id TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
      );
    `);

    const base = `${window.location.origin}/api/electric/v1/shape`;
    const shapes: Array<[string, string]> = [
      ['"Container"', "containers"],
      ['"ContainerType"', "container_types"],
    ];
    for (const [table, local] of shapes) {
      try {
        await (db as any).electric.syncShapeToTable({
          shape: { url: base, params: { table } },
          table: local,
          primaryKey: ["id"],
          shapeKey: local,
        });
      } catch {
        /* one shape failing (e.g. offline first load) shouldn't block the rest */
      }
    }

    return db;
  })();
  return dbPromise;
}

export async function enqueue(db: any, op: PendingOp): Promise<void> {
  const opId = crypto.randomUUID();
  await db.query(
    `INSERT INTO pending_ops (op_id, entity, type, record_id, data, updated_at, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',$7)`,
    [opId, op.entity, op.type, op.id, JSON.stringify(op.data), op.updatedAt, new Date().toISOString()],
  );
  void syncPending(db);
}

export async function pendingCount(db: any): Promise<number> {
  const r = await db.query(`SELECT count(*)::int AS n FROM pending_ops WHERE status = 'pending'`);
  return r.rows[0]?.n ?? 0;
}

// Replay queued offline writes to the server and reconcile local state.
export async function syncPending(db: any): Promise<void> {
  if (!navigator.onLine) return;
  const q = await db.query(
    `SELECT op_id, entity, type, record_id, data, updated_at FROM pending_ops WHERE status = 'pending'`,
  );
  if (q.rows.length === 0) return;
  const ops = q.rows.map((o: any) => ({
    opId: o.op_id, entity: o.entity, type: o.type, id: o.record_id,
    data: JSON.parse(String(o.data)), updatedAt: o.updated_at,
  }));
  const byId: Record<string, any> = Object.fromEntries(ops.map((o: any) => [o.opId, o]));

  let results: Array<Record<string, any>> = [];
  try {
    const res = await fetch("/api/sync/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ops }),
    });
    if (!res.ok) return;
    results = (await res.json()).results ?? [];
  } catch {
    return; // stay queued, retry later
  }

  for (const r of results) {
    const op = byId[r.opId];
    if (r.status === "applied" || r.status === "skipped" || r.status === "ignored") {
      // Gate in/out: write the server-assigned document (and release-order)
      // numbers back onto the local row.
      if (op?.entity === "gateTransaction" && r.docNumber) {
        await db.query(
          `UPDATE gate_transactions SET doc_number = $1, release_order = COALESCE($2, release_order), synced = 1 WHERE id = $3`,
          [r.docNumber, r.releaseOrderNo ?? null, op.id],
        );
      }
      await db.query(`DELETE FROM pending_ops WHERE op_id = $1`, [r.opId]);
    } else if (r.status === "conflict") {
      await db.query(`UPDATE pending_ops SET status = 'conflict' WHERE op_id = $1`, [r.opId]);
    }
  }
}
