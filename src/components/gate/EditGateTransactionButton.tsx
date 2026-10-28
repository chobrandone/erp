"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, X } from "lucide-react";
import { inputClass } from "@/components/shared/FormSection";
import { toDepotInput, depotInputToISO } from "@/lib/utils";

type Transaction = {
  id: string;
  type: string;
  containerId: string;
  containerNumber?: string | null;
  eirId?: string | null;
  truckPlate: string;
  driverName: string;
  driverIdNumber: string | null;
  sealNumber: string | null;
  sealNumber2?: string | null;
  condition: string;
  damageRemarks: string | null;
  destination: string | null;
  releaseOrderNo: string | null;
  remarks: string | null;
  deliveryHeading: string | null;
  grossWeightKg?: number | null;
  payloadKg?: number | null;
  statut?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  navire?: string | null;
  voyage?: string | null;
  pod?: string | null;
  isoCode?: string | null;
  acconier?: string | null;
  transitaire?: string | null;
  marchandise?: string | null;
  imdg?: string | null;
  region?: string | null;
  gatePost?: string | null;
  tempGate?: number | null;
  freeDays?: number | null;
  bookingNo?: string | null;
  agent?: string | null;
  acceptanceRef?: string | null;
  sealType?: string | null;
  newEquipmentNo?: string | null;
  createdAt: string; // ISO
};

type ContainerOption = { id: string; label: string; number: string };

const str = (v: unknown) => (v == null ? "" : String(v));

