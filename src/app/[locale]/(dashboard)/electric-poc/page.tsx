import { PageHeader } from "@/components/shared/PageHeader";
import { ElectricContainersLive } from "@/components/electric/ElectricContainersLive";
import { LocalContainersLive } from "@/components/electric/LocalContainersLive";
import { OfflineGateIn } from "@/components/electric/OfflineGateIn";

// Proof-of-concept page for the offline/local-first build. Admin-only.
export default function ElectricPocPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Offline sync — proof of concept"
        subtitle="Neon → Electric → app. Live streaming, plus an on-device local database."
      />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted">Increment 3 — offline Gate In (create → provisional number → synced)</h3>
        <OfflineGateIn />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted">Increment 1 &amp; 2 — on-device database, offline read + edit</h3>
        <LocalContainersLive />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted">Read POC — live stream (online only)</h3>
        <ElectricContainersLive />
      </section>
    </div>
  );
}
