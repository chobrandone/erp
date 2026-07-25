"use client";

import { inputClass } from "@/components/shared/FormSection";

// Default acconiers (stevedores) — the operator can pick one or type a new name.
export const DEFAULT_ACCONIERS = ["RTC", "APM", "KCT", "PAK", "SUPERMARITIME"];

/**
 * Acconier field: a text input backed by a datalist so the common acconiers are
 * offered as suggestions while a new one can still be typed in freely.
 */
export function AcconierInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <input
        className={inputClass}
        list="acconier-options"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="RTC / APM / KCT…"
      />
      <datalist id="acconier-options">
        {DEFAULT_ACCONIERS.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
    </>
  );
}
