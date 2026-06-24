import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { ReactElement } from "react";
import { promises as fs } from "fs";
import path from "path";
import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 160 });
}

export async function generatePdfFile(
  element: ReactElement<any>,
  subfolder: string,
  fileName: string
): Promise<string> {
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>);
  const dir = path.join(process.cwd(), "storage", "pdfs", subfolder);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${fileName}.pdf`);
  await fs.writeFile(filePath, buffer);
  return path.join("storage", "pdfs", subfolder, `${fileName}.pdf`);
}
