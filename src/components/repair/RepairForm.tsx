"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function RepairForm({ containers }: { containers: Option[] }) {
  const t = useTranslations("repair");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    damageType: "",
    description: "",
    estimatedCost: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm((f) => ({ ...f, damageType: "", description: "", estimatedCost: "" }));
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t("newRepair")}>
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
        <FormField label={t("damageType")} full>
          <input
            required
            className={inputClass}
            placeholder="Dented panel, broken door seal..."
            value={form.damageType}
            onChange={(e) => setForm((f) => ({ ...f, damageType: e.target.value }))}
          />
        </FormField>
        <FormField label={t("description")} full>
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </FormField>
        <FormField label={t("estimatedCost")}>
          <input
            type="number"
            className={inputClass}
            value={form.estimatedCost}
            onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
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
