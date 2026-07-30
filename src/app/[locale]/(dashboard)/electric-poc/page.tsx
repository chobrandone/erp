import { PageHeader } from "@/components/shared/PageHeader";
import { ElectricContainersLive } from "@/components/electric/ElectricContainersLive";

// Proof-of-concept page for the offline/local-first build. Admin-only.
// Shows the Container table syncing live from Postgres via ElectricSQL.
export default function ElectricPocPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Offline sync — proof of concept"
        subtitle="Live data from ElectricSQL (Neon → Electric → app). Real-time, no refresh."
      />
      <ElectricContainersLive />
    </div>
  );
}
