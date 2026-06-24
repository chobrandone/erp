import { UserCircle } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  GATE_CLERK: "Gate Clerk",
  YARD_PLANNER: "Yard Planner",
  PTI_INSPECTOR: "PTI Inspector",
  REEFER_TECHNICIAN: "Reefer Technician",
  FINANCE: "Finance",
  VIEWER: "Viewer",
};

export function UserMenu({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <div className="flex items-center gap-2 pl-3 border-l border-border-color">
      <div className="flex items-center justify-center w-8 h-8 rounded-full brand-gradient text-white">
        <UserCircle size={18} />
      </div>
      <div className="hidden md:flex flex-col leading-tight">
        <span className="text-sm font-medium text-fg">{userName}</span>
        <span className="text-xs text-fg-subtle">{ROLE_LABELS[userRole] ?? userRole}</span>
      </div>
      <SignOutButton />
    </div>
  );
}
