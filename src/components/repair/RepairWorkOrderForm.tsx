"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function RepairWorkOrderForm({ containers }: { containers: Option[] }) {
  const t = useTranslations("repairWorkOrder");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    assignedTechnician: "",
    startDate: "",
    expectedCompletion: "",
    workToBeDone: "",
    materialsRequired: "",
    remarks: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/repair-work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t("newWorkOrder")}>
        <FormField label="Container" full>
          <select
            className={inputClass}
            value={form.containerId}
            onChange={(e) => setForm((f) => ({ ...f, containerId: e.target.value }))}
          >
            {containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("assignedTechnician")}>
          <input className={inputClass} value={form.assignedTechnician} onChange={(e) => setForm((f) => ({ ...f, assignedTechnician: e.target.value }))} />
        </FormField>
        <FormField label={t("startDate")}>
          <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        </FormField>
        <FormField label={t("expectedCompletion")}>
          <input type="date" className={inputClass} value={form.expectedCompletion} onChange={(e) => setForm((f) => ({ ...f, expectedCompletion: e.target.value }))} />
        </FormField>
        <FormField label={t("workToBeDone")} full>
          <textarea
            className={inputClass}
            rows={4}
            placeholder="One line item per row"
            value={form.workToBeDone}
            onChange={(e) => setForm((f) => ({ ...f, workToBeDone: e.target.value }))}
          />
        </FormField>
        <FormField label={t("materialsRequired")} full>
          <textarea
            className={inputClass}
            rows={2}
            value={form.materialsRequired}
            onChange={(e) => setForm((f) => ({ ...f, materialsRequired: e.target.value }))}
          />
        </FormField>
        <FormField label={tc("remarks")} full>
          <textarea
            className={inputClass}
            rows={3}
            value={form.remarks}
            onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
          />
        </FormField>
      </FormSection>
      <button
        type="submit"
        disabled={submitting}
        className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
      >
        {submitting ? tc("loading") : t("submit")}
      </button>
    </form>
  );
}
