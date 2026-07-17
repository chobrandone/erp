"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Search, Calendar } from "lucide-react";

export function ReportsToolbar({
  q = "",
  from = "",
  to = "",
}: {
  q?: string;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(q);
  const [fromD, setFromD] = useState(from);
  const [toD, setToD] = useState(to);

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (fromD) params.set("from", fromD);
    if (toD) params.set("to", toD);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={apply} className="flex flex-wrap items-end gap-3 rounded-xl border border-border-color bg-surface p-4">
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs text-fg-subtle">Rechercher (n°, conteneur, camion, client…)</label>
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-2.5 text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border-color bg-surface-alt pl-8 pr-3 py-2 text-sm"
            placeholder="Rechercher dans tous les rapports…"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-fg-subtle flex items-center gap-1"><Calendar size={12} /> Du</label>
        <input type="date" value={fromD} onChange={(e) => setFromD(e.target.value)} className="rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs text-fg-subtle">Au</label>
        <input type="date" value={toD} onChange={(e) => setToD(e.target.value)} className="rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm" />
      </div>
      <button type="submit" className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg">Filtrer</button>
      {(q || from || to) && (
        <button type="button" onClick={() => router.push(pathname)} className="text-sm px-3 py-2 rounded-lg border border-border-color">Réinitialiser</button>
      )}
    </form>
  );
}
