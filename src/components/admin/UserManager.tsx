"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormSection, FormField, inputClass } from "@/components/shared/FormSection";
import { UserPlus, Pencil, Power, ShieldCheck, X, Check } from "lucide-react";

type ModuleOpt = { key: string; slug: string };
type UserRow = {
  id: string; name: string; email: string; role: string;
  permissions: string[] | null; isActive: boolean;
  canCreate: boolean; canEdit: boolean; canDelete: boolean;
};

const ROLES = ["ADMIN", "FINANCE", "GATE_CLERK", "YARD_PLANNER", "PTI_INSPECTOR", "REEFER_TECHNICIAN", "VIEWER"];

export function UserManager({ initialUsers, modules }: { initialUsers: UserRow[]; modules: ModuleOpt[] }) {
  const tn = useTranslations("nav");
  const router = useRouter();
  const [users] = useState(initialUsers);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setCreating(true); setEditing(null); }} className="flex items-center gap-2 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg">
          <UserPlus size={16} /> New user
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-color">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-fg-muted">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold">Name</th>
              <th className="text-left px-4 py-2.5 font-semibold">Email</th>
              <th className="text-left px-4 py-2.5 font-semibold">Role</th>
              <th className="text-left px-4 py-2.5 font-semibold">Access</th>
              <th className="text-left px-4 py-2.5 font-semibold">Rights</th>
              <th className="text-left px-4 py-2.5 font-semibold">Active</th>
              <th className="text-right px-4 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border-color">
                <td className="px-4 py-2.5 font-medium">{u.name}</td>
                <td className="px-4 py-2.5 text-fg-muted">{u.email}</td>
                <td className="px-4 py-2.5">{u.role}</td>
                <td className="px-4 py-2.5 text-xs text-fg-muted">
                  {u.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 text-brand-100"><ShieldCheck size={13} /> All sections</span>
                  ) : u.permissions == null ? (
                    "All (unset)"
                  ) : u.permissions.length === 0 ? (
                    "None"
                  ) : (
                    `${u.permissions.length} section(s)`
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  {u.role === "ADMIN" ? (
                    <span className="text-brand-100">All</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {u.canCreate && <span className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5">Create</span>}
                      {u.canEdit && <span className="rounded bg-blue-500/10 text-blue-600 px-1.5 py-0.5">Edit</span>}
                      {u.canDelete && <span className="rounded bg-red-500/10 text-red-600 px-1.5 py-0.5">Delete</span>}
                      {!u.canCreate && !u.canEdit && !u.canDelete && <span className="text-fg-subtle">Read only</span>}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">{u.isActive ? <Check size={15} className="text-green-600" /> : <X size={15} className="text-red-500" />}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => { setEditing(u); setCreating(false); }} className="text-fg-muted hover:text-brand-100" title="Edit"><Pencil size={15} /></button>
                    <DeactivateButton id={u.id} active={u.isActive} onDone={() => router.refresh()} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <UserForm
          modules={modules}
          tn={tn}
          user={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function DeactivateButton({ id, active, onDone }: { id: string; active: boolean; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    try {
      if (active) {
        if (!confirm("Deactivate this user? They will no longer be able to log in.")) return;
        await fetch(`/api/users/${id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: true }) });
      }
      onDone();
    } finally { setBusy(false); }
  }
  return (
    <button onClick={toggle} disabled={busy} title={active ? "Deactivate" : "Reactivate"} className={active ? "text-fg-muted hover:text-red-500" : "text-green-600"}>
      <Power size={15} />
    </button>
  );
}

function UserForm({
  modules, tn, user, onClose, onSaved,
}: {
  modules: ModuleOpt[];
  tn: (k: string) => string;
  user: UserRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role ?? "VIEWER");
  const [perms, setPerms] = useState<string[]>(user?.permissions ?? []);
  const [canCreate, setCanCreate] = useState(user?.canCreate ?? true);
  const [canEdit, setCanEdit] = useState(user?.canEdit ?? true);
  const [canDelete, setCanDelete] = useState(user?.canDelete ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (slug: string) => setPerms((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));
  const allOn = perms.length === modules.length;
  const toggleAll = () => setPerms(allOn ? [] : modules.map((m) => m.slug));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { name, role, permissions: perms, canCreate, canEdit, canDelete };
      if (!isEdit) { payload.email = email; payload.password = password; }
      else if (password) payload.password = password;
      const res = await fetch(isEdit ? `/api/users/${user!.id}` : "/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) onSaved();
      else setError((await res.json().catch(() => null))?.error ?? "Save failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => !busy && onClose()}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-2xl rounded-xl bg-surface border border-border-color p-5 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-fg">{isEdit ? `Edit — ${user!.name}` : "Create new user"}</h3>
          <button type="button" onClick={onClose} className="text-fg-muted"><X size={18} /></button>
        </div>

        <FormSection title="Account">
          <FormField label="Full name"><input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></FormField>
          <FormField label="Email">
            <input required type="email" disabled={isEdit} className={inputClass + (isEdit ? " opacity-60" : "")} value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label={isEdit ? "New password (leave blank to keep)" : "Password (min 6)"}>
            <input type="password" required={!isEdit} className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <FormField label="Role">
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
        </FormSection>

        {role === "ADMIN" ? (
          <div className="rounded-lg border border-brand-100/40 bg-brand-100/5 p-3 text-sm text-brand-100 flex items-center gap-2">
            <ShieldCheck size={16} /> Administrators have full access to every section and all rights.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-fg-muted">Sections this user can access</h4>
                <button type="button" onClick={toggleAll} className="text-xs text-brand-100 hover:underline">{allOn ? "Clear all" : "Select all"}</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {modules.map((m) => (
                  <label key={m.slug} className="flex items-center gap-2 text-sm rounded-lg border border-border-color px-3 py-2 cursor-pointer hover:bg-surface-alt">
                    <input type="checkbox" checked={perms.includes(m.slug)} onChange={() => toggle(m.slug)} />
                    <span className="truncate">{tn(m.key)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-fg-muted">What this user can do</h4>
              <p className="text-xs text-fg-subtle">Read access comes with the sections above. Grant only what this user should be able to change — e.g. leave “Delete” off so they can create but not delete.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 text-sm rounded-lg border border-border-color px-3 py-2 cursor-pointer hover:bg-surface-alt">
                  <input type="checkbox" checked={canCreate} onChange={(e) => setCanCreate(e.target.checked)} />
                  <span>Create records</span>
                </label>
                <label className="flex items-center gap-2 text-sm rounded-lg border border-border-color px-3 py-2 cursor-pointer hover:bg-surface-alt">
                  <input type="checkbox" checked={canEdit} onChange={(e) => setCanEdit(e.target.checked)} />
                  <span>Edit records</span>
                </label>
                <label className="flex items-center gap-2 text-sm rounded-lg border border-border-color px-3 py-2 cursor-pointer hover:bg-surface-alt">
                  <input type="checkbox" checked={canDelete} onChange={(e) => setCanDelete(e.target.checked)} />
                  <span>Delete records</span>
                </label>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg border border-border-color">Cancel</button>
          <button type="submit" disabled={busy} className="brand-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60">
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}
