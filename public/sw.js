// Negoce Services service worker — enables offline launch.
// Conservative strategy so ONLINE behaviour is unchanged:
//   • Pages (navigations): network-first, fall back to the last cached copy only
//     when the network is unavailable → online users always get fresh pages.
//   • Immutable static assets (/_next/static, images, fonts): cache-first (safe,
//     they are content-hashed).
//   • /api/* : never cached — always hits the network (offline calls just fail,
//     and the app's own offline queue handles that).
const VERSION = "v1";
const STATIC_CACHE = `ns-static-${VERSION}`;
const PAGE_CACHE = `ns-pages-${VERSION}`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/images/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/fonts/") ||
  /\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico)$/.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // only our own origin
  if (url.pathname.startsWith("/api/")) return; // never intercept API calls

  // Immutable assets → cache-first.
  if (isStatic(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return hit || Response.error();
        }
      })(),
    );
    return;
  }

  // Page navigations → network-first, cached fallback when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          const hit = (await cache.match(req)) || (await cache.match(url.pathname));
          return (
            hit ||
            new Response(
              "<!doctype html><meta charset='utf-8'><body style='font-family:system-ui;background:#0d0f14;color:#e6e8ee;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center'><div><h2>Offline</h2><p style='color:#9aa3b2'>Open this page once while online to enable offline use.</p></div></body>",
              { headers: { "content-type": "text/html; charset=utf-8" }, status: 200 },
            )
          );
        }
      })(),
    );
  }
});
