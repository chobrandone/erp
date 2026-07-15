"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, Column } from "@/components/shared/DataTable";
import { inputClass } from "@/components/shared/FormSection";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
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
    { header: "Container", accessor: (r) => r.containerNumber },
    { header: t("filterByType"), accessor: (r) => r.typeCode },
    { header: t("filterByLine"), accessor: (r) => r.lineName },
    { header: tc("status"), accessor: (r) => <StatusBadge status={r.status} /> },
    { header: t("location"), accessor: (r) => r.locationCode },
    {
      header: t("daysInYard"),
      accessor: (r) => {
        const days = dwell(r.enteredAt);
        const over = days - r.freeDays;
        return (
          <span className="flex items-center gap-1.5">
            <span>{days}</span>
            {over > 0 ? (
              <span className="text-[11px] font-medium text-red-600 bg-red-500/10 rounded px-1.5 py-0.5">
                +{over}j surestaries
              </span>
            ) : (
              <span className="text-[11px] text-fg-subtle">{r.freeDays - days}j francs</span>
            )}
          </span>
        );
      },
    },
    { header: tc("date"), accessor: (r) => formatDate(r.enteredAt) },
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

      <DataTable columns={cols} rows={filtered} />
    </div>
  );
}
