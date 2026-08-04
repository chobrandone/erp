const { app, BrowserWindow, shell, Menu } = require("electron");

// Canonical host (the apex redirects here). Loading it directly means offline
// launch doesn't depend on following a network redirect.
const APP_URL = "https://www.negoceservice.com";

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: "Negoce Services",
    icon: __dirname + "/build/icon.png",
    autoHideMenuBar: true,
    backgroundColor: "#0d0f14",
    webPreferences: { contextIsolation: true },
  });

  win.loadURL(APP_URL);

  // Open external links (e.g. PDFs, other sites) in the user's real browser,
  // keep app navigation inside the window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // A simple offline message if there's no internet on launch.
  win.webContents.on("did-fail-load", (_e, code, desc) => {
    if (code === -106 || code === -105 || code === -2) {
      win.loadURL(
        "data:text/html;charset=utf-8," +
          encodeURIComponent(
            `<body style="font-family:system-ui;background:#0d0f14;color:#e6e8ee;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
               <h2>No internet connection</h2>
               <p style="color:#9aa3b2">Negoce Services needs an internet connection.<br/>Reconnect and click Retry.</p>
               <button onclick="location.href='${APP_URL}'" style="margin-top:12px;padding:10px 20px;border:0;border-radius:8px;background:#0059ef;color:#fff;font-size:14px;cursor:pointer">Retry</button>
             </body>`
          )
      );
    }
  });
}

// Minimal app menu (Reload / Zoom / Quit) instead of the default dev menu.
function buildMenu() {
  const template = [
    {
      label: "Negoce Services",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
