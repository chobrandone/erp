import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

// Resolve a shipping line to an id for forms that let the user pick an existing
// one or type a new one. Finds-or-creates by name so new lines are saved and
// appear in every dropdown afterwards. Returns { id }.
export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  if (body.id) return NextResponse.json({ id: body.id });

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Shipping line name is required." }, { status: 400 });

  const existing = await prisma.shippingLine.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) return NextResponse.json({ id: existing.id });

  const count = await prisma.shippingLine.count();
  const base = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "SL";
  const created = await prisma.shippingLine.create({
    data: { code: body.code || `${base}-${count + 1}`, name },
  });
  return NextResponse.json({ id: created.id });
}
