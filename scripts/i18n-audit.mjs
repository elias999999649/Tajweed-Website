import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";
import { tajweedRules } from "../lib/tajweed/rules.ts";
import { tajweedExamples } from "../lib/tajweed/examples.ts";
import { articles } from "../lib/articles/content.ts";
import { tajweedLevels, tajweedTopics } from "../lib/taxonomy/index.ts";
import { curriculumAreas } from "../lib/tajweed/curriculum.ts";
import { taxonomySources } from "../lib/taxonomy/sources.ts";
import { lessonQuizzes } from "../lib/practice/quiz.ts";
import { createI18n } from "../lib/i18n/index.ts";

const required = new Set();
const add = (...items) => items.flat(Infinity).forEach((item) => { if (typeof item === "string" && /[A-Za-z]/.test(item)) required.add(item.replace(/\s+/g, " ").trim()); });
for (const r of tajweedRules) add(r.name, r.category, r.level, r.shortDefinition, r.detailedExplanation, r.whenItOccurs, r.pronunciation, r.commonMistakes, r.memoryTip, r.practiceQuestions, r.reviewNotes, r.faq.flatMap((f) => [f.question, f.answer]));
for (const e of tajweedExamples) if (!e.reviewIssue) add(e.translation, e.explanation, e.note);
for (const a of articles) add(a.title, a.description, a.category, a.readingTime, a.searchIntent, a.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets || [])]));
for (const level of tajweedLevels) add(level.title, level.purpose);
for (const topic of tajweedTopics) add(topic.title, topic.category, topic.summary);
for (const area of curriculumAreas) add(area.title, area.summary);
for (const source of taxonomySources) add(source.title, source.note);
for (const quiz of lessonQuizzes) for (const q of quiz.questions) add(q.question, q.options, q.explanation);
const catalog = JSON.parse(await readFile(new URL("../docs/translation-source-catalog.json", import.meta.url), "utf8"));
// Explicit t() calls must be covered even when they are not reached by a
// representative browser journey (empty states and errors included).
for (const [key, locations] of Object.entries(catalog)) if (locations.some((location) => location.startsWith("app/[lang]/") || location.startsWith("components/") || location === "runtime educational labels")) add(key);
const results = {};
const selected = process.argv.slice(2).filter((item) => ["ar", "ur", "id", "fr"].includes(item));
for (const locale of (selected.length ? selected : ["ar", "ur", "id", "fr"])) {
  const dictionarySource = await readFile(new URL(`../lib/i18n/${locale}.json`, import.meta.url), "utf8");
  const dictionary = JSON.parse(dictionarySource);
  const { t } = createI18n(locale, dictionary);
  const missing = new Set();
  const invalidPlaceholders = [];
  const encodingIssues = [];
  const seenKeys = new Set();
  const duplicateKeys = [];
  const jsonAst = ts.parseJsonText(`${locale}.json`, dictionarySource);
  for (const property of jsonAst.statements[0]?.expression?.properties ?? []) {
    const key = property.name?.text;
    if (seenKeys.has(key)) duplicateKeys.push(key);
    seenKeys.add(key);
  }
  for (const key of required) { try { t(key); } catch (error) { missing.add(error.message.replace(/^Missing \w+ translation: /, "")); } }
  for (const [key, value] of Object.entries(dictionary)) {
    const placeholders = (message) => [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
    if (typeof value !== "string" || !value.trim() || placeholders(key) !== placeholders(value)) invalidPlaceholders.push(key);
    if (typeof value === "string" && (/\uFFFD|\?{2,}|[A-Za-z]\?[a-z]|â€|Ã[\u0080-\u00BF]/.test(value))) encodingIssues.push(key);
  }
  const duplicateQuizOptions = [];
  for (const quiz of lessonQuizzes) for (const question of quiz.questions) {
    try {
      const translatedOptions = question.options.map((option) => t(option).normalize("NFKC").replace(/\s+/g, " ").trim());
      if (new Set(translatedOptions).size !== translatedOptions.length) duplicateQuizOptions.push(question.id);
    } catch { /* Missing messages are already reported above. */ }
  }
  results[locale] = { entries: Object.keys(dictionary).length, missing: [...missing].sort(), invalidPlaceholders, duplicateKeys, encodingIssues, duplicateQuizOptions };
  console.log(`${locale}: ${Object.keys(dictionary).length} translations; ${missing.size} missing; ${invalidPlaceholders.length} invalid placeholders; ${duplicateKeys.length} duplicate keys; ${encodingIssues.length} encoding issues; ${duplicateQuizOptions.length} duplicate quiz option sets`);
}
await writeFile(new URL("../docs/i18n-audit-results.json", import.meta.url), JSON.stringify(results, null, 2) + "\n");
process.exitCode = Object.values(results).some((result) => result.missing.length || result.invalidPlaceholders.length || result.duplicateKeys.length || result.encodingIssues.length || result.duplicateQuizOptions.length) ? 1 : 0;
