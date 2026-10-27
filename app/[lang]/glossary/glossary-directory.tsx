"use client";
import { useI18n } from "@/lib/i18n/client";


import { useMemo } from "react";
import { useUrlState } from "@/lib/learning/url-state";
import { normalizeSearch } from "@/lib/search";
import { studyText } from "@/lib/i18n/study";
import { ArrowRight, Search } from "lucide-react";
import { tajweedGlossary } from "@/lib/tajweed/glossary";
import { tajweedRules } from "@/lib/tajweed/rules";

export function GlossaryDirectory() {
  const { t, text, href, locale } = useI18n();

  const { params, setParams } = useUrlState();
  const query = params.get("q") ?? "";
  const entries = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return tajweedGlossary;
    return tajweedGlossary.filter((entry) => normalizeSearch([entry.englishTerm, entry.arabicTerm, entry.arabicSpelling, entry.definition, t(entry.englishTerm), t(entry.definition), t(entry.detailedExplanation)].join(" ")).includes(normalized));
  }, [query, t]);

  return <div className="glossary-directory"><label className="glossary-search"><Search size={19} /><span className="sr-only">{t("Search glossary")}</span><input value={query} onChange={(event) => setParams({ q: event.target.value })} placeholder={studyText(locale, "searchHint")} /></label><div className="glossary-result-heading"><span>{text(entries.length)} {text(entries.length === 1 ? "term" : "terms")}</span><span>{t("Definitions are drawn from the Tajweed rule database.")}</span></div><div className="glossary-list">{entries.map((entry) => <GlossaryCard entry={entry} key={entry.id} />)}</div>{!entries.length && <div className="directory-empty"><strong>{t("No glossary terms match your search.")}</strong><span>{t("Try an English term, Arabic spelling, or rule name.")}</span></div>}</div>;
}

function GlossaryCard({ entry }: { entry: (typeof tajweedGlossary)[number] }) {
  const { t, text, href } = useI18n();

  // relatedLessonIds stores rule *slugs*, so resolve lessons by slug (not id).
  const lessons = entry.relatedLessonIds
    .map((slug) => tajweedRules.find((rule) => rule.slug === slug))
    .filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));
  return <article className="glossary-card" id={entry.id}><div className="glossary-card-heading"><div><h2>{text(entry.englishTerm)}</h2><p className="glossary-arabic" lang="ar" dir="rtl">{text(entry.arabicSpelling)}</p></div></div><p className="glossary-definition">{text(entry.definition)}</p><details className="glossary-detail"><summary>{t("Detailed explanation")}</summary><p>{text(entry.detailedExplanation)}</p>{entry.pronunciationGuidance && <><h3>{t("Pronunciation guidance")}</h3><p>{text(entry.pronunciationGuidance)}</p></>}</details><div className="glossary-card-footer"><span>{t("Related lessons")}</span>{lessons.map((lesson) => <a href={href(`/tajweed/${lesson.slug}`)} key={lesson.id}>{text(lesson.name)} <ArrowRight size={14} /></a>)}</div></article>;
}
