import { ReactNode } from "react";
import { useTranslations } from "next-intl";

export type Column<T> = {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: Column<T>[];
  rows: T[];
}) {
  const t = useTranslations("common");

  return (
    <div className="overflow-x-auto rounded-xl border border-border-color bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-color bg-surface-alt">
            {columns.map((col, i) => (
              <th
                key={i}
                className="text-left font-medium text-fg-muted px-4 py-3 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-fg-subtle"
              >
                {t("noResults")}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-color last:border-0 hover:bg-surface-alt/60 transition-colors"
              >
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 text-fg ${col.className ?? ""}`}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
