"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
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
export function Quiz({ questions }: { questions: PracticeQuestion[] }) {
  const { t, href } = useI18n();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  useEffect(() => { if (hasNavigated.current) headingRef.current?.focus(); hasNavigated.current = true; }, [current, completed]);
  const question = questions[current];
  function reset() { setCurrent(0); setSelected(null); setScore(0); setCompleted(false); }
  if (!question) return <div className="practice-empty"><h3>{t("No questions match these filters.")}</h3><p>{t("Try choosing “All levels” or a different category to continue practising.")}</p></div>;
  if (completed) return <section className="quiz-session"><h2 ref={headingRef} tabIndex={-1}>{t("Practice complete")}</h2><p role="status">{t("{score} of {count} answers correct", { score, count: questions.length })}</p><p>{t("Review any missed answers with your teacher. Recognition practice cannot assess your recitation.")}</p><button type="button" className="button primary" onClick={reset}><RotateCcw size={16} aria-hidden="true" />{t("Try again")}</button></section>;
  const answered = selected !== null;
  const relatedRule = tajweedRules.find((item) => item.id === question.relatedRule);
  function answer(index: number) { if (answered) return; setSelected(index); if (index === question.correctAnswer) setScore((value) => value + 1); }
  function next() { if (current === questions.length - 1) setCompleted(true); else { setCurrent((value) => value + 1); setSelected(null); } }
  return <section className="quiz-session" aria-labelledby="quiz-heading"><div className="quiz-session-top"><div><span className="eyebrow">{t("Active recall")}</span><h2 id="quiz-heading" ref={headingRef} tabIndex={-1}>{t("Question {number} of {count}", { number: current + 1, count: questions.length })}</h2></div><span className="session-score">{t("{score} correct", { score })}</span></div><div className="session-track" role="progressbar" aria-label={t("Questions answered")} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={current + (answered ? 1 : 0)}><span style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }} /></div><div className="session-question"><span className="question-type">{t(question.type.replaceAll("-", " "))}</span><h3>{t(question.question)}</h3><div className="session-options">{question.answers.map((answerText, index) => <button type="button" aria-disabled={answered} aria-pressed={selected === index} className={selected === index ? index === question.correctAnswer ? "session-option correct" : "session-option incorrect" : answered && index === question.correctAnswer ? "session-option correct" : "session-option"} key={`${question.id}-${index}`} onClick={() => answer(index)}><span className="option-index" aria-hidden="true">{String.fromCharCode(65 + index)}</span>{t(answerText)}{answered && index === question.correctAnswer && <CheckCircle2 size={17} aria-hidden="true" />}{answered && selected === index && index !== question.correctAnswer && <XCircle size={17} aria-hidden="true" />}</button>)}</div>{answered && <div className={selected === question.correctAnswer ? "answer-feedback correct" : "answer-feedback incorrect"} role="status"><strong>{t(selected === question.correctAnswer ? "Correct" : "Review this one")}</strong><p>{t(question.explanation)}</p><a href={href(`/tajweed/${relatedRule?.slug ?? question.relatedRule}#definition`)}>{t("Review the related rule")}</a></div>}</div><div className="quiz-session-actions">{answered && <button type="button" className="button primary" onClick={next}>{t(current === questions.length - 1 ? "See results" : "Next question")}</button>}</div></section>;
}
export function PracticeHub() {
  const { t, href } = useI18n();
  const [level, setLevel] = useState<LearningLevel | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const categories = useMemo(() => Array.from(new Set(allPracticeQuestions.map((question) => question.category))).sort(), []);
  const questions = useMemo(() => allPracticeQuestions.filter((question) => (!level || question.level === level) && (!category || question.category === category) && (!difficulty || question.difficulty === difficulty)), [level, category, difficulty]);
  const filterKey = `${level ?? "all"}-${category ?? "all"}-${difficulty ?? "all"}`;
  if (!allPracticeQuestions.length) return <div className="practice-empty"><span className="badge gold-badge">{t("Awaiting qualified review")}</span><h2>{t("The quiz bank is not ready yet.")}</h2><p>{t("Questions are published after the lesson content has completed qualified review. You can still read the lessons and use their practice prompts with a teacher.")}</p><a className="button primary" href={href("/learn")}>{t("Choose a lesson")}</a><a className="text-link" href={href("/editorial-policy")}>{t("How content is reviewed")}</a></div>;
  return <div className="practice-hub"><div className="practice-toolbar"><div><span className="eyebrow">{t("Practice library")}</span><h2>{t("Choose a focused set")}</h2><p className="muted practice-count" role="status">{t("{count} questions available", { count: questions.length })}</p></div><div className="practice-filters" aria-label={t("Practice filters")}><div className="filter-pills">{levels.map((item) => <button type="button" aria-pressed={level === item.value} className={level === item.value ? "active" : ""} key={item.label} onClick={() => setLevel(item.value)}>{t(item.label)}</button>)}</div><div className="practice-filter-row"><select aria-label={t("Filter by category")} value={category ?? ""} onChange={(event) => setCategory(event.target.value || undefined)}><option value="">{t("All categories")}</option>{categories.map((item) => <option value={item} key={item}>{t(item)}</option>)}</select><select aria-label={t("Filter by difficulty")} value={difficulty ?? ""} onChange={(event) => setDifficulty(event.target.value || undefined)}><option value="">{t("All difficulties")}</option>{difficulties.map((item) => <option value={item} key={item}>{t(item)}</option>)}</select></div><button type="button" className="clear-filter" onClick={() => { setLevel(undefined); setCategory(undefined); setDifficulty(undefined); }}>{t("Reset filters")}</button></div></div><Quiz key={filterKey} questions={questions} /></div>;
}

