"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchEntries, type SearchIndexEntry } from "@/lib/search";
import { useI18n } from "@/lib/i18n/client";

/** Keyboard and touch search with a contained modal focus order. */
export function SearchPalette({ index }: { index: SearchIndexEntry[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const results = searchEntries(index, query);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    previousFocus.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else { previousFocus.current = document.activeElement as HTMLElement; setOpen(true); }
      }
      if (event.key === "Escape" && open) { event.preventDefault(); close(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => { document.body.style.overflow = oldOverflow; };
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`palette-result-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => (value + 1) % results.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => (value - 1 + results.length) % results.length); }
    if (event.key === "Enter" && results[active]) { event.preventDefault(); window.location.assign(results[active].url); }
  }

  function containFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const items = dialogRef.current?.querySelectorAll<HTMLElement>('button, input, a[href]');
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  if (!open) return null;
  return <div className="palette-backdrop" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div ref={dialogRef} className="search-palette" role="dialog" aria-modal="true" aria-label={t("Search the guide")} onKeyDown={containFocus}>
      <button type="button" className="palette-close icon-button" onClick={close} aria-label={t("Close search")}><X size={20} aria-hidden="true" /></button>
      <div className="palette-input-row"><Search size={18} aria-hidden="true" /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={onKeyDown} placeholder={t("Search rules, terms, and articles…")} aria-label={t("Search query")} role="combobox" aria-expanded={results.length > 0} aria-autocomplete="list" aria-controls="palette-results" aria-activedescendant={results.length ? `palette-result-${active}` : undefined} /></div>
      <p className="sr-only" role="status">{query.trim() ? t("{count} search results", { count: results.length }) : ""}</p>
      <div className="palette-results" id="palette-results" role="listbox" aria-label={t("Search results")}>
        {query.trim() && !results.length && <p className="palette-empty">{t("No results. Try a shorter word such as “madd” or “ikhfa”.")}</p>}
        {!query.trim() && <div className="palette-hint">{t("Type to search rules, glossary terms, and articles. Use ↑ ↓ and Enter.")}</div>}
        {results.map((result, index) => <a id={`palette-result-${index}`} role="option" aria-selected={index === active} key={result.url} href={result.url} className={index === active ? "palette-result active" : "palette-result"} onMouseEnter={() => setActive(index)} onClick={close}><span className="result-kind">{t(result.kind)}</span><span className="palette-result-body"><strong>{result.title}</strong><small>{result.level ? `${t(result.level)} · ` : ""}{result.description}</small></span></a>)}
      </div>
      <div className="palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> {t("navigate")}</span><span><kbd>Enter</kbd> {t("open")}</span><span><kbd>Esc</kbd> {t("close")}</span></div>
    </div>
  </div>;
}

