"use client";

import { useEffect, useState } from "react";
import { WifiOff, LogIn, LogOut } from "lucide-react";
import { getLocalDb } from "@/lib/electric/localdb";
import { OfflineGateIn } from "@/components/electric/OfflineGateIn";
import { OfflineGateOut } from "@/components/electric/OfflineGateOut";

// Pilot integration on the real Gate Operations page. Stays invisible while
// online (normal workflow untouched) and appears only when the connection drops,
// letting staff keep recording gate moves — saved on the device and synced
// automatically when the internet returns. It quietly keeps the on-device
// database in sync while online so the data is ready if the connection fails.
export function OfflineGateBanner() {
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState<"in" | "out">("in");

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    // Keep the local database synced while online so it's ready if we go offline.
    getLocalDb().catch(() => {});
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (online) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
        <WifiOff size={16} /> You&apos;re offline — record gate moves here. They save on this device and sync automatically when the internet returns.
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("in")}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg ${tab === "in" ? "brand-gradient text-white" : "border border-border-color text-fg hover:bg-surface-alt"}`}
        >
          <LogIn size={15} /> Gate In
        </button>
        <button
          onClick={() => setTab("out")}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg ${tab === "out" ? "brand-gradient text-white" : "border border-border-color text-fg hover:bg-surface-alt"}`}
        >
          <LogOut size={15} /> Gate Out
        </button>
      </div>

      {tab === "in" ? <OfflineGateIn /> : <OfflineGateOut />}
    </div>
  );
}
