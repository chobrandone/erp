"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

/**
 * Instant, client-side search over a rendered table — the same "match any field"
 * behaviour as the Container Inventory search. Wraps the table markup and hides
 * rows whose visible text doesn't contain the query. Works with server-rendered
 * tables because it filters the DOM rather than the data.
 */
export function TableSearch({ children }: { children: React.ReactNode }) {
  const tc = useTranslations("common");
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [empty, setEmpty] = useState(false);

  function onChange(value: string) {
    setQ(value);
    const query = value.trim().toLowerCase();
    const root = ref.current;
    if (!root) return;
    const rows = root.querySelectorAll<HTMLTableRowElement>("tbody tr");
    let visible = 0;
    rows.forEach((tr) => {
      if (tr.dataset.noResults === "1") return; // the built-in "no records" row
      const match = !query || (tr.textContent ?? "").toLowerCase().includes(query);
      tr.style.display = match ? "" : "none";
      if (match) visible++;
    });
    setEmpty(query !== "" && visible === 0);
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full sm:w-72">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
        <input
          className="w-full rounded-lg border border-border-color bg-surface-alt pl-8 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder={tc("searchPlaceholder")}
          value={q}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div ref={ref}>{children}</div>
      {empty && (
        <p className="text-center text-sm text-fg-subtle py-3">{tc("noResults")}</p>
      )}
    </div>
  );
}
