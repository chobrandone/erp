import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; name?: string | null; email?: string | null; role?: string };

// Restore an invoice from the sandbox back to the active list. ADMIN only.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const user = session!.user as SessionUser;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an administrator can restore invoices." }, { status: 403 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.invoice.update({
    where: { id },
    data: { archived: false, voidedAt: null, voidedBy: null, voidReason: null },
  });

  await logAudit({ userId: user.id, action: "INVOICE_RESTORE", entity: "Invoice", entityId: id, meta: { invoiceNumber: invoice.invoiceNumber } });

  return NextResponse.json({ ok: true });
}
