export type QuranExampleStatus = "verified" | "needs_review" | "draft";

export type QuranHighlightKind =
  | "rule-focus"
  | "related-rule"
  | "pronunciation-focus";

export type QuranExampleHighlight = {
  /** UTF-16 string offsets into arabicText. The source text is never rewritten. */
  start: number;
  end: number;
  label: string;
  kind: QuranHighlightKind;
};

export type QuranExampleSource = {
  provider: string;
  sourceUrl: string;
  textEdition: string;
  accessedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
};

export type QuranExampleRecord = {
  id: string;
  ruleId: string;
  arabicText: string;
  highlights: QuranExampleHighlight[];
  surahName: string;
  surahSlug: string;
  verseNumber: number;
  explanation: string;
  transliteration?: string;
  translation?: string;
  translationSource?: string;
  source: QuranExampleSource;
  status: QuranExampleStatus;
  editorialNotes?: string;
};

export function validateQuranExample(example: QuranExampleRecord): string[] {
  const errors: string[] = [];
  if (!example.id.trim()) errors.push("Example id is required.");
  if (!example.ruleId.trim()) errors.push("Rule id is required.");
  if (!example.arabicText.trim()) errors.push("Exact Arabic text is required.");
  if (!example.surahName.trim()) errors.push("Surah name is required.");
  if (!example.surahSlug.trim()) errors.push("Surah slug is required.");
  if (!Number.isInteger(example.verseNumber) || example.verseNumber < 1) errors.push("A positive integer verse number is required.");
  if (!example.explanation.trim()) errors.push("Explanation is required.");
  if (!example.source.provider.trim() || !example.source.sourceUrl.trim() || !example.source.textEdition.trim()) errors.push("Provider, source URL, and text edition are required.");
  const sorted = [...example.highlights].sort((a, b) => a.start - b.start);
  sorted.forEach((highlight, index) => {
    if (!Number.isInteger(highlight.start) || !Number.isInteger(highlight.end) || highlight.start < 0 || highlight.end <= highlight.start || highlight.end > example.arabicText.length) errors.push(`Highlight ${index + 1} has invalid offsets.`);
    if (!highlight.label.trim()) errors.push(`Highlight ${index + 1} needs an accessible label.`);
    if (index > 0 && highlight.start < sorted[index - 1].end) errors.push("Highlights must not overlap.");
  });
  return errors;
}
