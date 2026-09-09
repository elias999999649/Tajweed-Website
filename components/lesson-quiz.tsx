"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import type { LessonQuizQuestion } from "@/lib/practice/types";

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
  const [state, setState] = useState<QuestionState>({
    current: 0,
    selected: null,
    score: 0,
    answeredCount: 0,
    completed: false,
    answered: {},
  });

  if (!questions || questions.length === 0) {
    return (
      <div className="lesson-quiz-empty">
        <p>No quiz questions available for this lesson yet.</p>
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
            <h3 id="quiz-results">Quiz Complete</h3>
            <p className="results-summary">You completed the quiz for {lessonName}</p>
          </div>

          <div className={`results-score ${passed ? "passed" : "needs-review"}`}>
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
            </div>
            <div className="score-details">
              <p className="score-status">{passed ? "Great!" : "Keep practicing!"}</p>
              <p className="score-breakdown">
                You got <strong>{state.score}</strong> out of <strong>{questions.length}</strong> correct
              </p>
            </div>
          </div>

          <div className="results-feedback">
            {passed ? (
              <div className="feedback positive">
                <CheckCircle2 size={20} />
                <p>You have a solid understanding of {lessonName}. Review any incorrect answers and move on to related lessons.</p>
              </div>
            ) : (
              <div className="feedback needs-work">
                <XCircle size={20} />
                <p>Review the lesson content again and focus on the questions you missed. Then try the quiz again.</p>
              </div>
            )}
          </div>

          <div className="results-actions">
            <button className="button primary" onClick={handleReset}>
              <RotateCcw size={16} /> Try Again
            </button>
            <a href={`/tajweed/${question.lessonSlug}`} className="button secondary">
              Review Lesson <ChevronRight size={16} />
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
          <span className="eyebrow">Test Your Understanding</span>
          <h3 id="quiz-heading">Question {state.current + 1} of {questions.length}</h3>
        </div>
        <span className="quiz-progress-text">{state.current + 1}/{questions.length}</span>
      </div>

      <div className="quiz-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="quiz-question-area">
        <div className="question-type-badge">{question.purpose.replace("-", " ")}</div>
        <h4 className="quiz-question-text">{question.question}</h4>
      </div>

      {/* Options */}
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${selected === index ? (index === question.correctAnswer ? "correct" : "incorrect") : answered && index === question.correctAnswer ? "correct" : ""}`}
            onClick={() => handleAnswer(index)}
            disabled={answered}
            aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
          >
            <span className="option-indicator">
              {answered && index === question.correctAnswer && <CheckCircle2 size={20} />}
              {answered && selected === index && index !== question.correctAnswer && <XCircle size={20} />}
              {!answered && <span className="option-letter">{String.fromCharCode(65 + index)}</span>}
            </span>
            <span className="option-text">{option}</span>
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
                <strong>Correct!</strong>
              </>
            ) : (
              <>
                <XCircle size={20} />
                <strong>Not quite right</strong>
              </>
            )}
          </div>
          <p className="feedback-explanation">{question.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          className="button secondary"
          onClick={handlePrevious}
          disabled={state.current === 0}
          aria-label="Previous question"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {answered && (
          <button
            className="button primary"
            onClick={handleNext}
            aria-label={isLastQuestion ? "See results" : "Next question"}
          >
            {isLastQuestion ? "See Results" : "Next"} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
