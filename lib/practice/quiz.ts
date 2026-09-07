import type { LessonQuiz, LessonQuizQuestion } from "./types";
import { tajweedRules } from "@/lib/tajweed/rules";

/**
 * LESSON QUIZ SYSTEM
 * 
 * This system generates 2-3 focused quiz questions for each Tajweed lesson.
 * Each question tests one aspect:
 * - Q1: UNDERSTANDING - Test the definition or main concept
 * - Q2: RECOGNITION - Test whether the learner can recognize when the rule applies
 * - Q3: APPLICATION (when needed) - Test what to do when encountering the rule
 * 
 * All questions are grounded in verified lesson content.
 * No invented examples or unsupported information.
 */

function difficultyForRule(difficultyScore: number) {
  if (difficultyScore <= 1) return "introductory";
  if (difficultyScore <= 2) return "developing";
  if (difficultyScore <= 3) return "consolidating";
  return "advanced";
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

    // QUESTION 1: UNDERSTANDING
    // Test the definition or core concept
    const q1Options = [rule.shortDefinition, ...generateWrongOptions(rule, 3, "definition")];
    const q1 = createQuestion(
      `${rule.id}-q1-understanding`,
      rule.id,
      rule.slug,
      "multiple-choice",
      "understanding",
      `What is ${rule.name}?`,
      q1Options,
      0,
      `${rule.shortDefinition} This is the verified definition for ${rule.name}.`,
      difficulty,
      level,
    );
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
      `${rule.name} occurs: ${rule.whenItOccurs}. This is the verified occurrence condition for this rule.`,
      difficulty,
      level,
    );
    questions.push(q2);

    // QUESTION 3: APPLICATION (conditional)
    // Only add for rules with specific letters or actionable pronunciation guidance
    if (rule.letters.length > 0 && rule.pronunciation) {
      const q3Options = generateLetterOrApplicationOptions(rule);
      if (q3Options.length >= 2) {
        const q3 = createQuestion(
          `${rule.id}-q3-application`,
          rule.id,
          rule.slug,
          rule.letters.length > 0 ? "true-false" : "multiple-choice",
          "application",
          rule.letters.length > 0
            ? `True or false: ${rule.letters.slice(0, 2).join(", ")} are letters involved in ${rule.name}.`
            : `In ${rule.name}, the learner should: ${rule.pronunciation.split(".")[0]}.`,
          q3Options,
          0,
          `${rule.pronunciation || rule.commonMistakes[0]}. This guidance comes from the verified lesson content for ${rule.name}.`,
          difficulty,
          level,
        );
        questions.push(q3);
      }
    }

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
  return {
    id,
    lessonId,
    lessonSlug,
    type,
    purpose,
    question,
    options,
    correctAnswer,
    explanation,
    difficulty,
    level,
    verificationStatus: "verified",
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
    if (!wrongOptions.includes(option) && option !== rule.shortDefinition && option !== rule.whenItOccurs) {
      wrongOptions.push(option);
    }
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
