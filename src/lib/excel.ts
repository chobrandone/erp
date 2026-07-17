import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export type ExcelColumn = { header: string; key: string; width?: number };

/**
 * Build a styled .xlsx workbook from columns + rows and return it as a download.
 */
export async function excelResponse(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, unknown>[],
  fileName: string
): Promise<NextResponse> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "NEGOCE & SERVICES — N.S. SARL";
  wb.created = new Date();
  const ws = wb.addWorksheet(sheetName.slice(0, 31));

  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 20 }));

  // Header styling — NS SARL blue.
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F5FB0" } };
  head.alignment = { vertical: "middle", horizontal: "left" };
  head.height = 20;

  for (const r of rows) ws.addRow(r);

  ws.eachRow((row, i) => {
    if (i === 1) return;
    if (i % 2 === 0) row.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F6FB" } }));
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(new Blob([buffer as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}.xlsx"`,
    },
  });
}
