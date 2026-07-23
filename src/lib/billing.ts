/**
 * Billing helpers for NEGOCE & SERVICES (N.S. SARL).
 * Currency is XAF (FCFA). Storage/demurrage follows the client's "Free Pool"
 * model: the first N days are free, days beyond are charged at the storage rate.
 */

export const XAF = "XAF";
export const DEFAULT_TVA_RATE = 19.25; // Cameroon standard VAT

export const DEFAULT_FREE_DAYS = 11; // client's stated free days for some customers

/** Whole days a container has spent in the yard (min 0). */
export function dwellDays(enteredAt: Date, until: Date = new Date()): number {
  const ms = until.getTime() - new Date(enteredAt).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

/** Chargeable (demurrage) days = dwell days beyond the free allowance. */
export function chargeableDays(enteredAt: Date, freeDays = DEFAULT_FREE_DAYS, until: Date = new Date()): number {
  return Math.max(0, dwellDays(enteredAt, until) - freeDays);
}

export type DemurrageResult = {
  dwell: number;
  freeDays: number;
  chargeable: number;
  dailyRate: number;
  amount: number;
  overdue: boolean;
};

/** Compute demurrage given a per-day storage rate (XAF). */
export function computeDemurrage(
  enteredAt: Date,
  dailyRateXaf: number,
  freeDays = DEFAULT_FREE_DAYS,
  until: Date = new Date()
): DemurrageResult {
  const dwell = dwellDays(enteredAt, until);
  const chargeable = Math.max(0, dwell - freeDays);
  return {
    dwell,
    freeDays,
    chargeable,
    dailyRate: dailyRateXaf,
    amount: chargeable * dailyRateXaf,
    overdue: chargeable > 0,
  };
}

/** Pick the storage BillingRate code for a container size / reefer flag. */
export function storageRateCode(lengthFt: number, isReefer: boolean): string {
  const size = lengthFt >= 40 ? "40" : "20";
  return `STORAGE_EMPTY_${size}${isReefer ? "RF" : ""}`;
}

/** Format an XAF amount the Cameroonian way: "1 234 567 FCFA". */
export function formatXaf(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = rounded.toLocaleString("fr-FR").replace(/ /g, " ").replace(/,/g, " ");
  return `${grouped} FCFA`;
}

/**
 * Sum lines → gross HT, subtract an authorized reduction/waiver, then TVA and
 * TTC. `subtotal` is the gross HT; TVA is charged on the net (HT − reduction).
 */
export function invoiceTotals(
  lines: { quantity: number; unitPrice: number }[],
  tvaRate = DEFAULT_TVA_RATE,
  discountAmount = 0,
) {
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const discount = Math.min(Math.max(discountAmount, 0), subtotal); // never below zero
  const netHt = subtotal - discount;
  const tvaAmount = (netHt * tvaRate) / 100;
  return { subtotal, discount, netHt, tvaRate, tvaAmount, total: netHt + tvaAmount };
}
