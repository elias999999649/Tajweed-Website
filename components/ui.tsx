"use client";
import { FooterContent } from "@/components/footer-content";

import { ArrowRight, ChevronRight, Search } from "lucide-react";
import { searchPaletteIndex } from "@/lib/search";
import { SearchPalette } from "@/components/search-palette";
import { useI18n } from "@/lib/i18n/client";
export { QuranExample } from "@/components/quran-example";
export { QuizCard } from "@/components/quiz-card";
export { SearchPalette } from "@/components/search-palette";
export { SiteHeader } from "@/components/site-header";
export { ThemeToggle } from "@/components/theme-toggle";

export function Button({ children, variant = "primary", href = "/learn" }: { children: React.ReactNode; variant?: "primary" | "secondary" | "quiet"; href?: string }) { const content = <>{children}{variant === "primary" && <ArrowRight size={16} aria-hidden="true" />}</>; return href ? <a className={`button ${variant}`} href={href}>{content}</a> : <button className={`button ${variant}`} type="button">{content}</button>; }
export function Breadcrumbs() { const { t, href } = useI18n(); return <nav className="breadcrumbs" aria-label={t("Breadcrumb")}><a href={href("/")}>{t("Home")}</a><ChevronRight size={14} aria-hidden="true" /><span>{t("Learn Tajweed")}</span></nav>; }
export function Alert({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "notice" }) { return <aside className={`alert ${tone}`} role="note"><span className="alert-mark" aria-hidden="true">{tone === "notice" ? "!" : "i"}</span><span>{children}</span></aside>; }
export function InfoTable({ rows }: { rows: Array<[string, string]> }) { return <div className="table-wrap"><table><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div>; }
export function SearchPanel() {
  const { t, href } = useI18n();
  const index = searchPaletteIndex.map(item => ({ ...item, title: t(item.title), description: t(item.description), url: href(item.url), haystack: item.haystack + " " + t(item.title) + " " + t(item.description) }));
  return <div className="search-panel-wrap"><form className="search-panel" action={href("/search")} method="get" role="search"><Search size={20} aria-hidden="true" /><input name="q" aria-label={t("Search the guide")} list="search-suggestions" placeholder={t("Search rules, Arabic terms, or topics…")} /><datalist id="search-suggestions">{["ikhfa", "noon sakinah", "madd", "qalqalah", "heavy letters", "makharij"].map(term => <option key={term} value={t(term)} />)}</datalist><button className="search-submit" type="submit">{t("Search")}</button><kbd aria-hidden="true">Ctrl / ⌘ K</kbd></form><SearchPalette index={index} /></div>;
}
export function Footer() { return <FooterContent i18n={useI18n()} />; }
