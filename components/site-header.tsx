"use client";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/client";

export function SiteHeader() {
  const { t, href } = useI18n();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const links = [
    ["/learn", "Learn"],
    ["/tajweed", "Rules library"],
    ["/glossary", "Glossary"],
    ["/practice", "Practice"],
    ["/articles", "Articles"],
  ];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1101px)");
    const closeAtDesktop = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", closeAtDesktop);
    return () => media.removeEventListener("change", closeAtDesktop);
  }, []);

  return <><a className="skip-link" href="#main-content">{t("Skip to content")}</a><header className="site-header" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}><div className="container nav-wrap"><a href={href("/")} className="brand" aria-label={t("Tajweed101 home")}><span className="brand-mark"><Image src="/logo.png" alt="" width={48} height={48} /></span><span className="brand-name"><span>Tajweed101</span></span></a><nav id="primary-navigation" className={open ? "main-nav open" : "main-nav"} aria-label={t("Primary navigation")}>{links.map(([path, label]) => <a key={path} href={href(path)} aria-current={pathname.replace(/\/+$/, "") === href(path).replace(/\/+$/, "") || pathname.startsWith(href(path)) ? "page" : undefined} onClick={() => setOpen(false)}>{t(label)}</a>)}</nav><div className="nav-actions"><LanguageSwitcher /><a href={href("/search")} className="icon-button search-button" aria-label={t("Search")}><Search size={18} aria-hidden="true" /></a><ThemeToggle /><button ref={menuButton} type="button" className="menu-button icon-button" aria-label={t(open ? "Close menu" : "Open menu")} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button></div></div></header></>;
}

