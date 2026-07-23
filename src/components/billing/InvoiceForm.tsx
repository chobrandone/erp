"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { useFormModalClose } from "@/components/shared/FormModal";
import { Plus, Trash2 } from "lucide-react";

type Option = { id: string; label: string };
type Rate = { code: string; service: string; rateXaf: number };
type Line = { description: string; quantity: string; unitPrice: string; containerNumber: string };

const PAYMENT_METHODS = ["Espèces", "Virement bancaire (BICEC)", "Mobile Money", "Chèque", "Autre"];

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR").replace(/,/g, " ");

export function InvoiceForm({ customers, rates, isAdmin = false }: { customers: Option[]; rates: Rate[]; isAdmin?: boolean }) {
  const t = useTranslations("billing");
  const tc = useTranslations("common");
  const router = useRouter();
  const closeModal = useFormModalClose();
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [tvaRate, setTvaRate] = useState("19.25");
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: "1", unitPrice: "", containerNumber: "" }]);
  // Reduction / waiver — admin-authorized reduction on the original cost.
  const [waiver, setWaiver] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [discountAuthorizedBy, setDiscountAuthorizedBy] = useState("");

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((ls) => [...ls, { description: "", quantity: "1", unitPrice: "", containerNumber: "" }]);
  }
  function removeLine(i: number) {
    setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));
  }
  function applyRate(i: number, code: string) {
    const r = rates.find((x) => x.code === code);
    if (r) updateLine(i, { description: r.service, unitPrice: String(r.rateXaf) });
  }

  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const reduction = !isAdmin
    ? 0
    : waiver
      ? subtotal
      : Math.min(Math.max(Number(discountAmount) || 0, 0), subtotal);
  const netHt = subtotal - reduction;
  const tva = (netHt * (Number(tvaRate) || 0)) / 100;
  const ttc = netHt + tva;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customerId,
        description,
        dueAt,
        paymentMethod,
        tvaRate: Number(tvaRate),
        discountAmount: reduction,
        discountReason: reduction > 0 ? discountReason : "",
        discountAuthorizedBy: reduction > 0 ? discountAuthorizedBy : "",
        lines: lines
          .filter((l) => l.description && l.unitPrice !== "")
          .map((l) => ({
            description: l.description,
            quantity: Number(l.quantity) || 1,
            unitPrice: Number(l.unitPrice),
            containerNumber: l.containerNumber || undefined,
          })),
      };
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDescription("");
        setDueAt("");
        setLines([{ description: "", quantity: "1", unitPrice: "", containerNumber: "" }]);
        setWaiver(false);
        setDiscountAmount("");
        setDiscountReason("");
        setDiscountAuthorizedBy("");
        router.refresh();
        closeModal();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t("newInvoice")}>
        <FormField label={t("customer")} full>
          <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t("description")} full>
          <input
            className={inputClass}
            placeholder="Frais de stockage — Juin 2026"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>
      </FormSection>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-fg-muted">{t("lineItemsTitle")}</h4>
            <p className="text-xs text-fg-subtle">{t("lineItemsHint")}</p>
          </div>
          <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-brand-100 hover:underline">
            <Plus size={14} /> {tc("addNew")}
          </button>
        </div>
        {lines.map((l, i) => (
          <div key={i} className="rounded-lg border border-border-color p-3 space-y-2">
            <div className="flex items-center gap-2">
              <select
                className={inputClass + " text-xs"}
                value=""
                onChange={(e) => applyRate(i, e.target.value)}
              >
                <option value="">— Choisir depuis le tarif —</option>
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.service} ({fmt(r.rateXaf)})
                  </option>
                ))}
              </select>
              {lines.length > 1 && (
                <button type="button" onClick={() => removeLine(i)} className="text-red-500" title={tc("delete")}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <input
              className={inputClass}
              placeholder="Désignation"
              value={l.description}
              onChange={(e) => updateLine(i, { description: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number" min="0" className={inputClass} placeholder="Qté"
                value={l.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })}
              />
              <input
                type="number" min="0" step="0.01" className={inputClass} placeholder="P.U. FCFA"
                value={l.unitPrice} onChange={(e) => updateLine(i, { unitPrice: e.target.value })}
              />
              <input
                className={inputClass} placeholder="N° conteneur"
                value={l.containerNumber} onChange={(e) => updateLine(i, { containerNumber: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <FormSection title="Règlement & Totaux">
        <FormField label="Mode de paiement">
          <select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </FormField>
        <FormField label="TVA (%)">
          <input type="number" step="0.01" className={inputClass} value={tvaRate} onChange={(e) => setTvaRate(e.target.value)} />
        </FormField>
        <FormField label={t("dueOn")}>
          <input type="date" className={inputClass} value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </FormField>
      </FormSection>

      {isAdmin && (
        <FormSection title={t("reductionTitle")}>
          <FormField label={t("waiverToggle")} full>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
              <span>{t("waiverHint")}</span>
            </label>
          </FormField>
          {!waiver && (
            <FormField label={t("reductionAmount")}>
              <input
                type="number" min="0" step="0.01" className={inputClass} placeholder="0"
                value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </FormField>
          )}
          <FormField label={t("authorizedBy")}>
            <input className={inputClass} value={discountAuthorizedBy} onChange={(e) => setDiscountAuthorizedBy(e.target.value)} placeholder={t("authorizedByPlaceholder")} />
          </FormField>
          <FormField label={t("reductionReason")} full>
            <input className={inputClass} value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} placeholder={t("reductionReasonPlaceholder")} />
          </FormField>
        </FormSection>
      )}

      <div className="rounded-lg bg-surface-alt p-3 text-sm space-y-1">
        <div className="flex justify-between"><span className="text-fg-muted">Montant HT</span><span>{fmt(subtotal)} FCFA</span></div>
        {reduction > 0 && (
          <>
            <div className="flex justify-between text-amber-600"><span>{waiver ? t("waiverLabel") : t("reductionLabel")}</span><span>− {fmt(reduction)} FCFA</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Net HT</span><span>{fmt(netHt)} FCFA</span></div>
          </>
        )}
        <div className="flex justify-between"><span className="text-fg-muted">TVA ({tvaRate}%)</span><span>{fmt(tva)} FCFA</span></div>
        <div className="flex justify-between font-semibold text-brand-100 border-t border-border-color pt-1">
          <span>NET À PAYER (TTC)</span><span>{fmt(ttc)} FCFA</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || subtotal <= 0}
        className="brand-gradient text-white font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-60 w-full"
      >
        {submitting ? tc("loading") : t("submit")}
      </button>
    </form>
  );
}
