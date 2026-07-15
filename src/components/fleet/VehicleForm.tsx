"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { Plus, Trash2 } from "lucide-react";

type Doc = { docType: string; reference: string; expiryDate: string };

const DOC_TYPES = [
  { value: "INSURANCE", label: "Assurance" },
  { value: "TECHNICAL_INSPECTION", label: "Visite technique" },
  { value: "DRIVER_LICENSE", label: "Permis de conduire" },
  { value: "CARTE_GRISE", label: "Carte grise" },
  { value: "VIGNETTE", label: "Vignette" },
];

export function VehicleForm() {
  const tc = useTranslations("common");
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
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title="Nouveau véhicule">
        <FormField label="Immatriculation" full>
          <input required className={inputClass} value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value.toUpperCase())} placeholder="CE-101-NS" />
        </FormField>
        <FormField label="Marque">
          <input className={inputClass} value={form.make} onChange={(e) => set("make", e.target.value)} />
        </FormField>
        <FormField label="Modèle">
          <input className={inputClass} value={form.model} onChange={(e) => set("model", e.target.value)} />
        </FormField>
        <FormField label="Chauffeur">
          <input className={inputClass} value={form.driverName} onChange={(e) => set("driverName", e.target.value)} />
        </FormField>
        <FormField label="Téléphone chauffeur">
          <input className={inputClass} value={form.driverPhone} onChange={(e) => set("driverPhone", e.target.value)} />
        </FormField>
      </FormSection>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-fg-muted">Documents & échéances</h4>
          <button type="button" onClick={addDoc} className="flex items-center gap-1 text-xs text-brand-100 hover:underline">
            <Plus size={14} /> Ajouter
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
            <input className={inputClass} placeholder="Référence" value={d.reference} onChange={(e) => setDoc(i, { reference: e.target.value })} />
            <div>
              <label className="text-xs text-fg-subtle">Date d&apos;expiration</label>
              <input type="date" className={inputClass} value={d.expiryDate} onChange={(e) => setDoc(i, { expiryDate: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <button type="submit" disabled={submitting || !form.plateNumber} className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60 w-full">
        {submitting ? tc("loading") : "Enregistrer"}
      </button>
    </form>
  );
}
