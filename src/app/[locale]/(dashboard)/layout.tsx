import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { allowedSlugs, canAccessPath } from "@/lib/modules";
import { backgroundForNow } from "@/lib/backgrounds";
import { buildNotifications } from "@/lib/notifications";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const user = session!.user as { name?: string | null; role?: string; permissions?: string[] | null };
  const access = { role: user.role, permissions: user.permissions };

  // Enforce per-module access based on the requested path (set by middleware).
  const rawPath = (await headers()).get("x-pathname") ?? "";
  const pathAfterLocale = rawPath.replace(/^\/(en|fr)(?=\/|$)/, "");
  if (pathAfterLocale && !canAccessPath(access, pathAfterLocale)) {
    redirect({ href: "/", locale });
  }

  const allowed = allowedSlugs(access);
  const bg = backgroundForNow();
  // Fleet document-renewal alerts (+ waiver requests for admins), surfaced in the bell.
  const isAdmin = user.role === "ADMIN";
  const notifications =
    allowed.includes("fleet-management") || isAdmin
      ? await buildNotifications(locale, { isAdmin })
      : [];

  return (
    <div className="relative flex min-h-screen">
      {bg ? (
        <>
          {/* Rotating wallpaper (changes every two weeks) */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${bg}")` }}
          />
          {/* Readability scrim — keeps text legible while letting the image show through */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 bg-surface-alt/70 dark:bg-surface-alt/78"
          />
          {/* Soft brand-tinted depth gradient */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-brand-100/[0.06] via-transparent to-brand-500/[0.08]"
          />
        </>
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-surface-alt" />
      )}
      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar role={user.role} allowed={allowed} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar userName={user.name ?? "User"} userRole={user.role ?? "VIEWER"} notifications={notifications} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
