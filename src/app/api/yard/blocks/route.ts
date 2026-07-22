import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { logAudit } from "@/lib/audit";

type SessionUser = { id?: string; role?: string };

const pad = (n: number) => String(n).padStart(2, "0");

// Create a new yard block (admin only). Generates rows × bays × tiers positions.
export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;
  const user = session!.user as SessionUser;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an administrator can add a yard block." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const block = String(body.block ?? "").trim().toUpperCase();
  const rows = Math.max(1, Math.min(50, Number(body.rows) || 0));
  const bays = Math.max(1, Math.min(50, Number(body.bays) || 0));
  const tiers = Math.max(1, Math.min(40, Number(body.tiers) || 0));
  const isReefer = Boolean(body.isReefer);

  if (!block || !/^[A-Z0-9-]{1,10}$/.test(block)) {
    return NextResponse.json({ error: "Block name must be 1–10 letters/digits." }, { status: 400 });
  }
  if (!rows || !bays || !tiers) {
    return NextResponse.json({ error: "Rows, bays and tiers must all be at least 1." }, { status: 400 });
  }

  const existing = await prisma.location.count({ where: { block } });
  if (existing > 0) {
    return NextResponse.json({ error: `Block ${block} already exists.` }, { status: 409 });
  }

  const data: { block: string; row: string; bay: string; tier: number; code: string; isReeferSlot: boolean; maxStack: number }[] = [];
  for (let r = 1; r <= rows; r++)
    for (let b = 1; b <= bays; b++)
      for (let ti = 1; ti <= tiers; ti++)
        data.push({ block, row: pad(r), bay: pad(b), tier: ti, code: `${block}-${pad(r)}-${pad(b)}-${ti}`, isReeferSlot: isReefer, maxStack: tiers });

  await prisma.location.createMany({ data, skipDuplicates: true });
  await logAudit({ userId: user.id, action: "YARD_BLOCK_CREATE", entity: "Location", entityId: block, meta: { block, rows, bays, tiers, isReefer, positions: rows * bays } });

  return NextResponse.json({ ok: true, block, positions: rows * bays, slots: data.length });
}
