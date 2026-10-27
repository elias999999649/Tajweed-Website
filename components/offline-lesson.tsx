"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { studyText, type StudyMessage } from "@/lib/i18n/study";

export function OfflineLesson() {
  const { locale } = useI18n();
  const s = (id: StudyMessage) => studyText(locale, id);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<StudyMessage | null>(null);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistration("/").then(registration => registration?.update()).catch(() => {}); }, []);
  async function save() {
    setBusy(true); setNotice(null);
    try {
      if (!("serviceWorker" in navigator) || !window.isSecureContext) throw new Error("Unavailable");
      const registration = await navigator.serviceWorker.register("/offline-worker.js", { scope: "/", updateViaCache: "none" });
      if (registration.active) await registration.update();
      const worker = registration.installing || registration.waiting || registration.active;
      if (!worker) throw new Error("Unavailable");
      if (worker.state !== "activated") await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => { worker.removeEventListener("statechange", changed); reject(new Error("Timeout")); }, 25000);
        function changed() { if (worker!.state === "activated" || worker!.state === "redundant") { clearTimeout(timeout); worker!.removeEventListener("statechange", changed); if (worker!.state === "activated") resolve(); else reject(new Error("Unavailable")); } }
        worker.addEventListener("statechange", changed); changed();
      });
      const assets = new Set([...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>("script[src],link[rel=stylesheet],link[rel=preload]")].map(element => element instanceof HTMLScriptElement ? element.src : element.href));
      for (const image of document.querySelectorAll<HTMLImageElement>("img[src]")) assets.add(image.src);
      for (const entry of performance.getEntriesByType("resource")) if (entry.name.includes("/_next/static/")) assets.add(entry.name);
      await new Promise<void>((resolve, reject) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => { channel.port1.close(); reject(new Error("Timeout")); }, 25000);
        channel.port1.onmessage = event => { clearTimeout(timeout); channel.port1.close(); if (event.data?.ok) resolve(); else reject(new Error(event.data?.reason === "outdated" ? "outdated" : "Save failed")); };
        if (!registration.active) { clearTimeout(timeout); reject(new Error("Unavailable")); return; }
        registration.active.postMessage({ type: "save-lesson", version: document.querySelector<HTMLMetaElement>('meta[name="tajweed-content-version"]')?.content, url: window.location.origin + window.location.pathname, assets: [...assets] }, [channel.port2]);
      });
      setNotice("offlineSaved");
    } catch (error) { setNotice(error instanceof Error && error.message === "outdated" ? "offlineUpdated" : "offlineError"); } finally { setBusy(false); }
  }
  async function remove() { try { if (!("caches" in window)) throw new Error("Unavailable"); for (const key of await caches.keys()) if (key.startsWith("tajweed-offline-")) await caches.delete(key); setNotice("offlineRemoved"); } catch { setNotice("offlineError"); } }
  return <div className="offline-lesson"><p className="muted">{s("offlineHelp")}</p><div className="study-actions"><button type="button" className="button secondary" disabled={busy} aria-busy={busy} onClick={save}>{s("offline")}</button><button type="button" className="text-link" disabled={busy} onClick={remove}>{s("removeOffline")}</button></div><p role="status">{notice ? s(notice) : ""}</p>{notice === "offlineUpdated" && <button type="button" className="button secondary" onClick={() => window.location.reload()}>{s("reload")}</button>}</div>;
}
