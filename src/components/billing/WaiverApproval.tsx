"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Check, X } from "lucide-react";

// Super-admin controls to confirm or reject a finance-requested waiver.
export function WaiverApproval({ id, requestedBy, detail }: { id: string; requestedBy: string; detail: string }) {
  const t = useTranslations("billing");
  const tc = useTranslations("common");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    if (action === "reject" && !confirm(t("waiverRejectConfirm"))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waiverAction: action }),
      });
      if (res.ok) router.refresh();
      else alert((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold px-2 py-0.5 w-fit">
        {t("waiverPendingBadge")}
      </span>
      <span className="text-[11px] text-fg-subtle">{detail} · {requestedBy}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => act("approve")} disabled={busy} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50">
          <Check size={13} /> {t("waiverApprove")}
        </button>
        <button onClick={() => act("reject")} disabled={busy} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
          <X size={13} /> {t("waiverReject")}
        </button>
      </div>
    </div>
  );
}
