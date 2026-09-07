import { practiceQuestions } from "./questions";
import type { PracticeFilter } from "./types";

export { practiceQuestions };
export type { ExerciseType, PracticeQuestion, PracticeFilter } from "./types";

export function filterPracticeQuestions(filter: PracticeFilter = {}) {
  return practiceQuestions.filter((question) => (!filter.level || question.level === filter.level) && (!filter.category || question.category === filter.category) && (!filter.type || question.type === filter.type) && (!filter.difficulty || question.difficulty === filter.difficulty));
}
