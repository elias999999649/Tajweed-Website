"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { searchDocumentsFor, searchSuggestions, type SearchLevel } from "@/lib/search";

const levels: SearchLevel[] = ["Foundations", "Essential", "Intermediate", "Advanced"];


function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const levelParam = searchParams.get("level") ?? "";
  const level = levels.includes(levelParam as SearchLevel) ? levelParam as SearchLevel : undefined;
  const results = searchDocumentsFor(query, level);
  return <><SiteHeader /><main className="search-page"><section className="search-hero"><div className="container"><p className="eyebrow">Site-wide search</p><h1>Find your next lesson.</h1><p className="hero-lede">Search rules, Arabic terms, pronunciation concepts, articles, and glossary entries.</p><form className="large-search" action="/search" method="get"><Search size={21} /><input autoFocus={!query} name="q" defaultValue={query} list="search-suggestions-page" aria-label="Search Tajweed content" placeholder="Try “ikhfa”, “madd”, or “makharij”…" /><datalist id="search-suggestions-page">{searchSuggestions.map((suggestion) => <option value={suggestion} key={suggestion} />)}</datalist><button type="submit">Search</button></form></div></section><section className="section search-results-section"><div className="container search-results-layout"><aside className="search-filters"><div className="filter-heading"><SlidersHorizontal size={16} /><strong>Filter by level</strong></div><a className={!level ? "filter active" : "filter"} href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}>All levels</a>{levels.map((item) => <a className={level === item ? "filter active" : "filter"} href={`/search?${new URLSearchParams({ ...(query ? { q: query } : {}), level: item }).toString()}`} key={item}>{item}</a>)}</aside><div className="results-column"><div className="results-heading"><div><p className="eyebrow">{query ? `Results for “${query}”` : "All learning content"}</p><h2>{results.length} {results.length === 1 ? "result" : "results"}</h2></div>{level && <a className="clear-filter" href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}>Clear filter</a>}</div>{results.length ? <div className="search-result-list">{results.map((result) => <a className="search-result" href={result.url} key={`${result.kind}-${result.url}`}><div className="result-top"><span className="result-kind">{result.kind}</span>{result.level && <span className="result-level">{result.level}</span>}</div><h3>{result.title}</h3><p className="result-category">{result.category}</p><p>{result.description}</p><span className="result-url">{result.url}</span><ArrowRight size={17} /></a>)}</div> : <div className="search-empty"><div className="empty-icon"><Search size={22} /></div><h3>No matching content yet</h3><p>Try a broader term, check the spelling, or browse the learning path directly.</p><div className="suggestion-links"><span>Try searching:</span>{searchSuggestions.slice(0, 4).map((suggestion) => <a href={`/search?q=${encodeURIComponent(suggestion)}`} key={suggestion}>{suggestion}</a>)}</div><a className="text-link" href="/tajweed">Browse the Tajweed library <ArrowRight size={14} /></a></div>}</div></div></section></main><Footer /></>;
}


export default function SearchPage() {
  return <Suspense fallback={<><SiteHeader /><main className="search-page"><section className="search-hero"><div className="container"><p className="eyebrow">Site-wide search</p><h1>Find your next lesson.</h1><p className="hero-lede">Loading the search index…</p></div></section></main><Footer /></>}><SearchContent /></Suspense>;
}
