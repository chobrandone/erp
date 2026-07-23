import { PageHeader } from "@/components/shared/PageHeader";
import { UserManager } from "@/components/admin/UserManager";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { MODULES, parsePermissions } from "@/lib/modules";

export default async function UserManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect({ href: "/", locale });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, permissions: true, canCreate: true, canEdit: true, canDelete: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const initialUsers = users.map((u) => ({ ...u, permissions: parsePermissions(u.permissions) }));
  const modules = MODULES.map((m) => ({ key: m.key, slug: m.slug }));

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Create users and control which sections each one can access" />
      <UserManager initialUsers={initialUsers} modules={modules} />
    </div>
  );
}
