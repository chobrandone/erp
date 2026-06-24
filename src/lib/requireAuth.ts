import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, unauthorized: null };
}
