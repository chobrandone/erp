"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { X, Upload, ShieldCheck, FileText } from "lucide-react";

export function InvoiceStatusSelect({
  id,
  status,
  hasReceipt = false,
  receiptVerified = false,
}: {
  id: string;
  status: string;
  hasReceipt?: boolean;
  receiptVerified?: boolean;
}) {
  const t = useTranslations("billing");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function setStatus(next: string) {
    if (next === "PAID" && status !== "PAID" && !hasReceipt) {
      setModalOpen(true);
      return;
    }
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function uploadReceipt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Choose the receipt file.");
    if (!confirm) return setError("Tick the confirmation box.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      fd.append("confirm", "true");
      const res = await fetch(`/api/invoices/${id}/receipt`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      setModalOpen(false);
      setFile(null);
      setConfirm(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-border-color bg-surface-alt px-2 py-1 text-xs text-fg"
      >
        <option value="UNPAID">{t("statusUnpaid")}</option>
        <option value="PAID">{t("statusPaid")}</option>
      </select>
      {status === "PAID" && hasReceipt && (
        <a
          href={`/api/invoices/${id}/receipt`}
          target="_blank"
          title={receiptVerified ? "Receipt verified — view" : "Receipt on file — view"}
          className={receiptVerified ? "text-green-600" : "text-amber-600"}
        >
          {receiptVerified ? <ShieldCheck size={15} /> : <FileText size={15} />}
        </a>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setModalOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={uploadReceipt}
            className="w-full max-w-md rounded-xl bg-surface border border-border-color p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-fg flex items-center gap-2">
                <Upload size={17} /> Upload payment receipt
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-fg-muted">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-fg-muted">
              An invoice can only be marked <strong>Paid</strong> once a receipt is uploaded. Accepted:
              PDF or image (PNG/JPG/WEBP). The file is checked to confirm it looks like a receipt.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-fg file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100/10 file:px-3 file:py-1.5 file:text-brand-100"
            />
            <label className="flex items-start gap-2 text-xs text-fg">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5" />
              <span>I confirm this document is the genuine payment receipt for this invoice.</span>
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !file || !confirm}
                className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60"
              >
                {busy ? "Verifying…" : "Upload & mark paid"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
