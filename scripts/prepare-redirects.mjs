import { writeFile } from "node:fs/promises";
import { locales } from "../lib/i18n/index.ts";
import { tajweedTopics } from "../lib/taxonomy/index.ts";
import { getTopicLessonLink } from "../lib/taxonomy/lessons.ts";
const lines = ["# Equivalent lesson aliases only. Unprefixed language-preference pages are preserved."];
for (const locale of locales) for (const topic of tajweedTopics) {
  const link = getTopicLessonLink(topic);
  if (!link.lessonSlug) continue;
  const source = `/${locale}/learn/${topic.slug}`;
  const target = `/${locale}/tajweed/${link.lessonSlug}/`;
  lines.push(`${source} ${target} 301`, `${source}/ ${target} 301`);
}
await writeFile(new URL("../public/_redirects", import.meta.url), lines.join("\n") + "\n");
await import("./prepare-offline.mjs");
