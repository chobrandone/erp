"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, Pencil, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, Column } from "@/components/shared/DataTable";
import { inputClass } from "@/components/shared/FormSection";
import { formatDate } from "@/lib/utils";

const CONTAINER_STATUSES = ["EMPTY", "FULL", "DAMAGED", "IN_REPAIR", "BLOCKED"];

type Row = {
  id: string;
  containerId: string;
  containerNumber: string;
  typeCode: string;
  lineName: string;
  status: string;
  locationCode: string;
  enteredAt: string;
  freeDays: number;
};

const dwell = (enteredAt: string) => Math.max(0, Math.floor((Date.now() - new Date(enteredAt).getTime()) / 86400000));

export function InventoryExplorer({
  rows,
  shippingLines,
  containerTypes,
}: {
  rows: Row[];
  shippingLines: string[];
  containerTypes: string[];
}) {
  const t = useTranslations("containerInventory");
  const tc = useTranslations("common");
  const [line, setLine] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (line === "ALL" || r.lineName === line) &&
          (type === "ALL" || r.typeCode === type) &&
          (status === "ALL" || r.status === status) &&
          (!query.trim() ||
            JSON.stringify(r).toLowerCase().includes(query.trim().toLowerCase()))
      ),
    [rows, line, type, status, query]
  );

  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status))), [rows]);

  const cols: Column<Row & { id: string }>[] = [
    { header: t("container"), accessor: (r) => r.containerNumber },
    { header: t("filterByType"), accessor: (r) => r.typeCode },
    { header: t("filterByLine"), accessor: (r) => r.lineName },
    { header: tc("status"), accessor: (r) => <StatusBadge status={r.status} /> },
    { header: t("location"), accessor: (r) => r.locationCode },
    {
      header: t("daysInYard"),
      accessor: (r) => {
        const days = dwell(r.enteredAt);
        return <span className="font-medium">{days} {t("daysUnit")}</span>;
      },
    },
    {
      header: t("freeDayStatus"),
      accessor: (r) => {
        const days = dwell(r.enteredAt);
        const over = days - r.freeDays;
        return over > 0 ? (
          <span className="text-[11px] font-medium text-red-600 bg-red-500/10 rounded px-1.5 py-0.5">
            {over} {t("daysOverdue")}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-500/10 rounded px-1.5 py-0.5">
            {Math.max(0, r.freeDays - days)} {t("daysFreeLeft")}
          </span>
        );
      },
    },
    { header: t("freeDaysAllowed"), accessor: (r) => `${r.freeDays} ${t("daysUnit")}` },
    { header: tc("date"), accessor: (r) => formatDate(r.enteredAt) },
    { header: tc("actions"), accessor: (r) => <ContainerEditButton id={r.containerId} containerNumber={r.containerNumber} status={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            className={`${inputClass} pl-8 w-56`}
            placeholder={tc("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          value={line}
          onChange={(e) => setLine(e.target.value)}
          className="rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm text-fg"
        >
          <option value="ALL">{t("filterByLine")}: {t("filterAll")}</option>
          {shippingLines.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm text-fg"
        >
          <option value="ALL">{t("filterByType")}: {t("filterAll")}</option>
          {containerTypes.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm text-fg"
        >
          <option value="ALL">{t("filterByStatus")}: {t("filterAll")}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={cols} rows={filtered} searchable={false} />
    </div>
  );
}

// Edit a container's number (and status) in place, via PATCH /api/containers/[id].
function ContainerEditButton({ id, containerNumber, status }: { id: string; containerNumber: string; status: string }) {
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState(containerNumber);
  const [st, setSt] = useState(status);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/containers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerNumber: number, status: st }),
      });
      if (res.ok) { setOpen(false); router.refresh(); }
      else setError((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
    } finally { setBusy(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title={tc("edit")} className="text-fg-muted hover:text-brand-100"><Pencil size={15} /></button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-surface rounded-xl w-full max-w-sm border border-border-color">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
              <span className="text-sm font-semibold text-fg">{tc("edit")}</span>
              <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">N° Conteneur</label>
                <input className={inputClass} value={number} onChange={(e) => setNumber(e.target.value.toUpperCase())} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{tc("status")}</label>
                <select className={inputClass} value={st} onChange={(e) => setSt(e.target.value)}>
                  {!CONTAINER_STATUSES.includes(st) && <option value={st}>{st}</option>}
                  {CONTAINER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-fg-muted hover:text-fg px-4 py-2 rounded-lg">{tc("cancel")}</button>
                <button type="submit" disabled={busy} className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60">{busy ? tc("loading") : tc("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
