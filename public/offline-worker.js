/* Explicit lesson saves only. No analytics, private-data caching or audio precache. */
const VERSION = "ed6734673e51c04a4fe6";
const CACHE = "tajweed-offline-" + VERSION;
const origin = self.location.origin;
const lessonPath = /^\/(en|ar|ur|id|fr|tr)\/tajweed\/[a-z0-9-]+\/$/;
const assetPath = /^(?:\/_next\/static\/.+\.(?:js|css|woff2?)|\/(?:logo|quran-symbols)\.png)$/;
self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => event.waitUntil((async () => { for (const key of await caches.keys()) if (key.startsWith("tajweed-offline-") && key !== CACHE) await caches.delete(key); await self.clients.claim(); })()));
self.addEventListener("message", event => {
  if (event.data?.type !== "save-lesson" || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const page = new URL(event.data.url);
      const client = event.source && new URL(event.source.url);
      if (!client || page.origin !== origin || client.origin !== origin || client.pathname !== page.pathname || !lessonPath.test(page.pathname)) throw new Error("Invalid page");
      if (event.data.version !== VERSION) { event.ports[0].postMessage({ ok: false, reason: "outdated" }); return; }
      const assets = [...new Set((Array.isArray(event.data.assets) ? event.data.assets : []).slice(0, 80))].map(value => new URL(value)).filter(url => url.origin === origin && assetPath.test(url.pathname));
      const cache = await caches.open(CACHE);
      const pageResponse = await fetch(page.href, { cache: "reload" });
      if (!pageResponse.ok || !pageResponse.headers.get("content-type")?.includes("text/html")) throw new Error("Page unavailable");
      for (const asset of assets) {
        const response = await fetch(asset.href, { cache: "reload" });
        if (!response.ok) throw new Error("Asset unavailable");
        if (asset.pathname.endsWith(".css")) {
          const css = await response.clone().text();
          for (const match of css.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) {
            const font = new URL(match[1], asset);
            if (font.origin === origin && assetPath.test(font.pathname)) { const file = await fetch(font.href); if (!file.ok) throw new Error("Font unavailable"); await cache.put(font.href, file); }
          }
        }
        await cache.put(asset.href, response);
      }
      // Commit HTML last, so an incomplete download is never reported saved.
      await cache.put(page.href, pageResponse);
      const pages = (await cache.keys()).filter(request => lessonPath.test(new URL(request.url).pathname));
      for (const old of pages.slice(0, Math.max(0, pages.length - 20))) await cache.delete(old);
      event.ports[0].postMessage({ ok: true });
    } catch { event.ports[0].postMessage({ ok: false }); }
  })());
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== origin || !(lessonPath.test(url.pathname) || assetPath.test(url.pathname))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const stored = await cache.match(event.request.mode === "navigate" ? url.origin + url.pathname : event.request);
    try {
      const response = await fetch(event.request);
      if (stored && response.ok) {
        try { await cache.put(event.request.mode === "navigate" ? url.origin + url.pathname : event.request, response.clone()); }
        catch { /* A cache quota failure must not replace a fresh online response with stale content. */ }
      }
      return response;
    } catch { return stored || Response.error(); }
  })());
});
