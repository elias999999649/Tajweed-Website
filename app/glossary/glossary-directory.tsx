"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { tajweedGlossary } from "@/lib/tajweed/glossary";
import { tajweedRules } from "@/lib/tajweed/rules";

export function GlossaryDirectory() {
  const [query, setQuery] = useState("");
  const entries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return tajweedGlossary;
    return tajweedGlossary.filter((entry) => [entry.englishTerm, entry.arabicTerm, entry.arabicSpelling, entry.definition, entry.detailedExplanation].join(" ").toLocaleLowerCase().includes(normalized));
  }, [query]);

  return <div className="glossary-directory"><label className="glossary-search"><Search size={19} /><span className="sr-only">Search glossary</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search English or Arabic terms" /></label><div className="glossary-result-heading"><span>{entries.length} {entries.length === 1 ? "term" : "terms"}</span><span>Definitions are drawn from the Tajweed rule database.</span></div><div className="glossary-list">{entries.map((entry) => <GlossaryCard entry={entry} key={entry.id} />)}</div>{!entries.length && <div className="directory-empty"><strong>No glossary terms match your search.</strong><span>Try an English term, Arabic spelling, or rule name.</span></div>}</div>;
}

function GlossaryCard({ entry }: { entry: (typeof tajweedGlossary)[number] }) {
  const lessons = entry.relatedLessonIds.map((id) => tajweedRules.find((rule) => rule.id === id)).filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));
  return <article className="glossary-card" id={entry.id}><div className="glossary-card-heading"><div><h2>{entry.englishTerm}</h2><p className="glossary-arabic" lang="ar" dir="rtl">{entry.arabicSpelling}</p></div></div><p className="glossary-definition">{entry.definition}</p><div className="glossary-detail"><h3>Detailed explanation</h3><p>{entry.detailedExplanation}</p>{entry.pronunciationGuidance && <><h3>Pronunciation guidance</h3><p>{entry.pronunciationGuidance}</p></>}</div><div className="glossary-card-footer"><span>Related lessons</span>{lessons.map((lesson) => <a href={`/tajweed/${lesson.slug}`} key={lesson.id}>{lesson.name} <ArrowRight size={14} /></a>)}</div></article>;
}
