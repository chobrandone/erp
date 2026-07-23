import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";
import { MODULE_SLUGS } from "@/lib/modules";

type SessionUser = { id?: string; role?: string };

async function requireAdmin() {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return { admin: false as const, session: null, unauthorized };
  const user = session!.user as SessionUser;
  if (user.role !== "ADMIN") {
    return { admin: false as const, session, unauthorized: NextResponse.json({ error: "Administrator access required." }, { status: 403 }) };
  }
  return { admin: true as const, session, unauthorized: null };
}

export async function GET() {
  const { admin, unauthorized } = await requireAdmin();
  if (!admin) return unauthorized;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, permissions: true, canCreate: true, canEdit: true, canDelete: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const { admin, session, unauthorized } = await requireAdmin();
  if (!admin) return unauthorized;

  const body = await req.json();
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password as string | undefined;
  const role = (body.role ?? "VIEWER").trim();
  const permissions: string[] = Array.isArray(body.permissions)
    ? body.permissions.filter((s: string) => MODULE_SLUGS.includes(s as (typeof MODULE_SLUGS)[number]))
    : [];

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json({ error: "Name, email and a password (min 6 chars) are required." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });

  // Action rights (create / edit / delete). Admins implicitly have all.
  const isAdminRole = role === "ADMIN";
  const canCreate = isAdminRole || body.canCreate !== false;
  const canEdit = isAdminRole || body.canEdit !== false;
  const canDelete = isAdminRole || body.canDelete === true; // default: cannot delete unless granted

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      permissions: role === "ADMIN" ? null : JSON.stringify(permissions),
      canCreate,
      canEdit,
      canDelete,
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, permissions: true, canCreate: true, canEdit: true, canDelete: true, isActive: true },
  });

  await logAudit({ userId: (session!.user as SessionUser).id, action: "USER_CREATE", entity: "User", entityId: user.id, meta: { email, role, permissions, canCreate, canEdit, canDelete } });
  return NextResponse.json({ user });
}
