"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import type { LessonQuizQuestion } from "@/lib/practice/types";
import { useI18n } from "@/lib/i18n/client";

interface LessonQuizProps {
  lessonName: string;
  questions: LessonQuizQuestion[];
}

interface QuestionState {
  current: number;
  selected: number | null;
  score: number;
  answeredCount: number;
  completed: boolean;
  /** Selection kept per question so going back shows the answer and prevents re-scoring. */
  answered: Record<number, number>;
}

export function LessonQuiz({ lessonName, questions }: LessonQuizProps) {
  const { t, href } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<QuestionState>({
    current: 0,
    selected: null,
    score: 0,
    answeredCount: 0,
    completed: false,
    answered: {},
  });
  const currentQuestion = state.current;
  const quizCompleted = state.completed;
  const hasNavigated = useRef(false);
  useEffect(() => {
    if (hasNavigated.current) headingRef.current?.focus();
    hasNavigated.current = true;
  }, [currentQuestion, quizCompleted]);

  if (!questions || questions.length === 0) {
    return (
      <div className="lesson-quiz-empty">
        <p>{t("Quiz questions will appear after qualified review. Use the lesson’s practice prompts with your teacher.")}</p>
      </div>
    );
  }

  const question = questions[state.current];
  const isLastQuestion = state.current === questions.length - 1;
  const previousSelection = state.answered[state.current];
  const wasAnswered = previousSelection !== undefined;
  const selected = wasAnswered ? previousSelection : state.selected;
  const answered = wasAnswered || state.selected !== null;
  const progress = (Math.max(state.answeredCount, state.current + (answered ? 1 : 0)) / questions.length) * 100;

  function handleAnswer(index: number) {
    if (answered) return;

    const correct = index === question.correctAnswer;
    setState((prev) => ({
      ...prev,
      selected: index,
      answered: { ...prev.answered, [prev.current]: index },
      answeredCount: prev.answeredCount + 1,
      score: correct ? prev.score + 1 : prev.score,
    }));
  }

  function handleNext() {
    if (isLastQuestion) {
      setState((prev) => ({ ...prev, completed: true }));
    } else {
      setState((prev) => ({
        ...prev,
        current: prev.current + 1,
        selected: null,
      }));
    }
  }

  function handlePrevious() {
    if (state.current > 0) {
      setState((prev) => ({ ...prev, current: prev.current - 1, selected: null }));
    }
  }

  function handleReset() {
    setState({
      current: 0,
      selected: null,
      score: 0,
      answeredCount: 0,
      completed: false,
      answered: {},
    });
  }

  if (state.completed) {
    const percentage = Math.round((state.score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <section className="lesson-quiz lesson-quiz-results" aria-labelledby="quiz-results">
        <div className="quiz-results-inner">
          <div className="results-header">
            <h3 id="quiz-results" ref={headingRef} tabIndex={-1}>{t("Quiz complete")}</h3>
            <p className="results-summary">{t("You completed the quiz for {lesson}", { lesson: t(lessonName) })}</p>
          </div>

          <div className={`results-score ${passed ? "passed" : "needs-review"}`}>
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
            </div>
            <div className="score-details">
              <p className="score-status">{t(passed ? "Ready to review" : "Keep practising")}</p>
              <p className="score-breakdown">
                {t("{score} of {count} answers correct", { score: state.score, count: questions.length })}
              </p>
            </div>
          </div>

          <div className="results-feedback">
            {passed ? (
              <div className="feedback positive">
                <CheckCircle2 size={20} />
                <p>{t("Review any incorrect answers, then practise reciting with your teacher. A quiz checks understanding; it cannot assess pronunciation.")}</p>
              </div>
            ) : (
              <div className="feedback needs-work">
                <XCircle size={20} />
                <p>{t("Review the lesson and focus on the questions you missed. Then try the quiz again.")}</p>
              </div>
            )}
          </div>

          <div className="results-actions">
            <button className="button primary" onClick={handleReset}>
              <RotateCcw size={16} aria-hidden="true" /> {t("Try again")}
            </button>
            <a href={href(`/tajweed/${question.lessonSlug}`)} className="button secondary">
              {t("Review lesson")} <ChevronRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="lesson-quiz" aria-labelledby="quiz-heading">
      {/* Progress Bar */}
      <div className="quiz-header">
        <div className="quiz-title-area">
          <span className="eyebrow">{t("Check your understanding")}</span>
          <h3 id="quiz-heading" ref={headingRef} tabIndex={-1}>{t("Question {number} of {count}", { number: state.current + 1, count: questions.length })}</h3>
        </div>
        <span className="quiz-progress-text">{state.current + 1}/{questions.length}</span>
      </div>

      <div className="quiz-progress-bar" role="progressbar" aria-label={t("Questions answered")} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={state.answeredCount}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="quiz-question-area">
        <div className="question-type-badge">{t(question.purpose.replace("-", " "))}</div>
        <h4 className="quiz-question-text">{t(question.question)}</h4>
      </div>

      {/* Options */}
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${selected === index ? (index === question.correctAnswer ? "correct" : "incorrect") : answered && index === question.correctAnswer ? "correct" : ""}`}
            onClick={() => handleAnswer(index)}
            aria-disabled={answered}
            aria-label={t("Option {letter}: {answer}", { letter: String.fromCharCode(65 + index), answer: t(option) })}
          >
            <span className="option-indicator">
              {answered && index === question.correctAnswer && <CheckCircle2 size={20} />}
              {answered && selected === index && index !== question.correctAnswer && <XCircle size={20} />}
              {!answered && <span className="option-letter">{String.fromCharCode(65 + index)}</span>}
            </span>
            <span className="option-text">{t(option)}</span>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {answered && (
        <div className={`quiz-feedback ${selected === question.correctAnswer ? "correct" : "incorrect"}`} role="status">
          <div className="feedback-header">
            {selected === question.correctAnswer ? (
              <>
                <CheckCircle2 size={20} />
                <strong>{t("Correct")}</strong>
              </>
            ) : (
              <>
                <XCircle size={20} />
                <strong>{t("Review this one")}</strong>
              </>
            )}
          </div>
          <p className="feedback-explanation">{t(question.explanation)}</p>
          <a className="text-link" href={href(`/tajweed/${question.lessonSlug}#definition`)}>{t("Review the explanation")}</a>
        </div>
      )}

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          className="button secondary"
          onClick={handlePrevious}
          disabled={state.current === 0}
          aria-label={t("Previous question")}
        >
          <ChevronLeft size={16} aria-hidden="true" /> {t("Previous")}
        </button>

        {answered && (
          <button
            className="button primary"
            onClick={handleNext}
            aria-label={t(isLastQuestion ? "See results" : "Next question")}
          >
            {t(isLastQuestion ? "See results" : "Next")} <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
