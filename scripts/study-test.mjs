import assert from "node:assert/strict";
import { parseBackup, mergeBackup } from "../lib/learning/store.ts";
import { isPublishableRule, reviewFingerprint } from "../lib/editorial/reviews.ts";
import { tajweedRules } from "../lib/tajweed/rules.ts";
import { searchDocumentsFor, searchEntries } from "../lib/search/index.ts";
import { createI18n } from "../lib/i18n/index.ts";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { studyMessageIds, studyText } from "../lib/i18n/study.ts";

let checks = 0;
const check = (name, test) => { test(); checks++; console.log("✓ " + name); };
check("every stable study message has six nonempty, valid translations", () => { for (const id of studyMessageIds) for (const locale of ["en", "ar", "ur", "id", "fr", "tr"]) { const value = studyText(locale, id); assert.ok(value.trim()); assert.ok(!/\uFFFD|\?{2,}/.test(value)); } });
check("a status flag cannot approve an unreviewed lesson", () => assert.equal(isPublishableRule({ ...tajweedRules[0], verificationStatus: "verified", reviewStatus: "VERIFIED" }), false));
check("documented review fixture becomes stale when teaching text changes", () => {
  const rule = { ...tajweedRules[0], verificationStatus: "verified", reviewStatus: "VERIFIED" };
  const review = { reviewer: { name: "TEST FIXTURE — not a real reviewer", qualification: "TEST ONLY", evidenceUrl: "https://example.test/review" }, reviewedAt: "2026-01-01", sourceUrl: "https://example.test/source", locator: "test", contentFingerprint: reviewFingerprint(rule), fields: ["definition", "conditions", "letters", "pronunciation", "examples", "practice", "translation"] };
  assert.equal(isPublishableRule(rule, review), true);
  assert.equal(isPublishableRule({ ...rule, pronunciation: rule.pronunciation + " changed" }, review), false);
});
check("study backup preserves plain text notes and bounded records", () => {
  const data = parseBackup({ version: 1, records: { "what-is-tajweed": { updated: 1, read: true, notes: '<script>alert("test")</script>' } } });
  assert.equal(data.records["what-is-tajweed"].notes, '<script>alert("test")</script>');
  assert.deepEqual(Object.keys(data), ["version", "records", "sessions", "large", "goal"]);
});
check("invalid imports are rejected without accepting unexpected types", () => {
  for (const value of [{ version: 2, records: {} }, { version: 1, records: { bad: { updated: 1, read: "yes" } } }, { version: 1, records: { bad: { updated: 1, notes: "a".repeat(5001) } } }, JSON.parse('{"version":1,"records":{"__proto__":{"updated":1}}}')]) assert.throws(() => parseBackup(value));
});
check("incomplete imported quizzes cannot claim completion", () => {
  const data = parseBackup({ version: 1, records: {}, sessions: { "quiz-test": { ids: ["q-one", "q-two"], current: 0, answers: { "q-one": 1 }, completed: true } } });
  assert.equal(data.sessions["quiz-test"].completed, false);
});
check("backup restoration recovers reading preferences and sessions without replacing newer notes", () => {
  const current = parseBackup({ version: 1, records: { lesson: { updated: 20, notes: "newer" } } });
  const backup = parseBackup({ version: 1, large: true, goal: 5, last: "lesson", records: { lesson: { updated: 10, notes: "older" } }, sessions: { "quiz-test": { ids: ["q-one"], current: 0, answers: { "q-one": 1 }, completed: true } } });
  const restored = mergeBackup(current, backup);
  assert.equal(restored.records.lesson.notes, "newer"); assert.equal(restored.large, true); assert.equal(restored.goal, 5); assert.equal(restored.sessions["quiz-test"].completed, true); assert.equal(restored.last, "lesson");
});
check("common Turkish spellings find the canonical lessons", () => {
  assert.equal(searchDocumentsFor("kalkale")[0].title, "Qalqalah Letters");
  assert.ok(searchDocumentsFor("sakin nun").some(item => item.title === "Noon Sakinah"));
});
check("single Arabic letters find relevant letter sets", () => assert.ok(searchDocumentsFor("ق").some(item => item.url.includes("qalqalah"))));
check("search filters respect type and avoid duplicate glossary results", () => {
  assert.ok(searchDocumentsFor("madd", undefined, undefined, "glossary").every(item => item.kind === "glossary"));
  const results = searchDocumentsFor("madd");
  assert.ok(!results.some(item => item.kind === "glossary" && results.some(other => other.kind === "rule" && other.title === item.title)));
});
check("the quick palette also prefers the lesson over an identical glossary entry", () => {
  const entries = [{ kind: "rule", title: "Madd", description: "Lengthening", url: "/tajweed/madd", haystack: "madd lengthening" }, { kind: "glossary", title: "Madd", description: "Lengthening", url: "/glossary#madd", haystack: "madd lengthening" }];
  assert.deepEqual(searchEntries(entries, "madd").map(entry => entry.kind), ["rule"]);
});
const tr = createI18n("tr", JSON.parse(await readFile(new URL("../lib/i18n/tr.json", import.meta.url), "utf8")));
check("Turkish body text is searchable", () => assert.ok(searchDocumentsFor("kalici", undefined, tr.t).length > 0));
check("missing dynamic templates fail clearly without recursion", () => assert.throws(() => createI18n("tr").t("Which definition does this lesson give for {lesson}?"), /Missing tr translation/));
const workerSource = await readFile(new URL("../public/offline-worker.js", import.meta.url), "utf8");
const handlers = {};
let posted;
let handled;
runInNewContext(workerSource, { URL, Response, self: { location: { origin: "https://example.test" }, addEventListener: (name, fn) => { handlers[name] = fn; } }, caches: { open: async () => ({ match: async () => new Response("old"), put: async () => { throw new Error("Quota"); } }) }, fetch: async () => new Response("fresh") });
handlers.message({ data: { type: "save-lesson", version: "stale-version", url: "https://example.test/en/tajweed/what-is-tajweed/", assets: [] }, source: { url: "https://example.test/en/tajweed/what-is-tajweed/" }, ports: [{ postMessage: message => { posted = message; } }], waitUntil: promise => { handled = promise; } });
await handled;
check("an older open page cannot report a new-version offline save as successful", () => { assert.equal(posted.ok, false); assert.equal(posted.reason, "outdated"); });
handlers.fetch({ request: { method: "GET", mode: "navigate", url: "https://example.test/en/tajweed/what-is-tajweed/" }, respondWith: promise => { handled = promise; } });
const onlineResponse = await handled;
const onlineText = await onlineResponse.text();
check("offline cache quota failure never replaces fresh online content", () => assert.equal(onlineText, "fresh"));
console.log(`${checks} study and release regression checks passed.`);
