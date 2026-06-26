"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function DamageSurveyForm({ containers }: { containers: Option[] }) {
  const t = useTranslations("damageSurvey");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    location: "",
    surveyor: "",
    frontEnd: "",
    rearEnd: "",
    roof: "",
    floor: "",
    leftSide: "",
    rightSide: "",
    severity: "MINOR" as "MINOR" | "MODERATE" | "MAJOR",
    photosAttached: false,
    repairRecommended: false,
    remarks: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/damage-surveys", {
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
      <FormSection title={t("newSurvey")}>
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
        <FormField label={t("location")}>
          <input className={inputClass} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </FormField>
        <FormField label={t("surveyor")}>
          <input className={inputClass} value={form.surveyor} onChange={(e) => setForm((f) => ({ ...f, surveyor: e.target.value }))} />
        </FormField>
        <FormField label={t("frontEnd")}>
          <input className={inputClass} value={form.frontEnd} onChange={(e) => setForm((f) => ({ ...f, frontEnd: e.target.value }))} />
        </FormField>
        <FormField label={t("rearEnd")}>
          <input className={inputClass} value={form.rearEnd} onChange={(e) => setForm((f) => ({ ...f, rearEnd: e.target.value }))} />
        </FormField>
        <FormField label={t("roof")}>
          <input className={inputClass} value={form.roof} onChange={(e) => setForm((f) => ({ ...f, roof: e.target.value }))} />
        </FormField>
        <FormField label={t("floor")}>
          <input className={inputClass} value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} />
        </FormField>
        <FormField label={t("leftSide")}>
          <input className={inputClass} value={form.leftSide} onChange={(e) => setForm((f) => ({ ...f, leftSide: e.target.value }))} />
        </FormField>
        <FormField label={t("rightSide")}>
          <input className={inputClass} value={form.rightSide} onChange={(e) => setForm((f) => ({ ...f, rightSide: e.target.value }))} />
        </FormField>
        <FormField label={t("severity")}>
          <select
            className={inputClass}
            value={form.severity}
            onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as "MINOR" | "MODERATE" | "MAJOR" }))}
          >
            <option value="MINOR">{t("minor")}</option>
            <option value="MODERATE">{t("moderate")}</option>
            <option value="MAJOR">{t("major")}</option>
          </select>
        </FormField>
        <FormField label={t("photosAttached")}>
          <select
            className={inputClass}
            value={form.photosAttached ? "yes" : "no"}
            onChange={(e) => setForm((f) => ({ ...f, photosAttached: e.target.value === "yes" }))}
          >
            <option value="no">{tc("no")}</option>
            <option value="yes">{tc("yes")}</option>
          </select>
        </FormField>
        <FormField label={t("repairRecommended")}>
          <select
            className={inputClass}
            value={form.repairRecommended ? "yes" : "no"}
            onChange={(e) => setForm((f) => ({ ...f, repairRecommended: e.target.value === "yes" }))}
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
