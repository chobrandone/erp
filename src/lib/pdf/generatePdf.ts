import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { ReactElement } from "react";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 160 });
}

export async function pdfResponse(element: ReactElement<any>, fileName: string): Promise<NextResponse> {
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>);
  return new NextResponse(new Blob([buffer as unknown as ArrayBuffer], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}.pdf"`,
    },
  });
}
