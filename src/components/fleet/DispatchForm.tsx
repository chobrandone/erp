"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { Send } from "lucide-react";

type VehicleOption = { id: string; label: string; driver: string };

const CARGO_TYPES = [
  { value: "CONTAINER", label: "Conteneur" },
  { value: "EQUIPMENT", label: "Équipement" },
  { value: "GOODS", label: "Marchandise" },
  { value: "EMPTY", label: "À vide" },
];

export function DispatchForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    vehicleId: vehicles[0]?.id ?? "",
    driverName: "",
    cargoType: "CONTAINER",
    containerNumber: "",
    cargoDescription: "",
    destination: "",
    expectedReturn: "",
    remarks: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.vehicleId) return setError("No vehicle available in the park.");
    if (!form.destination) return setError("Destination is required.");
    setBusy(true);
    try {
      const res = await fetch("/api/vehicle-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Dispatch failed.");
        return;
      }
      setForm((f) => ({ ...f, containerNumber: "", cargoDescription: "", destination: "", expectedReturn: "", remarks: "" }));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const selected = vehicles.find((v) => v.id === form.vehicleId);

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormSection title="Affecter un véhicule (Départ mission)">
        <FormField label="Véhicule (en parc)" full>
          <select className={inputClass} value={form.vehicleId} onChange={(e) => set("vehicleId", e.target.value)}>
            {vehicles.length === 0 && <option value="">Aucun véhicule disponible</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Chauffeur">
          <input className={inputClass} value={form.driverName} onChange={(e) => set("driverName", e.target.value)} placeholder={selected?.driver || "Nom du chauffeur"} />
        </FormField>
        <FormField label="Type de chargement">
          <select className={inputClass} value={form.cargoType} onChange={(e) => set("cargoType", e.target.value)}>
            {CARGO_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="N° Conteneur / Équipement">
          <input className={inputClass} value={form.containerNumber} onChange={(e) => set("containerNumber", e.target.value.toUpperCase())} placeholder="MSCU1234567" />
        </FormField>
        <FormField label="Description du chargement" full>
          <input className={inputClass} value={form.cargoDescription} onChange={(e) => set("cargoDescription", e.target.value)} />
        </FormField>
        <FormField label="Destination">
          <input required className={inputClass} value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Douala / Yaoundé…" />
        </FormField>
        <FormField label="Retour prévu">
          <input type="datetime-local" className={inputClass} value={form.expectedReturn} onChange={(e) => set("expectedReturn", e.target.value)} />
        </FormField>
        <FormField label="Remarques" full>
          <input className={inputClass} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
        </FormField>
      </FormSection>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={busy || vehicles.length === 0}
        className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60 w-full flex items-center justify-center gap-2"
      >
        <Send size={15} /> {busy ? "Envoi…" : "Dispatcher le véhicule"}
      </button>
    </form>
  );
}
