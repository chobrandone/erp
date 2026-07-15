import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VehicleForm } from "@/components/fleet/VehicleForm";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Truck, AlertTriangle, ShieldCheck } from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  DRIVER_LICENSE: "Permis de conduire",
  INSURANCE: "Assurance",
  TECHNICAL_INSPECTION: "Visite technique",
  CARTE_GRISE: "Carte grise",
  VIGNETTE: "Vignette",
};

const DAY = 86400000;

export default async function FleetManagementPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: { documents: true },
    orderBy: { plateNumber: "asc" },
  });

  const now = Date.now();
  const soon = 30 * DAY;

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

  const rows = vehicles.map((v) => {
    const nextExpiry = [...v.documents].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0];
    const daysLeft = nextExpiry ? Math.floor((nextExpiry.expiryDate.getTime() - now) / DAY) : null;
    return { id: v.id, plate: v.plateNumber, make: `${v.make ?? ""} ${v.model ?? ""}`.trim() || "-", driver: v.driverName ?? "-", status: v.status, docs: v.documents.length, nextExpiry, daysLeft };
  });

  const cols: Column<(typeof rows)[number]>[] = [
    { header: "Immatriculation", accessor: (r) => <span className="font-medium">{r.plate}</span> },
    { header: "Véhicule", accessor: (r) => r.make },
    { header: "Chauffeur", accessor: (r) => r.driver },
    { header: "Statut", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Documents", accessor: (r) => r.docs },
    {
      header: "Prochaine échéance",
      accessor: (r) => {
        if (!r.nextExpiry || r.daysLeft == null) return "-";
        const label = `${DOC_LABELS[r.nextExpiry.docType] ?? r.nextExpiry.docType} — ${formatDate(r.nextExpiry.expiryDate)}`;
        const cls =
          r.daysLeft < 0 ? "text-red-600 bg-red-500/10" : r.daysLeft <= 30 ? "text-amber-600 bg-amber-500/10" : "text-fg-subtle";
        return <span className={`text-xs rounded px-1.5 py-0.5 ${cls}`}>{label} {r.daysLeft < 0 ? "(expiré)" : `(${r.daysLeft}j)`}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion de la Flotte" subtitle="Véhicules, chauffeurs et échéances des documents" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Véhicules" value={vehicles.length} icon={Truck} accentIndex={3} />
        <KPICard title="Documents à renouveler (30j)" value={expiring.length} icon={AlertTriangle} accentIndex={1} />
        <KPICard title="Documents expirés" value={expiredCount} icon={ShieldCheck} accentIndex={2} />
      </div>

      {expiring.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Alertes — documents à renouveler
          </h3>
          <ul className="space-y-1.5">
            {expiring.slice(0, 12).map((e, i) => (
              <li key={i} className="text-sm flex items-center justify-between">
                <span>
                  <span className="font-medium">{e.plate}</span> — {DOC_LABELS[e.docType] ?? e.docType}
                </span>
                <span className={e.daysLeft < 0 ? "text-red-600 font-medium" : "text-amber-600"}>
                  {e.daysLeft < 0 ? `Expiré depuis ${Math.abs(e.daysLeft)}j` : `Expire dans ${e.daysLeft}j`} · {formatDate(e.expiry)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DataTable columns={cols} rows={rows} />
        </div>
        <div className="rounded-xl border border-border-color bg-surface p-5">
          <VehicleForm />
        </div>
      </div>
    </div>
  );
}
