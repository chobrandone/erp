"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";

type ContainerOption = { id: string; label: string };

export function GateOutForm({ containers }: { containers: ContainerOption[] }) {
  const t = useTranslations("gateOut");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    destination: "",
    releaseOrderNo: "",
    truckPlate: "",
    driverName: "",
    condition: "GOOD" as "GOOD" | "DAMAGED",
    damageRemarks: "",
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
        body: JSON.stringify({ type: "GATE_OUT", ...form }),
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
        <FormField label={t("destination")}>
          <input
            required
            className={inputClass}
            value={form.destination}
            onChange={(e) => update("destination", e.target.value)}
          />
        </FormField>
        <FormField label={t("releaseOrder")}>
          <input
            required
            className={inputClass}
            value={form.releaseOrderNo}
            onChange={(e) => update("releaseOrderNo", e.target.value)}
          />
        </FormField>
        <FormField label="Truck Registration">
          <input
            required
            className={inputClass}
            value={form.truckPlate}
            onChange={(e) => update("truckPlate", e.target.value)}
          />
        </FormField>
        <FormField label="Driver Name">
          <input
            required
            className={inputClass}
            value={form.driverName}
            onChange={(e) => update("driverName", e.target.value)}
          />
        </FormField>
        <FormField label="Condition">
          <select
            className={inputClass}
            value={form.condition}
            onChange={(e) => update("condition", e.target.value as "GOOD" | "DAMAGED")}
          >
            <option value="GOOD">Good Condition</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </FormField>
        {form.condition === "DAMAGED" && (
          <FormField label="Remarks" full>
            <textarea
              className={inputClass}
              rows={3}
              value={form.damageRemarks}
              onChange={(e) => update("damageRemarks", e.target.value)}
            />
          </FormField>
        )}
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
