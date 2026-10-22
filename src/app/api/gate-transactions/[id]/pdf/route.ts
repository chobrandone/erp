import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, liveDocUrl, pdfResponse } from "@/lib/pdf/generatePdf";
import { EquipmentInterchangeReceipt } from "@/lib/pdf/templates/EIRBody";
import { DEPOT_TIME_ZONE } from "@/lib/utils";

// Equipment Interchange / Receipt date, e.g. "18-Sep-2024 17:56:40", in the depot zone.
function fmtEirDateTime(d?: Date | null): string {
  if (!d) return "-";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEPOT_TIME_ZONE,
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d).reduce<Record<string, string>>((a, p) => { a[p.type] = p.value; return a; }, {});
  return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}

const fmtWeight = (n?: number | null) =>
  n != null ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

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
  const isGateIn = t.type === "GATE_IN";
  const isEmpty = t.deliveryHeading?.endsWith("EMPTY");

  // Move Type / Service derived from direction + load, matching the sample wording.
  const moveType = isGateIn
    ? `${isEmpty ? "Empty" : "Loaded"} Received at CY`
    : `${isEmpty ? "Empty" : "Loaded"} Delivered`;
  const service = isEmpty ? "Empty" : "Loaded";

  return pdfResponse(
    EquipmentInterchangeReceipt({
      qrDataUrl,
      equipmentNo: t.container.containerNumber,
      moveType,
      sizeType: t.isoCode ?? t.container.isoCode ?? t.container.containerType.code,
      dateTime: fmtEirDateTime(t.createdAt),
      service,
      gatePassNo: t.docNumber,
      carrier: t.shippingLine?.name ?? "",
      agent: t.agent ?? t.acconier ?? "",
      stackPosition: t.stackPosition ?? t.container.inventory?.location.code ?? "",
      bookingNo: t.bookingNo ?? t.documentNumber ?? "",
      customer: t.customer?.name ?? "",
      tareWeight: fmtWeight(t.container.tareWeightKg),
      payload: fmtWeight(t.payloadKg ?? t.grossWeightKg ?? t.container.grossWeightKg),
      smartContainer: t.container.containerType.isReefer ? "Yes" : "No",
      newEquipmentNo: t.newEquipmentNo ?? "",
      transportMode: "Truck",
      truckNo: t.truckPlate,
      transporter: t.transitaire ?? "",
      driverName: t.driverName,
      driverRefNo: t.driverIdNumber ?? "",
      acceptanceRef: t.acceptanceRef ?? t.releaseOrderNo ?? "",
      sealType: t.sealType ?? "",
      sealNumber: t.sealNumber ?? "",
      remarks: [t.remarks, t.condition === "DAMAGED" ? `DAMAGED: ${t.damageRemarks ?? ""}` : ""].filter(Boolean).join(" — "),
    }),
    t.docNumber
  );
}
