"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function MovementForm({
  containers,
  locations,
}: {
  containers: Option[];
  locations: Option[];
}) {
  const t = useTranslations("yard");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    toLocationId: locations[0]?.id ?? "",
    reason: "YARD_OPTIMIZATION" as "YARD_OPTIMIZATION" | "GATE_OUT_PREP" | "INSPECTION" | "REPAIR",
    equipment: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/yard-management/movements");
    } catch {
      setError("Something went wrong. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <FormSection title={t("newMovement")}>
        <FormField label="Container" full>
          <select
            className={inputClass}
            value={form.containerId}
            onChange={(e) => update("containerId", e.target.value)}
          >
            {containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("to")}>
          <select
            className={inputClass}
            value={form.toLocationId}
            onChange={(e) => update("toLocationId", e.target.value)}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("reason")}>
          <select
            className={inputClass}
            value={form.reason}
            onChange={(e) => update("reason", e.target.value as typeof form.reason)}
          >
            <option value="YARD_OPTIMIZATION">{t("reasonYardOptimization")}</option>
            <option value="GATE_OUT_PREP">{t("reasonGateOutPrep")}</option>
            <option value="INSPECTION">{t("reasonInspection")}</option>
            <option value="REPAIR">{t("reasonRepair")}</option>
          </select>
        </FormField>
        <FormField label={t("equipment")} full>
          <input
            className={inputClass}
            value={form.equipment}
            onChange={(e) => update("equipment", e.target.value)}
            placeholder="Reach Stacker 2"
          />
        </FormField>
      </FormSection>

      {error && <p className="text-sm text-red-500">{error}</p>}

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
