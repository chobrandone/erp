"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Plus, X, Pencil } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { inputClass } from "@/components/shared/FormSection";
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "checkbox";
  placeholder?: string;
};

export type DisplayColumnDef = {
  header: string;
  key: string;
  format?: "boolean" | "underscoreToSpace";
};

export function MasterDataPanel<T extends { id: string } & Record<string, unknown>>({
  title,
  apiPath,
  fields,
  columns,
  initialRows,
}: {
  title: string;
  apiPath: string;
  fields: FieldDef[];
  columns: DisplayColumnDef[];
  initialRows: T[];
}) {
  const tc = useTranslations("common");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = () =>
    Object.fromEntries(fields.map((f) => [f.key, f.type === "checkbox" ? false : ""]));

  const [form, setForm] = useState<Record<string, string | boolean>>(emptyForm());

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(row: T) {
    setEditingId(row.id);
    setForm(Object.fromEntries(fields.map((f) => [f.key, (row[f.key] as string | boolean) ?? (f.type === "checkbox" ? false : "")])));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `${apiPath}/${editingId}` : apiPath;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        closeForm();
        setForm(emptyForm());
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-color bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <button
          onClick={() => (showForm ? closeForm() : openCreate())}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-100 hover:text-brand-200"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? tc("cancel") : tc("createNew")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 rounded-lg bg-surface-alt border border-border-color"
        >
          {fields.map((f) => (
            <div key={f.key} className={f.type === "checkbox" ? "flex items-center gap-2 pt-5" : ""}>
              {f.type !== "checkbox" && (
                <label className="block text-xs font-medium text-fg-muted mb-1.5">{f.label}</label>
              )}
              {f.type === "checkbox" ? (
                <>
                  <input
                    type="checkbox"
                    checked={form[f.key] as boolean}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                  />
                  <span className="text-sm text-fg">{f.label}</span>
                </>
              ) : (
                <input
                  type={f.type ?? "text"}
                  className={inputClass}
                  placeholder={f.placeholder}
                  value={form[f.key] as string}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {submitting ? tc("loading") : tc("save")}
            </button>
          </div>
        </form>
      )}

      <DataTable
        columns={[
          ...columns.map<Column<T>>((col) => ({
            header: col.header,
            accessor: (row) => {
              const value = row[col.key];
              if (col.format === "boolean") return value ? "Yes" : "No";
              if (col.format === "underscoreToSpace" && typeof value === "string")
                return value.replace(/_/g, " ");
              if (value == null || value === "") return "-";
              return String(value);
            },
          })),
          {
            header: tc("actions"),
            accessor: (row) => (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEdit(row)}
                  className="flex items-center gap-1 text-fg-muted hover:text-fg"
                  title={tc("save")}
                >
                  <Pencil size={14} />
                </button>
                <ConfirmDeleteButton apiPath={`${apiPath}/${row.id}`} />
              </div>
            ),
          },
        ]}
        rows={initialRows}
      />
    </div>
  );
}
