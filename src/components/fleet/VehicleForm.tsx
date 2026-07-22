"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { useFormModalClose } from "@/components/shared/FormModal";
import { Plus, Trash2 } from "lucide-react";

type Doc = { docType: string; reference: string; expiryDate: string };

export function VehicleForm() {
  const tc = useTranslations("common");
  const t = useTranslations("fleet");
  const closeModal = useFormModalClose();
  const DOC_TYPES = [
    { value: "INSURANCE", label: t("docInsurance") },
    { value: "TECHNICAL_INSPECTION", label: t("docTechnicalInspection") },
    { value: "DRIVER_LICENSE", label: t("docDriverLicense") },
    { value: "CARTE_GRISE", label: t("docCarteGrise") },
    { value: "VIGNETTE", label: t("docVignette") },
  ];
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ plateNumber: "", make: "", model: "", driverName: "", driverPhone: "" });
  const [docs, setDocs] = useState<Doc[]>([{ docType: "INSURANCE", reference: "", expiryDate: "" }]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setDoc = (i: number, patch: Partial<Doc>) => setDocs((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const addDoc = () => setDocs((ds) => [...ds, { docType: "INSURANCE", reference: "", expiryDate: "" }]);
  const removeDoc = (i: number) => setDocs((ds) => (ds.length > 1 ? ds.filter((_, idx) => idx !== i) : ds));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, documents: docs.filter((d) => d.expiryDate) }),
      });
      if (res.ok) {
        setForm({ plateNumber: "", make: "", model: "", driverName: "", driverPhone: "" });
        setDocs([{ docType: "INSURANCE", reference: "", expiryDate: "" }]);
        router.refresh();
        closeModal();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t("newVehicle")}>
        <FormField label={t("plate")} full>
          <input required className={inputClass} value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value.toUpperCase())} placeholder="CE-101-NS" />
        </FormField>
        <FormField label={t("make")}>
          <input className={inputClass} value={form.make} onChange={(e) => set("make", e.target.value)} />
        </FormField>
        <FormField label={t("model")}>
          <input className={inputClass} value={form.model} onChange={(e) => set("model", e.target.value)} />
        </FormField>
        <FormField label={t("driver")}>
          <input className={inputClass} value={form.driverName} onChange={(e) => set("driverName", e.target.value)} />
        </FormField>
        <FormField label={t("driverPhone")}>
          <input className={inputClass} value={form.driverPhone} onChange={(e) => set("driverPhone", e.target.value)} />
        </FormField>
      </FormSection>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-fg-muted">{t("docsAndExpiry")}</h4>
          <button type="button" onClick={addDoc} className="flex items-center gap-1 text-xs text-brand-100 hover:underline">
            <Plus size={14} /> {t("add")}
          </button>
        </div>
        {docs.map((d, i) => (
          <div key={i} className="rounded-lg border border-border-color p-3 space-y-2">
            <div className="flex items-center gap-2">
              <select className={inputClass + " text-xs"} value={d.docType} onChange={(e) => setDoc(i, { docType: e.target.value })}>
                {DOC_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
              {docs.length > 1 && (
                <button type="button" onClick={() => removeDoc(i)} className="text-red-500" title={tc("delete")}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <input className={inputClass} placeholder={t("reference")} value={d.reference} onChange={(e) => setDoc(i, { reference: e.target.value })} />
            <div>
              <label className="text-xs text-fg-subtle">{t("expiryDate")}</label>
              <input type="date" className={inputClass} value={d.expiryDate} onChange={(e) => setDoc(i, { expiryDate: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <button type="submit" disabled={submitting || !form.plateNumber} className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60 w-full">
        {submitting ? tc("loading") : t("saveBtn")}
      </button>
    </form>
  );
}
