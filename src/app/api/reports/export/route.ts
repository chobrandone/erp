import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { excelResponse, ExcelColumn } from "@/lib/excel";

const d = (x?: Date | null) => (x ? new Date(x).toLocaleString("fr-FR") : "");
const day = (x?: Date | null) => (x ? new Date(x).toLocaleDateString("fr-FR") : "");

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "gate";
  const q = sp.get("q")?.trim() || "";
  const from = sp.get("from");
  const to = sp.get("to");
  const date = sp.get("date"); // daily records

  const dateRange =
    from || to
      ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(`${to}T23:59:59`) : undefined }
      : undefined;

  const like = (s: string) => ({ contains: s, mode: "insensitive" as const });

  switch (type) {
    case "gate": {
      const rows = await prisma.gateTransaction.findMany({
        where: {
          ...(dateRange ? { createdAt: dateRange } : {}),
          ...(q ? { OR: [{ docNumber: like(q) }, { truckPlate: like(q) }, { container: { containerNumber: like(q) } }] } : {}),
        },
        include: { container: true, customer: true, shippingLine: true },
        orderBy: { createdAt: "desc" },
      });
      const cols: ExcelColumn[] = [
        { header: "N° EIR", key: "doc", width: 18 }, { header: "Type", key: "type", width: 10 },
        { header: "Conteneur", key: "cont", width: 16 }, { header: "Navire", key: "navire", width: 16 },
        { header: "Armement BL", key: "line", width: 16 }, { header: "Client", key: "cust", width: 18 },
        { header: "Camion", key: "truck", width: 12 }, { header: "Chauffeur", key: "driver", width: 16 },
        { header: "Statut", key: "statut", width: 8 }, { header: "Destination", key: "dest", width: 16 },
        { header: "Date", key: "date", width: 18 },
      ];
      return excelResponse("Gate", cols, rows.map((r) => ({
        doc: r.docNumber, type: r.type, cont: r.container.containerNumber, navire: r.navire ?? "",
        line: r.shippingLine?.name ?? "", cust: r.customer?.name ?? "", truck: r.truckPlate, driver: r.driverName,
        statut: r.statut ?? "", dest: r.destination ?? "", date: d(r.createdAt),
      })), "NS-SARL-Gate-Report");
    }

    case "inventory": {
      const rows = await prisma.inventory.findMany({
        where: q ? { container: { containerNumber: like(q) } } : {},
        include: { container: { include: { containerType: true, shippingLine: true } }, location: true },
        orderBy: { enteredAt: "desc" },
      });
      const now = Date.now();
      const cols: ExcelColumn[] = [
        { header: "Conteneur", key: "cont", width: 16 }, { header: "Type", key: "type", width: 10 },
        { header: "Armement", key: "line", width: 16 }, { header: "Position", key: "loc", width: 14 },
        { header: "Statut", key: "status", width: 12 }, { header: "Entré le", key: "entered", width: 18 },
        { header: "Jours en parc", key: "dwell", width: 12 },
      ];
      return excelResponse("Inventory", cols, rows.map((r) => ({
        cont: r.container.containerNumber, type: r.container.containerType.code, line: r.container.shippingLine?.name ?? "",
        loc: r.location.code, status: r.container.status, entered: d(r.enteredAt),
        dwell: Math.max(0, Math.floor((now - r.enteredAt.getTime()) / 86400000)),
      })), "NS-SARL-Inventory-Report");
    }

    case "invoices": {
      const rows = await prisma.invoice.findMany({
        where: {
          ...(dateRange ? { issuedAt: dateRange } : {}),
          ...(q ? { OR: [{ invoiceNumber: like(q) }, { customer: { name: like(q) } }] } : {}),
        },
        include: { customer: true },
        orderBy: { issuedAt: "desc" },
      });
      const cols: ExcelColumn[] = [
        { header: "N° Facture", key: "num", width: 18 }, { header: "Client", key: "cust", width: 20 },
        { header: "Montant HT", key: "ht", width: 14 }, { header: "TVA", key: "tva", width: 12 },
        { header: "Montant TTC (FCFA)", key: "ttc", width: 18 }, { header: "Statut", key: "status", width: 10 },
        { header: "Reçu vérifié", key: "receipt", width: 12 },
        { header: "Émise le", key: "issued", width: 14 }, { header: "Échéance", key: "due", width: 14 },
      ];
      return excelResponse("Factures", cols, rows.map((r) => ({
        num: r.invoiceNumber, cust: r.customer.name, ht: Math.round(r.subtotal), tva: Math.round(r.tvaAmount),
        ttc: Math.round(r.amount), status: r.status === "PAID" ? "PAYÉE" : "IMPAYÉE",
        receipt: r.receiptUploadedAt ? (r.receiptVerified ? "Oui (vérifié)" : "Oui") : "Non",
        issued: day(r.issuedAt), due: day(r.dueAt),
      })), "NS-SARL-Factures-Report");
    }

    case "pti": {
      const rows = await prisma.pTIRequest.findMany({
        where: q ? { OR: [{ docNumber: like(q) }, { container: { containerNumber: like(q) } }] } : {},
        include: { container: true, inspection: true },
        orderBy: { requestedAt: "desc" },
      });
      const cols: ExcelColumn[] = [
        { header: "N° Doc", key: "doc", width: 18 }, { header: "Conteneur", key: "cont", width: 16 },
        { header: "Statut", key: "status", width: 12 }, { header: "Résultat", key: "result", width: 10 },
        { header: "Demandé le", key: "req", width: 18 }, { header: "Inspecté le", key: "insp", width: 18 },
      ];
      return excelResponse("PTI", cols, rows.map((r) => ({
        doc: r.docNumber, cont: r.container.containerNumber, status: r.status,
        result: r.inspection?.result ?? "", req: d(r.requestedAt), insp: r.inspection ? d(r.inspection.inspectedAt) : "",
      })), "NS-SARL-PTI-Report");
    }

    case "fleet": {
      const rows = await prisma.vehicleTrip.findMany({
        where: {
          ...(dateRange ? { departureTime: dateRange } : {}),
          ...(q ? { OR: [{ tripNo: like(q) }, { destination: like(q) }, { vehicle: { plateNumber: like(q) } }] } : {}),
        },
        include: { vehicle: true },
        orderBy: { departureTime: "desc" },
      });
      const cols: ExcelColumn[] = [
        { header: "N° Mission", key: "trip", width: 18 }, { header: "Camion", key: "plate", width: 14 },
        { header: "Chauffeur", key: "driver", width: 16 }, { header: "Chargement", key: "cargo", width: 14 },
        { header: "Conteneur/Équip.", key: "cont", width: 18 }, { header: "Destination", key: "dest", width: 18 },
        { header: "Départ", key: "dep", width: 18 }, { header: "Retour", key: "ret", width: 18 },
        { header: "Statut", key: "status", width: 12 },
      ];
      return excelResponse("Flotte", cols, rows.map((r) => ({
        trip: r.tripNo, plate: r.vehicle.plateNumber, driver: r.driverName, cargo: r.cargoType,
        cont: r.containerNumber ?? r.cargoDescription ?? "", dest: r.destination,
        dep: d(r.departureTime), ret: d(r.returnTime), status: r.status,
      })), "NS-SARL-Fleet-Report");
    }

    case "daily": {
      if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59`);
      const range = { gte: start, lte: end };
      const [gate, movements, invoices, trips] = await Promise.all([
        prisma.gateTransaction.findMany({ where: { createdAt: range }, include: { container: true }, orderBy: { createdAt: "asc" } }),
        prisma.containerMovement.findMany({ where: { createdAt: range }, include: { container: true, toLocation: true } }),
        prisma.invoice.findMany({ where: { issuedAt: range }, include: { customer: true } }),
        prisma.vehicleTrip.findMany({ where: { departureTime: range }, include: { vehicle: true } }),
      ]);
      const cols: ExcelColumn[] = [
        { header: "Heure", key: "time", width: 12 }, { header: "Activité", key: "activity", width: 18 },
        { header: "Référence", key: "ref", width: 20 }, { header: "Détail", key: "detail", width: 36 },
      ];
      const rows: Record<string, unknown>[] = [];
      const tm = (x: Date) => new Date(x).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      for (const g of gate) rows.push({ time: tm(g.createdAt), activity: g.type === "GATE_IN" ? "Entrée (Gate In)" : "Sortie (Gate Out)", ref: g.docNumber, detail: `${g.container.containerNumber} · ${g.truckPlate}` });
      for (const m of movements) rows.push({ time: tm(m.createdAt), activity: "Mouvement", ref: m.docNumber, detail: `${m.container.containerNumber} → ${m.toLocation.code} (${m.reason})` });
      for (const inv of invoices) rows.push({ time: tm(inv.issuedAt), activity: "Facture", ref: inv.invoiceNumber, detail: `${inv.customer.name} · ${Math.round(inv.amount)} FCFA · ${inv.status}` });
      for (const tp of trips) rows.push({ time: tm(tp.departureTime), activity: "Mission flotte", ref: tp.tripNo, detail: `${tp.vehicle.plateNumber} → ${tp.destination}` });
      rows.sort((a, b) => String(a.time).localeCompare(String(b.time)));
      return excelResponse(`Journalier ${date}`, cols, rows, `NS-SARL-Daily-${date}`);
    }

    default:
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }
}
