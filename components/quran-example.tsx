"use client";

import { useI18n } from "@/lib/i18n/client";
import type { QuranExampleHighlight, QuranExampleRecord } from "@/lib/quran-examples/types";
import { validateQuranExample } from "@/lib/quran-examples/types";

type QuranExampleProps = {
  example?: QuranExampleRecord;
  showStatusInDevelopment?: boolean;
};

function renderHighlightedArabic(text: string, highlights: QuranExampleHighlight[], t: (message: string) => string) {
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((highlight, index) => {
    if (highlight.start > cursor) pieces.push(<span key={`plain-${index}`}>{text.slice(cursor, highlight.start)}</span>);
    pieces.push(<mark className={`quran-highlight ${highlight.kind}`} key={`highlight-${index}`} aria-label={t(highlight.label)}>{text.slice(highlight.start, highlight.end)}</mark>);
    cursor = highlight.end;
  });
  if (cursor < text.length) pieces.push(<span key="plain-final">{text.slice(cursor)}</span>);
  return pieces;
}

export function QuranExample({ example, showStatusInDevelopment = true }: QuranExampleProps) {
  const { t } = useI18n();
  if (!example) return <div className="editorial-placeholder"><strong>{t('No Quran example is published here yet.')}</strong><span>{t('Examples appear only after the exact Arabic text, reference, highlighting, meaning, and source metadata have been verified.')}</span></div>;
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && example.status !== "verified") return null;
  const validationErrors = validateQuranExample(example);
  if (validationErrors.length) return <div className="editorial-placeholder"><strong>{t('Example withheld.')}</strong><span>{t('This example failed content validation and cannot be displayed.')}</span></div>;
  return <article className="quran-example-card"><div className="quran-example-head"><div><span className="eyebrow">{example.surahName} · {t("verse")} {example.verseNumber}</span>{showStatusInDevelopment && !isProduction && <span className={`example-status ${example.status}`}>{t(example.status.replace("_", " "))}</span>}</div><span className="audio-pending">{t('Audio demonstration pending verification')}</span></div><p className="quran-arabic-prominent" lang="ar" dir="rtl">{renderHighlightedArabic(example.arabicText, example.highlights, t)}</p><div className="quran-highlight-legend">{example.highlights.map((highlight, index) => <span key={`${t(highlight.label)}-${index}`}><i className={`dot ${highlight.kind}`} />{t(highlight.label)}</span>)}</div>{example.transliteration && <p className="quran-annotation"><strong>{t('Transliteration:')}</strong> {example.transliteration}</p>}{example.translation && <p className="quran-annotation"><strong>{t('Meaning:')}</strong> {example.translation}{example.translationSource && <small> {t("Source:")} {example.translationSource}</small>}</p>}<p className="quran-explanation"><strong>{t('Why this applies:')}</strong> {t(example.explanation)}</p><footer className="quran-source"><span>{t("Source:")} {example.source.provider} · {example.source.textEdition}</span><a href={example.source.sourceUrl} target="_blank" rel="noreferrer">{t('View source')}</a></footer></article>;
}
