import type { QuranExampleRecord, QuranExampleStatus } from "./types";
import { validateQuranExample } from "./types";

/**
 * Intentionally empty until each example has been independently verified.
 * Never add a Quran quotation here from memory or by inference.
 */
export const quranExamples: QuranExampleRecord[] = [];

export function getPublishedQuranExamples() {
  return quranExamples.filter((example) => example.status === "verified" && validateQuranExample(example).length === 0);
}

export function getQuranExamplesByRule(ruleId: string, status?: QuranExampleStatus) {
  return quranExamples.filter((example) => example.ruleId === ruleId && (!status || example.status === status));
}

export function validateAllQuranExamples() {
  return quranExamples.flatMap((example) => validateQuranExample(example).map((error) => ({ id: example.id, error })));
}
