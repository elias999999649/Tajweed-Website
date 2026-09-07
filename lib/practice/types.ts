import type { Difficulty, LearningLevel } from "@/lib/taxonomy/types";

export type ExerciseType =
  | "identify-rule"
  | "choose-rule"
  | "identify-letter"
  | "rule-applies"
  | "match-definition"
  | "match-example"
  | "true-false"
  | "multiple-choice"
  | "understanding"
  | "recognition"
  | "application";

export type QuestionPurpose = "understanding" | "recognition" | "application";

export type PracticeQuestion = {
  id: string;
  type: ExerciseType;
  question: string;
  options: string[];
  answers: string[];
  correctAnswer: number;
  explanation: string;
  relatedRule: string;
  difficulty: Difficulty;
  category: string;
  level: LearningLevel;
  reviewStatus: "needs-qualified-review" | "approved";
  sourceIds: string[];
};

export type LessonQuizQuestion = {
  id: string;
  lessonId: string;
  lessonSlug: string;
  type: ExerciseType;
  purpose: QuestionPurpose;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  level: LearningLevel;
  verificationStatus: "verified" | "needs-review" | "draft";
};

export type LessonQuiz = {
  lessonId: string;
  lessonSlug: string;
  lessonName: string;
  questions: LessonQuizQuestion[];
};

export type PracticeFilter = {
  level?: LearningLevel;
  category?: string;
  type?: ExerciseType;
  difficulty?: Difficulty;
};
