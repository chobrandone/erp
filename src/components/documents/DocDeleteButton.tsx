"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Trash2 } from "lucide-react";

// kind → how to delete. Invoices are voided to the sandbox (never hard-deleted).
export function DocDeleteButton({ kind, sourceId }: { kind: string; sourceId: string }) {
  const tc = useTranslations("common");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    setBusy(true);
    try {
      let res: Response;
      if (kind === "INVOICE") {
        const reason = window.prompt("Move this invoice to the billing sandbox.\n\nReason (required):");
        if (reason == null) return;
        if (!reason.trim()) { alert("A reason is required."); return; }
        res = await fetch(`/api/invoices/${sourceId}/void`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() }),
        });
      } else {
        if (!window.confirm(tc("confirmDelete"))) return;
        const path =
          kind === "GATE_IN" || kind === "GATE_OUT" ? `/api/gate-transactions/${sourceId}`
          : kind === "MOVEMENT" ? `/api/movements/${sourceId}`
          : kind === "PTI" ? `/api/pti-inspections/${sourceId}`
          : "";
        if (!path) return;
        res = await fetch(path, { method: "DELETE" });
      }
      if (res.ok) router.refresh();
      else alert((await res.json().catch(() => null))?.error ?? tc("deleteFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={del} disabled={busy} title={tc("delete")} className="text-fg-muted hover:text-red-500 disabled:opacity-50">
      <Trash2 size={14} />
    </button>
  );
}
