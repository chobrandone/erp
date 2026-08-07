# Negoce Services — Offline / Local-First System Guide

This guide explains the offline capability end to end: what it does, how staff use
it, how to test it, and how it is built. It is written for the business owner and
yard supervisors, with a technical section at the end for developers.

---

## 1. What "offline" means here

The ERP normally talks to the cloud database (Neon) through the website. If the
internet at the depot goes down, staff would normally be stuck. The offline system
removes that dependency for the busiest, most time-critical operation — **the gate**.

- Each PC keeps its **own copy of the data on the machine** (in the browser / the
  desktop app). This copy is kept up to date automatically while online.
- When the connection drops, staff can **still record Gate In and Gate Out moves**.
  These are saved on the device.
- When the connection comes back, everything **syncs automatically** to the cloud
  database and receives its real document numbers (EIR / Release Order).
- If two people edited the same thing while disconnected, nothing is silently
  overwritten — the clash is sent to a **Sync Conflicts** review page for an admin
  to resolve.

> The model is **"every PC independent"**: there is no on-site server to maintain.
> Each machine syncs directly with the cloud when it has a connection.

---

## 2. What works offline today

| Capability | Offline? | Notes |
|---|---|---|
| View containers & container types | ✅ | Read from the on-device copy. |
| Edit a container's status | ✅ | Queued and synced; last edit wins. |
| **Gate In** (new container arriving) | ✅ | Provisional number on device → real EIR on sync. |
| **Gate Out** (container leaving) | ✅ | Release Order number auto-assigned on sync. |
| Launch the app with no internet | ✅ | Service worker + desktop `.exe`. |
| Conflict review | ✅ (admin) | Server vs device, choose which wins. |
| PTI, maintenance, reefer, invoices, fleet | ❌ (online only) | Roadmap — see §7. |

---

## 3. How staff use it (the real screen)

There is **nothing new to learn** for normal work. The offline tools live on the
**Gate Operations** page and stay hidden while the internet is working.

1. Open **Gate Operations** while online at least once (this loads the on-device copy).
2. If the internet drops, an **amber panel appears at the top of Gate Operations**:
   *"You're offline — record gate moves here…"*
3. Use the **Gate In** / **Gate Out** tabs in that panel to record moves as usual.
   Each saves on the device with a temporary number.
4. When the connection returns, records **sync automatically**. The temporary number
   is replaced by the real **EIR / Release Order** number.
5. An admin checks **Sync Conflicts** (sidebar, admin only) if anything clashed.

While online the panel is invisible and the normal **New Gate In / New Gate Out**
buttons work exactly as before.

---

## 4. The desktop app (.exe)

The Windows installer (`Negoce Services Setup 1.0.0.exe`) wraps the same app so it
can be launched from the Start menu / desktop, including with no internet.

- **Install once**, then run it **once while online** so it caches the app and loads
  the on-device data copy.
- After that it opens and works offline; gate moves sync when the connection returns.
- The installer is unsigned, so Windows SmartScreen may warn on first run — click
  **More info → Run anyway**. (Code-signing is optional and covered separately.)

---

## 5. How to test it (5 minutes)

1. Sign in and open **Gate Operations** online. Leave it a few seconds to sync.
2. Open the browser DevTools (**F12**) → **Network** tab → set throttling to **Offline**
   (or simply disable Wi-Fi / unplug the network cable).
3. The amber offline panel appears. Record a **Gate In** and a **Gate Out**.
4. Set the network back to **Online** (or re-enable Wi-Fi).
5. Within a few seconds the queued moves sync; reload and confirm they now have real
   document numbers and appear in the main table.
6. (Admin) Open **Sync Conflicts** to confirm it's empty — or shows any real clash.

---

## 6. Trust & safety rules built in

- **Nothing is lost**: offline writes sit in a durable on-device queue until the
  server confirms them.
- **Idempotent sync**: replaying the same queued move twice cannot create duplicates
  (each move carries a stable id the server recognises).
- **Last-edit-wins by timestamp** for simple edits (e.g. container status).
- **Conflicts are never auto-overwritten**: a newer server value vs a device value
  is recorded and shown for a human to decide (see
  [OFFLINE-SYNC-CONFLICT-RULES.md](OFFLINE-SYNC-CONFLICT-RULES.md)).
- **Credentials never touch the device copy**: the on-device database only holds
  operational reference data (containers, types) and this device's own gate moves.

---

## 7. Roadmap — extending offline to more modules

The same proven pattern (on-device table → sync shape → local write → queued replay
→ last-edit-wins / conflict review) can be rolled to other modules, in priority order:

1. **Reefer power status** — frequently toggled at the yard.
2. **PTI requests** — inspections often happen where signal is weak.
3. **Container movements** — yard moves.
4. **Invoices** — lower priority (finance is usually office-based / online).

Each module is an incremental, independently shippable step.

---

## 8. Technical reference (for developers)

- **Cloud DB**: Neon Postgres (logical replication enabled).
- **Sync engine**: ElectricSQL Cloud → shapes pulled through a same-origin secure
  proxy (`src/app/api/electric/v1/shape/route.ts`) that injects `ELECTRIC_SOURCE_ID`
  + `ELECTRIC_SECRET` server-side. Requires `requireAuth`.
- **On-device DB**: PGlite (WASM Postgres) in IndexedDB (`idb://negoce-erp`), created
  once and shared — `src/lib/electric/localdb.ts` (`getLocalDb`, `enqueue`,
  `pendingCount`, `syncPending`, `getDeviceId`).
- **Synced (read) tables**: `Container`, `ContainerType` via
  `electric.syncShapeToTable`. Locally-owned table: `gate_transactions`. Queue:
  `pending_ops`.
- **Replay endpoint**: `src/app/api/sync/replay/route.ts` — idempotent by client id;
  handles `container/update` (last-edit-wins, records `SyncConflict` if server newer),
  `gateTransaction/create` GATE_IN (find-or-create container, EIR-IN, slot alloc) and
  GATE_OUT (EIR-OUT + Release Order, mark inventory). Document numbers via
  `formatDocNumber` in `src/lib/pdf/docNumber.ts`.
- **Conflicts**: `SyncConflict` model; API `src/app/api/sync/conflicts/**`; admin UI
  `src/components/sync/ConflictReview.tsx` at `/sync-conflicts`.
- **Offline shell**: service worker `public/sw.js` (network-first pages, cache-first
  static, never `/api`), `ServiceWorkerRegister` (production only), PWA manifest.
- **Desktop**: `desktop/` — Electron wrapper (`main.js`, `APP_URL =
  https://www.negoceservice.com`), electron-builder NSIS target.
- **Real-screen pilot**: `src/components/electric/OfflineGateBanner.tsx`, mounted in
  `src/app/[locale]/(dashboard)/gate-operations/page.tsx` — hidden while online,
  keeps the local DB warm, shows offline Gate In/Out when the connection drops.
