import { tajweedRules } from "./rules";
import type { TajweedGlossaryEntry } from "./types";

export const tajweedGlossary: TajweedGlossaryEntry[] = tajweedRules.map((rule) => ({
  id: rule.id,
  englishTerm: rule.name,
  arabicTerm: rule.arabicName ?? rule.name,
  arabicSpelling: rule.arabicName ?? "REQUIRES SCHOLAR REVIEW",
  definition: rule.shortDefinition,
  detailedExplanation: rule.detailedExplanation,
  relatedRuleIds: [rule.id, ...rule.relatedRules],
  relatedLessonIds: [rule.slug],
  pronunciationGuidance: rule.pronunciation,
  sourceIds: rule.sources,
  verificationStatus: rule.verificationStatus,
}));

export function searchGlossary(query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return tajweedGlossary;
  return tajweedGlossary.filter((entry) => [entry.englishTerm, entry.arabicTerm, entry.arabicSpelling, entry.definition, entry.detailedExplanation].join(" ").toLocaleLowerCase().includes(normalized));
}

export function getGlossaryEntry(id: string) {
  return tajweedGlossary.find((entry) => entry.id === id);
}
