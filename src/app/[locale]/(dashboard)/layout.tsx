import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

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

  const user = session!.user as { name?: string | null; role?: string };

  return (
    <div className="flex min-h-screen bg-surface-alt">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName={user.name ?? "User"} userRole={user.role ?? "VIEWER"} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
