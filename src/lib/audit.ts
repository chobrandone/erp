import { prisma } from "@/lib/prisma";

/**
 * Append an immutable entry to the audit trail. `meta` is JSON-serialised so a
 * full snapshot of a record can be preserved even after the record is purged.
 */
export async function logAudit(params: {
  userId?: string | null;
  action: string; // e.g. INVOICE_VOID, INVOICE_RESTORE, INVOICE_PURGE
  entity: string; // e.g. Invoice
  entityId: string;
  meta?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metaJson: params.meta != null ? JSON.stringify(params.meta) : null,
      },
    });
  } catch {
    // Auditing must never block the primary operation, but should be visible in logs.
    console.error("Failed to write audit log", params.action, params.entityId);
  }
}
