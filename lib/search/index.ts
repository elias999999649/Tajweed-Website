import { articles } from "@/lib/articles/content";
import { tajweedGlossary } from "@/lib/tajweed/glossary";
import { tajweedRules } from "@/lib/tajweed/rules";
import type { DifficultyLevel } from "@/lib/tajweed/types";

export type SearchLevel = "Foundations" | "Essential" | "Intermediate" | "Advanced";
export type SearchKind = "rule" | "article" | "glossary";

export type SearchDocument = {
  kind: SearchKind;
  title: string;
  category: string;
  level?: SearchLevel;
  description: string;
  url: string;
  terms: string[];
  localizedTerms?: string[];
};

const supportingDocuments: SearchDocument[] = articles.map((article): SearchDocument => ({ kind: "article", title: article.title, category: article.category, description: article.description, url: `/articles/${article.slug}`, terms: [article.title, article.category, article.searchIntent, ...article.relatedRuleIds], localizedTerms: article.sections.flatMap(section => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])]) }));
const searchLevelFor = (level: DifficultyLevel): SearchLevel => level === "Foundation" ? "Foundations" : level;

export const searchDocuments: SearchDocument[] = [
  ...tajweedRules.map((rule): SearchDocument => ({ kind: "rule", title: rule.name, category: rule.category, level: searchLevelFor(rule.level), description: rule.shortDefinition, url: `/tajweed/${rule.slug}`, terms: [rule.name, rule.arabicName ?? "", ...rule.letters, rule.category, rule.detailedExplanation, ...rule.prerequisites, ...rule.relatedRules], localizedTerms: [rule.detailedExplanation, rule.whenItOccurs, rule.pronunciation, ...rule.commonMistakes, rule.memoryTip] })),
  ...tajweedGlossary.map((entry): SearchDocument => ({ kind: "glossary", title: entry.englishTerm, category: "Tajweed glossary", description: entry.definition, url: `/glossary#${entry.id}`, terms: [entry.arabicTerm, entry.arabicSpelling, entry.detailedExplanation, ...entry.relatedRuleIds] })),
  ...supportingDocuments,
];

export const searchSuggestions = ["ikhfa", "noon sakinah", "madd", "qalqalah", "heavy letters", "makharij"];

/** Compact index for the client-side search palette (keeps the bundle small). */
export type SearchIndexEntry = { kind: SearchKind; title: string; level?: SearchLevel; description: string; url: string; haystack: string };

const paletteDocuments: SearchDocument[] = [
  ...tajweedRules.map((rule): SearchDocument => ({ kind: "rule", title: rule.name, category: rule.category, level: searchLevelFor(rule.level), description: rule.shortDefinition, url: `/tajweed/${rule.slug}`, terms: [rule.arabicName ?? "", rule.name] })),
  ...tajweedGlossary.map((entry): SearchDocument => ({ kind: "glossary", title: entry.englishTerm, category: "Tajweed glossary", description: entry.definition, url: `/glossary#${entry.id}`, terms: [entry.arabicTerm, entry.arabicSpelling] })),
  ...supportingDocuments,
];

export const searchPaletteIndex: SearchIndexEntry[] = paletteDocuments.map((document) => ({ kind: document.kind, title: document.title, level: document.level, description: document.description, url: document.url, haystack: [document.title, document.category, document.level ?? "", document.description, ...document.terms].filter(Boolean).join(" ").toLocaleLowerCase() }));

