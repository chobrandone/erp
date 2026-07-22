"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { ArrowLeft } from "lucide-react";

type Option = { id: string; label: string };

export function PTIRequestForm({
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
  const t = useTranslations("pti");
  const tc = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // "existing" = pick from the dropdown; "new" = type a container number + type.
  const [containerMode, setContainerMode] = useState<"existing" | "new">(
    containers.length > 0 ? "existing" : "new"
  );
  const [form, setForm] = useState({
    containerId: containers[0]?.id ?? "",
    containerNumber: "",
    containerTypeId: containerTypes[0]?.id ?? "",
    customerId: "",
    shippingLineId: "",
    priority: "NORMAL" as "NORMAL" | "URGENT",
    requiredDate: "",
    inspectionType: "STANDARD" as "STANDARD" | "SPECIAL" | "SMART",
    remarks: "",
    requestedBy: "",
    approvedBy: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload =
        containerMode === "existing"
          ? { ...form, containerNumber: "", containerTypeId: "" }
          : { ...form, containerId: "" };
      const res = await fetch("/api/pti-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/pti-management");
    } catch {
      setError("Something went wrong. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
      <FormSection title={t("newRequest")}>
        <FormField label={tc("containerNumber")} full>
          <div className="mb-2 flex gap-4 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="containerMode"
                checked={containerMode === "existing"}
                onChange={() => setContainerMode("existing")}
                disabled={containers.length === 0}
              />
              {t("selectExistingContainer")}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="containerMode"
                checked={containerMode === "new"}
                onChange={() => setContainerMode("new")}
              />
              {t("enterNewContainer")}
            </label>
          </div>
          {containerMode === "existing" ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                value={form.containerNumber}
                onChange={(e) => setForm((f) => ({ ...f, containerNumber: e.target.value.toUpperCase() }))}
                placeholder="MSCU1234567"
              />
              <select
                className={inputClass}
                value={form.containerTypeId}
                onChange={(e) => setForm((f) => ({ ...f, containerTypeId: e.target.value }))}
              >
                {containerTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </FormField>
        <FormField label={t("customerLabel")}>
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
        <FormField label={t("shippingLineLabel")}>
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
        <FormField label={t("priority")}>
          <select
            className={inputClass}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as "NORMAL" | "URGENT" }))}
          >
            <option value="NORMAL">{t("normal")}</option>
            <option value="URGENT">{t("urgent")}</option>
          </select>
        </FormField>
        <FormField label={t("requiredDate")}>
          <input
            type="date"
            className={inputClass}
            value={form.requiredDate}
            onChange={(e) => setForm((f) => ({ ...f, requiredDate: e.target.value }))}
          />
        </FormField>
        <FormField label={t("inspectionType")}>
          <select
            className={inputClass}
            value={form.inspectionType}
            onChange={(e) => setForm((f) => ({ ...f, inspectionType: e.target.value as "STANDARD" | "SPECIAL" | "SMART" }))}
          >
            <option value="STANDARD">{t("standardPti")}</option>
            <option value="SPECIAL">{t("specialPti")}</option>
            <option value="SMART">{t("smartPti")}</option>
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
        <FormField label={t("requestedBy")}>
          <input
            className={inputClass}
            value={form.requestedBy}
            onChange={(e) => setForm((f) => ({ ...f, requestedBy: e.target.value }))}
          />
        </FormField>
        <FormField label={t("approvedBy")}>
          <input
            className={inputClass}
            value={form.approvedBy}
            onChange={(e) => setForm((f) => ({ ...f, approvedBy: e.target.value }))}
          />
        </FormField>
      </FormSection>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/pti-management")}
          disabled={submitting}
          className="flex items-center gap-1.5 border border-border-color text-fg font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-surface-alt disabled:opacity-60"
        >
          <ArrowLeft size={16} /> {tc("back")}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
        >
          {submitting ? tc("loading") : t("submitRequest")}
        </button>
      </div>
    </form>
  );
}
