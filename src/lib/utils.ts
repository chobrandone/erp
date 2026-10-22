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
