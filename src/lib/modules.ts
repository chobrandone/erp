/**
 * Canonical registry of ERP modules for role-based access control.
 * `slug` is the first path segment after the locale (e.g. /en/gate-operations → "gate-operations").
 * `key` matches the nav translation key. Permissions are stored as an array of slugs.
 */
export const MODULES = [
  { key: "masterData", slug: "master-data" },
  { key: "gateOperations", slug: "gate-operations" },
  { key: "yardManagement", slug: "yard-management" },
  { key: "containerInventory", slug: "container-inventory" },
  { key: "reeferManagement", slug: "reefer-management" },
  { key: "ptiManagement", slug: "pti-management" },
  { key: "maintenanceRepair", slug: "maintenance-repair" },
  { key: "fleetManagement", slug: "fleet-management" },
  { key: "documentManagement", slug: "document-management" },
  { key: "billingFinance", slug: "billing-finance" },
  { key: "reportingDashboard", slug: "reporting-dashboard" },
  { key: "mobileYardOps", slug: "mobile-yard-ops" },
] as const;

export const MODULE_SLUGS = MODULES.map((m) => m.slug);

// Always reachable by any signed-in user (landing) / admin-only areas.
export const ALWAYS_ALLOWED = ["", "dashboard"]; // dashboard home
export const ADMIN_ONLY = ["user-management"];

export type SessionAccess = { role?: string; permissions?: string[] | null };

/** Parse the permissions column (JSON string) into a slug array. */
export function parsePermissions(raw?: string | null): string[] | null {
  if (raw == null) return null;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : null;
  } catch {
    return null;
  }
}

/** Which module slugs may this user see? ADMIN → all. null permissions → all (legacy fallback). */
export function allowedSlugs(access: SessionAccess): string[] {
  if (access.role === "ADMIN") return [...MODULE_SLUGS, ...ADMIN_ONLY];
  if (access.permissions == null) return [...MODULE_SLUGS]; // backward-compatible: unset = full
  return access.permissions;
}

/** Can this user access the module at the given (locale-stripped) path? */
export function canAccessPath(access: SessionAccess, pathAfterLocale: string): boolean {
  const seg = pathAfterLocale.replace(/^\/+/, "").split("/")[0] ?? "";
  if (ALWAYS_ALLOWED.includes(seg)) return true;
  if (ADMIN_ONLY.includes(seg)) return access.role === "ADMIN";
  return allowedSlugs(access).includes(seg);
}
