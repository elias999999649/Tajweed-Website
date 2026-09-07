"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { LearningLevel } from "@/lib/taxonomy/types";
import { filterPracticeQuestions, practiceQuestions } from "@/lib/practice";
import type { PracticeQuestion } from "@/lib/practice";

const levels: Array<{ label: string; value?: LearningLevel }> = [{ label: "All levels" }, { label: "Foundation", value: 1 }, { label: "Essential", value: 2 }, { label: "Intermediate", value: 3 }, { label: "Advanced", value: 5 }];

const difficulties = [
  { label: "All difficulties", value: undefined },
  { label: "Introductory", value: "introductory" },
  { label: "Developing", value: "developing" },
  { label: "Consolidating", value: "consolidating" },
  { label: "Advanced", value: "advanced" },
];

export function Quiz({ questions }: { questions: PracticeQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const question = questions[current];
  if (!question) return <div className="practice-empty"><h3>No questions are available yet.</h3><p>Approved practice questions will appear here after editorial review.</p></div>;
  const answered = selected !== null;
  function answer(index: number) { if (answered) return; setSelected(index); if (index === question.correctAnswer) setScore((value) => value + 1); }
  function next() { setCurrent((value) => value + 1); setSelected(null); }
  function reset() { setCurrent(0); setSelected(null); setScore(0); }
  return <section className="quiz-session" aria-labelledby="quiz-heading"><div className="quiz-session-top"><div><span className="eyebrow">Active recall</span><h2 id="quiz-heading">Question {current + 1} of {questions.length}</h2></div><span className="session-score">{score} correct</span></div><div className="session-track"><span style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }} /></div><div className="session-question"><span className="question-type">{question.type.replaceAll("-", " ")}</span><h3>{question.question}</h3><div className="session-options">{question.answers.map((answerText, index) => <button className={selected === index ? index === question.correctAnswer ? "session-option correct" : "session-option incorrect" : answered && index === question.correctAnswer ? "session-option correct" : "session-option"} key={answerText} onClick={() => answer(index)}><span className="option-index">{String.fromCharCode(65 + index)}</span>{answerText}{answered && index === question.correctAnswer && <CheckCircle2 size={17} />}{answered && selected === index && index !== question.correctAnswer && <XCircle size={17} />}</button>)}</div>{answered && <div className={selected === question.correctAnswer ? "answer-feedback correct" : "answer-feedback incorrect"}><strong>{selected === question.correctAnswer ? "Correct" : "Review this one"}</strong><p>{question.explanation}</p><a href={`/tajweed/${question.relatedRule}`}>Review the related rule</a></div>}</div><div className="quiz-session-actions">{answered && current < questions.length - 1 && <button className="button primary" onClick={next}>Next question</button>}{answered && current === questions.length - 1 && <button className="button secondary" onClick={reset}><RotateCcw size={16} /> Try again</button>}</div></section>;
}

export function PracticeHub() {
  const [level, setLevel] = useState<LearningLevel | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const categories = useMemo(() => Array.from(new Set(practiceQuestions.map((question) => question.category))), []);
  const questions = useMemo(() => filterPracticeQuestions({ level, category, difficulty: difficulty as any }), [level, category, difficulty]);
  
  return <div className="practice-hub"><div className="practice-toolbar"><div><span className="eyebrow">Practice library</span><h2>Choose a focused set</h2></div><div className="practice-filters" aria-label="Practice filters"><div className="filter-pills">{levels.map((item) => <button className={level === item.value ? "active" : !level && !item.value ? "active" : ""} key={item.label} onClick={() => setLevel(item.value)}>{item.label}</button>)}</div><div className="practice-filter-row"><select aria-label="Filter by category" value={category ?? ""} onChange={(event) => setCategory(event.target.value || undefined)}><option value="">All categories</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select><select aria-label="Filter by difficulty" value={difficulty ?? ""} onChange={(event) => setDifficulty(event.target.value || undefined)}><option value="">All difficulties</option>{difficulties.slice(1).map((item) => <option value={item.value} key={item.label}>{item.label}</option>)}</select></div></div></div><Quiz questions={questions} /></div>;
}
