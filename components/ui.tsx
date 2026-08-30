"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronRight, Menu, Moon, Search, Sun, Volume2, X } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  function toggle() {
    document.documentElement.classList.toggle("dark", !dark);
    setDark(!dark);
  }
  return <button className="icon-button" onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="container nav-wrap">
      <a href="#" className="brand"><span className="brand-mark"><BookOpen size={18} /></span><span>Complete <em>Tajweed</em> Guide</span></a>
      <nav className={open ? "main-nav open" : "main-nav"} aria-label="Primary navigation">
        <a href="#learn">Learn</a><a href="#rules">Rules library</a><a href="#practice">Practice</a><a href="#articles">Articles</a>
      </nav>
      <div className="nav-actions"><button className="icon-button search-button" aria-label="Search"><Search size={18} /></button><ThemeToggle /><button className="menu-button icon-button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button></div>
    </div>
  </header>;
}

export function Button({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "secondary" | "quiet" }) {
  return <button className={`button ${variant}`} type="button">{children}{variant === "primary" && <ArrowRight size={16} />}</button>;
}

export function Breadcrumbs() { return <div className="breadcrumbs" aria-label="Breadcrumb"><a href="#">Home</a><ChevronRight size={14} /><span>Learn Tajweed</span></div>; }

export function RuleCard({ title, description, level, arabic }: { title: string; description: string; level: string; arabic: string }) {
  return <article className="card rule-card"><div className="card-top"><span className="badge">{level}</span><span className="card-arrow"><ArrowRight size={17} /></span></div><p className="arabic-sm" lang="ar" dir="rtl">{arabic}</p><h3>{title}</h3><p className="muted">{description}</p><a className="text-link" href="#">Explore rule <ArrowRight size={14} /></a></article>;
}

export function QuranExample() {
  return <section className="example-card card"><div className="example-head"><div><span className="eyebrow">Verified example slot</span><h3>See the rule in context</h3></div><button className="icon-button" aria-label="Play recitation"><Volume2 size={18} /></button></div><div className="arabic-example" lang="ar" dir="rtl"><span className="highlight-green">مَثَالٌ</span> <span className="highlight-gold">تَجْرِيبِيٌّ</span></div><div className="highlight-legend"><span><i className="dot green" /> Rule focus</span><span><i className="dot gold" /> Related sound</span></div><p className="example-ref">A verified Quran text, reference, and licensed recitation will be inserted here during editorial review.</p></section>;
}

export function ProgressCard() { return <section className="card progress-card" id="practice"><div className="progress-title"><div><span className="eyebrow">Your learning path</span><h3>Build a steady practice</h3></div><span className="progress-number">02 <small>/ 12</small></span></div><div className="progress-track"><span style={{ width: "18%" }} /></div><p className="muted">Start with the foundations, then return to practice as your ear develops.</p><Button variant="secondary">View learning path</Button></section>; }

export function QuizCard() { const [selected, setSelected] = useState<string | null>(null); return <section className="card quiz-card"><div className="quiz-kicker"><span className="badge gold-badge">Quick check</span><span>1 of 3</span></div><h3>What should practice include?</h3><p className="muted">Choose the most complete answer.</p><div className="quiz-options">{["Reading the explanation only", "Listening and repeating with guidance", "Memorising every term"].map((item) => <button key={item} className={selected === item ? "quiz-option selected" : "quiz-option"} onClick={() => setSelected(item)}>{selected === item ? <Check size={16} /> : <span className="radio" />}{item}</button>)}</div></section>; }

export function SearchPanel() { return <div className="search-panel"><Search size={20} /><input aria-label="Search the guide" placeholder="Search rules, Arabic terms, or topics…" /><kbd>⌘ K</kbd></div>; }

export function Alert({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "notice" }) { return <aside className={`alert ${tone}`} role="note"><span className="alert-mark">{tone === "notice" ? "!" : "i"}</span><span>{children}</span></aside>; }

export function RuleHighlight({ children, label = "Rule focus" }: { children: React.ReactNode; label?: string }) { return <span className="rule-highlight"><span className="sr-only">{label}: </span>{children}</span>; }

export function InfoTable({ rows }: { rows: Array<[string, string]> }) { return <div className="table-wrap"><table><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div>; }

export function Footer() { return <footer className="site-footer"><div className="container footer-grid"><div><a href="#" className="brand footer-brand"><span className="brand-mark"><BookOpen size={18} /></span><span>Complete <em>Tajweed</em> Guide</span></a><p className="footer-copy">Clear explanations for a practice that is heard, guided, and lived.</p></div><div><h4>Explore</h4><a href="#learn">Learning path</a><a href="#categories">Categories</a><a href="#rules">Rules library</a><a href="#practice">Practice</a></div><div><h4>Trust & navigation</h4><a href="#">Editorial policy</a><a href="#">Sources</a><a href="#">About the guide</a><a href="/sitemap.xml">Sitemap</a></div></div><div className="container teacher-notice"><strong>A note for every learner</strong><span>Tajweed is best learned through listening, repetition, and practice with a qualified teacher or reciter. This guide supports that learning; it does not replace it.</span></div><div className="container footer-bottom"><span>© 2026 Complete Tajweed Guide</span><span>Built for careful learning.</span></div></footer>; }
