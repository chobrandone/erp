"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

export function ReturnTripButton({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function complete() {
    if (!confirm("Mark this trip as completed and return the vehicle to the park?")) return;
    setBusy(true);
    try {
      await fetch(`/api/vehicle-trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={complete}
      disabled={busy}
      className="flex items-center gap-1 text-xs font-medium text-green-600 hover:underline disabled:opacity-60"
    >
      <CheckCircle size={14} /> {busy ? "…" : "Retour parc"}
    </button>
  );
}
