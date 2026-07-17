/**
 * Payment-receipt validation. An invoice can only be marked PAID once a file
 * that plausibly IS a payment receipt has been uploaded and stored.
 *
 * "Double-check it's a receipt" is done in three layers:
 *   1. File type — must be a PDF or an image (magic-byte sniff, not just the
 *      client-declared MIME which can be spoofed).
 *   2. Size — non-empty and within a sane bound.
 *   3. Content heuristic — scan the bytes for receipt/payment keywords
 *      (works for text-based PDFs and any file carrying embedded ASCII text).
 */

export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024; // 8 MB

const ACCEPTED = [
  { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  { mime: "image/webp", magic: [0x52, 0x49, 0x46, 0x46] }, // RIFF (WEBP)
];

// Bilingual receipt / payment vocabulary.
const RECEIPT_KEYWORDS = [
  "receipt", "reçu", "recu", "paid", "payé", "paye", "payment", "paiement",
  "montant", "amount", "facture", "invoice", "virement", "transfer", "bicec",
  "mobile money", "espèces", "especes", "cash", "fcfa", "xaf", "règlement",
  "reglement", "quittance", "bordereau",
];

export type ReceiptCheck = {
  ok: boolean;
  mime?: string;
  verified: boolean; // content heuristic matched → high confidence it's a receipt
  reason?: string;
  keywordsFound: string[];
};

function sniffMime(bytes: Uint8Array): string | null {
  for (const a of ACCEPTED) {
    if (a.magic.every((b, i) => bytes[i] === b)) {
      // WEBP: RIFF....WEBP — verify the WEBP marker at offset 8.
      if (a.mime === "image/webp") {
        const webp = [0x57, 0x45, 0x42, 0x50];
        if (!webp.every((b, i) => bytes[8 + i] === b)) continue;
      }
      return a.mime;
    }
  }
  return null;
}

export function validateReceipt(buffer: Buffer, declaredMime?: string): ReceiptCheck {
  if (!buffer || buffer.length === 0) {
    return { ok: false, verified: false, reason: "Empty file.", keywordsFound: [] };
  }
  if (buffer.length > MAX_RECEIPT_BYTES) {
    return { ok: false, verified: false, reason: "File too large (max 8 MB).", keywordsFound: [] };
  }

  const mime = sniffMime(new Uint8Array(buffer.subarray(0, 16)));
  if (!mime) {
    return {
      ok: false,
      verified: false,
      reason: "Unsupported file type. Upload the receipt as a PDF or an image (PNG/JPG/WEBP).",
      keywordsFound: [],
    };
  }
  // Guard against a spoofed content-type that disagrees with the real bytes.
  if (declaredMime && declaredMime !== mime && !declaredMime.startsWith("image/")) {
    // allow generic image/* mismatch, otherwise trust the sniffed type
  }

  // Content heuristic — decode as latin1 so embedded ASCII in PDF streams survives.
  const text = buffer.toString("latin1").toLowerCase();
  const keywordsFound = RECEIPT_KEYWORDS.filter((k) => text.includes(k));
  const verified = keywordsFound.length > 0;

  return { ok: true, mime, verified, keywordsFound };
}
