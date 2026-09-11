"use client";

import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Close the menu with the Escape key and lock body scroll while it is open.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return <header className="site-header"><div className="container nav-wrap"><a href="/" className="brand"><span className="brand-mark"><BrandMark /></span><span className="brand-name"><span>Complete</span> <em>Tajweed</em><small>Learn with clarity</small></span></a><nav id="primary-navigation" className={open ? "main-nav open" : "main-nav"} aria-label="Primary navigation"><a href="/learn" onClick={() => setOpen(false)}>Learn</a><a href="/tajweed" onClick={() => setOpen(false)}>Rules library</a><a href="/glossary" onClick={() => setOpen(false)}>Glossary</a><a href="/practice" onClick={() => setOpen(false)}>Practice</a><a href="/articles" onClick={() => setOpen(false)}>Articles</a></nav><div className="nav-actions"><a href="/search" className="icon-button search-button" aria-label="Search"><Search size={18} /></a><ThemeToggle /><button className="menu-button icon-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>;
}
