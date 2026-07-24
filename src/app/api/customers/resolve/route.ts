import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

// Resolve a customer to an id for forms that let the user pick an existing
// customer or type a new one. Finds-or-creates by name so new customers are
// saved and appear in every dropdown afterwards. Returns { id }.
export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  if (body.id) return NextResponse.json({ id: body.id });

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });

  const existing = await prisma.customer.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) return NextResponse.json({ id: existing.id });

  const count = await prisma.customer.count();
  const created = await prisma.customer.create({
    data: { code: body.code || `CUST-${String(count + 1).padStart(3, "0")}`, name },
  });
  return NextResponse.json({ id: created.id });
}
