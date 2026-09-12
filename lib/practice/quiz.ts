import type { LessonQuiz, LessonQuizQuestion } from "./types";
import { tajweedRules } from "@/lib/tajweed/rules";
import { shuffleOptions } from "./shuffle";

/**
 * LESSON QUIZ SYSTEM
 *
 * This system generates 2-3 focused quiz questions for each Tajweed lesson.
 * Each question tests one aspect:
 * - Q1: UNDERSTANDING - Test the definition or main concept
 * - Q2: RECOGNITION - Test whether the learner can recognize when the rule applies
 * - Q3: APPLICATION (when needed) - Test what to do when encountering the rule
 *
 * Questions are grounded in each lesson's structured content. Lessons that are
 * still awaiting qualified review are shown as review-stage questions so every
 * learner can practise, while their status remains visible to content tooling.
 */

function difficultyForRule(difficultyScore: number) {
  if (difficultyScore <= 1) return "introductory";
  if (difficultyScore <= 2) return "developing";
  if (difficultyScore <= 3) return "consolidating";
  return "advanced";
}

/**
 * Deterministic shuffle so the correct answer is not always the first option,
 * while server and client renders stay identical for a given question id.
 */
function shuffleOptionsLocal(options: string[], seed: string): { options: string[]; correctAnswer: number } {
  return shuffleOptions(options, seed);
}

function levelForRule(level: string) {
  switch (level) {
    case "Foundation":
      return 1;
    case "Essential":
      return 2;
    case "Intermediate":
      return 3;
    case "Advanced":
      return 4;
    default:
      return 1;
  }
}

function createQuizzes(): LessonQuiz[] {
  return tajweedRules.map((rule) => {
    const questions: LessonQuizQuestion[] = [];
    const difficulty = difficultyForRule(rule.difficultyScore);
    const level = levelForRule(rule.level);
    const verificationStatus: LessonQuizQuestion["verificationStatus"] = rule.verificationStatus === "verified" && rule.reviewStatus === "VERIFIED" ? "verified" : "needs-review";

    // QUESTION 1: UNDERSTANDING
    // Test the definition or core concept
    const q1Raw = [rule.shortDefinition, ...generateWrongOptions(rule, 3, "definition")];
    const q1 = createQuestion(
      `${rule.id}-q1-understanding`,
      rule.id,
      rule.slug,
      "multiple-choice",
      "understanding",
      `What is ${rule.name}?`,
      q1Raw,
      0,
      `${rule.shortDefinition} This explanation comes directly from the lesson content for ${rule.name}.`,
      difficulty,
      level,
    );
    q1.verificationStatus = verificationStatus;
    questions.push(q1);

    // QUESTION 2: RECOGNITION
    // Test whether learner can recognize when the rule applies
    const q2Options = [rule.whenItOccurs, ...generateWrongOptions(rule, 3, "occurrence")];
    const q2 = createQuestion(
      `${rule.id}-q2-recognition`,
      rule.id,
      rule.slug,
      "multiple-choice",
      "recognition",
      `When does ${rule.name} occur?`,
      q2Options,
      0,
      `${rule.name} occurs: ${rule.whenItOccurs} Review the lesson explanation and practise identifying this condition while reciting.`,
      difficulty,
      level,
    );
    q2.verificationStatus = verificationStatus;
    questions.push(q2);

    return {
      lessonId: rule.id,
      lessonSlug: rule.slug,
      lessonName: rule.name,
      questions,
    };
  });
}

function createQuestion(
  id: string,
  lessonId: string,
  lessonSlug: string,
  type: any,
  purpose: any,
  question: string,
  options: string[],
  correctAnswer: number,
  explanation: string,
  difficulty: any,
  level: any,
): LessonQuizQuestion {
  const shuffled = shuffleOptionsLocal(options, id);
  return {
    id,
    lessonId,
    lessonSlug,
    type,
    purpose,
    question,
    options: shuffled.options,
    correctAnswer: shuffled.correctAnswer,
    explanation,
    difficulty,
    level,
    verificationStatus: "needs-review",
  };
}

