import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { InvoicePdf, InvoiceLineData } from "@/lib/pdf/templates/Invoice";
import { formatDate } from "@/lib/utils";
import { formatXaf } from "@/lib/billing";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lines: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));

  // Use structured lines if present; otherwise fall back to the flat description/amount.
  const lines: InvoiceLineData[] =
    invoice.lines.length > 0
      ? invoice.lines.map((l) => ({
          description: l.description + (l.containerNumber ? ` — ${l.containerNumber}` : ""),
          quantity: l.quantity,
          unitPrice: formatXaf(l.unitPrice),
          lineTotal: formatXaf(l.lineTotal),
        }))
      : [
          {
            description: invoice.description ?? "Prestations de dépôt de conteneurs",
            quantity: 1,
            unitPrice: formatXaf(invoice.subtotal || invoice.amount),
            lineTotal: formatXaf(invoice.subtotal || invoice.amount),
          },
        ];

  const hasDiscount = (invoice.discountAmount ?? 0) > 0;
  const isFullWaiver = hasDiscount && invoice.discountAmount >= invoice.subtotal;
  const discountLabel = isFullWaiver ? "Waiver (exonération)" : "Réduction";
  const noteParts = [
    invoice.discountAuthorizedBy ? `Autorisé par : ${invoice.discountAuthorizedBy}` : null,
    invoice.discountReason ? `Motif : ${invoice.discountReason}` : null,
  ].filter(Boolean);

  return pdfResponse(
    InvoicePdf({
      docNumber: invoice.invoiceNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString("fr-FR"),
      customerName: invoice.customer.name,
      customerAddress: invoice.customer.address ?? "-",
      lines,
      subtotal: formatXaf(invoice.subtotal || invoice.amount),
      discountAmount: hasDiscount ? formatXaf(invoice.discountAmount) : undefined,
      discountLabel,
      discountNote: noteParts.length > 0 ? noteParts.join("   ·   ") : undefined,
      netHt: hasDiscount ? formatXaf(invoice.subtotal - invoice.discountAmount) : undefined,
      tvaRate: invoice.tvaRate,
      tvaAmount: formatXaf(invoice.tvaAmount),
      amount: formatXaf(invoice.amount),
      paymentMethod: invoice.paymentMethod ?? "—",
      status: invoice.status as "PAID" | "UNPAID",
      issuedAt: formatDate(invoice.issuedAt),
      dueAt: invoice.dueAt ? formatDate(invoice.dueAt) : "-",
    }),
    invoice.invoiceNumber
  );
}
