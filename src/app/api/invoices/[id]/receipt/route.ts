import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { validateReceipt } from "@/lib/receipt";

// Upload (and verify) a payment receipt, then mark the invoice PAID.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("receipt");
  const confirmed = form.get("confirm") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No receipt file provided." }, { status: 400 });
  }
  if (!confirmed) {
    return NextResponse.json(
      { error: "Please confirm the uploaded document is the payment receipt." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateReceipt(buffer, file.type);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      receiptData: buffer,
      receiptMime: check.mime,
      receiptName: file.name,
      receiptVerified: check.verified,
      receiptUploadedAt: new Date(),
      status: "PAID",
      paidAt: invoice.paidAt ?? new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    verified: check.verified,
    keywordsFound: check.keywordsFound,
    invoiceNumber: updated.invoiceNumber,
  });
}

// Serve the stored receipt inline.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { receiptData: true, receiptMime: true, receiptName: true },
  });
  if (!invoice?.receiptData) return NextResponse.json({ error: "No receipt" }, { status: 404 });

  const body = Buffer.from(invoice.receiptData);
  return new NextResponse(new Blob([body as unknown as ArrayBuffer], { type: invoice.receiptMime ?? "application/octet-stream" }), {
    headers: {
      "Content-Type": invoice.receiptMime ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${invoice.receiptName ?? "receipt"}"`,
    },
  });
}
