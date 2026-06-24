"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PTI_CHECKLIST_ITEMS } from "@/lib/validations/pti";
import { inputClass } from "@/components/shared/FormSection";

export function PTIInspectionChecklist({ ptiRequestId }: { ptiRequestId: string }) {
  const t = useTranslations("pti");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, "PASS" | "FAIL">>(
    Object.fromEntries(PTI_CHECKLIST_ITEMS.map((i) => [i.key, "PASS"]))
  );
  const [remarks, setRemarks] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const checklist = PTI_CHECKLIST_ITEMS.map((item) => ({
        key: item.key,
        label: t(item.key as never),
        result: results[item.key],
      }));
      const res = await fetch("/api/pti-inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ptiRequestId, checklist, remarks }),
      });
      if (!res.ok) throw new Error("Failed");
      const { inspection } = await res.json();
      router.push(`/pti-management/${ptiRequestId}/certificate?inspectionId=${inspection.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="rounded-xl border border-border-color bg-surface p-5">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-4">
          {t("checklist")}
        </h3>
        <div className="space-y-3">
          {PTI_CHECKLIST_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between border-b border-border-color last:border-0 pb-3 last:pb-0"
            >
              <span className="text-sm text-fg">{t(item.key as never)}</span>
              <div className="flex gap-1 rounded-lg border border-border-color p-0.5">
                {(["PASS", "FAIL"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setResults((res) => ({ ...res, [item.key]: r }))}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      results[item.key] === r
                        ? r === "PASS"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "text-fg-muted hover:bg-surface-alt"
                    }`}
                  >
                    {t(r === "PASS" ? "pass" : "fail")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("remarks")}</label>
        <textarea
          className={inputClass}
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
      >
        {submitting ? tc("loading") : t("submitInspection")}
      </button>
    </form>
  );
}
