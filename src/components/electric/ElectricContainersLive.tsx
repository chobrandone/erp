"use client";

import { useEffect, useState } from "react";
import { useShape } from "@electric-sql/react";
import { Zap } from "lucide-react";

type Row = Record<string, unknown>;

// Proof-of-concept: live-sync the Container table from Postgres via ElectricSQL.
// Any change made to a container elsewhere (e.g. a Gate In) shows here instantly,
// with no page refresh — proving the sync pipeline works inside the ERP.
export function ElectricContainersLive() {
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);
  if (!origin) return <p className="text-sm text-fg-subtle">Loading…</p>;
  return <ContainersTable origin={origin} />;
}

function ContainersTable({ origin }: { origin: string }) {
  const { data, isLoading, error } = useShape<Row>({
    url: `${origin}/api/electric/v1/shape`,
    // Table names are capitalised in Postgres, so they must be quoted.
    params: { table: '"Container"' },
  });

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-500">
        Sync error: {String((error as Error).message ?? error)}
      </div>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-1 font-medium">
          <Zap size={13} /> Live from ElectricSQL
        </span>
        <span className="text-fg-muted">{isLoading ? "connecting…" : `${rows.length} container(s) synced`}</span>
      </div>

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
              <tr><td colSpan={4} className="px-4 py-8 text-center text-fg-subtle">No containers yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={String(r.id)} className="border-b border-border-color last:border-0">
                  <td className="px-4 py-2.5 font-medium">{String(r.containerNumber ?? "-")}</td>
                  <td className="px-4 py-2.5">{String(r.status ?? "-")}</td>
                  <td className="px-4 py-2.5">{String(r.isoCode ?? "-")}</td>
                  <td className="px-4 py-2.5 text-xs text-fg-subtle">{String(r.id ?? "")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-fg-subtle">
        Try it: add or edit a container (e.g. a Gate In) in another tab — this list updates in real time, no refresh.
      </p>
    </div>
  );
}
