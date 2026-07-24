"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClass } from "@/components/shared/FormSection";
import { Pencil, FileText, Trash2, X, Plus, Check } from "lucide-react";

export type VehicleDoc = {
  id: string;
  docType: string;
  reference: string | null;
  expiryDate: string; // ISO
};

export type VehicleInfo = {
  id: string;
  plateNumber: string;
  make: string | null;
  model: string | null;
  driverName: string | null;
  driverPhone: string | null;
  status: string;
  odometerKm: number | null;
};

const DOC_TYPES = ["INSURANCE", "TECHNICAL_INSPECTION", "DRIVER_LICENSE", "CARTE_GRISE", "VIGNETTE"] as const;
const toDateInput = (iso: string) => (iso ? iso.slice(0, 10) : "");

export function VehicleActions({
  vehicle,
  documents,
  canManage,
}: {
  vehicle: VehicleInfo;
  documents: VehicleDoc[];
  canManage: boolean;
}) {
  const t = useTranslations("fleet");
  const tc = useTranslations("common");
  const router = useRouter();
  const [mode, setMode] = useState<null | "edit" | "docs">(null);

  if (!canManage) return <span className="text-xs text-fg-subtle">—</span>;

  const DOC_LABELS: Record<string, string> = {
    INSURANCE: t("docInsurance"),
    TECHNICAL_INSPECTION: t("docTechnicalInspection"),
    DRIVER_LICENSE: t("docDriverLicense"),
    CARTE_GRISE: t("docCarteGrise"),
    VIGNETTE: t("docVignette"),
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setMode("edit")} title={t("editVehicle")} className="text-fg-muted hover:text-brand-100"><Pencil size={15} /></button>
      <button onClick={() => setMode("docs")} title={t("manageDocuments")} className="text-fg-muted hover:text-brand-100"><FileText size={15} /></button>

      {mode === "edit" && <EditVehicle vehicle={vehicle} t={t} tc={tc} onClose={() => setMode(null)} onDone={() => { setMode(null); router.refresh(); }} />}
      {mode === "docs" && (
        <ManageDocs
          vehicle={vehicle}
          documents={documents}
          docLabels={DOC_LABELS}
          t={t}
          tc={tc}
          onClose={() => setMode(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl bg-surface border border-border-color shadow-xl my-8">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border-color">
          <span className="font-semibold text-fg">{title}</span>
          <button type="button" onClick={onClose} className="text-fg-muted hover:text-fg"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function EditVehicle({
  vehicle, t, tc, onClose, onDone,
}: {
  vehicle: VehicleInfo;
  t: (k: string) => string;
  tc: (k: string) => string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    plateNumber: vehicle.plateNumber,
    make: vehicle.make ?? "",
    model: vehicle.model ?? "",
    driverName: vehicle.driverName ?? "",
    driverPhone: vehicle.driverPhone ?? "",
    status: vehicle.status,
    odometerKm: vehicle.odometerKm != null ? String(vehicle.odometerKm) : "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) onDone();
      else setError((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
    } finally { setBusy(false); }
  }

  return (
    <Modal title={t("editVehicle")} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("plate")}><input required className={inputClass} value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value.toUpperCase())} /></FormField>
          <FormField label={t("vehicleStatus")}>
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="ACTIVE">{t("statusActive")}</option>
              <option value="MAINTENANCE">{t("statusMaintenance")}</option>
              <option value="INACTIVE">{t("statusInactive")}</option>
            </select>
          </FormField>
          <FormField label={t("make")}><input className={inputClass} value={form.make} onChange={(e) => set("make", e.target.value)} /></FormField>
          <FormField label={t("model")}><input className={inputClass} value={form.model} onChange={(e) => set("model", e.target.value)} /></FormField>
          <FormField label={t("driver")}><input className={inputClass} value={form.driverName} onChange={(e) => set("driverName", e.target.value)} /></FormField>
          <FormField label={t("driverPhone")}><input className={inputClass} value={form.driverPhone} onChange={(e) => set("driverPhone", e.target.value)} /></FormField>
          <FormField label={t("odometer")}><input type="number" className={inputClass} value={form.odometerKm} onChange={(e) => set("odometerKm", e.target.value)} /></FormField>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">{tc("cancel")}</button>
          <button type="submit" disabled={busy} className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60">{busy ? tc("loading") : tc("save")}</button>
        </div>
      </form>
    </Modal>
  );
}

function ManageDocs({
  vehicle, documents, docLabels, t, tc, onClose, onChanged,
}: {
  vehicle: VehicleInfo;
  documents: VehicleDoc[];
  docLabels: Record<string, string>;
  t: (k: string) => string;
  tc: (k: string) => string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState(documents.map((d) => ({ ...d, expiry: toDateInput(d.expiryDate) })));
  const [adding, setAdding] = useState({ docType: "INSURANCE", reference: "", expiryDate: "" });

  async function renew(docId: string, expiry: string, reference: string | null) {
    if (!expiry) return;
    setBusy(true);
    try {
      await fetch(`/api/vehicle-documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiryDate: expiry, reference }),
      });
      onChanged();
    } finally { setBusy(false); }
  }

  async function del(docId: string) {
    if (!confirm(tc("confirmDelete"))) return;
    setBusy(true);
    try {
      await fetch(`/api/vehicle-documents/${docId}`, { method: "DELETE" });
      setRows((rs) => rs.filter((r) => r.id !== docId));
      onChanged();
    } finally { setBusy(false); }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!adding.expiryDate) return;
    setBusy(true);
    try {
      await fetch(`/api/vehicle-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle.id, ...adding }),
      });
      setAdding({ docType: "INSURANCE", reference: "", expiryDate: "" });
      onChanged();
      onClose();
    } finally { setBusy(false); }
  }

  return (
    <Modal title={`${t("manageDocuments")} — ${vehicle.plateNumber}`} onClose={onClose}>
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-fg-subtle">{t("noDocuments")}</p>}
        {rows.map((d) => (
          <div key={d.id} className="rounded-lg border border-border-color p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg">{docLabels[d.docType] ?? d.docType}</span>
              <button onClick={() => del(d.id)} disabled={busy} className="text-red-500 disabled:opacity-50" title={tc("delete")}><Trash2 size={14} /></button>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <div>
                <label className="text-xs text-fg-subtle">{t("expiryDate")}</label>
                <input
                  type="date"
                  className={inputClass}
                  value={d.expiry}
                  onChange={(e) => setRows((rs) => rs.map((r) => (r.id === d.id ? { ...r, expiry: e.target.value } : r)))}
                />
              </div>
              <button onClick={() => renew(d.id, d.expiry, d.reference)} disabled={busy} className="flex items-center gap-1 brand-gradient text-white text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-60">
                <Check size={13} /> {t("renew")}
              </button>
            </div>
          </div>
        ))}

        <form onSubmit={add} className="rounded-lg border border-dashed border-border-color p-3 space-y-2">
          <p className="text-xs font-semibold text-fg-muted">{t("addDocument")}</p>
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass + " text-xs"} value={adding.docType} onChange={(e) => setAdding((a) => ({ ...a, docType: e.target.value }))}>
              {DOC_TYPES.map((dt) => <option key={dt} value={dt}>{docLabels[dt]}</option>)}
            </select>
            <input type="date" className={inputClass} value={adding.expiryDate} onChange={(e) => setAdding((a) => ({ ...a, expiryDate: e.target.value }))} />
          </div>
          <input className={inputClass} placeholder={t("reference")} value={adding.reference} onChange={(e) => setAdding((a) => ({ ...a, reference: e.target.value }))} />
          <button type="submit" disabled={busy || !adding.expiryDate} className="flex items-center gap-1 text-xs text-brand-100 hover:underline disabled:opacity-50">
            <Plus size={13} /> {t("add")}
          </button>
        </form>
      </div>
    </Modal>
  );
}
