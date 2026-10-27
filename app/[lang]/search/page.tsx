"use client";
import { studyText } from "@/lib/i18n/study";
import { useI18n } from "@/lib/i18n/client";


import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { searchDocumentsFor, searchSuggestions, type SearchLevel, type SearchKind } from "@/lib/search";

const levels: SearchLevel[] = ["Foundations", "Essential", "Intermediate", "Advanced"];


function SearchContent() {
  const { t, text, href, locale } = useI18n();

  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const levelParam = searchParams.get("level") ?? "";
  const level = levels.includes(levelParam as SearchLevel) ? levelParam as SearchLevel : undefined;
  const kindParam = searchParams.get("kind") ?? "";
  const kind = ["rule", "article", "glossary"].includes(kindParam) ? kindParam as SearchKind : undefined;
  const results = searchDocumentsFor(query, level, t, kind);
  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="search-page"><section className="search-hero"><div className="container"><p className="eyebrow">{t("Site-wide search")}</p><h1>{t("Find your next lesson.")}</h1><p className="hero-lede">{t("Search rules, Arabic terms, pronunciation concepts, articles, and glossary entries.")}</p><form className="large-search" action={href("/search")} method="get"><Search size={21} />{level && <input type="hidden" name="level" value={level} />}{kind && <input type="hidden" name="kind" value={kind} />}<input name="q" defaultValue={query} list="search-suggestions-page" aria-label={t("Search Tajweed content")} placeholder={t("Try “ikhfa”, “madd”, or “makharij”…")} /><datalist id="search-suggestions-page">{searchSuggestions.map((suggestion) => <option value={t(suggestion)} key={suggestion} />)}</datalist><button type="submit">{t("Search")}</button></form></div></section><section className="section search-results-section"><div className="container search-results-layout"><aside className="search-filters"><div className="filter-heading"><SlidersHorizontal size={16} /><strong>{t("Filter by level")}</strong></div><a className={!level ? "filter active" : "filter"} href={href(query ? `/search?q=${encodeURIComponent(query)}` : "/search")}>{t("All levels")}</a>{levels.map((item) => <a className={level === item ? "filter active" : "filter"} href={href(`/search?${new URLSearchParams({ ...(query ? { q: query } : {}), level: item }).toString()}`)} key={item}>{text(item)}</a>)}<label className="search-kind-filter">{studyText(locale, "kind")}<select value={kind ?? ""} onChange={event => window.location.assign(href(`/search?${new URLSearchParams({ q: query, ...(level ? { level } : {}), ...(event.target.value ? { kind: event.target.value } : {}) })}`))}><option value="">{studyText(locale, "all")}</option>{["rule", "article", "glossary"].map(type => <option value={type} key={type}>{t(type)}</option>)}</select></label></aside><div className="results-column"><div className="results-heading"><div><p className="eyebrow">{query ? t("Results for {query}", { query }) : t("All learning content")}</p><h2>{text(results.length)} {text(results.length === 1 ? "result" : "results")}</h2></div>{level && <a className="clear-filter" href={href(query ? `/search?q=${encodeURIComponent(query)}` : "/search")}>{t("Clear filter")}</a>}</div>{results.length ? <div className="search-result-list">{results.map((result) => <a className="search-result" href={href(result.url)} key={`${result.kind}-${result.url}`}><div className="result-top"><span className="result-kind">{text(result.kind)}</span>{result.level && <span className="result-level">{text(result.level)}</span>}</div><h3>{text(result.title)}</h3><p className="result-category">{text(result.category)}</p><p>{text(result.description)}</p><span className="result-url">{href(result.url)}</span><ArrowRight size={17} /></a>)}</div> : <div className="search-empty"><div className="empty-icon"><Search size={22} /></div><h3>{t("No matching content yet")}</h3><p>{t("Try a broader term, check the spelling, or browse the learning path directly.")}</p><div className="suggestion-links"><span>{t("Try searching:")}</span>{searchSuggestions.slice(0, 4).map((suggestion) => <a href={href(`/search?q=${encodeURIComponent(suggestion)}`)} key={suggestion}>{text(suggestion)}</a>)}</div><a className="text-link" href={href("/tajweed")}>{t("Browse the Tajweed library")}{" "}<ArrowRight size={14} /></a></div>}</div></div></section></main><Footer /></>;
}


export default function SearchPage() {
  const { t, text, href } = useI18n();

  return <Suspense fallback={<><SiteHeader /><main id="main-content" tabIndex={-1} className="search-page"><section className="search-hero"><div className="container"><p className="eyebrow">{t("Site-wide search")}</p><h1>{t("Find your next lesson.")}</h1><p className="hero-lede">{t("Loading the search index…")}</p></div></section></main><Footer /></>}><SearchContent /></Suspense>;
}
