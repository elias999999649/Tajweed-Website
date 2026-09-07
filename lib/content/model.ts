import type { Difficulty, LearningLevel, PracticeType, TajweedTopic } from "@/lib/taxonomy/types";

export type ContentKind = "lesson" | "rule" | "example" | "exercise" | "quiz" | "article" | "glossary";

export type ContentRecord = {
  id: string;
  kind: ContentKind;
  slug: string;
  title: string;
  summary: string;
  topicId?: string;
  level?: LearningLevel;
  category?: string;
  difficulty?: Difficulty;
  prerequisites?: string[];
  relatedContentIds?: string[];
  practiceTypes?: PracticeType[];
  arabicSearchTerms?: string[];
  englishSearchTerms?: string[];
  sourceIds: string[];
  reviewStatus: "draft" | "needs-qualified-review" | "approved" | "published";
  readingTraditions: string[];
  publishedAt?: string;
  updatedAt: string;
};

export type ContentFilters = {
  kind?: ContentKind;
  level?: LearningLevel;
  category?: string;
  difficulty?: Difficulty;
  practiceType?: PracticeType;
  readingTradition?: string;
  query?: string;
};

export function filterTopics(topics: TajweedTopic[], filters: ContentFilters) {
  const query = filters.query?.trim().toLowerCase();
  return topics.filter((topic) => {
    const searchable = [topic.title, topic.arabicName, topic.transliteration, topic.category, topic.seoTopic, topic.summary, ...topic.tags].filter(Boolean).join(" ").toLowerCase();
    return (!filters.level || topic.level === filters.level)
      && (!filters.category || topic.category === filters.category)
      && (!filters.difficulty || topic.estimatedDifficulty === filters.difficulty)
      && (!filters.practiceType || topic.practiceType.includes(filters.practiceType))
      && (!filters.readingTradition || topic.readingTraditions.includes(filters.readingTradition))
      && (!query || searchable.includes(query));
  }).sort((a, b) => a.suggestedOrder - b.suggestedOrder);
}
