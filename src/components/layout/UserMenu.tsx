import { UserCircle } from "lucide-react";

export function UserMenu() {
  return (
    <div className="flex items-center gap-2 pl-3 border-l border-border-color">
      <div className="flex items-center justify-center w-8 h-8 rounded-full brand-gradient text-white">
        <UserCircle size={18} />
      </div>
      <div className="hidden md:flex flex-col leading-tight">
        <span className="text-sm font-medium text-fg">Admin User</span>
        <span className="text-xs text-fg-subtle">Administrator</span>
      </div>
    </div>
  );
}
