# Offline sync — conflict rules (for approval)

How data behaves when several machines edit **while offline** and then sync.
This governs the local-first build (ElectricSQL). Please approve or adjust.

## The core model
- Every record already has a **globally-unique id** (`cuid`) — so two machines
  creating records offline never collide.
- We add an **`updatedAt`** timestamp to every table (Phase 1 migration).
- **Reads** sync via Electric (done ✅). **Writes** happen locally first, are
  **queued**, and replayed to the server when back online; the server applies the
  rules below, writes to Postgres, and Electric syncs the result back to everyone.

---

## Rules by data type

### 1) Operational records → **LAST-EDIT-WINS**
Gate transactions, movements, PTI, reefer logs, damage surveys, repairs,
inventory, container status, vehicles/trips/documents.
- **New records:** always kept — two clerks doing Gate-Ins offline both sync fine.
- **Same record edited on two machines:** the edit with the **later `updatedAt`
  wins**; the older version is **saved to the conflict log** (never silently lost).
- *Why:* high-volume, low-dispute data — simple and predictable.

### 2) Financial records → **PROTECTED (no silent overwrite)**
Invoices, invoice lines, waivers, billing rates.
- **New invoices:** fine offline (unique ids).
- **Same invoice edited on two machines:** **not** auto-merged — both versions are
  kept and **flagged for admin review**. Corrections use **void + reissue**, never a
  destructive overwrite.
- **Waivers** stay **admin-authorized** and are applied server-side on sync.
- *Why:* protect money — never lose or silently change a financial figure.

### 3) Master / reference data → **LAST-EDIT-WINS + DEDUPE**
Customers, shipping lines, container types, locations, equipment.
- **Edits:** last-edit-wins.
- **Creates deduped by natural key:** customer/line by **name** (case-insensitive),
  container type by **code**. If two machines add "MAERSK" offline, they **merge into
  one** on sync — no duplicates. (We already dedupe server-side; this extends it.)

### 4) Deletes → **SOFT-DELETE (tombstones)**
- A delete becomes "mark `deletedAt`" so the deletion **syncs** to other machines.
- **Delete vs. concurrent edit:** operational/master data → **delete wins** (edit
  logged). Financial data → **no delete, void only**.

### 5) Document numbers → **PROVISIONAL, finalized on sync** ⚠️ (important)
Sequential numbers are assigned **server-side in order**: `EIR-IN-000123`,
`FAC-2026-000045`, `RO-2026-000012`, `TRIP-…`, `PTI-REQ-…`. Two offline machines
would otherwise generate the **same number** → collision.
- **Solution:** offline records get a **provisional number** (e.g.
  `TEMP-<device>-<n>`), shown as *"provisional — final number assigned on sync."*
  On sync, the **server assigns the real sequential number**.
- *Why:* guarantees no duplicate official numbers and a clean sequence.

---

## Conflict review
An admin-only **"Sync conflicts"** page lists anything flagged (mainly financial
edits and delete-vs-edit). The admin picks the correct version. **Nothing is ever
silently lost.**

---

## What I need you to approve
1. **Operational = last-edit-wins** (older version logged). ✅ / change?
2. **Financial = protected** — flag for review, void/reissue, no overwrite. ✅ / change?
3. **Document numbers provisional offline, finalized on sync.** ✅ / change?
4. **Soft-delete (tombstones); financial = void only.** ✅ / change?

Once approved, **Phase 2** starts, scoped to **Gate Operations** first:
(a) the `updatedAt` migration, (b) local store + offline write queue,
(c) apply these rules on replay, (d) the conflict-review page.
