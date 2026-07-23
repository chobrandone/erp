import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export type ActionRight = "create" | "edit" | "delete";

type RightsUser = {
  id?: string;
  role?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

/** Whether a user may perform an action. Admins always may. */
export function hasRight(user: RightsUser, action: ActionRight): boolean {
  if (user.role === "ADMIN") return true;
  if (action === "create") return user.canCreate !== false;
  if (action === "edit") return user.canEdit !== false;
  return user.canDelete !== false;
}

/**
 * Guard an API mutation by the user's action right (create / edit / delete).
 * Returns the session when allowed, or a ready-to-return error response.
 */
export async function requireRight(action: ActionRight) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return { session: null, forbidden: unauthorized };
  const user = session!.user as RightsUser;
  if (!hasRight(user, action)) {
    return {
      session: null,
      forbidden: NextResponse.json(
        { error: `You do not have permission to ${action} records.` },
        { status: 403 },
      ),
    };
  }
  return { session, forbidden: null };
}
