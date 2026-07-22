"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Plus, X } from "lucide-react";

const CloseCtx = createContext<() => void>(() => {});

/** Forms rendered inside a FormModal call this to close the dialog on success. */
export function useFormModalClose(): () => void {
  return useContext(CloseCtx);
}

/**
 * Renders an "Add / New" button that opens a centered dialog containing the
 * given form. Replaces the old right-hand side panels so forms sit centered.
 */
export function FormModal({
  triggerLabel,
  title,
  children,
  triggerClassName,
  maxWidth = "max-w-2xl",
}: {
  triggerLabel: string;
  title: string;
  children: ReactNode;
  triggerClassName?: string;
  maxWidth?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
        }
      >
        <Plus size={16} /> {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} rounded-xl bg-surface border border-border-color shadow-xl my-8`}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-border-color">
              <span className="font-semibold text-fg">{title}</span>
              <button type="button" onClick={close} className="text-fg-muted hover:text-fg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <CloseCtx.Provider value={close}>{children}</CloseCtx.Provider>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
