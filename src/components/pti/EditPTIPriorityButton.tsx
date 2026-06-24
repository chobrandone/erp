"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil } from "lucide-react";

export function EditPTIPriorityButton({ id, priority }: { id: string; priority: string }) {
  const t = useTranslations("pti");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function update(next: string) {
    setSubmitting(true);
    try {
      await fetch(`/api/pti-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: next }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <select
        autoFocus
        disabled={submitting}
        defaultValue={priority}
        onBlur={() => setEditing(false)}
        onChange={(e) => update(e.target.value)}
        className="rounded-lg border border-border-color bg-surface-alt px-2 py-1 text-xs text-fg"
      >
        <option value="NORMAL">{t("normal")}</option>
        <option value="URGENT">{t("urgent")}</option>
      </select>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-fg-muted hover:text-fg">
      <span>{priority === "URGENT" ? t("urgent") : t("normal")}</span>
      <Pencil size={12} />
    </button>
  );
}
