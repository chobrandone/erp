"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { ContainerPicker, resolveContainerId, initialContainerValue, type ContainerPickerValue, type Option } from "@/components/shared/ContainerPicker";
import { useFormModalClose } from "@/components/shared/FormModal";

export function ReleaseOrderForm({
  containers,
  containerTypes,
  customers,
  shippingLines,
}: {
  containers: Option[];
  containerTypes: Option[];
  customers: Option[];
  shippingLines: Option[];
}) {
  const t = useTranslations("releaseOrder");
  const tc = useTranslations("common");
  const router = useRouter();
  const closeModal = useFormModalClose();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<ContainerPickerValue>(() => initialContainerValue(containers, containerTypes));
  const [form, setForm] = useState({
    customerId: "",
    shippingLineId: "",
    authorizedReleaseDate: "",
    destination: "",
    approvedBy: "",
    gateAuthorization: "APPROVED" as "APPROVED" | "REJECTED",
    remarks: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const containerId = await resolveContainerId(container);
      const res = await fetch("/api/release-orders", {
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
      <FormSection title={t("newRelease")}>
        <ContainerPicker containers={containers} containerTypes={containerTypes} value={container} onChange={setContainer} />
        <FormField label="Customer">
          <select
            className={inputClass}
            value={form.customerId}
            onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
          >
            <option value="">-</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Shipping Line">
          <select
            className={inputClass}
            value={form.shippingLineId}
            onChange={(e) => setForm((f) => ({ ...f, shippingLineId: e.target.value }))}
          >
            <option value="">-</option>
            {shippingLines.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("authorizedReleaseDate")}>
          <input
            type="date"
            className={inputClass}
            value={form.authorizedReleaseDate}
            onChange={(e) => setForm((f) => ({ ...f, authorizedReleaseDate: e.target.value }))}
          />
        </FormField>
        <FormField label={t("destination")}>
          <input
            className={inputClass}
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
          />
        </FormField>
        <FormField label={t("approvedBy")}>
          <input
            className={inputClass}
            value={form.approvedBy}
            onChange={(e) => setForm((f) => ({ ...f, approvedBy: e.target.value }))}
          />
        </FormField>
        <FormField label={t("gateAuthorization")}>
          <select
            className={inputClass}
            value={form.gateAuthorization}
            onChange={(e) => setForm((f) => ({ ...f, gateAuthorization: e.target.value as "APPROVED" | "REJECTED" }))}
          >
            <option value="APPROVED">{tc("approved")}</option>
            <option value="REJECTED">{tc("rejected")}</option>
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
