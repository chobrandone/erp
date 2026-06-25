"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type Option = { id: string; label: string };

export function GateInForm({
  containerTypes,
  shippingLines,
  customers,
}: {
  containerTypes: Option[];
  shippingLines: Option[];
  customers: Option[];
}) {
  const t = useTranslations("gateIn");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    containerNumber: "",
    containerTypeId: containerTypes[0]?.id ?? "",
    shippingLineId: "",
    customerId: "",
    truckPlate: "",
    driverName: "",
    driverId: "",
    sealNumber: "",
    grossWeightKg: "",
    status: "FULL" as "EMPTY" | "FULL",
    condition: "GOOD" as "GOOD" | "DAMAGED",
    damageRemarks: "",
    photosAttached: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/gate-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "GATE_IN", ...form }),
      });
      if (!res.ok) throw new Error("Failed");
      const { transaction } = await res.json();
      router.push(`/gate-operations/${transaction.id}`);
    } catch {
      setError("Something went wrong. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <FormSection title={t("title")}>
        <FormField label={t("containerNumber")}>
          <input
            required
            className={inputClass}
            value={form.containerNumber}
            onChange={(e) => update("containerNumber", e.target.value.toUpperCase())}
            placeholder="MSCU1234567"
          />
        </FormField>
        <FormField label={t("containerType")}>
          <select
            className={inputClass}
            value={form.containerTypeId}
            onChange={(e) => update("containerTypeId", e.target.value)}
          >
            {containerTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("shippingLine")}>
          <select
            className={inputClass}
            value={form.shippingLineId}
            onChange={(e) => update("shippingLineId", e.target.value)}
          >
            <option value="">-</option>
            {shippingLines.map((sl) => (
              <option key={sl.id} value={sl.id}>
                {sl.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("customer")}>
          <select
            className={inputClass}
            value={form.customerId}
            onChange={(e) => update("customerId", e.target.value)}
          >
            <option value="">-</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("truckPlate")}>
          <input
            required
            className={inputClass}
            value={form.truckPlate}
            onChange={(e) => update("truckPlate", e.target.value)}
          />
        </FormField>
        <FormField label={t("driverName")}>
          <input
            required
            className={inputClass}
            value={form.driverName}
            onChange={(e) => update("driverName", e.target.value)}
          />
        </FormField>
        <FormField label={t("driverId")}>
          <input
            className={inputClass}
            value={form.driverId}
            onChange={(e) => update("driverId", e.target.value)}
          />
        </FormField>
        <FormField label={t("sealNumber")}>
          <input
            className={inputClass}
            value={form.sealNumber}
            onChange={(e) => update("sealNumber", e.target.value)}
          />
        </FormField>
        <FormField label={t("grossWeight")}>
          <input
            type="number"
            className={inputClass}
            value={form.grossWeightKg}
            onChange={(e) => update("grossWeightKg", e.target.value)}
          />
        </FormField>
        <FormField label={t("status")}>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => update("status", e.target.value as "EMPTY" | "FULL")}
          >
            <option value="EMPTY">{t("statusEmpty")}</option>
            <option value="FULL">{t("statusFull")}</option>
          </select>
        </FormField>
        <FormField label={t("condition")}>
          <select
            className={inputClass}
            value={form.condition}
            onChange={(e) => update("condition", e.target.value as "GOOD" | "DAMAGED")}
          >
            <option value="GOOD">{t("good")}</option>
            <option value="DAMAGED">{t("damaged")}</option>
          </select>
        </FormField>
        {form.condition === "DAMAGED" && (
          <FormField label={t("damageRemarks")} full>
            <textarea
              className={inputClass}
              rows={3}
              value={form.damageRemarks}
              onChange={(e) => update("damageRemarks", e.target.value)}
            />
          </FormField>
        )}
        <FormField label={t("photosAttached")}>
          <select
            className={inputClass}
            value={form.photosAttached ? "yes" : "no"}
            onChange={(e) => update("photosAttached", e.target.value === "yes")}
          >
            <option value="no">{tc("no")}</option>
            <option value="yes">{tc("yes")}</option>
          </select>
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
