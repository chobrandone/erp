import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { ProcesVerbalEIR } from "@/lib/pdf/templates/EIRBody";

const fmtDate = (d?: Date | null) =>
  d ? d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.gateTransaction.findUnique({
    where: { id },
    include: {
      container: { include: { containerType: true, inventory: { include: { location: true } } } },
      customer: true,
      shippingLine: true,
    },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const t = transaction;
  const qrDataUrl = await generateQrDataUrl(liveDocUrl(req));
  const generatedAt = new Date().toLocaleString("fr-FR");
  const isReefer = t.container.containerType.isReefer;

  // Entry vs exit both use the RTC procès-verbal layout.
  const isGateIn = t.type === "GATE_IN";

  return pdfResponse(
    ProcesVerbalEIR({
      mode: isGateIn ? "ENTREE" : "SORTIE",
      docNumber: t.docNumber,
      qrDataUrl,
      generatedAt,
      region: t.region ?? "-",
      dateEntree: isGateIn ? fmtDate(t.createdAt) : "-",
      dateSortie: isGateIn ? "-" : fmtDate(t.createdAt),
      statut: t.statut ?? "-",
      containerNumber: t.container.containerNumber,
      navire: t.navire ?? "-",
      voyage: t.voyage ?? "-",
      documentType: t.documentType ?? "",
      documentNumber: t.documentNumber ?? "",
      armementBl: t.shippingLine?.name ?? "-",
      poids: t.grossWeightKg != null ? String(t.grossWeightKg) : (t.container.grossWeightKg != null ? String(t.container.grossWeightKg) : "-"),
      pod: t.pod ?? "-",
      tare: t.container.tareWeightKg != null ? String(t.container.tareWeightKg) : "-",
      lieu: t.container.inventory?.location.code ?? "-",
      acconier: t.acconier ?? "-",
      codeIso: t.isoCode ?? t.container.isoCode ?? t.container.containerType.code,
      immat: t.truckPlate,
      destFinale: t.destination ?? "-",
      plomb1: t.sealNumber ?? "-",
      plomb2: t.sealNumber2 ?? "-",
      marchandise: t.marchandise ?? "-",
      reefer: isReefer,
      temp: t.tempGate != null ? `${t.tempGate} °C` : "-",
      oog: t.oog,
      imdg: t.imdg ?? "-",
      transitaire: t.transitaire ?? "-",
      transporteur: t.customer?.name ?? "-",
      condition: t.condition as "GOOD" | "DAMAGED",
      damageRemarks: t.damageRemarks ?? "-",
      gatePost: t.gatePost ?? "",
    }),
    t.docNumber
  );
}
