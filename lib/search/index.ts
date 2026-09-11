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
};

const supportingDocuments: SearchDocument[] = articles.map((article): SearchDocument => ({ kind: "article", title: article.title, category: article.category, description: article.description, url: `/articles/${article.slug}`, terms: [article.title, article.category, article.searchIntent, ...article.relatedRuleIds] }));
const searchLevelFor = (level: DifficultyLevel): SearchLevel => level === "Foundation" ? "Foundations" : level;

export const searchDocuments: SearchDocument[] = [
  ...tajweedRules.map((rule): SearchDocument => ({ kind: "rule", title: rule.name, category: rule.category, level: searchLevelFor(rule.level), description: rule.shortDefinition, url: `/tajweed/${rule.slug}`, terms: [rule.name, rule.arabicName ?? "", rule.category, rule.detailedExplanation, ...rule.prerequisites, ...rule.relatedRules] })),
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

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[’'`-]/g, " ").replace(/[^\p{Letter}\p{Number}]+/gu, " ").trim();
}

function tokenize(query: string): string[] {
  return normalize(query).split(/\s+/).filter((token) => token.length > 1);
}

function scoreEntry(haystack: string, tokens: string[]): number {
  const normalizedHaystack = normalize(haystack);
  const words = normalizedHaystack.split(/\s+/);
  let score = 0;
  let matched = 0;
  for (const token of tokens) {
    const index = normalizedHaystack.indexOf(token);
    const wordMatch = words.some((word) => word === token || word.startsWith(token));
    if (index === -1 && !wordMatch) continue;
    matched += 1;
    score += wordMatch ? 5 : 2;
    if (index === 0) score += 3;
    else if (index < 45) score += 1;
  }
  if (!matched) return 0;
  return score + (matched === tokens.length ? 8 : matched * 2);
}

/** Search with multi-word matching and relevance ranking (best first). */
export function searchDocumentsFor(query: string, level?: SearchLevel): SearchDocument[] {
  const tokens = tokenize(query);
  const matchingLevel = (document: SearchDocument) => !level || document.level === level;
  if (!tokens.length) return searchDocuments.filter(matchingLevel);
  return searchDocuments
    .filter((document) => matchingLevel(document))
    .map((document) => ({ document, score: scoreEntry([document.title, document.category, document.level ?? "", document.description, ...document.terms].filter(Boolean).join(" ").toLocaleLowerCase(), tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.document);
}

/** Client-side ranked search over a provided compact index. */
export function searchEntries(entries: SearchIndexEntry[], query: string, limit = 8): SearchIndexEntry[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry.haystack, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}


