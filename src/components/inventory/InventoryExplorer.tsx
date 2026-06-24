"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, Column } from "@/components/shared/DataTable";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  containerNumber: string;
  typeCode: string;
  lineName: string;
  status: string;
  locationCode: string;
  enteredAt: string;
};

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

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (line === "ALL" || r.lineName === line) &&
          (type === "ALL" || r.typeCode === type) &&
          (status === "ALL" || r.status === status)
      ),
    [rows, line, type, status]
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
      accessor: (r) =>
        Math.max(1, Math.round((Date.now() - new Date(r.enteredAt).getTime()) / 86400000)),
    },
    { header: tc("date"), accessor: (r) => formatDate(r.enteredAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
