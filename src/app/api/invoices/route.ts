import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { invoiceTotals, DEFAULT_TVA_RATE } from "@/lib/billing";

type LineInput = { description: string; quantity?: number; unitPrice: number; containerNumber?: string };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(from || to
        ? {
            issuedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: { customer: true },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as { name?: string | null; email?: string | null; role?: string };
  const isAdmin = user.role === "ADMIN"; // super-admin
  const isFinance = user.role === "FINANCE";

  const body = await req.json();
  const count = await prisma.invoice.count();
  const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const rawLines: LineInput[] = Array.isArray(body.lines) ? body.lines : [];
  const lines = rawLines
    .filter((l) => l.description && Number(l.unitPrice) >= 0)
    .map((l) => ({
      description: l.description,
      quantity: Number(l.quantity) || 1,
      unitPrice: Number(l.unitPrice),
      containerNumber: l.containerNumber || null,
      lineTotal: (Number(l.quantity) || 1) * Number(l.unitPrice),
    }));

  const tvaRate = body.tvaRate != null ? Number(body.tvaRate) : DEFAULT_TVA_RATE;

  // --- Waiver / reduction ---------------------------------------------------
  // A waiver may be an amount or a percentage of the HT. A super-admin (ADMIN)
  // applies it immediately; a FINANCE user can only *request* it, which is held
  // pending until a super-admin confirms. Anyone else's waiver is ignored.
  const grossSubtotal =
    lines.length > 0 ? lines.reduce((s, l) => s + l.lineTotal, 0) : Number(body.amount) || 0;
  const percent = Math.min(Math.max(Number(body.discountPercent) || 0, 0), 100);
  const requestedDiscount = Math.min(
    percent > 0 ? (grossSubtotal * percent) / 100 : Math.max(Number(body.discountAmount) || 0, 0),
    grossSubtotal,
  );
  const wantsWaiver = requestedDiscount > 0 && (isAdmin || isFinance);
  const applied = isAdmin && wantsWaiver; // takes effect now
  const pending = isFinance && wantsWaiver; // awaits super-admin confirmation
  const effectiveDiscount = applied ? requestedDiscount : 0; // pending waivers don't reduce the payable yet

  // Totals come from line items when supplied, else from a flat amount (HT).
  const totals =
    lines.length > 0
      ? invoiceTotals(lines, tvaRate, effectiveDiscount)
      : (() => {
          const subtotal = grossSubtotal;
          const discount = Math.min(effectiveDiscount, subtotal);
          const netHt = subtotal - discount;
          const tvaAmount = (netHt * tvaRate) / 100;
          return { subtotal, discount, netHt, tvaRate, tvaAmount, total: netHt + tvaAmount };
        })();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: body.customerId,
      description: body.description || null,
      currency: "XAF",
      subtotal: totals.subtotal,
      discountAmount: wantsWaiver ? requestedDiscount : 0,
      discountPercent: wantsWaiver ? percent : 0,
      discountReason: wantsWaiver ? body.discountReason || null : null,
      discountAuthorizedBy: applied ? body.discountAuthorizedBy || user.name || null : null,
      discountRequestedBy: pending ? user.name || user.email || null : null,
      discountPending: pending,
      tvaRate: totals.tvaRate,
      tvaAmount: totals.tvaAmount,
      amount: totals.total,
      paymentMethod: body.paymentMethod || null,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      ...(lines.length > 0 ? { lines: { create: lines } } : {}),
    },
    include: { customer: true, lines: true },
  });

  return NextResponse.json({ invoice });
}
