import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePdfFile, generateQrDataUrl } from "@/lib/pdf/generatePdf";
import { InvoicePdf } from "@/lib/pdf/templates/Invoice";
import { formatDate } from "@/lib/utils";

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
  const body = await req.json();
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: body.customerId,
      description: body.description || null,
      amount: Number(body.amount),
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
    },
    include: { customer: true },
  });

  const qrDataUrl = await generateQrDataUrl(invoiceNumber);
  const pdfPath = await generatePdfFile(
    InvoicePdf({
      docNumber: invoiceNumber,
      qrDataUrl,
      generatedAt: new Date().toLocaleString(),
      customerName: invoice.customer.name,
      customerAddress: invoice.customer.address ?? "-",
      description: invoice.description ?? "Container depot services",
      amount: `$${invoice.amount.toFixed(2)}`,
      status: "UNPAID",
      issuedAt: formatDate(invoice.issuedAt),
      dueAt: invoice.dueAt ? formatDate(invoice.dueAt) : "-",
    }),
    "invoices",
    invoiceNumber
  );

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfPath },
    include: { customer: true },
  });

  return NextResponse.json({ invoice: updated });
}
