"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { tajweedRules } from "@/lib/tajweed/rules";

const QUESTION_ID = "izhar";

export function QuizCard() {
  const rule = tajweedRules.find((item) => item.id === QUESTION_ID);
  const [selected, setSelected] = useState<number | null>(null);
  if (!rule) return null;

  const options = [
    { text: rule.shortDefinition, correct: true },
    { text: "A stopping point where recitation is paused briefly.", correct: false },
    { text: "The articulation point of a letter in the mouth or throat.", correct: false },
  ];

  return <section className="card quiz-card"><div className="quiz-kicker"><span className="badge gold-badge">Quick check</span><span>{selected !== null ? "Answered" : "1 question"}</span></div><h3>What is {rule.name}?</h3><p className="muted">Choose the best answer.</p><div className="quiz-options">{options.map((item, index) => <button key={item.text} className={selected === index ? item.correct ? "quiz-option selected" : "quiz-option wrong" : "quiz-option"} onClick={() => setSelected(index)} disabled={selected !== null}>{selected !== null && item.correct ? <Check size={16} /> : selected === index && !item.correct ? <X size={16} /> : <span className="radio" />}{item.text}</button>)}</div>{selected !== null && <div className={options[selected].correct ? "answer-feedback correct" : "answer-feedback incorrect"} role="status"><strong>{options[selected].correct ? "Correct" : "Review this one"}</strong><p>{rule.shortDefinition} Open the full lesson to see when it applies and which letters are involved.</p><a href={`/tajweed/${rule.slug}`}>Review {rule.name}</a></div>}</section>;
}
