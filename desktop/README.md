# Negoce Services — Desktop app

A thin desktop wrapper that opens **https://negoceservice.com** in its own window
(own icon, no browser bar). It needs an internet connection — this is the online
desktop app; the offline/local-first version is a separate, larger build.

## Build the Windows installer (.exe)
From this `desktop/` folder:

```bash
npm install
npm run dist
```

The installer is created in **`desktop/dist/`** as **`Negoce Services Setup 1.0.0.exe`**.
Give that file to staff → double-click → it installs with a desktop shortcut and a
Start-menu entry.

## Test without building
```bash
npm start
```
Opens the app window immediately (using the installed Electron).

## Change the target URL
Edit `APP_URL` at the top of `main.js`.

## Icon
`build/icon.png` (256×256) is generated from the company logo. Replace it with a
new 256×256 PNG to change the app icon, then rebuild.

## Notes
- **SmartScreen warning:** unsigned apps show a "Windows protected your PC" notice
  on first run — click *More info → Run anyway*. To remove it, buy a code-signing
  certificate and add it to the `build` config.
- This folder is **independent** of the web app — it is not part of the Vercel
  deployment and does not affect the website.
