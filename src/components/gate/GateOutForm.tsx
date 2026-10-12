"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { ContainerPicker, resolveContainerId, initialContainerValue, type ContainerPickerValue, type Option } from "@/components/shared/ContainerPicker";
import { NamePicker, initialNameValue, resolveNameId, type NamePickerValue } from "@/components/shared/NamePicker";
import { AcconierInput } from "@/components/shared/AcconierInput";

// datetime-local wants "YYYY-MM-DDTHH:mm" in the browser's local time.
function nowLocal(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function GateOutForm({ containers, containerTypes, customers, defaultEirId }: { containers: Option[]; containerTypes: Option[]; customers: Option[]; defaultEirId: string }) {
  const t = useTranslations("gateOut");
  const tc = useTranslations("common");
  const td = useTranslations("delivery");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<ContainerPickerValue>(() => initialContainerValue(containers, containerTypes));
  const [customer, setCustomer] = useState<NamePickerValue>(initialNameValue);
  const [form, setForm] = useState({
    eirId: defaultEirId,
    destination: "",
    truckPlate: "",
    driverName: "",
    gateDateTime: nowLocal(),
    deliveryHeading: "OUT_FULL" as "OUT_EMPTY" | "OUT_FULL",
    condition: "GOOD" as "GOOD" | "DAMAGED",
    damageRemarks: "",
    remarks: "",
    // RTC / Port de Douala EIR (livraison) fields
    navire: "",
    voyage: "",
    acconier: "",
    transitaire: "",
    documentType: "BEE" as "BL" | "BEE",
    documentNumber: "",
    gatePost: "",
    sealNumber2: "",
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
      const customerId = await resolveNameId(customer, "/api/customers/resolve");
      const occurredAt = form.gateDateTime ? new Date(form.gateDateTime).toISOString() : undefined;
      const res = await fetch("/api/gate-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "GATE_OUT", ...form, occurredAt, containerId, customerId }),
      });
      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.error;
        throw new Error(msg || "Failed");
      }
      const { transaction } = await res.json();
      router.push(`/gate-operations/${transaction.id}`);
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed" ? err.message : "Something went wrong. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
      <FormSection title={t("title")}>
        <FormField label={tc("eirId")}>
          <input
            required
            className={inputClass}
            value={form.eirId}
            onChange={(e) => update("eirId", e.target.value.toUpperCase())}
          />
        </FormField>
        <ContainerPicker containers={containers} containerTypes={containerTypes} value={container} onChange={setContainer} />
        <NamePicker label={t("customer")} options={customers} value={customer} onChange={setCustomer} placeholder={t("customer")} />
        <FormField label={t("destination")}>
          <input
            required
            className={inputClass}
            value={form.destination}
            onChange={(e) => update("destination", e.target.value)}
          />
        </FormField>
        <FormField label={tc("dateTime")}>
          <input
            type="datetime-local"
            required
            className={inputClass}
            value={form.gateDateTime}
            onChange={(e) => update("gateDateTime", e.target.value)}
          />
        </FormField>
        <FormField label={td("label")}>
          <select
            className={inputClass}
            value={form.deliveryHeading}
            onChange={(e) => update("deliveryHeading", e.target.value as "OUT_EMPTY" | "OUT_FULL")}
          >
            <option value="OUT_FULL">{td("outFull")}</option>
            <option value="OUT_EMPTY">{td("outEmpty")}</option>
          </select>
        </FormField>
        <FormField label={t("releaseOrder")}>
          <input className={`${inputClass} opacity-60`} value={t("releaseOrderAuto")} disabled readOnly />
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
          <FormField label="Damage Description" full>
            <textarea
              className={inputClass}
              rows={3}
              value={form.damageRemarks}
              onChange={(e) => update("damageRemarks", e.target.value)}
            />
          </FormField>
        )}
        <FormField label={tc("remarks")} full>
          <textarea
            className={inputClass}
            rows={3}
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="EIR — Procès-verbal de Livraison (Port de Douala)">
        <FormField label="NAVIRE (Vessel)">
          <input className={inputClass} value={form.navire} onChange={(e) => update("navire", e.target.value)} />
        </FormField>
        <FormField label="VGE (Voyage)">
          <input className={inputClass} value={form.voyage} onChange={(e) => update("voyage", e.target.value)} />
        </FormField>
        <FormField label="ACCONIER">
          <AcconierInput value={form.acconier} onChange={(v) => update("acconier", v)} />
        </FormField>
        <FormField label="TRANSITAIRE">
          <input className={inputClass} value={form.transitaire} onChange={(e) => update("transitaire", e.target.value)} />
        </FormField>
        <FormField label="Type de document">
          <select
            className={inputClass}
            value={form.documentType}
            onChange={(e) => update("documentType", e.target.value as "BL" | "BEE")}
          >
            <option value="BEE">BEE (Bon d&apos;Enlèvement)</option>
            <option value="BL">BL (Bill of Lading)</option>
          </select>
        </FormField>
        <FormField label="N° du document (BEE / BL)">
          <input className={inputClass} value={form.documentNumber} onChange={(e) => update("documentNumber", e.target.value)} />
        </FormField>
        <FormField label="N° PLOMB 2">
          <input className={inputClass} value={form.sealNumber2} onChange={(e) => update("sealNumber2", e.target.value)} />
        </FormField>
        <FormField label="VU BST POSTE (Cachet porte)">
          <input className={inputClass} value={form.gatePost} onChange={(e) => update("gatePost", e.target.value)} placeholder="POSTE 14" />
        </FormField>
      </FormSection>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Link
          href="/gate-operations"
          className="flex items-center gap-1.5 border border-border-color text-fg font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-surface-alt"
        >
          <ArrowLeft size={16} /> {tc("back")}
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
        >
          {submitting ? tc("loading") : t("submit")}
        </button>
      </div>
    </form>
  );
}
