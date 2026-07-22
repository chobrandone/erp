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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, session, unauthorized } = await requireAdmin();
  if (!admin) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.role !== undefined) data.role = String(body.role).trim();
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (body.permissions !== undefined) {
    const perms: string[] = Array.isArray(body.permissions)
      ? body.permissions.filter((s: string) => MODULE_SLUGS.includes(s as (typeof MODULE_SLUGS)[number]))
      : [];
    data.permissions = (data.role ?? target.role) === "ADMIN" ? null : JSON.stringify(perms);
  }
  if (body.password) {
    if (String(body.password).length < 6) return NextResponse.json({ error: "Password too short (min 6)." }, { status: 400 });
    data.passwordHash = await bcrypt.hash(String(body.password), 10);
  }
  // If promoting to ADMIN, clear the (now-irrelevant) permission list.
  if (data.role === "ADMIN") data.permissions = null;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, permissions: true, isActive: true },
  });

  await logAudit({ userId: (session!.user as SessionUser).id, action: "USER_UPDATE", entity: "User", entityId: id, meta: { changed: Object.keys(data) } });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, session, unauthorized } = await requireAdmin();
  if (!admin) return unauthorized;

  const { id } = await params;
  const me = (session!.user as SessionUser).id;
  if (id === me) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Deactivate rather than hard-delete to preserve audit references.
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  await logAudit({ userId: me, action: "USER_DEACTIVATE", entity: "User", entityId: id, meta: { email: target.email } });
  return NextResponse.json({ success: true });
}
