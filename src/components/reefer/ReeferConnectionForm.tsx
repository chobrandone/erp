"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function ReeferConnectionForm({ containers }: { containers: Option[] }) {
  const t = useTranslations("reefer");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
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
    try {
      const res = await fetch("/api/reefer-connections", {
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
      <FormSection title={t("newConnection")}>
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
