"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import {
  REPAIR_COMPONENTS,
  REPAIR_DAMAGE_TYPES,
  REPAIR_SEVERITIES,
  REPAIR_METHODS,
  REPAIR_RESPONSIBILITIES,
  type RepairOption,
} from "@/lib/repairOptions";
import { useFormModalClose } from "@/components/shared/FormModal";

type Option = { id: string; label: string };

export function RepairForm({
  containers,
  containerTypes,
}: {
  containers: Option[];
  containerTypes: Option[];
}) {
  const t = useTranslations("repair");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const closeModal = useFormModalClose();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerMode, setContainerMode] = useState<"existing" | "new">(
    containers.length > 0 ? "existing" : "new"
  );
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    containerNumber: "",
    containerTypeId: containerTypes[0]?.id ?? "",
    component: "",
    damageType: "",
    severity: "",
    repairMethod: "",
    repairResponsibility: "",
    description: "",
    estimatedCost: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const label = (o: RepairOption) => (locale.startsWith("fr") ? o.fr : o.en);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload =
        containerMode === "existing"
          ? { ...form, containerNumber: "", containerTypeId: "" }
          : { ...form, containerId: "" };
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setForm((f) => ({
        ...f,
        containerNumber: "",
        component: "",
        damageType: "",
        severity: "",
        repairMethod: "",
        repairResponsibility: "",
        description: "",
        estimatedCost: "",
      }));
      router.refresh();
      closeModal();
    } catch {
      setError("Something went wrong. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t("newRepair")}>
        {/* Container: pick from existing list OR type a new number + ISO type */}
        <FormField label={tc("containerNumber")} full>
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="repairContainerMode"
                checked={containerMode === "existing"}
                onChange={() => setContainerMode("existing")}
                disabled={containers.length === 0}
              />
              {t("selectExistingContainer")}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="repairContainerMode"
                checked={containerMode === "new"}
                onChange={() => setContainerMode("new")}
              />
              {t("enterNewContainer")}
            </label>
          </div>
          {containerMode === "existing" ? (
            <select className={inputClass} value={form.containerId} onChange={(e) => set("containerId", e.target.value)}>
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                value={form.containerNumber}
                onChange={(e) => set("containerNumber", e.target.value.toUpperCase())}
                placeholder="MSCU1234567"
              />
              <select className={inputClass} value={form.containerTypeId} onChange={(e) => set("containerTypeId", e.target.value)}>
                {containerTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </FormField>

        <FormField label={t("component")}>
          <select className={inputClass} value={form.component} onChange={(e) => set("component", e.target.value)}>
            <option value="">-</option>
            {REPAIR_COMPONENTS.map((o) => (
              <option key={o.value} value={o.value}>{label(o)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("damageType")}>
          <select required className={inputClass} value={form.damageType} onChange={(e) => set("damageType", e.target.value)}>
            <option value="">-</option>
            {REPAIR_DAMAGE_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{label(o)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("severity")}>
          <select className={inputClass} value={form.severity} onChange={(e) => set("severity", e.target.value)}>
            <option value="">-</option>
            {REPAIR_SEVERITIES.map((o) => (
              <option key={o.value} value={o.value}>{label(o)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("repairMethod")}>
          <select className={inputClass} value={form.repairMethod} onChange={(e) => set("repairMethod", e.target.value)}>
            <option value="">-</option>
            {REPAIR_METHODS.map((o) => (
              <option key={o.value} value={o.value}>{label(o)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("repairResponsibility")}>
          <select className={inputClass} value={form.repairResponsibility} onChange={(e) => set("repairResponsibility", e.target.value)}>
            <option value="">-</option>
            {REPAIR_RESPONSIBILITIES.map((o) => (
              <option key={o.value} value={o.value}>{label(o)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("estimatedCost")}>
          <input
            type="number"
            className={inputClass}
            value={form.estimatedCost}
            onChange={(e) => set("estimatedCost", e.target.value)}
          />
        </FormField>
        <FormField label={t("description")} full>
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
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
