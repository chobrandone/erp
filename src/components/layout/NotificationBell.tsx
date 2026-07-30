"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Bell, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  /** ISO date string, optional */
  when?: string;
  severity: "danger" | "warning" | "info";
  /** Locale-relative path to the item this notification is about, e.g. "/fleet-management" */
  href?: string;
};

const SEEN_KEY = "ns_seen_notifications";
// Stable identity for a notification (index-based ids aren't stable across loads).
const keyOf = (n: AppNotification) => `${n.title}|${n.when ?? ""}`;

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const count = notifications.length;

  // Load which notifications were already viewed (persisted across reloads).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEEN_KEY);
      if (raw) setSeen(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  // Badge reflects only notifications not yet viewed.
  const unseen = notifications.filter((n) => !seen.has(keyOf(n)));
  const badge = unseen.length;
  const hasDanger = unseen.some((n) => n.severity === "danger");

  // Mark everything currently shown as viewed → badge clears until new ones arrive.
  function markSeen() {
    const keys = notifications.map(keyOf);
    setSeen(new Set(keys));
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(keys));
    } catch {}
  }

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) markSeen();
      return next;
    });
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        title={t("notifications")}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-alt text-fg-muted"
      >
        <Bell size={18} />
        {badge > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center ${
              hasDanger ? "bg-red-500" : "bg-amber-500"
            }`}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-border-color bg-surface shadow-xl z-50">
          <div className="px-4 h-11 flex items-center border-b border-border-color">
            <span className="text-sm font-semibold text-fg">{t("notifications")}</span>
            {count > 0 && (
              <span className="ml-auto text-xs text-fg-subtle">{count}</span>
            )}
          </div>
          {count === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-subtle text-center">{t("noNotifications")}</p>
          ) : (
            <ul className="divide-y divide-border-color">
              {notifications.slice(0, 6).map((n) => {
                const dot = (
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      n.severity === "danger" ? "bg-red-500" : n.severity === "warning" ? "bg-amber-500" : "bg-brand-100"
                    }`}
                  />
                );
                const body = (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">{n.title}</p>
                    <p className="text-xs text-fg-muted">{n.detail}</p>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} onClick={() => setOpen(false)} className="px-4 py-3 flex gap-3 hover:bg-surface-alt">
                        {dot}
                        {body}
                      </Link>
                    ) : (
                      <div className="px-4 py-3 flex gap-3">{dot}{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 px-4 h-11 border-t border-border-color text-sm font-medium text-brand-100 hover:bg-surface-alt"
          >
            {t("viewAllNotifications")} <ChevronRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
