import type { QuranExampleHighlight, QuranExampleRecord } from "@/lib/quran-examples/types";
import { validateQuranExample } from "@/lib/quran-examples/types";

type QuranExampleProps = {
  example?: QuranExampleRecord;
  showStatusInDevelopment?: boolean;
};

function renderHighlightedArabic(text: string, highlights: QuranExampleHighlight[]) {
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((highlight, index) => {
    if (highlight.start > cursor) pieces.push(<span key={`plain-${index}`}>{text.slice(cursor, highlight.start)}</span>);
    pieces.push(<mark className={`quran-highlight ${highlight.kind}`} key={`highlight-${index}`} aria-label={highlight.label}>{text.slice(highlight.start, highlight.end)}</mark>);
    cursor = highlight.end;
  });
  if (cursor < text.length) pieces.push(<span key="plain-final">{text.slice(cursor)}</span>);
  return pieces;
}

export function QuranExample({ example, showStatusInDevelopment = true }: QuranExampleProps) {
  if (!example) return <div className="editorial-placeholder"><strong>No Quran example is published here yet.</strong><span>Examples appear only after the exact Arabic text, reference, highlighting, meaning, and source metadata have been verified.</span></div>;
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && example.status !== "verified") return null;
  const validationErrors = validateQuranExample(example);
  if (validationErrors.length) return <div className="editorial-placeholder"><strong>Example withheld.</strong><span>This example failed content validation and cannot be displayed.</span></div>;
  return <article className="quran-example-card"><div className="quran-example-head"><div><span className="eyebrow">{example.surahName} · verse {example.verseNumber}</span>{showStatusInDevelopment && !isProduction && <span className={`example-status ${example.status}`}>{example.status.replace("_", " ")}</span>}</div><span className="audio-pending">Audio demonstration pending verification</span></div><p className="quran-arabic-prominent" lang="ar" dir="rtl">{renderHighlightedArabic(example.arabicText, example.highlights)}</p><div className="quran-highlight-legend">{example.highlights.map((highlight, index) => <span key={`${highlight.label}-${index}`}><i className={`dot ${highlight.kind}`} />{highlight.label}</span>)}</div>{example.transliteration && <p className="quran-annotation"><strong>Transliteration:</strong> {example.transliteration}</p>}{example.translation && <p className="quran-annotation"><strong>Meaning:</strong> {example.translation}{example.translationSource && <small> Source: {example.translationSource}</small>}</p>}<p className="quran-explanation"><strong>Why this applies:</strong> {example.explanation}</p><footer className="quran-source"><span>Source: {example.source.provider} · {example.source.textEdition}</span><a href={example.source.sourceUrl} target="_blank" rel="noreferrer">View source</a></footer></article>;
}
