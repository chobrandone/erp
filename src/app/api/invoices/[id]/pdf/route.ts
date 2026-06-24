import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { InvoicePdf } from "@/lib/pdf/templates/Invoice";
import { formatDate } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await generateQrDataUrl(invoice.invoiceNumber);
  return pdfResponse(
    InvoicePdf({
      docNumber: invoice.invoiceNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      customerName: invoice.customer.name,
      customerAddress: invoice.customer.address ?? "-",
      description: invoice.description ?? "Container depot services",
      amount: `$${invoice.amount.toFixed(2)}`,
      status: invoice.status as "PAID" | "UNPAID",
      issuedAt: formatDate(invoice.issuedAt),
      dueAt: invoice.dueAt ? formatDate(invoice.dueAt) : "-",
    }),
    invoice.invoiceNumber
  );
}
