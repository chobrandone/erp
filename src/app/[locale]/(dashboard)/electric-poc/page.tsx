import { PageHeader } from "@/components/shared/PageHeader";
import { ElectricContainersLive } from "@/components/electric/ElectricContainersLive";
import { LocalContainersLive } from "@/components/electric/LocalContainersLive";

// Proof-of-concept page for the offline/local-first build. Admin-only.
export default function ElectricPocPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Offline sync — proof of concept"
        subtitle="Neon → Electric → app. Live streaming, plus an on-device local database."
      />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted">Increment 1 — on-device local database (offline-capable)</h3>
        <LocalContainersLive />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-fg-muted">Read POC — live stream (online only)</h3>
        <ElectricContainersLive />
      </section>
    </div>
  );
}
