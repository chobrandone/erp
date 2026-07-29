# Automated Excel backups to Google Drive

Every day the database is exported to **one Excel workbook** (a sheet per table)
and uploaded to Google Drive, kept in this structure:

```
ERP-Backups/
├── latest.xlsx                                  ← always the newest
└── 2026/
    └── 2026-07/
        ├── erp-backup-2026-07-28.xlsx
        └── erp-backup-2026-07-29.xlsx           ← dated history (90-day retention)
```

Sensitive columns are **never** exported (user password hashes, invoice receipt files).

It runs as the GitHub Action **`.github/workflows/db-excel-backup.yml`** (daily at
01:00 UTC, plus a manual "Run workflow" button). Nothing needs to be left on.

---

## What you need to provide (one-time)

You add **two repository secrets** — I never see their values.

### 1. `DATABASE_URL`
Your Neon connection string (copy it from Vercel → Settings → Environment Variables).

### 2. `RCLONE_CONF` — the Google Drive connection
This authorises uploads to **your own Google Drive** (files count against your normal
15 GB, so it works on a regular Gmail account — no Google Workspace required).

On any computer with a browser:

1. Install **rclone** — https://rclone.org/downloads/
2. Run:
   ```bash
   rclone config
   ```
   - `n` (new remote) → name it **`gdrive`**
   - Storage: **`drive`** (Google Drive)
   - Leave client_id / client_secret blank (press Enter)
   - Scope: **`1`** (full access) or **`3`** (drive.file)
   - Root folder / service account: leave blank
   - "Use auto config?" → **Yes** → a browser opens → **sign in with the company
     Google account** and allow access.
   - Confirm and quit.
3. Print the config and copy the whole `[gdrive] …` block:
   ```bash
   rclone config show gdrive
   ```
4. In GitHub: **repo → Settings → Secrets and variables → Actions → New repository
   secret** → name **`RCLONE_CONF`**, paste that block.

> Create a Drive folder named **`ERP-Backups`** first if you like — otherwise the
> Action creates it automatically on the first run.

---

## Turn it on / test it
1. Add both secrets (above).
2. GitHub → **Actions → "Excel backup to Google Drive" → Run workflow**.
3. A green check means it worked — check Google Drive for `ERP-Backups/latest.xlsx`.

## Run a backup manually on your PC
```bash
npm run backup-excel
```
Writes `backups/erp-backup-YYYY-MM-DD.xlsx` locally (not uploaded).

## Restore
Open the workbook to read/print any table. To restore data into the database,
send me the file — an `.xlsx` isn't a direct database restore, so for a true
point-in-time restore keep the SQL backup option too (ask me to add it).

## Alternative for Google Workspace users
If the company is on **Google Workspace**, a **Shared Drive** + service account is
cleaner (files owned by the Shared Drive, not a person). Ask me and I'll switch the
workflow to that method.
