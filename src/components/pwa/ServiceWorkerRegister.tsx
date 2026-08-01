"use client";

import { useEffect } from "react";

// Registers the service worker (production only) so the app shell is cached and
// can launch offline — including inside the desktop app, which uses the same
// browser engine.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
