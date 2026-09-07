"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  function toggle() { document.documentElement.classList.toggle("dark", !dark); setDark(!dark); }
  return <button className="icon-button" onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
