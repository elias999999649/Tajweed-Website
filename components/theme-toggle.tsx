"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}
function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the choice still applies for this visit.
    }
  }, [dark]);

  return <button className="icon-button" onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"} aria-pressed={dark}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
