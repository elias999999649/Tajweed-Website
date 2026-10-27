"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { LessonQuizQuestion } from "@/lib/practice/types";
import { useI18n } from "@/lib/i18n/client";
import { studyText } from "@/lib/i18n/study";
import { recordAttempt, saveSession, useStudyData, type QuizSession } from "@/lib/learning/store";

function fingerprint(value: string) { let hash = 2166136261; for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619); return (hash >>> 0).toString(36); }
const anchor = (question: LessonQuizQuestion) => question.purpose === "application" ? "pronunciation" : question.purpose === "recognition" ? "occurs" : "definition";
function sample<T>(questions: T[], count: number) {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, count);
}

/** One engine for lesson checks and mixed sessions. Source edits invalidate saved answers. */
export function LessonQuiz({ lessonName, questions, sessionSize = questions.length }: { lessonName: string; questions: LessonQuizQuestion[]; sessionSize?: number }) {
  const { t, href, locale } = useI18n();
  const s = (id: Parameters<typeof studyText>[1]) => studyText(locale, id);
  const { data, storageAvailable } = useStudyData();
  const byId = useMemo(() => new Map(questions.map(question => [question.id, question])), [questions]);
  const sessionKey = `quiz-${fingerprint(JSON.stringify(questions))}-${sessionSize}`;
  const initial = useMemo<QuizSession>(() => ({ ids: Array.from({ length: Math.min(sessionSize, questions.length) }, (_, index) => questions[Math.floor(index * questions.length / Math.min(sessionSize, questions.length))].id), current: 0, answers: {}, completed: false }), [questions, sessionSize]);
  const stored = data.sessions[sessionKey];
  const state = stored && stored.ids.every(id => byId.has(id) && (stored.answers[id] === undefined || stored.answers[id] < byId.get(id)!.options.length)) ? stored : initial;
  const activeQuestions = state.ids.map(id => byId.get(id)!).filter(Boolean);
  const [confidence, setConfidence] = useState<{ id: string; value: number } | null>(null);
  const [draft, setDraft] = useState<{ id: string; answer: number } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  const currentIndex = state.current;
  const completed = state.completed;
  useEffect(() => { if (focusRequested.current) { headingRef.current?.focus(); focusRequested.current = false; } }, [currentIndex, completed]);
  const question = activeQuestions[state.current];
  if (!question) return <div className="lesson-quiz-empty"><p>{t("No questions match these filters.")}</p></div>;
  const selected = state.answers[question.id] ?? (draft?.id === question.id ? draft.answer : null);
  const answered = question.id in state.answers;
  const score = activeQuestions.filter(q => state.answers[q.id] === q.correctAnswer).length;
  const answeredCount = activeQuestions.filter(q => q.id in state.answers).length;
  const missed = activeQuestions.filter(q => state.answers[q.id] !== q.correctAnswer);
  const persist = (next: QuizSession) => saveSession(sessionKey, next);
  function restart(onlyMissed = false) {
    focusRequested.current = true;
    const pool = onlyMissed ? missed : sessionSize < questions.length ? sample(questions, sessionSize) : questions;
    setDraft(null); persist({ ids: pool.slice(0, sessionSize).map(q => q.id), answers: {}, current: 0, completed: false });
  }
  function check() {
    if (selected === null || answered) return;
    persist({ ...state, answers: { ...state.answers, [question.id]: selected }, ...(confidence?.id === question.id ? { confidence: { ...state.confidence, [question.id]: confidence.value } } : {}) });
    queueMicrotask(() => feedbackRef.current?.focus());
  }
  function next() {
    if (!answered) return;
    focusRequested.current = true;
    setDraft(null);
    if (state.current < activeQuestions.length - 1) persist({ ...state, current: state.current + 1 });
    else {
      persist({ ...state, completed: true });
      const groups = new Map<string, LessonQuizQuestion[]>();
      for (const q of activeQuestions) groups.set(q.lessonId, [...(groups.get(q.lessonId) ?? []), q]);
      for (const [lesson, entries] of groups) recordAttempt(lesson, entries.filter(q => state.answers[q.id] === q.correctAnswer).length, entries.length);
    }
  }
  if (state.completed) return <section className="lesson-quiz lesson-quiz-results quiz-session"><h3 ref={headingRef} tabIndex={-1}>{t("Quiz complete")}</h3><p>{t("You completed the quiz for {lesson}", { lesson: t(lessonName) })}</p><p className="score-breakdown" role="status">{t("{score} of {count} answers correct", { score, count: activeQuestions.length })}</p><p>{t("Review any missed answers with your teacher. Recognition practice cannot assess your recitation.")}</p><details className="study-tools"><summary>{s("reflection")}</summary><p>{s("reflectionHelp")}</p></details><h4>{s("review")}</h4><ul className="quiz-review-list">{activeQuestions.map(q => <li key={q.id}><span aria-hidden="true">{state.answers[q.id] === q.correctAnswer ? "✓" : "↻"}</span><a href={href(`/tajweed/${q.lessonSlug}#${anchor(q)}`)}>{t(q.question)}</a><span>{t(state.answers[q.id] === q.correctAnswer ? "Correct" : "Review this one")}</span></li>)}</ul><div className="results-actions">{missed.length > 0 && <button type="button" className="button primary" onClick={() => restart(true)}>{s("retry")}</button>}<button type="button" className="button secondary" onClick={() => restart()}><RotateCcw size={16} aria-hidden="true" />{t("Try again")}</button><a href={href("/my-learning")} className="text-link">{s("myLearning")} →</a></div></section>;
  return <section className="lesson-quiz quiz-session" aria-labelledby="quiz-heading"><div className="quiz-header"><div><span className="eyebrow">{t("Check your understanding")}</span><h3 id="quiz-heading" ref={headingRef} tabIndex={-1}>{t("Question {number} of {count}", { number: state.current + 1, count: activeQuestions.length })}</h3></div><span>{new Intl.NumberFormat(locale).format(answeredCount)}/{new Intl.NumberFormat(locale).format(activeQuestions.length)}</span></div><div className="quiz-progress-bar" role="progressbar" aria-label={t("Questions answered")} aria-valuemin={0} aria-valuemax={activeQuestions.length} aria-valuenow={answeredCount}><div className="progress-fill" style={{ width: `${answeredCount / activeQuestions.length * 100}%` }} /></div><fieldset className="quiz-question-area"><legend className="quiz-question-text">{t(question.question)}</legend><div className="quiz-options">{question.options.map((option, index) => <label key={`${question.id}-${index}`} className={`quiz-option${answered && index === question.correctAnswer ? " correct" : answered && selected === index ? " incorrect" : selected === index ? " selected" : ""}`}><input type="radio" name={`answer-${question.id}`} value={index} checked={selected === index} disabled={answered} onChange={() => setDraft({ id: question.id, answer: index })} /><span className="option-text">{t(option)}</span>{answered && index === question.correctAnswer && <CheckCircle2 size={20} aria-hidden="true" />}{answered && selected === index && index !== question.correctAnswer && <XCircle size={20} aria-hidden="true" />}</label>)}</div></fieldset>{answered && <div ref={feedbackRef} tabIndex={-1} className={`quiz-feedback ${selected === question.correctAnswer ? "correct" : "incorrect"}`} role="status"><strong>{t(selected === question.correctAnswer ? "Correct" : "Review this one")}</strong><p>{t(question.explanation)}</p><a className="text-link" href={href(`/tajweed/${question.lessonSlug}#${anchor(question)}`)}>{t("Review the explanation")}</a></div>}<details className="quiz-confidence"><summary>{s("confidence")}</summary><label>{s("confidence")}<select disabled={answered} value={state.confidence?.[question.id] ?? (confidence?.id === question.id ? confidence.value : "")} onChange={event => setConfidence(event.target.value === "" ? null : { id: question.id, value: Number(event.target.value) })}><option value="">—</option><option value={0}>{s("unsure")}</option><option value={1}>{s("somewhat")}</option><option value={2}>{s("sure")}</option></select></label></details><div className="quiz-navigation"><button type="button" className="button secondary" disabled={state.current === 0} onClick={() => { focusRequested.current = true; setDraft(null); persist({ ...state, current: state.current - 1 }); }}>{t("Previous")}</button>{answered ? <button type="button" className="button primary" onClick={next}>{t(state.current === activeQuestions.length - 1 ? "See results" : "Next question")}</button> : <button type="button" className="button primary check-answer" disabled={selected === null} onClick={check}>{s("check")}</button>}</div>{!storageAvailable && <p className="muted" role="status">{s("unavailable")}</p>}</section>;
}
