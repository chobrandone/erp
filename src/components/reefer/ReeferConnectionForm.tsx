"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { ContainerPicker, resolveContainerId, initialContainerValue, type ContainerPickerValue, type Option } from "@/components/shared/ContainerPicker";
import { useFormModalClose } from "@/components/shared/FormModal";

export function ReeferConnectionForm({ containers, containerTypes }: { containers: Option[]; containerTypes: Option[] }) {
  const t = useTranslations("reefer");
  const tc = useTranslations("common");
  const router = useRouter();
  const closeModal = useFormModalClose();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<ContainerPickerValue>(() => initialContainerValue(containers, containerTypes));
  const [form, setForm] = useState({
    plugNumber: "",
    connectionTime: "",
    disconnectionTime: "",
    connectedBy: "",
    disconnectedBy: "",
    powerStatus: "OPERATIONAL" as "OPERATIONAL" | "FAULT",
    remarks: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const containerId = await resolveContainerId(container);
      const res = await fetch("/api/reefer-connections", {
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
      <FormSection title={t("newConnection")}>
        <ContainerPicker containers={containers} containerTypes={containerTypes} value={container} onChange={setContainer} />
        <FormField label={t("plugNumber")}>
          <input
            className={inputClass}
            value={form.plugNumber}
            onChange={(e) => setForm((f) => ({ ...f, plugNumber: e.target.value }))}
          />
        </FormField>
        <FormField label={t("connectionTime")}>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.connectionTime}
            onChange={(e) => setForm((f) => ({ ...f, connectionTime: e.target.value }))}
          />
        </FormField>
        <FormField label={t("disconnectionTime")}>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.disconnectionTime}
            onChange={(e) => setForm((f) => ({ ...f, disconnectionTime: e.target.value }))}
          />
        </FormField>
        <FormField label={t("connectedBy")}>
          <input
            className={inputClass}
            value={form.connectedBy}
            onChange={(e) => setForm((f) => ({ ...f, connectedBy: e.target.value }))}
          />
        </FormField>
        <FormField label={t("disconnectedBy")}>
          <input
            className={inputClass}
            value={form.disconnectedBy}
            onChange={(e) => setForm((f) => ({ ...f, disconnectedBy: e.target.value }))}
          />
        </FormField>
        <FormField label={t("powerStatus")}>
          <select
            className={inputClass}
            value={form.powerStatus}
            onChange={(e) => setForm((f) => ({ ...f, powerStatus: e.target.value as "OPERATIONAL" | "FAULT" }))}
          >
            <option value="OPERATIONAL">{t("operational")}</option>
            <option value="FAULT">{t("fault")}</option>
          </select>
        </FormField>
        <FormField label={t("remarks")} full>
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
        {submitting ? tc("loading") : t("submitConnection")}
      </button>
    </form>
  );
}
