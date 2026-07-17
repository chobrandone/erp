import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VehicleForm } from "@/components/fleet/VehicleForm";
import { DispatchForm } from "@/components/fleet/DispatchForm";
import { ReturnTripButton } from "@/components/fleet/TripActions";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Truck, AlertTriangle, ShieldCheck, ParkingSquare, Send, FileSpreadsheet } from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  DRIVER_LICENSE: "Permis de conduire",
  INSURANCE: "Assurance",
  TECHNICAL_INSPECTION: "Visite technique",
  CARTE_GRISE: "Carte grise",
  VIGNETTE: "Vignette",
};
const CARGO_LABELS: Record<string, string> = {
  CONTAINER: "Conteneur",
  EQUIPMENT: "Équipement",
  GOODS: "Marchandise",
  EMPTY: "À vide",
};

const DAY = 86400000;

export default async function FleetManagementPage() {
  const [vehicles, ongoingTrips] = await Promise.all([
    prisma.vehicle.findMany({ include: { documents: true }, orderBy: { plateNumber: "asc" } }),
    prisma.vehicleTrip.findMany({ where: { status: "ONGOING" }, include: { vehicle: true }, orderBy: { departureTime: "asc" } }),
  ]);

  const now = Date.now();
  const soon = 30 * DAY;

  const inUse = vehicles.filter((v) => v.operationalStatus === "IN_USE");
  const inPark = vehicles.filter((v) => v.operationalStatus === "IN_PARK" && v.status !== "MAINTENANCE");
  const maintenance = vehicles.filter((v) => v.status === "MAINTENANCE");

  type DocFlag = { plate: string; docType: string; expiry: Date; daysLeft: number };
  const expiring: DocFlag[] = [];
  for (const v of vehicles) {
    for (const d of v.documents) {
      const daysLeft = Math.floor((d.expiryDate.getTime() - now) / DAY);
      if (d.expiryDate.getTime() - now <= soon) {
        expiring.push({ plate: v.plateNumber, docType: d.docType, expiry: d.expiryDate, daysLeft });
      }
    }
  }
  expiring.sort((a, b) => a.daysLeft - b.daysLeft);
  const expiredCount = expiring.filter((e) => e.daysLeft < 0).length;

  // --- IN USE table (vehicle + what it carries + destination) ---
  const useRows = ongoingTrips.map((tp) => ({
    id: tp.id,
    plate: tp.vehicle.plateNumber,
    driver: tp.driverName,
    cargo: CARGO_LABELS[tp.cargoType] ?? tp.cargoType,
    container: tp.containerNumber ?? tp.cargoDescription ?? "-",
    destination: tp.destination,
    departure: tp.departureTime,
    expected: tp.expectedReturn,
    tripNo: tp.tripNo,
  }));
  const useCols: Column<(typeof useRows)[number]>[] = [
    { header: "Immatriculation", accessor: (r) => <span className="font-medium">{r.plate}</span> },
    { header: "Chauffeur", accessor: (r) => r.driver },
    { header: "Chargement", accessor: (r) => <StatusBadge status={r.cargo} /> },
    { header: "Conteneur / Équip.", accessor: (r) => r.container },
    { header: "Destination", accessor: (r) => r.destination },
    { header: "Départ", accessor: (r) => formatDateTime(r.departure) },
    { header: "Retour prévu", accessor: (r) => (r.expected ? formatDateTime(r.expected) : "-") },
    { header: "Action", accessor: (r) => <ReturnTripButton tripId={r.id} /> },
  ];

  // --- IN PARK table ---
  const parkRows = inPark.map((v) => {
    const nextExpiry = [...v.documents].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0];
    const daysLeft = nextExpiry ? Math.floor((nextExpiry.expiryDate.getTime() - now) / DAY) : null;
    return { id: v.id, plate: v.plateNumber, make: `${v.make ?? ""} ${v.model ?? ""}`.trim() || "-", driver: v.driverName ?? "-", docs: v.documents.length, nextExpiry, daysLeft };
  });
  const parkCols: Column<(typeof parkRows)[number]>[] = [
    { header: "Immatriculation", accessor: (r) => <span className="font-medium">{r.plate}</span> },
    { header: "Véhicule", accessor: (r) => r.make },
    { header: "Chauffeur", accessor: (r) => r.driver },
    { header: "Documents", accessor: (r) => r.docs },
    {
      header: "Prochaine échéance",
      accessor: (r) => {
        if (!r.nextExpiry || r.daysLeft == null) return "-";
        const label = `${DOC_LABELS[r.nextExpiry.docType] ?? r.nextExpiry.docType} — ${formatDate(r.nextExpiry.expiryDate)}`;
        const cls = r.daysLeft < 0 ? "text-red-600 bg-red-500/10" : r.daysLeft <= 30 ? "text-amber-600 bg-amber-500/10" : "text-fg-subtle";
        return <span className={`text-xs rounded px-1.5 py-0.5 ${cls}`}>{label} {r.daysLeft < 0 ? "(expiré)" : `(${r.daysLeft}j)`}</span>;
      },
    },
  ];

  const dispatchVehicles = inPark.map((v) => ({
    id: v.id,
    label: `${v.plateNumber} — ${`${v.make ?? ""} ${v.model ?? ""}`.trim() || "véhicule"}`,
    driver: v.driverName ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de la Flotte"
        subtitle="Véhicules en parc, en mission, chargements et échéances des documents"
        actions={
          <a href="/api/reports/export?type=fleet" target="_blank" className="flex items-center gap-1.5 text-sm rounded-lg border border-border-color px-3 py-1.5 hover:bg-surface-alt">
            <FileSpreadsheet size={15} /> Export Excel
          </a>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <KPICard title="Total véhicules" value={vehicles.length} icon={Truck} accentIndex={3} />
        <KPICard title="En parc" value={inPark.length} icon={ParkingSquare} accentIndex={5} />
        <KPICard title="En mission" value={inUse.length} icon={Send} accentIndex={0} />
        <KPICard title="Maintenance" value={maintenance.length} icon={AlertTriangle} accentIndex={4} />
        <KPICard title="Docs expirés" value={expiredCount} icon={ShieldCheck} accentIndex={2} />
      </div>

      {expiring.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Alertes — documents à renouveler (30 jours)
          </h3>
          <ul className="space-y-1.5">
            {expiring.slice(0, 12).map((e, i) => (
              <li key={i} className="text-sm flex items-center justify-between">
                <span><span className="font-medium">{e.plate}</span> — {DOC_LABELS[e.docType] ?? e.docType}</span>
                <span className={e.daysLeft < 0 ? "text-red-600 font-medium" : "text-amber-600"}>
                  {e.daysLeft < 0 ? `Expiré depuis ${Math.abs(e.daysLeft)}j` : `Expire dans ${e.daysLeft}j`} · {formatDate(e.expiry)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* IN USE */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <Send size={15} className="text-brand-100" /> Véhicules en mission ({inUse.length}) — détails du chargement
        </h3>
        {useRows.length > 0 ? (
          <DataTable columns={useCols} rows={useRows} />
        ) : (
          <p className="text-sm text-fg-subtle rounded-lg border border-border-color p-4">Aucun véhicule en mission actuellement.</p>
        )}
      </section>

      {/* IN PARK + dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
            <ParkingSquare size={15} className="text-brand-100" /> Véhicules en parc ({inPark.length})
          </h3>
          <DataTable columns={parkCols} rows={parkRows} />
        </div>
        <div className="rounded-xl border border-border-color bg-surface p-5">
          <DispatchForm vehicles={dispatchVehicles} />
        </div>
      </div>

      {/* Add vehicle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {maintenance.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-fg-muted">En maintenance ({maintenance.length})</h3>
              <ul className="text-sm space-y-1">
                {maintenance.map((v) => (
                  <li key={v.id} className="rounded-lg border border-border-color px-3 py-2">{v.plateNumber} — {`${v.make ?? ""} ${v.model ?? ""}`.trim()}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="rounded-xl border border-border-color bg-surface p-5">
          <VehicleForm />
        </div>
      </div>
    </div>
  );
}
