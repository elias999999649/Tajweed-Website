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
  ...tajweedRules.map((rule): SearchDocument => ({ kind: "rule", title: rule.name, category: rule.category, level: searchLevelFor(rule.level), description: rule.shortDefinition, url: `/tajweed/${rule.slug}`, terms: [rule.arabicName ?? "", rule.detailedExplanation, ...rule.prerequisites, ...rule.relatedRules] })),
  ...tajweedGlossary.map((entry): SearchDocument => ({ kind: "glossary", title: entry.englishTerm, category: "Tajweed glossary", description: entry.definition, url: `/glossary#${entry.id}`, terms: [entry.arabicTerm, entry.arabicSpelling, entry.detailedExplanation, ...entry.relatedRuleIds] })),
  ...supportingDocuments,
];

export const searchSuggestions = ["ikhfa", "noon sakinah", "madd", "qalqalah", "heavy letters", "makharij"];

export function searchDocumentsFor(query: string, level?: SearchLevel) {
  const normalized = query.trim().toLocaleLowerCase();
  return searchDocuments.filter((document) => {
    const matchesLevel = !level || document.level === level;
    if (!normalized) return matchesLevel;
    const haystack = [document.title, document.category, document.level, document.description, ...document.terms].filter(Boolean).join(" ").toLocaleLowerCase();
    return matchesLevel && haystack.includes(normalized);
  });
}
