"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormField, inputClass } from "@/components/shared/FormSection";

export type Option = { id: string; label: string };

export type ContainerPickerValue = {
  mode: "existing" | "new";
  containerId: string;
  containerNumber: string;
  containerTypeId: string;
};

export function initialContainerValue(containers: Option[], containerTypes: Option[]): ContainerPickerValue {
  return {
    mode: containers.length > 0 ? "existing" : "new",
    containerId: containers[0]?.id ?? "",
    containerNumber: "",
    containerTypeId: containerTypes[0]?.id ?? "",
  };
}

/**
 * Resolve the picker selection to a container id, creating the container from a
 * typed-in number + ISO type when needed. Returns the id or throws with a
 * user-facing message.
 */
export async function resolveContainerId(value: ContainerPickerValue): Promise<string> {
  if (value.mode === "existing") {
    if (!value.containerId) throw new Error("Select a container.");
    return value.containerId;
  }
  const res = await fetch("/api/containers/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ containerNumber: value.containerNumber, containerTypeId: value.containerTypeId }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Could not resolve the container.");
  return data.containerId as string;
}

/**
 * Container selector that lets the user pick from the existing list OR type a
 * new container number and choose its ISO/type. Fully controlled.
 */
export function ContainerPicker({
  containers,
  containerTypes,
  value,
  onChange,
  label,
}: {
  containers: Option[];
  containerTypes: Option[];
  value: ContainerPickerValue;
  onChange: (v: ContainerPickerValue) => void;
  label?: string;
}) {
  const t = useTranslations("common");
  const set = (patch: Partial<ContainerPickerValue>) => onChange({ ...value, ...patch });

  return (
    <FormField label={label ?? t("containerNumber")} full>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={value.mode === "existing"}
            onChange={() => set({ mode: "existing" })}
            disabled={containers.length === 0}
          />
          {t("selectExistingContainer")}
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={value.mode === "new"} onChange={() => set({ mode: "new" })} />
          {t("enterNewContainer")}
        </label>
      </div>
      {value.mode === "existing" ? (
        <select className={inputClass} value={value.containerId} onChange={(e) => set({ containerId: e.target.value })}>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className={inputClass}
            value={value.containerNumber}
            onChange={(e) => set({ containerNumber: e.target.value.toUpperCase() })}
            placeholder="MSCU1234567"
          />
          <select className={inputClass} value={value.containerTypeId} onChange={(e) => set({ containerTypeId: e.target.value })}>
            {containerTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </FormField>
  );
}
