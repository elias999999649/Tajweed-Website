import { tajweedExamples } from "@/lib/tajweed/examples";
import { tajweedRules } from "@/lib/tajweed/rules";
import type { TajweedRuleRecord } from "@/lib/tajweed/types";
import { shuffleOptions } from "./shuffle";
import type { PracticeQuestion } from "./types";

const verifiedRules = tajweedRules.filter((rule) => rule.verificationStatus === "verified" && rule.reviewStatus === "VERIFIED");
const verifiedExamples = tajweedExamples.filter((example) => example.type === "quran" && example.verificationStatus === "verified");

function difficultyFor(rule: TajweedRuleRecord): PracticeQuestion["difficulty"] {
  if (rule.difficultyScore <= 1) return "introductory";
  if (rule.difficultyScore <= 3) return "developing";
  if (rule.difficultyScore <= 5) return "consolidating";
  return "advanced";
}

function levelFor(rule: TajweedRuleRecord): PracticeQuestion["level"] {
  return { Foundation: 1, Essential: 2, Intermediate: 3, Advanced: 4 }[rule.level] as PracticeQuestion["level"];
}

function baseQuestion(rule: TajweedRuleRecord, id: string, type: PracticeQuestion["type"], question: string, answers: string[], correctAnswer: number, explanation: string): PracticeQuestion {
  // Deterministic shuffle so the correct answer is not always listed first.
  const { options, correctAnswer: shuffledCorrect } = shuffleOptions(answers, id);
  return { id, type, question, options, answers: options, correctAnswer: shuffledCorrect, explanation, relatedRule: rule.id, difficulty: difficultyFor(rule), category: rule.category, level: levelFor(rule), reviewStatus: "approved", sourceIds: rule.sources };
}

function distinctOptions(correct: string, alternatives: string[], limit = 4) {
  return [...new Set([correct, ...alternatives.filter((alternative) => alternative !== correct)])].slice(0, limit);
}

function questionsForRule(rule: TajweedRuleRecord): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  const otherRules = verifiedRules.filter((candidate) => candidate.id !== rule.id);
  const otherNames = otherRules.map((candidate) => candidate.name);
  const ruleOptions = distinctOptions(rule.name, otherNames);

  if (ruleOptions.length >= 2) {
    questions.push(baseQuestion(rule, `${rule.id}-identify`, "identify-rule", `Which Tajweed rule is described by this definition? ${rule.shortDefinition}`, ruleOptions, 0, `${rule.name} is correct because the definition in the question is the verified short definition stored for this rule.`));
    questions.push(baseQuestion(rule, `${rule.id}-choice`, "choose-rule", `Which rule should you study for this condition? ${rule.whenItOccurs}`, ruleOptions, 0, `${rule.name} is correct because this condition is the verified occurrence statement stored for the rule.`));
  }

  const letterPool = [...new Set(verifiedRules.flatMap((candidate) => candidate.letters))];
  const letterOptions = distinctOptions(rule.letters[0], letterPool.filter((letter) => !rule.letters.includes(letter)));
  if (rule.letters.length && letterOptions.length >= 2) {
    questions.push(baseQuestion(rule, `${rule.id}-letter`, "identify-letter", `Which letter is included in the verified letter set for ${rule.name}?`, letterOptions, 0, `${rule.letters[0]} is correct because it appears in the stored letter set for ${rule.name}.`));
  }

  const conditionOptions = distinctOptions(rule.whenItOccurs, otherRules.map((candidate) => candidate.whenItOccurs));
  if (conditionOptions.length >= 2) {
    questions.push(baseQuestion(rule, `${rule.id}-condition`, "rule-applies", `Which condition belongs to ${rule.name}?`, conditionOptions, 0, `This condition is correct because it is the exact occurrence statement stored for ${rule.name}.`));
  }

  const example = verifiedExamples.find((candidate) => candidate.ruleId === rule.id);
  const otherExampleTexts = verifiedExamples.filter((candidate) => candidate.ruleId !== rule.id).map((candidate) => candidate.arabicText);
  const exampleOptions = example ? distinctOptions(example.arabicText, otherExampleTexts) : [];
  if (example && exampleOptions.length >= 2) {
    questions.push(baseQuestion(rule, `${rule.id}-example`, "match-example", `Which verified Quran example belongs to ${rule.name}?`, exampleOptions, 0, `This example is correct because it is stored as a verified Quran example for ${rule.name}, including its reference and rule annotation.`));
  }

  const related = rule.relatedRules.map((id) => verifiedRules.find((candidate) => candidate.id === id)).find(Boolean);
  if (related) {
    questions.push(baseQuestion(rule, `${rule.id}-compare`, "match-definition", `Which rule matches this condition: ${rule.whenItOccurs}`, [rule.name, related.name], 0, `${rule.name} is correct because the condition is stored on this rule. ${related.name} is related, but its condition is recorded separately.`));
  }

  questions.push(baseQuestion(rule, `${rule.id}-true`, "true-false", `True or false: ${rule.shortDefinition}`, ["True", "False"], 0, `True. The statement repeats the verified short definition stored for ${rule.name}.`));
  return questions;
}

export const practiceQuestions: PracticeQuestion[] = verifiedRules.flatMap(questionsForRule);
