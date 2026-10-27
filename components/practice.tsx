"use client";
import { useMemo } from "react";
import { useUrlState } from "@/lib/learning/url-state";
import { LessonQuiz } from "@/components/lesson-quiz";
import { studyText } from "@/lib/i18n/study";
import type { LearningLevel } from "@/lib/taxonomy/types";
import { practiceQuestions as practiceBankQuestions } from "@/lib/practice";
import { lessonQuizzes } from "@/lib/practice/quiz";
import { tajweedRules } from "@/lib/tajweed/rules";
import type { PracticeQuestion } from "@/lib/practice";
import type { LessonQuizQuestion } from "@/lib/practice/types";
import { useI18n } from "@/lib/i18n/client";

const levels: Array<{ label: string; value?: LearningLevel }> = [{ label: "All levels" }, { label: "Foundation", value: 1 }, { label: "Essential", value: 2 }, { label: "Intermediate", value: 3 }, { label: "Advanced", value: 4 }];
const difficulties = ["introductory", "developing", "consolidating", "advanced"];
function lessonQuestionToPracticeQuestion(question: LessonQuizQuestion): PracticeQuestion {
  const rule = tajweedRules.find((item) => item.id === question.lessonId);
  return { id: question.id, type: question.type, question: question.question, options: question.options, answers: question.options, correctAnswer: question.correctAnswer, explanation: question.explanation, relatedRule: question.lessonId, difficulty: question.difficulty, category: rule?.category ?? "Tajweed lessons", level: question.level, reviewStatus: question.verificationStatus === "verified" ? "approved" : "needs-qualified-review", sourceIds: rule?.sources ?? [] };
}
const lessonPracticeQuestions = lessonQuizzes.flatMap((quiz) => quiz.questions.map(lessonQuestionToPracticeQuestion));
const allPracticeQuestions = [...lessonPracticeQuestions, ...practiceBankQuestions];
export function Quiz({ questions, sessionSize = 5 }: { questions: PracticeQuestion[]; sessionSize?: number }) {
  return <LessonQuiz lessonName="Practice" sessionSize={sessionSize} questions={questions.map(question => ({ id: question.id, lessonId: question.relatedRule, lessonSlug: tajweedRules.find(rule => rule.id === question.relatedRule)?.slug ?? question.relatedRule, type: question.type, purpose: question.type === "application" ? "application" : question.type === "recognition" ? "recognition" : "understanding", question: question.question, options: question.options, correctAnswer: question.correctAnswer, explanation: question.explanation, difficulty: question.difficulty, level: question.level, verificationStatus: question.reviewStatus === "approved" ? "verified" : "needs-review" }))} />;
}
export function PracticeHub() {
  const { t, href, locale } = useI18n();
  const { params, setParams } = useUrlState();
  const size = Number(params.get("size"));
  const sessionSize = [5,10,20].includes(size) ? size : 5;
  const levelNumber = Number(params.get("level"));
  const level = [1,2,3,4].includes(levelNumber) ? levelNumber as LearningLevel : undefined;
  const category = params.get("category") || undefined;
  const difficulty = params.get("difficulty") || undefined;
  const lessonFilter = params.get("lessons") || "";
  const categories = useMemo(() => Array.from(new Set(allPracticeQuestions.map((question) => question.category))).sort(), []);
  const questions = useMemo(() => allPracticeQuestions.filter((question) => (!level || question.level === level) && (!category || question.category === category) && (!difficulty || question.difficulty === difficulty) && (!lessonFilter || lessonFilter.split(",").includes(question.relatedRule))), [level, category, difficulty, lessonFilter]);
  const filterKey = `${level ?? "all"}-${category ?? "all"}-${difficulty ?? "all"}-${lessonFilter}`;
  if (!allPracticeQuestions.length) return <div className="practice-empty"><span className="badge gold-badge">{t("Awaiting qualified review")}</span><h2>{t("The quiz bank is not ready yet.")}</h2><p>{t("Questions are published after the lesson content has completed qualified review. You can still read the lessons and use their practice prompts with a teacher.")}</p><a className="button primary" href={href("/learn")}>{t("Choose a lesson")}</a><a className="text-link" href={href("/editorial-policy")}>{t("How content is reviewed")}</a></div>;
  return <div className="practice-hub"><div className="practice-toolbar"><div><span className="eyebrow">{t("Practice library")}</span><h2>{t("Choose a focused set")}</h2><p className="muted practice-count" role="status">{t("{count} questions available", { count: questions.length })}</p></div><div className="practice-filters" aria-label={t("Practice filters")}><div className="filter-pills">{levels.map((item) => <button type="button" aria-pressed={level === item.value} className={level === item.value ? "active" : ""} key={item.label} onClick={() => setParams({ level: item.value ? String(item.value) : undefined })}>{t(item.label)}</button>)}</div><div className="practice-filter-row"><label>{studyText(locale, "session")}<select value={sessionSize} onChange={e => setParams({ size: e.target.value })}>{[5,10,20].map(size => <option key={size} value={size}>{new Intl.NumberFormat(locale).format(size)}</option>)}</select></label><select aria-label={t("Filter by category")} value={category ?? ""} onChange={(event) => setParams({ category: event.target.value || undefined })}><option value="">{t("All categories")}</option>{categories.map((item) => <option value={item} key={item}>{t(item)}</option>)}</select><select aria-label={t("Filter by difficulty")} value={difficulty ?? ""} onChange={(event) => setParams({ difficulty: event.target.value || undefined })}><option value="">{t("All difficulties")}</option>{difficulties.map((item) => <option value={item} key={item}>{t(item)}</option>)}</select></div><button type="button" className="clear-filter" onClick={() => { setParams({ level: undefined, category: undefined, difficulty: undefined, lessons: undefined }); }}>{t("Reset filters")}</button></div></div><Quiz key={`${filterKey}-${sessionSize}`} questions={questions} sessionSize={sessionSize} /></div>;
}

