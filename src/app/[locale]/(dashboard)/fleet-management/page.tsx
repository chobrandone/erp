import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VehicleForm } from "@/components/fleet/VehicleForm";
import { DispatchForm } from "@/components/fleet/DispatchForm";
import { ReturnTripButton, RedispatchButton } from "@/components/fleet/TripActions";
import { FormModal } from "@/components/shared/FormModal";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Truck, AlertTriangle, ShieldCheck, ParkingSquare, Send, FileSpreadsheet, Printer, History } from "lucide-react";

const DAY = 86400000;

export default async function FleetManagementPage() {
  const t = await getTranslations("fleet");

  const DOC_LABELS: Record<string, string> = {
    DRIVER_LICENSE: t("docDriverLicense"),
    INSURANCE: t("docInsurance"),
    TECHNICAL_INSPECTION: t("docTechnicalInspection"),
    CARTE_GRISE: t("docCarteGrise"),
    VIGNETTE: t("docVignette"),
  };
  const CARGO_LABELS: Record<string, string> = {
    CONTAINER: t("cargoContainer"), EQUIPMENT: t("cargoEquipment"), GOODS: t("cargoGoods"), EMPTY: t("cargoEmpty"),
  };

  const [vehicles, ongoingTrips, allTrips] = await Promise.all([
    prisma.vehicle.findMany({ include: { documents: true, trips: true }, orderBy: { plateNumber: "asc" } }),
    prisma.vehicleTrip.findMany({ where: { status: "ONGOING" }, include: { vehicle: true }, orderBy: { departureTime: "asc" } }),
    prisma.vehicleTrip.findMany({ include: { vehicle: true }, orderBy: { departureTime: "desc" }, take: 60 }),
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
      if (d.expiryDate.getTime() - now <= soon) expiring.push({ plate: v.plateNumber, docType: d.docType, expiry: d.expiryDate, daysLeft });
    }
  }
  expiring.sort((a, b) => a.daysLeft - b.daysLeft);
  const expiredCount = expiring.filter((e) => e.daysLeft < 0).length;

  // --- IN USE ---
  const useRows = ongoingTrips.map((tp) => ({
    id: tp.id, plate: tp.vehicle.plateNumber, driver: tp.driverName,
    cargo: CARGO_LABELS[tp.cargoType] ?? tp.cargoType,
    container: tp.containerNumber ?? tp.cargoDescription ?? "-",
    destination: tp.destination, departure: tp.departureTime, expected: tp.expectedReturn,
  }));
  const useCols: Column<(typeof useRows)[number]>[] = [
    { header: t("plate"), accessor: (r) => <span className="font-medium">{r.plate}</span> },
    { header: t("driver"), accessor: (r) => r.driver },
    { header: t("cargo"), accessor: (r) => <StatusBadge status={r.cargo} /> },
    { header: t("containerEquip"), accessor: (r) => r.container },
    { header: t("destination"), accessor: (r) => r.destination },
    { header: t("departure"), accessor: (r) => formatDateTime(r.departure) },
    { header: t("expectedReturn"), accessor: (r) => (r.expected ? formatDateTime(r.expected) : "-") },
    {
      header: t("action"),
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <a href={`/api/vehicle-trips/${r.id}/pdf`} target="_blank" title={t("printSheet")} className="text-brand-100"><Printer size={15} /></a>
          <RedispatchButton tripId={r.id} />
          <ReturnTripButton tripId={r.id} label={t("returnToPark")} confirmText={t("confirmReturn")} />
        </div>
      ),
    },
  ];

  // --- IN PARK ---
  const parkRows = inPark.map((v) => {
    const nextExpiry = [...v.documents].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0];
    const daysLeft = nextExpiry ? Math.floor((nextExpiry.expiryDate.getTime() - now) / DAY) : null;
    return { id: v.id, plate: v.plateNumber, make: `${v.make ?? ""} ${v.model ?? ""}`.trim() || "-", driver: v.driverName ?? "-", docs: v.documents.length, nextExpiry, daysLeft };
  });
  const parkCols: Column<(typeof parkRows)[number]>[] = [
    { header: t("plate"), accessor: (r) => <span className="font-medium">{r.plate}</span> },
    { header: t("vehicle"), accessor: (r) => r.make },
    { header: t("driver"), accessor: (r) => r.driver },
    { header: t("documents"), accessor: (r) => r.docs },
    {
      header: t("nextExpiry"),
      accessor: (r) => {
        if (!r.nextExpiry || r.daysLeft == null) return "-";
        const label = `${DOC_LABELS[r.nextExpiry.docType] ?? r.nextExpiry.docType} — ${formatDate(r.nextExpiry.expiryDate)}`;
        const cls = r.daysLeft < 0 ? "text-red-600 bg-red-500/10" : r.daysLeft <= 30 ? "text-amber-600 bg-amber-500/10" : "text-fg-subtle";
        return <span className={`text-xs rounded px-1.5 py-0.5 ${cls}`}>{label} {r.daysLeft < 0 ? `(${t("expiredSuffix")})` : `(${r.daysLeft}${t("daysSuffix")})`}</span>;
      },
    },
  ];

  // --- MISSION HISTORY (all trips) ---
  const histCols: Column<(typeof allTrips)[number]>[] = [
    { header: t("tripNo"), accessor: (r) => <span className="font-medium">{r.tripNo}</span> },
    { header: t("plate"), accessor: (r) => r.vehicle.plateNumber },
    { header: t("driver"), accessor: (r) => r.driverName },
    { header: t("cargo"), accessor: (r) => CARGO_LABELS[r.cargoType] ?? r.cargoType },
    { header: t("containerEquip"), accessor: (r) => r.containerNumber ?? "-" },
    { header: t("destination"), accessor: (r) => r.destination },
    { header: t("departure"), accessor: (r) => formatDateTime(r.departureTime) },
    { header: t("returned"), accessor: (r) => (r.returnTime ? formatDateTime(r.returnTime) : "-") },
    { header: t("status"), accessor: (r) => <StatusBadge status={r.status} /> },
    { header: t("action"), accessor: (r) => <a href={`/api/vehicle-trips/${r.id}/pdf`} target="_blank" title={t("printSheet")} className="text-brand-100 inline-flex"><Printer size={15} /></a> },
  ];

  // --- PER-VEHICLE OPERATIONS SUMMARY ---
  const summaryRows = vehicles.map((v) => {
    const trips = v.trips;
    const ongoing = trips.filter((tp) => tp.status === "ONGOING").length;
    const completed = trips.filter((tp) => tp.status === "COMPLETED").length;
    const last = [...trips].sort((a, b) => b.departureTime.getTime() - a.departureTime.getTime())[0];
    const state = v.status === "MAINTENANCE" ? "MAINTENANCE" : v.operationalStatus;
    return { id: v.id, plate: v.plateNumber, state, total: trips.length, ongoing, completed, last: last ? `${last.destination} · ${formatDate(last.departureTime)}` : t("none") };
  });
  const summaryCols: Column<(typeof summaryRows)[number]>[] = [
    { header: t("plate"), accessor: (r) => <span className="font-medium">{r.plate}</span> },
    { header: t("status"), accessor: (r) => <StatusBadge status={r.state} /> },
    { header: t("totalTrips"), accessor: (r) => r.total },
    { header: t("ongoing"), accessor: (r) => r.ongoing },
    { header: t("completed"), accessor: (r) => r.completed },
    { header: t("lastMission"), accessor: (r) => r.last },
  ];

  const dispatchVehicles = inPark.map((v) => ({ id: v.id, label: `${v.plateNumber} — ${`${v.make ?? ""} ${v.model ?? ""}`.trim() || t("vehicle")}`, driver: v.driverName ?? "" }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <a href="/api/reports/export?type=fleet" target="_blank" className="flex items-center gap-1.5 text-sm rounded-lg border border-border-color px-3 py-1.5 hover:bg-surface-alt">
              <FileSpreadsheet size={15} /> {t("exportExcel")}
            </a>
            <FormModal triggerLabel={t("dispatchBtn")} title={t("dispatchTitle")}>
              <DispatchForm vehicles={dispatchVehicles} />
            </FormModal>
            <FormModal triggerLabel={t("newVehicle")} title={t("newVehicle")} triggerClassName="flex items-center gap-1.5 text-sm rounded-lg border border-border-color px-3 py-1.5 hover:bg-surface-alt">
              <VehicleForm />
            </FormModal>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <KPICard title={t("totalVehicles")} value={vehicles.length} icon={Truck} accentIndex={3} />
        <KPICard title={t("inPark")} value={inPark.length} icon={ParkingSquare} accentIndex={5} />
        <KPICard title={t("inUse")} value={inUse.length} icon={Send} accentIndex={0} />
        <KPICard title={t("maintenance")} value={maintenance.length} icon={AlertTriangle} accentIndex={4} />
        <KPICard title={t("docsExpired")} value={expiredCount} icon={ShieldCheck} accentIndex={2} />
      </div>

      {/* Document-renewal alerts now surface in the top-bar notification bell. */}

      {/* IN USE */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <Send size={15} className="text-brand-100" /> {t("onMissionDetail")} ({inUse.length}) — {t("cargoDetails")}
        </h3>
        {useRows.length > 0 ? <DataTable columns={useCols} rows={useRows} /> : <p className="text-sm text-fg-subtle rounded-lg border border-border-color p-4">{t("noMission")}</p>}
      </section>

      {/* IN PARK */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <ParkingSquare size={15} className="text-brand-100" /> {t("inParkTitle")} ({inPark.length})
        </h3>
        <DataTable columns={parkCols} rows={parkRows} />
      </section>

      {/* PER-VEHICLE SUMMARY */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <Truck size={15} className="text-brand-100" /> {t("vehicleSummary")}
        </h3>
        <DataTable columns={summaryCols} rows={summaryRows} />
      </section>

      {/* MISSION HISTORY */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <History size={15} className="text-brand-100" /> {t("missionHistory")}
        </h3>
        {allTrips.length > 0 ? <DataTable columns={histCols} rows={allTrips} /> : <p className="text-sm text-fg-subtle rounded-lg border border-border-color p-4">{t("none")}</p>}
      </section>

      {/* Maintenance */}
      {maintenance.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-fg-muted">{t("maintenanceTitle")} ({maintenance.length})</h3>
          <ul className="text-sm space-y-1">
            {maintenance.map((v) => (
              <li key={v.id} className="rounded-lg border border-border-color px-3 py-2">{v.plateNumber} — {`${v.make ?? ""} ${v.model ?? ""}`.trim()}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
