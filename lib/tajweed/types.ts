export type VerificationStatus = "verified" | "needs_review" | "draft";
export type ReviewStatus = "VERIFIED" | "REQUIRES REVIEW" | "DRAFT";
export type DifficultyLevel = "Foundation" | "Essential" | "Intermediate" | "Advanced";
export type ExampleType = "quran" | "instructional";

export type RuleExample = {
  id: string;
  ruleId: string;
  type: ExampleType;
  arabicText: string;
  surah?: string;
  verse?: number;
  highlightedText?: string;
  explanation: string;
  transliteration?: string;
  translation?: string;
  source: string;
  sourceIds?: string[];
  verificationStatus: VerificationStatus;
  note?: string;
};

export type RuleFaq = {
  question: string;
  answer: string;
};

export type TajweedRuleRecord = {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  category: string;
  level: DifficultyLevel;
  difficultyScore: number;
  shortDefinition: string;
  detailedExplanation: string;
  whenItOccurs: string;
  letters: string[];
  pronunciation: string;
  commonMistakes: string[];
  memoryTip: string;
  prerequisites: string[];
  relatedRules: string[];
  quranExamples: string[];
  practiceQuestions: string[];
  faq: RuleFaq[];
  sources: string[];
  verificationStatus: VerificationStatus;
  reviewStatus: ReviewStatus;
  sourceReferences: string[];
  reviewNotes: string[];
};

export type CurriculumArea = {
  id: string;
  title: string;
  slug: string;
  level: DifficultyLevel;
  order: number;
  summary: string;
  prerequisites: string[];
  rules: string[];
};

export type TajweedGlossaryEntry = {
  id: string;
  englishTerm: string;
  arabicTerm: string;
  arabicSpelling: string;
  definition: string;
  detailedExplanation: string;
  relatedRuleIds: string[];
  relatedLessonIds: string[];
  pronunciationGuidance?: string;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
};
