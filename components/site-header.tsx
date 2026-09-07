"use client";

import { useState } from "react";
import { BookOpen, Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container nav-wrap"><a href="/" className="brand"><span className="brand-mark"><BookOpen size={18} /></span><span>Complete <em>Tajweed</em> Guide</span></a><nav className={open ? "main-nav open" : "main-nav"} aria-label="Primary navigation"><a href="/learn">Learn</a><a href="/tajweed">Rules library</a><a href="/glossary">Glossary</a><a href="/practice">Practice</a><a href="/articles">Articles</a></nav><div className="nav-actions"><a href="/search" className="icon-button search-button" aria-label="Search"><Search size={18} /></a><ThemeToggle /><button className="menu-button icon-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>;
}
