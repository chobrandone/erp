// Exports the whole database to a single multi-sheet Excel workbook (one sheet
// per table) in ./backups/. The GitHub Action then uploads it to Google Drive.
//
// Sensitive columns are never exported: user password hashes and invoice receipt
// blobs are excluded.
//
// Run locally:  node scripts/backup-to-excel.mjs   (needs DATABASE_URL)
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

// Turn a value into something a spreadsheet cell can hold.
function cell(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().replace("T", " ").slice(0, 19);
  if (typeof v === "object") return JSON.stringify(v); // e.g. Json columns
  return v;
}

function addSheet(wb, name, rows) {
  const ws = wb.addWorksheet(name.slice(0, 31));
  if (rows.length === 0) {
    ws.addRow(["(no records)"]);
    return;
  }
  const keys = Object.keys(rows[0]);
  ws.columns = keys.map((k) => ({ header: k, key: k, width: 20 }));
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F5FB0" } };
  head.height = 18;
  for (const r of rows) ws.addRow(keys.map((k) => cell(r[k])));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: keys.length } };
}

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "NEGOCE & SERVICES — N.S. SARL (automated backup)";
  wb.created = new Date();

  // Each entry: [sheet name, query]. Sensitive fields are omitted via `omit`.
  const tables = [
    ["Customers", prisma.customer.findMany()],
    ["ShippingLines", prisma.shippingLine.findMany()],
    ["ContainerTypes", prisma.containerType.findMany()],
    ["Containers", prisma.container.findMany()],
    ["Locations", prisma.location.findMany()],
    ["Inventory", prisma.inventory.findMany()],
    ["GateTransactions", prisma.gateTransaction.findMany()],
    ["ContainerMovements", prisma.containerMovement.findMany()],
    ["ReeferMonitoring", prisma.reeferMonitoring.findMany()],
    ["ReeferConnections", prisma.reeferConnection.findMany()],
    ["PTIRequests", prisma.pTIRequest.findMany()],
    ["PTIInspections", prisma.pTIInspection.findMany()],
    ["Repairs", prisma.repair.findMany()],
    ["DamageSurveys", prisma.damageSurvey.findMany()],
    ["RepairEstimates", prisma.repairEstimate.findMany()],
    ["RepairWorkOrders", prisma.repairWorkOrder.findMany()],
    ["ReleaseOrders", prisma.releaseOrder.findMany()],
    ["Invoices", prisma.invoice.findMany({ omit: { receiptData: true } })],
    ["InvoiceLines", prisma.invoiceLine.findMany()],
    ["BillingRates", prisma.billingRate.findMany()],
    ["Vehicles", prisma.vehicle.findMany()],
    ["VehicleTrips", prisma.vehicleTrip.findMany()],
    ["VehicleDocuments", prisma.vehicleDocument.findMany()],
    ["Equipment", prisma.equipment.findMany()],
    ["Users", prisma.user.findMany({ omit: { passwordHash: true } })],
    ["AuditLog", prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 })],
  ];

  let total = 0;
  for (const [name, query] of tables) {
    const rows = await query;
    total += rows.length;
    addSheet(wb, name, rows);
    console.log(`  ${name}: ${rows.length} row(s)`);
  }

  // Summary sheet first (moved to front).
  const summary = wb.addWorksheet("_Summary");
  summary.addRow(["NS-SARL ERP — Database backup"]);
  summary.addRow(["Generated", new Date().toISOString()]);
  summary.addRow(["Total records", total]);
  summary.getRow(1).font = { bold: true, size: 14 };
  wb.worksheets.unshift(wb.worksheets.pop()); // move _Summary to first tab

  mkdirSync(join(process.cwd(), "backups"), { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const file = join(process.cwd(), "backups", `erp-backup-${stamp}.xlsx`);
  await wb.xlsx.writeFile(file);
  console.log(`backup-to-excel: wrote ${file} (${total} total records)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
