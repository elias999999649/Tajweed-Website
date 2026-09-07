import { tajweedExamples } from "./examples";
import { tajweedRules } from "./rules";
import { practiceQuestions } from "@/lib/practice";
import type { TajweedRuleRecord } from "./types";

export type RuleContentAudit = {
  ruleId: string;
  ruleName: string;
  definitionPresent: boolean;
  explanationPresent: boolean;
  conditionPresent: boolean;
  lettersPresent: boolean;
  pronunciationPresent: boolean;
  authenticExamplesPresent: boolean;
  examplesVerified: boolean;
  commonMistakesPresent: boolean;
  relatedRulesLinked: boolean;
  practicePresent: boolean;
  quizPresent: boolean;
  sourcesPresent: boolean;
  levelPresent: boolean;
  prerequisitesDefined: boolean;
  requiresReview: boolean;
  issues: string[];
};

const meaningful = (value: string) => value.trim().length >= 20;
const hasRule = (id: string) => tajweedRules.some((rule) => rule.id === id);

export function auditRuleContent(rule: TajweedRuleRecord): RuleContentAudit {
  const examples = tajweedExamples.filter((example) => example.ruleId === rule.id);
  const issues: string[] = [];
  const definitionPresent = meaningful(rule.shortDefinition);
  const explanationPresent = meaningful(rule.detailedExplanation);
  const conditionPresent = meaningful(rule.whenItOccurs);
  const lettersPresent = rule.letters.length > 0 || ["what-is-tajweed", "why-tajweed-is-studied", "waqf", "ibtida"].includes(rule.id);
  const pronunciationPresent = meaningful(rule.pronunciation);
  const authenticExamplesPresent = examples.some((example) => example.type === "quran");
  const examplesVerified = examples.some((example) => example.type === "quran") && examples.filter((example) => example.type === "quran").every((example) => example.verificationStatus === "verified");
  const relatedRulesLinked = rule.relatedRules.every(hasRule);
  const quizPresent = practiceQuestions.some((question) => question.relatedRule === rule.id);

  if (!definitionPresent) issues.push("Definition missing or too brief");
  if (!explanationPresent) issues.push("Detailed explanation missing or too brief");
  if (!conditionPresent) issues.push("Occurrence condition missing or too brief");
  if (!lettersPresent) issues.push("Letter set missing; REQUIRES SCHOLAR REVIEW");
  if (!pronunciationPresent) issues.push("Pronunciation guidance missing or too brief");
  if (!authenticExamplesPresent) issues.push("No authentic Quran example");
  if (!examplesVerified) issues.push("Examples are not fully verified; REQUIRES SCHOLAR REVIEW");
  if (!rule.commonMistakes.length) issues.push("Common mistakes missing");
  if (!relatedRulesLinked) issues.push("Related rule link is unresolved");
  if (!rule.practiceQuestions.length) issues.push("Practice prompt missing");
  if (!quizPresent) issues.push("No verified quiz questions");
  if (!rule.sources.length || !rule.sourceReferences.length) issues.push("Source reference missing");
  if (!rule.level) issues.push("Learning level missing");
  if (!rule.prerequisites) issues.push("Prerequisites missing");

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    definitionPresent,
    explanationPresent,
    conditionPresent,
    lettersPresent,
    pronunciationPresent,
    authenticExamplesPresent,
    examplesVerified,
    commonMistakesPresent: rule.commonMistakes.length > 0,
    relatedRulesLinked,
    practicePresent: rule.practiceQuestions.length > 0,
    quizPresent,
    sourcesPresent: rule.sources.length > 0 && rule.sourceReferences.length > 0,
    levelPresent: Boolean(rule.level),
    prerequisitesDefined: Boolean(rule.prerequisites),
    requiresReview: rule.verificationStatus !== "verified" || rule.reviewStatus !== "VERIFIED" || issues.length > 0,
    issues,
  };
}

export const tajweedContentAudit = tajweedRules.map(auditRuleContent);
export const completeRules = tajweedContentAudit.filter((audit) => !audit.requiresReview);
export const reviewRequiredRules = tajweedContentAudit.filter((audit) => audit.requiresReview);