function generateWrongOptions(rule: any, count: number, type: "definition" | "occurrence"): string[] {
  const relatedRules = rule.relatedRules
    .map((id: string) => tajweedRules.find((r: any) => r.id === id))
    .filter(Boolean);

  const wrongOptions: string[] = [];

  if (type === "definition") {
    for (const related of relatedRules.slice(0, count)) {
      if (related && related.shortDefinition !== rule.shortDefinition) {
        wrongOptions.push(related.shortDefinition);
      }
    }
  } else if (type === "occurrence") {
    for (const related of relatedRules.slice(0, count)) {
      if (related && related.whenItOccurs !== rule.whenItOccurs) {
        wrongOptions.push(related.whenItOccurs);
      }
    }
  }

  // If not enough related rules, use generic distractors
  while (wrongOptions.length < count) {
    const generic =
      type === "definition"
        ? [
            "A letter's place of articulation in the mouth or throat.",
            "The quality or characteristic of a sound.",
            "A stopping point in recitation.",
            "A rule that changes the pronunciation of a letter.",
          ]
        : [
            "Throughout recitation and in every letter context.",
            "Only in foundational lessons.",
            "Only when followed by specific vowels.",
            "Only at the end of words.",
          ];

    const option = generic[wrongOptions.length % generic.length];
    // Guard against an endless loop when the candidate is already present.
    if (wrongOptions.includes(option) || option === rule.shortDefinition || option === rule.whenItOccurs) break;
    wrongOptions.push(option);
  }

  return wrongOptions.slice(0, count);
}

function generateLetterOrApplicationOptions(rule: any): string[] {
  if (rule.letters.length === 0) {
    return [];
  }

  // For true/false: correct statement about letters
  if (rule.letters.length > 0) {
    const letterStatement = `${rule.letters.slice(0, 2).join(", ")} are letters involved in ${rule.name}.`;
    return [letterStatement, `These letters are not involved in ${rule.name}.`];
  }

  return [];
}

// Generate all quizzes
export const lessonQuizzes: LessonQuiz[] = createQuizzes();

/**
 * Get quiz questions for a specific lesson
 */
export function getQuizForLesson(lessonSlug: string): LessonQuiz | undefined {
  return lessonQuizzes.find((quiz) => quiz.lessonSlug === lessonSlug);
}

/**
 * Get all questions for a specific lesson
 */
export function getLessonQuestions(lessonSlug: string): LessonQuizQuestion[] {
  const quiz = getQuizForLesson(lessonSlug);
  return quiz ? quiz.questions : [];
}

/**
 * Filter questions by various criteria
 */
export function filterQuizQuestions(filters: {
  lessonSlug?: string;
  purpose?: "understanding" | "recognition" | "application";
  difficulty?: string;
  level?: number;
}): LessonQuizQuestion[] {
  let allQuestions: LessonQuizQuestion[] = [];

  for (const quiz of lessonQuizzes) {
    if (filters.lessonSlug && quiz.lessonSlug !== filters.lessonSlug) {
      continue;
    }
    allQuestions.push(...quiz.questions);
  }

  if (filters.purpose) {
    allQuestions = allQuestions.filter((q) => q.purpose === filters.purpose);
  }

  if (filters.difficulty) {
    allQuestions = allQuestions.filter((q) => q.difficulty === filters.difficulty);
  }

  if (filters.level) {
    allQuestions = allQuestions.filter((q) => q.level === filters.level);
  }

  return allQuestions;
}

/**
 * Get quiz statistics
 */
export function getQuizStatistics() {
  return {
    totalLessons: lessonQuizzes.length,
    totalQuestions: lessonQuizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0),
    lessonsWithQuizzes: lessonQuizzes.filter((q) => q.questions.length > 0).length,
    averageQuestionsPerLesson: lessonQuizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0) / lessonQuizzes.length,
    verifiedQuestions: lessonQuizzes
      .flatMap((q) => q.questions)
      .filter((q) => q.verificationStatus === "verified").length,
  };
}
