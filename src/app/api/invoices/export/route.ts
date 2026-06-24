import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

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
    orderBy: { issuedAt: "asc" },
  });

  const header = [
    "Invoice No",
    "Customer",
    "Description",
    "Amount",
    "Status",
    "Issued On",
    "Due On",
    "Paid On",
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.customer.name,
    inv.description ?? "",
    inv.amount.toFixed(2),
    inv.status,
    inv.issuedAt.toISOString().slice(0, 10),
    inv.dueAt ? inv.dueAt.toISOString().slice(0, 10) : "",
    inv.paidAt ? inv.paidAt.toISOString().slice(0, 10) : "",
  ]);

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = totalAmount - totalPaid;

  const csv = [
    header.map(csvEscape).join(","),
    ...rows.map((r) => r.map((v) => csvEscape(String(v))).join(",")),
    "",
    ["TOTAL BILLED", "", "", totalAmount.toFixed(2)].join(","),
    ["TOTAL PAID", "", "", totalPaid.toFixed(2)].join(","),
    ["TOTAL OUTSTANDING", "", "", totalOutstanding.toFixed(2)].join(","),
  ].join("\n");

  const rangeLabel = from || to ? `_${from ?? "start"}_to_${to ?? "now"}` : "_all";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="billing-export${rangeLabel}.csv"`,
    },
  });
}
