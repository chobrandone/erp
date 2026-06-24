"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function ConfirmDeleteButton({
  apiPath,
  confirmMessage,
}: {
  apiPath: string;
  confirmMessage?: string;
}) {
  const tc = useTranslations("common");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage ?? tc("confirmDelete"))) return;
    setDeleting(true);
    try {
      const res = await fetch(apiPath, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const body = await res.json().catch(() => null);
        window.alert(body?.error ?? tc("deleteFailed"));
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title={tc("delete")}
      className="flex items-center gap-1 text-fg-muted hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}
