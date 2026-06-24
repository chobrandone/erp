import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePdfFile, generateQrDataUrl } from "@/lib/pdf/generatePdf";
import { InvoicePdf } from "@/lib/pdf/templates/Invoice";
import { formatDate } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: body.status,
      paidAt: body.status === "PAID" ? new Date() : null,
    },
    include: { customer: true },
  });

  const qrDataUrl = await generateQrDataUrl(invoice.invoiceNumber);
  const pdfPath = await generatePdfFile(
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
    "invoices",
    invoice.invoiceNumber
  );

  const updated = await prisma.invoice.update({ where: { id }, data: { pdfPath } });

  return NextResponse.json({ invoice: updated });
}
