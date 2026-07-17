"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { FileSpreadsheet, CalendarDays } from "lucide-react";

export function DailyRecordPicker({ date = "" }: { date?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [d, setD] = useState(date || new Date().toISOString().slice(0, 10));

  function view() {
    router.push(`${pathname}?date=${d}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs text-fg-subtle flex items-center gap-1"><CalendarDays size={12} /> Date du journal</label>
        <input type="date" value={d} onChange={(e) => setD(e.target.value)} className="rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm" />
      </div>
      <button onClick={view} className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg">Afficher le journal</button>
      <a href={`/api/reports/export?type=daily&date=${d}`} target="_blank" className="flex items-center gap-1.5 text-sm rounded-lg border border-border-color px-3 py-2 hover:bg-surface-alt">
        <FileSpreadsheet size={15} /> Export Excel du jour
      </a>
    </div>
  );
}
