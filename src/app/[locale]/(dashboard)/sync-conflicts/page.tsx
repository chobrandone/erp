import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConflictReview } from "@/components/sync/ConflictReview";
import { auth } from "@/auth";

// Admin-only: review and resolve offline sync conflicts.
export default async function SyncConflictsPage() {
  const session = await auth();
  const locale = await getLocale();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sync conflicts"
        subtitle="Offline edits that clashed with a newer server value — nothing is overwritten until you choose."
      />
      <ConflictReview />
    </div>
  );
}
