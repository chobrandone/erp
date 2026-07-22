"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { ContainerPicker, resolveContainerId, initialContainerValue, type ContainerPickerValue, type Option } from "@/components/shared/ContainerPicker";
import { useFormModalClose } from "@/components/shared/FormModal";

export function RepairWorkOrderForm({ containers, containerTypes }: { containers: Option[]; containerTypes: Option[] }) {
  const t = useTranslations("repairWorkOrder");
  const tc = useTranslations("common");
  const router = useRouter();
  const closeModal = useFormModalClose();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<ContainerPickerValue>(() => initialContainerValue(containers, containerTypes));
  const [form, setForm] = useState({
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
    setError(null);
    try {
      const containerId = await resolveContainerId(container);
      const res = await fetch("/api/repair-work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, containerId }),
      });
      if (res.ok) {
        router.refresh();
        closeModal();
      } else {
        setError((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t("newWorkOrder")}>
        <ContainerPicker containers={containers} containerTypes={containerTypes} value={container} onChange={setContainer} />
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
