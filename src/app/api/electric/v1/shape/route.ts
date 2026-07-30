import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

// Secure proxy to ElectricSQL Cloud. The browser/desktop client talks to THIS
// route (same-origin), and we attach the Electric source_id + secret here so the
// credentials never leave the server. This is Electric's recommended pattern.
//
// Requires env vars:
//   ELECTRIC_SOURCE_ID  — e.g. svc-vivacious-kiwi-rpezjq88g9
//   ELECTRIC_SECRET     — the (rotated) source secret
const ELECTRIC_ORIGIN = "https://api.electric-sql.cloud/v1/shape";

// Electric long-polls for live updates; allow the function to run longer (Pro).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Only signed-in users can pull synced data through the proxy.
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const sourceId = process.env.ELECTRIC_SOURCE_ID;
  const secret = process.env.ELECTRIC_SECRET;
  if (!sourceId || !secret) {
    return new Response(JSON.stringify({ error: "Electric sync is not configured on the server." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  // Forward the Electric protocol params the client sends (table, offset, handle,
  // live, cursor, columns, where, …), then inject the credentials.
  const incoming = new URL(req.url);
  const origin = new URL(ELECTRIC_ORIGIN);
  incoming.searchParams.forEach((value, key) => {
    if (key !== "source_id" && key !== "secret") origin.searchParams.set(key, value);
  });
  origin.searchParams.set("source_id", sourceId);
  origin.searchParams.set("secret", secret);

  const upstream = await fetch(origin, {
    headers: { "accept-encoding": "identity" },
    // Electric long-polls for live updates; let it stream through.
    cache: "no-store",
  });

  // Pass the response (and Electric's sync headers) straight back to the client.
  // Strip hop-by-hop/encoding headers that would confuse the browser.
  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return new Response(upstream.body, { status: upstream.status, headers });
}
