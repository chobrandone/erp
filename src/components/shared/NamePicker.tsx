"use client";

import { useTranslations } from "next-intl";
import { FormField, inputClass } from "@/components/shared/FormSection";

export type Option = { id: string; label: string };

export type NamePickerValue = {
  mode: "existing" | "new";
  id: string;
  name: string;
};

export function initialNameValue(): NamePickerValue {
  return { mode: "existing", id: "", name: "" };
}

/**
 * Resolve the picker selection to an id. For "new", posts the typed name to the
 * given find-or-create endpoint (e.g. /api/customers/resolve) so the record is
 * saved and becomes available in future dropdowns. Returns null when empty.
 */
export async function resolveNameId(value: NamePickerValue, endpoint: string): Promise<string | null> {
  if (value.mode === "existing") return value.id || null;
  const name = value.name.trim();
  if (!name) return null;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Could not save the entry.");
  return data.id as string;
}

/**
 * Pick an existing record from a dropdown OR type a new name to create one.
 * Used for fields like Customer / Shipping line where new entries appear over
 * time. The parent resolves `mode === "new"` by sending `name` to the API,
 * which finds-or-creates the record.
 */
export function NamePicker({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: Option[];
  value: NamePickerValue;
  onChange: (v: NamePickerValue) => void;
  placeholder?: string;
}) {
  const tc = useTranslations("common");
  const set = (patch: Partial<NamePickerValue>) => onChange({ ...value, ...patch });

  return (
    <FormField label={label}>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={value.mode === "existing"} onChange={() => set({ mode: "existing" })} />
          {tc("selectExisting")}
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={value.mode === "new"} onChange={() => set({ mode: "new" })} />
          {tc("addNew")}
        </label>
      </div>
      {value.mode === "existing" ? (
        <select className={inputClass} value={value.id} onChange={(e) => set({ id: e.target.value })}>
          <option value="">-</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={inputClass}
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
}
