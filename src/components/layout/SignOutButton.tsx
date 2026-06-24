"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Sign out"
      className="flex items-center justify-center w-8 h-8 rounded-lg text-fg-muted hover:bg-surface-alt hover:text-red-500 transition-colors"
    >
      <LogOut size={16} />
    </button>
  );
}
