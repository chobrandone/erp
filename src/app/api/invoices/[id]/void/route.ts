import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; name?: string | null; email?: string | null; role?: string };

// Void an invoice → move it to the sandbox (soft-delete). Requires a reason.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = (body.reason ?? "").trim();
  if (!reason) {
    return NextResponse.json({ error: "A reason is required to void an invoice." }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.archived) return NextResponse.json({ error: "Already in sandbox." }, { status: 409 });

  const user = session!.user as SessionUser;
  const updated = await prisma.invoice.update({
    where: { id },
    data: { archived: true, voidedAt: new Date(), voidedBy: user.name ?? user.email ?? "unknown", voidReason: reason },
  });

  await logAudit({
    userId: user.id,
    action: "INVOICE_VOID",
    entity: "Invoice",
    entityId: id,
    meta: { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount, reason },
  });

  return NextResponse.json({ invoice: { id: updated.id, invoiceNumber: updated.invoiceNumber } });
}
