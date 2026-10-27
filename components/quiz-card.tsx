"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Check, X } from "lucide-react";
import { tajweedRules } from "@/lib/tajweed/rules";

const QUESTION_ID = "izhar";

export function QuizCard() {
  const { t, href } = useI18n();
  const rule = tajweedRules.find((item) => item.id === QUESTION_ID);
  const [selected, setSelected] = useState<number | null>(null);
  if (!rule) return null;
  if (rule.verificationStatus !== "verified" || rule.reviewStatus !== "VERIFIED") {
    return <section className="card quiz-card quiz-unavailable"><div className="quiz-kicker"><span className="badge gold-badge">{t('Practice note')}</span><span>{t('Review-gated')}</span></div><h3>{t('Practice follows verified content')}</h3><p className="muted">{t('This quick check will appear after the Izhar lesson and its examples have completed qualified review. For now, use the lesson to learn the trigger letters and listen carefully.')}</p><a className="text-link" href={href(`/tajweed/${rule.slug}`)}>{t('Open the Izhar lesson')}</a></section>;
  }

  const options = [
    { text: rule.shortDefinition, correct: true },
    { text: "A stopping point where recitation is paused briefly.", correct: false },
    { text: "The articulation point of a letter in the mouth or throat.", correct: false },
  ];

  return <section className="card quiz-card"><div className="quiz-kicker"><span className="badge gold-badge">{t('Quick check')}</span><span>{t(selected !== null ? "Answered" : "1 question")}</span></div><h3>{t("What is {rule}?", {rule: t(rule.name)})}</h3><p className="muted">{t('Choose the best answer. Then read the explanation and practise with a qualified reciter.')}</p><div className="quiz-options">{options.map((item, index) => <button key={t(item.text)} className={selected === index ? item.correct ? "quiz-option selected" : "quiz-option wrong" : "quiz-option"} onClick={() => setSelected(index)} disabled={selected !== null}>{selected !== null && item.correct ? <Check size={16} /> : selected === index && !item.correct ? <X size={16} /> : <span className="radio" />}{t(item.text)}</button>)}</div>{selected !== null && <div className={options[selected].correct ? "answer-feedback correct" : "answer-feedback incorrect"} role="status"><strong>{t(options[selected].correct ? "Correct" : "Review this one")}</strong><p>{t(rule.shortDefinition)} {t("Open the full lesson to see when it applies and which letters are involved.")}</p><a href={href(`/tajweed/${rule.slug}`)}>{t("Review {rule}", {rule: t(rule.name)})}</a></div>}</section>;
}