export function normalizeSearch(value: string): string {
  return value.normalize("NFKD").replace(/\p{Mark}/gu, "").replace(/ـ/g, "").replace(/[أإآٱ]/g, "ا").replace(/ی/g, "ي").replace(/ک/g, "ك").toLowerCase().replace(/ı/g, "i").replace(/[’'`-]/g, " ").replace(/[^\p{Letter}\p{Number}]+/gu, " ").trim();
}

const aliasGroups = [["tajweed", "tajwid", "tecvid", "tecvit"], ["ikhfa", "ihfa", "ihfâ"], ["idgham", "idgam", "idgâm"], ["izhar", "idhar", "idhhar"], ["iqlab", "iklab"], ["qalqalah", "kalkale", "qalqala"], ["madd", "med", "medd"], ["makharij", "mahrec", "mahreçler", "mekharic"], ["sifaat", "sifat", "sıfatlar"], ["noon", "nun", "nûn"], ["meem", "mim", "mîm"], ["sakinah", "sakin", "saakin", "sâkin"], ["ghunnah", "gunne", "ghunna"], ["waqf", "vakif", "vakıf", "waqaf"], ["ibtida", "ibtidâ"], ["tafkhim", "tefhim", "tefhîm"], ["tarqiq", "terkik", "terkīk"], ["hamzah", "hamza", "hemze"], ["lam", "laam", "lâm"], ["raa", "ra", "râ"]];
const aliases = new Map(aliasGroups.flatMap(group => group.map(value => [normalizeSearch(value), normalizeSearch(group[0])] as const)));
const canonical = (value: string) => normalizeSearch(value).split(/\s+/).map(word => aliases.get(word) ?? word).join(" ");

function tokenize(query: string): string[] {
  return canonical(query).split(/\s+/).filter((token) => token.length > 1 || /\p{Script=Arabic}/u.test(token));
}

function scoreEntry(haystack: string, tokens: string[]): number {
  const normalizedHaystack = canonical(haystack);
  const words = normalizedHaystack.split(/\s+/);
  let score = 0;
  let matched = 0;
  for (const token of tokens) {
    const index = normalizedHaystack.indexOf(token);
    const wordMatch = words.some((word) => word === token || token.length > 1 && word.startsWith(token));
    if (token.length === 1 && !wordMatch) continue;
    if (index === -1 && !wordMatch) continue;
    matched += 1;
    score += wordMatch ? 5 : 2;
    if (index === 0) score += 3;
    else if (index < 45) score += 1;
  }
  return matched === tokens.length ? score + 8 : 0;
}

function titleScore(title: string, tokens: string[]) { const normalized = canonical(title); const query = tokens.join(" "); return normalized === query ? 100 : normalized.startsWith(query) ? 45 : scoreEntry(normalized, tokens) * 2; }
function nearWord(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 4) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else { if (++edits > 1) return false; if (a.length >= b.length) i++; if (b.length >= a.length) j++; } }
  return edits + (i < a.length || j < b.length ? 1 : 0) <= 1;
}
const prepared = new WeakMap<(message: string) => string, { document: SearchDocument; title: string; haystack: string }[]>();

/** Search with multi-word matching and relevance ranking (best first). */
export function searchDocumentsFor(query: string, level?: SearchLevel, translate?: (message: string) => string, kind?: SearchKind): SearchDocument[] {
  const tokens = tokenize(query);
  const matchingLevel = (document: SearchDocument) => (!level || document.level === level) && (!kind || document.kind === kind);
  if (!tokens.length) return searchDocuments.filter(matchingLevel).filter(document => kind || document.kind !== "glossary");
  let index = translate ? prepared.get(translate) : undefined;
  if (!index) {
    index = searchDocuments.map(document => ({ document, title: [document.title, translate?.(document.title) ?? ""].join(" "), haystack: canonical([document.title, document.category, document.description, ...document.terms, ...(translate ? [translate(document.title), translate(document.category), translate(document.description), ...(document.localizedTerms ?? []).map(translate)] : document.localizedTerms ?? [])].join(" ")) }));
    if (translate) prepared.set(translate, index);
  }
  const results = index.filter(({ document }) => matchingLevel(document))
    .map(({ document, title, haystack }) => ({ document, score: scoreEntry(haystack, tokens) + titleScore(title, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.document);
  const found = results.length ? results : index.filter(({ document, title }) => matchingLevel(document) && tokens.every(token => canonical(title).split(" ").some(word => nearWord(token, word)))).map(item => item.document);
  // The glossary repeats rule definitions. Show its result when explicitly
  // requested, or when there is no matching lesson for the same term.
  return kind ? found : found.filter(document => document.kind !== "glossary" || !found.some(other => other.kind === "rule" && other.title === document.title));
}

/** Client-side ranked search over a provided compact index. */
export function searchEntries(entries: SearchIndexEntry[], query: string, limit = 8): SearchIndexEntry[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const ranked = entries
    .map((entry) => ({ entry, score: scoreEntry(entry.haystack, tokens) + titleScore(entry.title, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const lessonTitles = new Set(ranked.filter(item => item.entry.kind === "rule").map(item => canonical(item.entry.title)));
  return ranked.filter(item => item.entry.kind !== "glossary" || !lessonTitles.has(canonical(item.entry.title)))
    .slice(0, limit)
    .map((item) => item.entry);
}