export function EditGateTransactionButton({
  transaction,
  compact = false,
  containers = [],
}: {
  transaction: Transaction;
  compact?: boolean;
  containers?: ContainerOption[];
}) {
  const tc = useTranslations("common");
  const tIn = useTranslations("gateIn");
  const tOut = useTranslations("gateOut");
  const tOps = useTranslations("gateOperations");
  const td = useTranslations("delivery");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: (transaction.type === "GATE_OUT" ? "GATE_OUT" : "GATE_IN") as "GATE_IN" | "GATE_OUT",
    containerId: transaction.containerId,
    containerNumber: str(transaction.containerNumber),
    eirId: str(transaction.eirId),
    gateDateTime: toDepotInput(transaction.createdAt),
    deliveryHeading: transaction.deliveryHeading ?? (transaction.type === "GATE_OUT" ? "OUT_FULL" : "IN_FULL"),
    condition: transaction.condition as "GOOD" | "DAMAGED",
    truckPlate: str(transaction.truckPlate),
    driverName: str(transaction.driverName),
    driverIdNumber: str(transaction.driverIdNumber),
    sealNumber: str(transaction.sealNumber),
    sealNumber2: str(transaction.sealNumber2),
    grossWeightKg: str(transaction.grossWeightKg),
    payloadKg: str(transaction.payloadKg),
    destination: str(transaction.destination),
    releaseOrderNo: str(transaction.releaseOrderNo),
    damageRemarks: str(transaction.damageRemarks),
    remarks: str(transaction.remarks),
    statut: str(transaction.statut) || "FCL",
    documentType: (transaction.documentType as "BL" | "BEE") ?? "BL",
    documentNumber: str(transaction.documentNumber),
    navire: str(transaction.navire),
    voyage: str(transaction.voyage),
    pod: str(transaction.pod),
    isoCode: str(transaction.isoCode),
    acconier: str(transaction.acconier),
    transitaire: str(transaction.transitaire),
    marchandise: str(transaction.marchandise),
    imdg: str(transaction.imdg),
    region: str(transaction.region),
    gatePost: str(transaction.gatePost),
    tempGate: str(transaction.tempGate),
    freeDays: str(transaction.freeDays),
    bookingNo: str(transaction.bookingNo),
    agent: str(transaction.agent),
    acceptanceRef: str(transaction.acceptanceRef),
    sealType: str(transaction.sealType),
    newEquipmentNo: str(transaction.newEquipmentNo),
  });
  const isGateOut = form.type === "GATE_OUT";
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Keep the delivery heading on the correct side when the direction changes.
  function changeType(next: "GATE_IN" | "GATE_OUT") {
    setForm((f) => {
      const full = f.deliveryHeading.endsWith("FULL");
      const heading = next === "GATE_OUT" ? (full ? "OUT_FULL" : "OUT_EMPTY") : (full ? "IN_FULL" : "IN_EMPTY");
      return { ...f, type: next, deliveryHeading: heading };
    });
  }

  // Selecting a different container shows that container's current number
  // (which can then be edited in place to rename the container).
  function changeContainer(id: string) {
    const picked = containers.find((c) => c.id === id);
    setForm((f) => ({ ...f, containerId: id, containerNumber: picked ? picked.number : f.containerNumber }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Rename the selected container first if its number was changed.
      const picked = containers.find((c) => c.id === form.containerId);
      const nextNumber = form.containerNumber.trim().toUpperCase();
      if (nextNumber && picked && nextNumber !== picked.number.toUpperCase()) {
        const cRes = await fetch(`/api/containers/${form.containerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ containerNumber: nextNumber }),
        });
        if (!cRes.ok) {
          setError((await cRes.json().catch(() => null))?.error ?? tc("saveFailed"));
          setSubmitting(false);
          return;
        }
      }
      const occurredAt = form.gateDateTime ? depotInputToISO(form.gateDateTime) : undefined;
      const res = await fetch(`/api/gate-transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, occurredAt }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError((await res.json().catch(() => null))?.error ?? tc("saveFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Plain text / number fields rendered generically. [key, label, type]
  const textFields: [keyof typeof form, string, "text" | "number"][] = [
    ["eirId", tc("eirId"), "text"],
    ["truckPlate", tIn("truckPlate"), "text"],
    ["driverName", tIn("driverName"), "text"],
    ["driverIdNumber", tIn("driverId"), "text"],
    ["sealNumber", tIn("sealNumber"), "text"],
    ["sealNumber2", "N° PLOMB 2", "text"],
    ["grossWeightKg", tIn("grossWeight"), "number"],
    ["payloadKg", "Payload (kg)", "number"],
    ["navire", "NAVIRE (Vessel)", "text"],
    ["voyage", "VGE (Voyage)", "text"],
    ["pod", "POD", "text"],
    ["isoCode", "CODE ISO", "text"],
    ["acconier", "ACCONIER", "text"],
    ["agent", "Agent", "text"],
    ["transitaire", "TRANSITAIRE / Transporter", "text"],
    ["bookingNo", "Booking No.", "text"],
    ["marchandise", "MARCHANDISE (Cargo)", "text"],
    ["imdg", "IMDG", "text"],
    ["region", "RÉGION", "text"],
    ["documentNumber", "N° Document (BL / BEE)", "text"],
    ["acceptanceRef", "Acceptance Ref", "text"],
    ["sealType", "Seal Type", "text"],
    ["newEquipmentNo", "New Equipment No.", "text"],
    ["tempGate", "TEMP (°C — Reefer)", "number"],
    ["freeDays", "Jours francs (Free Pool)", "number"],
    ["gatePost", "VU BST POSTE", "text"],
  ];

  return (
    <>
      {compact ? (
        <button onClick={() => setOpen(true)} title={tc("edit")} className="text-fg-muted hover:text-brand-100">
          <Pencil size={15} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Pencil size={14} /> {tc("edit")}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg border border-border-color">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
              <span className="text-sm font-semibold text-fg">{isGateOut ? tOut("title") : tIn("title")}</span>
              <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tOps("type")}</label>
                  <select className={inputClass} value={form.type} onChange={(e) => changeType(e.target.value as "GATE_IN" | "GATE_OUT")}>
                    <option value="GATE_IN">{tOps("gateIn")}</option>
                    <option value="GATE_OUT">{tOps("gateOut")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tc("container")}</label>
                  <select className={inputClass} value={form.containerId} onChange={(e) => changeContainer(e.target.value)}>
                    {containers.length === 0 && <option value={form.containerId}>{form.containerNumber || form.containerId}</option>}
                    {containers.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("containerNumber")}</label>
                  <input className={inputClass} value={form.containerNumber} onChange={(e) => set("containerNumber", e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tc("dateTime")}</label>
                  <input type="datetime-local" className={inputClass} value={form.gateDateTime} onChange={(e) => set("gateDateTime", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{td("label")}</label>
                  <select className={inputClass} value={form.deliveryHeading} onChange={(e) => set("deliveryHeading", e.target.value)}>
                    {isGateOut ? (
                      <>
                        <option value="OUT_FULL">{td("outFull")}</option>
                        <option value="OUT_EMPTY">{td("outEmpty")}</option>
                      </>
                    ) : (
                      <>
                        <option value="IN_FULL">{td("inFull")}</option>
                        <option value="IN_EMPTY">{td("inEmpty")}</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("condition")}</label>
                  <select className={inputClass} value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                    <option value="GOOD">{tIn("good")}</option>
                    <option value="DAMAGED">{tIn("damaged")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">STATUT</label>
                  <select className={inputClass} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
                    <option value="FCL">FCL</option>
                    <option value="LCL">LCL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">Type de document</label>
                  <select className={inputClass} value={form.documentType} onChange={(e) => set("documentType", e.target.value)}>
                    <option value="BL">BL</option>
                    <option value="BEE">BEE</option>
                  </select>
                </div>
                {isGateOut && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-fg-muted mb-1.5">{tOut("destination")}</label>
                      <input className={inputClass} value={form.destination} onChange={(e) => set("destination", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-fg-muted mb-1.5">{tOut("releaseOrder")}</label>
                      <input className={inputClass} value={form.releaseOrderNo} onChange={(e) => set("releaseOrderNo", e.target.value)} />
                    </div>
                  </>
                )}
                {textFields.map(([key, label, type]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">{label}</label>
                    <input type={type} className={inputClass} value={form[key] as string} onChange={(e) => set(key, e.target.value)} />
                  </div>
                ))}
              </div>
              {form.condition === "DAMAGED" && (
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">{tIn("damageRemarks")}</label>
                  <textarea className={inputClass} rows={2} value={form.damageRemarks} onChange={(e) => set("damageRemarks", e.target.value)} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{tc("remarks")}</label>
                <textarea className={inputClass} rows={2} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-fg-muted hover:text-fg px-4 py-2 rounded-lg">
                  {tc("cancel")}
                </button>
                <button type="submit" disabled={submitting} className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60">
                  {submitting ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
