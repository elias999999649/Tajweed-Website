import type { TajweedTopic } from "@/lib/taxonomy/types";
import { tajweedTopics } from "@/lib/taxonomy";
import { tajweedRules } from "@/lib/tajweed/rules";

/**
 * Some taxonomy topics share an id and slug with a published rule lesson, and
 * others are placeholders for lessons still in preparation. This map connects
 * every topic to the rule lesson that teaches it, so no internal link can 404.
 * Keep the values aligned with rule ids in lib/tajweed/rules.ts.
 */
export const topicLessonMap: Record<string, string> = {
  makharij: "makharij-al-huruf",
  sifaat: "sifaat-al-huruf",
  qalqalah: "qalqalah-letters",
  "lam-rules": "lam-shamsiyyah",
  "raa-rules": "raa-heavy-and-light",
  // Topic slug differs slightly from the rule slug ("lis" vs "li").
  "madd-arid-lis-sukun": "madd-arid-li-sukun",
  // Topic ids "stop-signs" and "how-to-resume" differ from their slugs, so the
  // map must use the topic *id* (see tajweedTopics in lib/taxonomy/index.ts).
  "stop-signs": "mushaf-stopping-symbols",
  "types-of-waqf": "major-stopping-concepts",
  "how-to-resume": "ibtida",
  "noon-and-meem-mushaddad": "ghunnah",
  "idgham-between-letters": "idgham",
  "tafkhim-and-tarqiq": "tafkhim",
  // Topic id "hamzatul-wasl" differs from the rule id "hamzat-al-wasl".
  "hamzatul-wasl": "hamzat-al-wasl",
  "cutting-and-joining": "hamzat-al-wasl",
  "recitation-modes": "waqf",
};

export type TopicLessonLink = {
  topic: TajweedTopic;
  lessonSlug: string;
  /** True when the topic itself is a rule lesson page on /tajweed/[slug]. */
  isLesson: boolean;
  /** True when a different lesson teaches this topic until its own page exists. */
  isPreparation: boolean;
};

function lessonSlugForTopic(topic: TajweedTopic): string {
  const mapped = topicLessonMap[topic.id];
  if (mapped && tajweedRules.some((rule) => rule.id === mapped)) return mapped;
  const relatedRule = topic.relatedRules.find((id) => tajweedRules.some((rule) => rule.id === id));
  return relatedRule ?? "what-is-tajweed";
}

/** Resolve the /tajweed/[slug] lesson a topic links to. */
export function getTopicLessonLink(topic: TajweedTopic): TopicLessonLink {
  const isLesson = tajweedRules.some((rule) => rule.id === topic.id);
  const lessonSlug = isLesson ? topic.slug : lessonSlugForTopic(topic);
  const isPreparation = !isLesson;
  return { topic, lessonSlug, isLesson, isPreparation };
}

export function getTopicLessonLinkBySlug(slug: string): TopicLessonLink | undefined {
  const topic = tajweedTopics.find((item) => item.slug === slug);
  return topic ? getTopicLessonLink(topic) : undefined;
}
