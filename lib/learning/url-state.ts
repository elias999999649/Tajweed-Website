"use client";
import { useSyncExternalStore } from "react";
function subscribe(fn: () => void) { window.addEventListener("popstate", fn); window.addEventListener("study-query", fn); return () => { window.removeEventListener("popstate", fn); window.removeEventListener("study-query", fn); }; }
export function useUrlState() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  return { params: new URLSearchParams(search), setParams(values: Record<string, string | undefined>) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) if (value && value !== "all") url.searchParams.set(key, value); else url.searchParams.delete(key);
    window.history.replaceState(null, "", url); window.dispatchEvent(new Event("study-query"));
  } };
}
