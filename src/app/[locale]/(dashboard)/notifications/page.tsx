import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { allowedSlugs } from "@/lib/modules";
import { buildNotifications } from "@/lib/notifications";
import { Bell, ChevronRight } from "lucide-react";

export default async function NotificationsPage() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const session = await auth();
  const user = session?.user as { role?: string; permissions?: string[] | null } | undefined;
  const allowed = allowedSlugs({ role: user?.role, permissions: user?.permissions });
  const isAdmin = user?.role === "ADMIN";

  const notifications =
    allowed.includes("fleet-management") || isAdmin
      ? await buildNotifications(locale, { isAdmin })
      : [];

  return (
    <div className="space-y-6">
      <PageHeader title={tc("notifications")} subtitle={`${notifications.length}`} />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-color bg-surface p-12 text-center">
          <Bell size={28} className="text-fg-subtle" />
          <p className="text-sm text-fg-muted">{tc("noNotifications")}</p>
        </div>
      ) : (
        <ul className="rounded-xl border border-border-color bg-surface divide-y divide-border-color overflow-hidden">
          {notifications.map((n) => {
            const inner = (
              <div className="flex items-center gap-3 px-5 py-4">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    n.severity === "danger" ? "bg-red-500" : n.severity === "warning" ? "bg-amber-500" : "bg-brand-100"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{n.title}</p>
                  <p className="text-xs text-fg-muted">{n.detail}</p>
                </div>
                {n.href && <ChevronRight size={16} className="text-fg-subtle shrink-0" />}
              </div>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} className="block hover:bg-surface-alt">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
