export type LearningLevel = 1 | 2 | 3 | 4 | 5;
export type Difficulty = "introductory" | "developing" | "consolidating" | "advanced";
export type PracticeType = "recognition" | "articulation" | "listening" | "guided-repetition" | "application" | "stop-start" | "mixed";
export type ReviewStatus = "taxonomy-reviewed" | "needs-qualified-review" | "tradition-specific-review";

export type TajweedTopic = {
  id: string;
  title: string;
  arabicName?: string;
  transliteration?: string;
  level: LearningLevel;
  category: string;
  summary: string;
  prerequisites: string[];
  relatedRules: string[];
  suggestedOrder: number;
  estimatedDifficulty: Difficulty;
  slug: string;
  seoTopic: string;
  practiceType: PracticeType[];
  tags: string[];
  readingTraditions: string[];
  reviewStatus: ReviewStatus;
  sourceIds: string[];
  taxonomyNote?: string;
};

export type TajweedLevel = {
  id: string;
  level: LearningLevel;
  title: string;
  slug: string;
  purpose: string;
  topicIds: string[];
};

export type TajweedSource = {
  id: string;
  title: string;
  url: string;
  sourceType: "curriculum" | "reference" | "quran-data";
  note: string;
};
