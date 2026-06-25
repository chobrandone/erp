"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function RepairEstimateForm({ containers }: { containers: Option[] }) {
  const t = useTranslations("repairEstimate");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    workDescription: "",
    laborCost: "",
    materialCost: "",
    equipmentCost: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/repair-estimates", {
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
      <FormSection title={t("newEstimate")}>
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
        <FormField label={t("workDescription")} full>
          <textarea
            className={inputClass}
            rows={4}
            placeholder={"One line item per row"}
            value={form.workDescription}
            onChange={(e) => setForm((f) => ({ ...f, workDescription: e.target.value }))}
          />
        </FormField>
        <FormField label={t("laborCost")}>
          <input type="number" step="0.01" className={inputClass} value={form.laborCost} onChange={(e) => setForm((f) => ({ ...f, laborCost: e.target.value }))} />
        </FormField>
        <FormField label={t("materialCost")}>
          <input type="number" step="0.01" className={inputClass} value={form.materialCost} onChange={(e) => setForm((f) => ({ ...f, materialCost: e.target.value }))} />
        </FormField>
        <FormField label={t("equipmentCost")}>
          <input type="number" step="0.01" className={inputClass} value={form.equipmentCost} onChange={(e) => setForm((f) => ({ ...f, equipmentCost: e.target.value }))} />
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
