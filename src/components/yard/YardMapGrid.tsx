"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Snowflake } from "lucide-react";

type LocationWithInventory = {
  id: string;
  block: string;
  row: string;
  bay: string;
  tier: number;
  code: string;
  isReeferSlot: boolean;
  inventory: { container: { containerNumber: string; status: string } } | null | undefined;
};

export function YardMapGrid({ locations }: { locations: LocationWithInventory[] }) {
  const t = useTranslations("yard");
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const blocks = useMemo(() => {
    const map = new Map<string, LocationWithInventory[]>();
    for (const loc of locations) {
      if (!map.has(loc.block)) map.set(loc.block, []);
      map.get(loc.block)!.push(loc);
    }
    return map;
  }, [locations]);

  const blockKeys = Array.from(blocks.keys());
  const activeBlock = selectedBlock ?? blockKeys[0];
  const activeLocations = blocks.get(activeBlock) ?? [];

  const bayMap = useMemo(() => {
    const map = new Map<string, LocationWithInventory[]>();
    for (const loc of activeLocations) {
      const key = `${loc.row}-${loc.bay}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(loc);
    }
    return map;
  }, [activeLocations]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {blockKeys.map((b) => {
          // Count positions (row-bay) rather than individual stack slots.
          const locs = blocks.get(b)!;
          const total = new Set(locs.map((l) => `${l.row}-${l.bay}`)).size;
          const occupied = new Set(locs.filter((l) => l.inventory).map((l) => `${l.row}-${l.bay}`)).size;
          return (
            <button
              key={b}
              onClick={() => setSelectedBlock(b)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeBlock === b
                  ? "brand-gradient text-white border-transparent"
                  : "border-border-color text-fg-muted hover:bg-surface-alt"
              }`}
            >
              {t("block")} {b}
              <span className="ml-2 text-xs opacity-80">
                {occupied}/{total}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}>
        {Array.from(bayMap.entries()).map(([key, cells]) => {
          const sorted = [...cells].sort((a, b) => a.tier - b.tier);
          const topOccupied = sorted.filter((c) => c.inventory).length;
          const isReefer = sorted[0]?.isReeferSlot;
          return (
            <div
              key={key}
              title={key}
              className="aspect-square rounded-lg border border-border-color flex flex-col items-center justify-center gap-0.5 bg-surface text-[10px] relative"
            >
              {isReefer && (
                <Snowflake size={10} className="absolute top-1 right-1 text-brand-400" />
              )}
              <span className="text-fg-subtle font-medium">{key}</span>
              <span
                className={`text-xs font-semibold ${
                  topOccupied > 0 ? "text-brand-100" : "text-fg-subtle"
                }`}
              >
                {topOccupied}/{sorted.length}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
