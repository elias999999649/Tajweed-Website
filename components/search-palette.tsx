"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchEntries, type SearchIndexEntry } from "@/lib/search";

/** Lightweight ⌘K / Ctrl-K search palette over a server-provided index. */
export function SearchPalette({ index }: { index: SearchIndexEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchEntries(index, query);

  function updateQuery(value: string) {
    setQuery(value);
    setActive(0);
  }

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => (value + 1) % results.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => (value - 1 + results.length) % results.length); }
    if (event.key === "Enter" && results[active]) { event.preventDefault(); window.location.assign(results[active].url); }
  }

  if (!open) return null;

  return <div className="palette-backdrop" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="search-palette" role="dialog" aria-modal="true" aria-label="Search the guide">
      <div className="palette-input-row"><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => updateQuery(event.target.value)} onKeyDown={onKeyDown} placeholder="Search rules, terms, and articles…" aria-label="Search query" aria-controls="palette-results" /></div>
      <div className="palette-results" id="palette-results">
        {query.trim() && !results.length && <p className="palette-empty">No results for “{query}”. Try a shorter word such as “madd” or “ikhfa”.</p>}
        {!query.trim() && <div className="palette-hint">Type to search rules, glossary terms, and articles. Use ↑ ↓ and Enter.</div>}
        {results.map((result, index) => (
          <a key={result.url} href={result.url} className={index === active ? "palette-result active" : "palette-result"} onMouseEnter={() => setActive(index)} onClick={close}>
            <span className="result-kind">{result.kind}</span>
            <span className="palette-result-body"><strong>{result.title}</strong><small>{result.level ? `${result.level} · ` : ""}{result.description}</small></span>
          </a>
        ))}
      </div>
      <div className="palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
    </div>
  </div>;
}
