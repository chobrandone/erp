"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { ContainerPicker, resolveContainerId, initialContainerValue, type ContainerPickerValue, type Option } from "@/components/shared/ContainerPicker";

type Reason = "YARD_ALLOCATION" | "YARD_REPOSITION" | "PTI" | "REEFER_CONNECTION" | "REPAIR" | "GATE_OUT";

export function MovementForm({
  containers,
  containerTypes,
  locations,
}: {
  containers: Option[];
  containerTypes: Option[];
  locations: Option[];
}) {
  const t = useTranslations("yard");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<ContainerPickerValue>(() => initialContainerValue(containers, containerTypes));
  const [form, setForm] = useState({
    toLocationId: locations[0]?.id ?? "",
    reason: "YARD_ALLOCATION" as Reason,
    equipment: "",
    operator: "",
    supervisorName: "",
    completed: false,
    remarks: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const containerId = await resolveContainerId(container);
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, containerId }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/yard-management/movements");
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed" ? err.message : "Something went wrong. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
      <FormSection title={t("newMovement")}>
        <ContainerPicker containers={containers} containerTypes={containerTypes} value={container} onChange={setContainer} />
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
            onChange={(e) => update("reason", e.target.value as Reason)}
          >
            <option value="YARD_ALLOCATION">{t("reasonYardAllocation")}</option>
            <option value="YARD_REPOSITION">{t("reasonYardReposition")}</option>
            <option value="PTI">{t("reasonPTI")}</option>
            <option value="REEFER_CONNECTION">{t("reasonReeferConnection")}</option>
            <option value="REPAIR">{t("reasonRepair")}</option>
            <option value="GATE_OUT">{t("reasonGateOut")}</option>
          </select>
        </FormField>
        <FormField label={t("equipment")}>
          <input
            className={inputClass}
            value={form.equipment}
            onChange={(e) => update("equipment", e.target.value)}
            placeholder="Reach Stacker 2"
          />
        </FormField>
        <FormField label={t("operator")}>
          <input
            className={inputClass}
            value={form.operator}
            onChange={(e) => update("operator", e.target.value)}
          />
        </FormField>
        <FormField label={t("supervisorName")}>
          <input
            className={inputClass}
            value={form.supervisorName}
            onChange={(e) => update("supervisorName", e.target.value)}
          />
        </FormField>
        <FormField label={t("movementCompleted")}>
          <select
            className={inputClass}
            value={form.completed ? "yes" : "no"}
            onChange={(e) => update("completed", e.target.value === "yes")}
          >
            <option value="no">{tc("no")}</option>
            <option value="yes">{tc("yes")}</option>
          </select>
        </FormField>
        <FormField label={tc("remarks")} full>
          <textarea
            className={inputClass}
            rows={3}
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
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
