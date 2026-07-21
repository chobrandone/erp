"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

export function ReturnTripButton({
  tripId,
  label = "Return to park",
  confirmText = "Complete this trip?",
}: {
  tripId: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function complete() {
    if (!confirm(confirmText)) return;
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
    <button onClick={complete} disabled={busy} className="flex items-center gap-1 text-xs font-medium text-green-600 hover:underline disabled:opacity-60">
      <CheckCircle size={14} /> {busy ? "…" : label}
    </button>
  );
}
