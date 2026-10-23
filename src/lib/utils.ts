import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BRAND_GRADIENT_STEPS = [
  "#5415BC",
  "#0059EF",
  "#0080FF",
  "#009DF8",
  "#00B7D7",
  "#00CDAB",
] as const;

// The depot operates in Cameroon (WAT, UTC+1). Format in this zone explicitly
// so a date shows the same whether rendered on the server (UTC) or the browser,
// and so a time the operator picks is displayed back exactly as entered.
export const DEPOT_TIME_ZONE = "Africa/Douala";

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DEPOT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DEPOT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Cameroon is WAT (UTC+1) with no daylight saving, so the offset is always +01:00.
// These helpers make the <input type="datetime-local"> pickers operate in Cameroon
// time regardless of the machine's own timezone, so the time an operator sees and
// picks is always the real depot time and round-trips without drifting by an hour.
export const DEPOT_UTC_OFFSET = "+01:00";

/** A Date (or ISO string) → "YYYY-MM-DDTHH:mm" wall-clock in Cameroon time. */
export function toDepotInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEPOT_TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a; }, {});
  const hour = p.hour === "24" ? "00" : p.hour; // en-GB can emit "24"
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}`;
}

/** Current Cameroon wall-clock as "YYYY-MM-DDTHH:mm" for a datetime-local default. */
export function depotNowInput(): string {
  return toDepotInput(new Date());
}

/** A datetime-local value typed as Cameroon time → the correct UTC ISO instant. */
export function depotInputToISO(input: string): string {
  if (!input) return new Date().toISOString();
  return new Date(`${input.slice(0, 16)}:00${DEPOT_UTC_OFFSET}`).toISOString();
}
