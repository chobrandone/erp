import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { ReactElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 200 });
}

/**
 * Build the absolute, publicly reachable URL of the document being generated.
 * A PDF route IS the live document endpoint, so the current request path — served
 * from the deployed host — is exactly the URL a scanned QR code should open.
 * Prefers an explicit APP_URL env (stable public domain) and otherwise honours
 * the forwarded host/proto headers set by Vercel / reverse proxies.
 */
export function liveDocUrl(req: NextRequest, pathOverride?: string): string {
  const path = pathOverride ?? req.nextUrl.pathname;
  const envBase = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envBase) return new URL(path, envBase).toString();
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "") ?? "https";
  return `${proto}://${host}${path}`;
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
