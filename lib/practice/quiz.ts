import type { LessonQuiz, LessonQuizQuestion } from "./types";
import type { TajweedRuleRecord } from "@/lib/tajweed/types";
import { tajweedRules } from "@/lib/tajweed/rules";
import { shuffleOptions } from "./shuffle";

/** Review-stage comprehension checks are separate from the approved practice bank. */
function difficultyForRule(score: number): LessonQuizQuestion["difficulty"] {
  if (score <= 1) return "introductory";
  if (score <= 2) return "developing";
  if (score <= 3) return "consolidating";
  return "advanced";
}

function makeQuestion(rule: TajweedRuleRecord, suffix: string, purpose: LessonQuizQuestion["purpose"], question: string, options: string[], explanation: string): LessonQuizQuestion {
  const id = `${rule.id}-${suffix}`;
  const shuffled = shuffleOptions([...new Set(options)], id);
  return {
    id, lessonId: rule.id, lessonSlug: rule.slug, type: "multiple-choice", purpose,
    question, options: shuffled.options, correctAnswer: shuffled.correctAnswer, explanation,
    difficulty: difficultyForRule(rule.difficultyScore),
    level: ({ Foundation: 1, Essential: 2, Intermediate: 3, Advanced: 4 } as const)[rule.level],
    verificationStatus: rule.verificationStatus === "verified" && rule.reviewStatus === "VERIFIED" ? "verified" : "needs-review",
  };
}

function quizForRule(rule: TajweedRuleRecord): LessonQuiz {
  // Ask for the lesson definition, not whether an overlapping rule is false.
  const alternatives = tajweedRules
    .filter((other) => other.category !== rule.category && other.shortDefinition !== rule.shortDefinition)
    .map((other) => other.shortDefinition);
  const offset = tajweedRules.indexOf(rule) % alternatives.length;
  const distractors = [...alternatives.slice(offset), ...alternatives.slice(0, offset)].slice(0, 3);
  return {
    lessonId: rule.id, lessonSlug: rule.slug, lessonName: rule.name,
    questions: [
      makeQuestion(rule, "q1-understanding", "understanding", `Which definition does this lesson give for ${rule.name}?`,
        [rule.shortDefinition, ...distractors], `${rule.shortDefinition} Compare the other choices with the lesson explanation; they describe different study topics.`),
      makeQuestion(rule, "q2-application", "application", `Which practice guidance belongs to this lesson on ${rule.name}?`,
        [rule.pronunciation,
          "Use transliteration as a complete substitute for listening and teacher feedback.",
          "Read faster whenever a sound feels uncertain, without checking it.",
          "Memorise the rule name and skip listening, repetition, and correction."],
        `${rule.pronunciation} The other choices skip the careful listening and feedback needed for pronunciation practice.`),
    ],
  };
}

export const lessonQuizzes: LessonQuiz[] = tajweedRules.map(quizForRule);
export function getQuizForLesson(slug: string) { return lessonQuizzes.find((quiz) => quiz.lessonSlug === slug); }
export function getLessonQuestions(slug: string): LessonQuizQuestion[] { return getQuizForLesson(slug)?.questions ?? []; }
export function filterQuizQuestions(filters: { lessonSlug?: string; purpose?: LessonQuizQuestion["purpose"]; difficulty?: string; level?: number }): LessonQuizQuestion[] {
  return lessonQuizzes.filter((quiz) => !filters.lessonSlug || quiz.lessonSlug === filters.lessonSlug).flatMap((quiz) => quiz.questions)
    .filter((question) => (!filters.purpose || question.purpose === filters.purpose) && (!filters.difficulty || question.difficulty === filters.difficulty) && (!filters.level || question.level === filters.level));
}
export function getQuizStatistics() {
  const questions = lessonQuizzes.flatMap((quiz) => quiz.questions);
  return { totalLessons: lessonQuizzes.length, totalQuestions: questions.length,
    lessonsWithQuizzes: lessonQuizzes.filter((quiz) => quiz.questions.length > 0).length,
    averageQuestionsPerLesson: lessonQuizzes.length ? questions.length / lessonQuizzes.length : 0,
    verifiedQuestions: questions.filter((question) => question.verificationStatus === "verified").length };
}
