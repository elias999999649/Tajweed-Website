export type ArticleCategory = "Tajweed Basics" | "Tajweed Rules" | "Pronunciation" | "Quran Reading" | "Learning Tips" | "Common Mistakes";

export type ArticleSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  searchIntent: string;
  readingTime: string;
  updatedAt: string;
  sections: ArticleSection[];
  relatedRuleIds: string[];
  learningPathHref: string;
  sourceIds: string[];
  reviewStatus: "needs-qualified-review" | "approved";
};
