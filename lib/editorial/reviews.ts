import type { TajweedRuleRecord } from "@/lib/tajweed/types";
export type ReviewRecord = { reviewer: { name: string; qualification: string; evidenceUrl: string }; reviewedAt: string; sourceUrl: string; locator: string; contentFingerprint: string; fields: readonly string[] };
const requiredFields = ["definition", "conditions", "letters", "pronunciation", "examples", "practice", "translation"] as const;
// Add only actual, documented approvals. A source author or reciter is not
// implicitly a reviewer of this website.
export const qualifiedReviews: Record<string, ReviewRecord> = {};
/** Change detector, not a cryptographic signature or proof of scholarly approval. */
export function reviewFingerprint(rule: TajweedRuleRecord) {
  const copy = { name: rule.name, arabicName: rule.arabicName, shortDefinition: rule.shortDefinition, detailedExplanation: rule.detailedExplanation, whenItOccurs: rule.whenItOccurs, letters: rule.letters, pronunciation: rule.pronunciation, commonMistakes: rule.commonMistakes, memoryTip: rule.memoryTip, practiceQuestions: rule.practiceQuestions, faq: rule.faq, quranExamples: rule.quranExamples, sources: rule.sources, sourceReferences: rule.sourceReferences };
  let hash = 2166136261;
  for (const character of JSON.stringify(copy)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `content-v1-${(hash >>> 0).toString(16)}`;
}
export function isPublishableRule(rule: TajweedRuleRecord, review = qualifiedReviews[rule.id]): boolean {
  return rule.verificationStatus === "verified" && rule.reviewStatus === "VERIFIED" && !!review && !!review.reviewer.name.trim() && !!review.reviewer.qualification.trim() && /^https:\/\//.test(review.reviewer.evidenceUrl) && /^https:\/\//.test(review.sourceUrl) && !!review.locator.trim() && /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt) && Number.isFinite(Date.parse(review.reviewedAt)) && Date.parse(review.reviewedAt) <= Date.now() && requiredFields.every(field => review.fields.includes(field)) && review.contentFingerprint === reviewFingerprint(rule);
}
