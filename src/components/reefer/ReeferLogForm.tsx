"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function ReeferLogForm({ containers }: { containers: Option[] }) {
  const t = useTranslations("reefer");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    setTempC: "-18",
    actualTempC: "-17.8",
    humidity: "65",
    powerStatus: "CONNECTED" as "CONNECTED" | "DISCONNECTED" | "ALARM",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reefer-monitoring", {
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
      <FormSection title={t("logReading")}>
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
        <FormField label={t("setPoint")}>
          <input
            type="number"
            step="0.1"
            className={inputClass}
            value={form.setTempC}
            onChange={(e) => setForm((f) => ({ ...f, setTempC: e.target.value }))}
          />
        </FormField>
        <FormField label={t("actualTemp")}>
          <input
            type="number"
            step="0.1"
            className={inputClass}
            value={form.actualTempC}
            onChange={(e) => setForm((f) => ({ ...f, actualTempC: e.target.value }))}
          />
        </FormField>
        <FormField label={t("humidity")}>
          <input
            type="number"
            className={inputClass}
            value={form.humidity}
            onChange={(e) => setForm((f) => ({ ...f, humidity: e.target.value }))}
          />
        </FormField>
        <FormField label={t("powerStatus")}>
          <select
            className={inputClass}
            value={form.powerStatus}
            onChange={(e) => setForm((f) => ({ ...f, powerStatus: e.target.value as typeof form.powerStatus }))}
          >
            <option value="CONNECTED">{t("connected")}</option>
            <option value="DISCONNECTED">{t("disconnected")}</option>
            <option value="ALARM">{t("alarm")}</option>
          </select>
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
