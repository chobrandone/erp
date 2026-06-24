import { ReactNode } from "react";

export function FormSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-color bg-surface p-5">
      {title && (
        <h3 className="text-sm font-semibold text-fg mb-4 uppercase tracking-wide text-fg-muted">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function FormField({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-fg-muted mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border-color bg-surface-alt px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-200 transition-colors";
