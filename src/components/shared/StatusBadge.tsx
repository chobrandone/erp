import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  GOOD: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  DAMAGED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  EMPTY: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  FULL: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  PASSED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  PASS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  FAIL: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  GATE_IN: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  GATE_OUT: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  // Reefer power status
  CONNECTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  NOT_CONNECTED: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  IN_REPAIRS: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  OPERATIONAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  FAULT: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  ALARM: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  NORMAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status] ?? "bg-surface-alt text-fg-muted"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
