/**
 * Content integrity audit.
 *
 * Run with: npm run audit
 * (uses scripts/register.mjs to map the "@/..." imports used across the app)
 *
 * Verifies quiz/question generation and cross-references between rules,
 * curriculum, and examples. Exits with code 1 on any failure so it can
 * run in CI before deploying.
 */
import { getQuizStatistics, lessonQuizzes } from "../lib/practice/quiz.ts";
import { practiceQuestions } from "../lib/practice/questions.ts";
import { tajweedRules } from "../lib/tajweed/rules.ts";
import { curriculumAreas } from "../lib/tajweed/curriculum.ts";
import { tajweedExamples } from "../lib/tajweed/examples.ts";
import { isPublishableRule } from "../lib/editorial/reviews.ts";
import { tajweedContentAudit } from "../lib/tajweed/content-audit.ts";

let failures = 0;
const fail = (message) => { console.error("  ✗ " + message); failures++; };
const ok = (message) => console.log("  ✓ " + message);

console.log("=== QUIZ SYSTEM ===");
const stats = getQuizStatistics();
console.log(`  Lessons: ${stats.totalLessons} · with quizzes: ${stats.lessonsWithQuizzes} · questions: ${stats.totalQuestions}`);
const approvedRuleCount = tajweedRules.filter((rule) => rule.verificationStatus === "verified" && rule.reviewStatus === "VERIFIED").length;
if (stats.totalLessons === tajweedRules.length) ok("every lesson has a quiz");
else fail("some lessons are missing a quiz");
if (stats.totalLessons > 0) lessonQuizzes.every(quiz => quiz.questions.length >= 3) ? ok("every lesson has at least 3 questions") : fail("some lessons have fewer than 3 questions");
console.log(`  Review-stage lessons: ${stats.totalLessons - approvedRuleCount}`);
const questionIds = new Set();
const quizFailuresBefore = failures;
lessonQuizzes.forEach((quiz) => {
  quiz.questions.forEach((question) => {
    if (questionIds.has(question.id)) fail(`duplicate question id ${question.id}`);
    questionIds.add(question.id);
    if (new Set(question.options).size !== question.options.length) fail(`duplicate options ${question.id}`);
    if (question.options.length < 2) fail(`question ${question.id} has fewer than 2 options`);
    if (!Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) fail(`question ${question.id} has an out-of-range correctAnswer`);
  });
});
if (failures === quizFailuresBefore) ok("all quiz answers valid and choices distinct");

console.log("=== PRACTICE BANK ===");
console.log(`  Questions: ${practiceQuestions.length}`);
if (!practiceQuestions.length && approvedRuleCount === 0) ok("practice bank is correctly gated until content review is complete");
else if (practiceQuestions.length) ok("practice bank is not empty");
else fail("approved rules exist but practice bank is empty");
if (practiceQuestions.length) {
  const alwaysFirst = practiceQuestions.filter((q) => q.correctAnswer === 0).length;
  console.log(`  Correct answer at position A: ${alwaysFirst}/${practiceQuestions.length}`);
  alwaysFirst < practiceQuestions.length * 0.6 ? ok("answers are shuffled") : fail("correct answer is nearly always the first option");
}

console.log("=== RULE CROSS-REFERENCES ===");
const ruleIds = new Set(tajweedRules.map((rule) => rule.id));
let dangling = 0;
tajweedRules.forEach((rule) => {
  [...rule.relatedRules, ...rule.prerequisites].forEach((id) => {
    if (!ruleIds.has(id)) { fail(`${rule.id} references missing rule "${id}"`); dangling++; }
  });
});
if (dangling === 0) ok("all relatedRules/prerequisites resolve");

console.log("=== CURRICULUM COVERAGE ===");
const curriculumIds = new Set(curriculumAreas.flatMap((area) => area.rules));
const missing = tajweedRules.filter((rule) => !curriculumIds.has(rule.id));
console.log(`  Rules in a curriculum area: ${tajweedRules.length - missing.length}/${tajweedRules.length}`);
if (missing.length) fail("not in curriculum: " + missing.map((rule) => rule.id).join(", "));
const orderedIds = curriculumAreas.flatMap(area => area.rules);
if (orderedIds.length !== curriculumIds.size) fail("a rule appears in multiple curriculum positions");
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { fail(`prerequisite cycle at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  for (const prerequisite of tajweedRules.find(rule => rule.id === id)?.prerequisites ?? []) visit(prerequisite);
  visiting.delete(id); visited.add(id);
}
for (const rule of tajweedRules) visit(rule.id);
const curriculumMissing = [...curriculumIds].filter((id) => !ruleIds.has(id));
curriculumMissing.length ? fail("curriculum references rules that do not exist: " + curriculumMissing.join(", ")) : ok("all curriculum rule ids exist");

console.log("=== EXAMPLE REFERENCES ===");
const exampleIssues = tajweedExamples.filter((example) => !ruleIds.has(example.ruleId));
exampleIssues.length ? fail("examples reference missing rules: " + exampleIssues.map((e) => e.ruleId).join(", ")) : ok("all example ruleIds resolve");
for (const example of tajweedExamples.filter(example => !example.reviewIssue)) {
  if (example.highlightedText && !example.arabicText.includes(example.highlightedText)) fail(`highlight outside example ${example.id}`);
  if (example.type === "quran" && example.verificationStatus === "verified" && (!example.surah || !Number.isInteger(example.verse) || !example.sourceIds?.length)) fail(`missing verified Quran provenance ${example.id}`);
}
console.log("=== PUBLICATION READINESS (separate from structural integrity) ===");
console.log(`  ${tajweedContentAudit.filter(audit => !audit.requiresReview).length}/${tajweedRules.length} lessons meet full content-readiness checks.`);
for (const rule of tajweedRules) if ((rule.verificationStatus === "verified" || rule.reviewStatus === "VERIFIED") && !isPublishableRule(rule)) fail(`approval evidence missing or stale: ${rule.id}`);

console.log("");
if (failures) {
  console.error(`AUDIT FAILED with ${failures} problem(s).`);
  process.exit(1);
} else {
  console.log("AUDIT PASSED.");
}
