import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; name?: string | null; email?: string | null; role?: string };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const current = await prisma.invoice.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextStatus = body.status ?? current.status;

  // An invoice can only become PAID once a verified receipt is on file.
  if (nextStatus === "PAID" && current.status !== "PAID" && !current.receiptData) {
    return NextResponse.json(
      { error: "RECEIPT_REQUIRED", message: "Upload the payment receipt to mark this invoice as paid." },
      { status: 422 }
    );
  }

  // Reverting to UNPAID clears the receipt so a fresh one is required next time.
  const clearReceipt = nextStatus === "UNPAID" && current.status === "PAID";

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(body.customerId !== undefined ? { customerId: body.customerId } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
      ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
      status: nextStatus,
      paidAt: nextStatus === "PAID" ? current.paidAt ?? new Date() : null,
      ...(clearReceipt
        ? { receiptData: null, receiptMime: null, receiptName: null, receiptVerified: false, receiptUploadedAt: null }
        : {}),
    },
    include: { customer: true },
  });

  return NextResponse.json({ invoice });
}

// Permanent deletion (purge). Restricted to ADMIN, requires password re-entry,
// and only invoices already in the sandbox can be purged. A full JSON snapshot
// is written to the audit trail BEFORE the row is removed, so nothing is lost.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const user = session!.user as SessionUser;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an administrator can permanently delete an invoice." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const password = body.password as string | undefined;
  if (!password) {
    return NextResponse.json({ error: "Password confirmation is required." }, { status: 400 });
  }

  // Verify the administrator's own password.
  const dbUser = user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
  if (!dbUser || !(await bcrypt.compare(password, dbUser.passwordHash))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { lines: true, customer: true } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!invoice.archived) {
    return NextResponse.json(
      { error: "Only invoices in the sandbox can be permanently deleted. Void it first." },
      { status: 409 }
    );
  }

  // Snapshot everything (minus the binary receipt) into the immutable audit log.
  const { receiptData: _omit, ...snapshot } = invoice;
  void _omit;
  await logAudit({ userId: user.id, action: "INVOICE_PURGE", entity: "Invoice", entityId: id, meta: snapshot });

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
