"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileStack,
  ClipboardList,
  ClipboardCheck,
  Snowflake,
  AlertTriangle,
  Wrench,
  ClipboardX,
  LogOut,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const ICONS = {
  fileStack: FileStack,
  clipboardList: ClipboardList,
  clipboardCheck: ClipboardCheck,
  snowflake: Snowflake,
  alertTriangle: AlertTriangle,
  wrench: Wrench,
  clipboardX: ClipboardX,
  logOut: LogOut,
} as const;

export type DropdownIcon = keyof typeof ICONS;

export type DropdownMenuItem = {
  label: string;
  href: string;
  icon?: DropdownIcon;
};

export function DropdownMenu({ label, icon, items }: { label: string; icon?: DropdownIcon; items: DropdownMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = icon ? ICONS[icon] : undefined;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 border border-border-color text-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-alt"
      >
        {Icon && <Icon size={16} />}
        {label}
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-64 rounded-lg border border-border-color bg-surface shadow-lg z-20 py-1">
          {items.map((item) => {
            const ItemIcon = item.icon ? ICONS[item.icon] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-surface-alt"
              >
                {ItemIcon && <ItemIcon size={15} className="text-fg-muted" />}
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
