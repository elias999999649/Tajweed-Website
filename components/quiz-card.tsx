"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function QuizCard() { const [selected, setSelected] = useState<string | null>(null); return <section className="card quiz-card"><div className="quiz-kicker"><span className="badge gold-badge">Quick check</span><span>1 of 3</span></div><h3>What should practice include?</h3><p className="muted">Choose the most complete answer.</p><div className="quiz-options">{["Reading the explanation only", "Listening and repeating with guidance", "Memorising every term"].map((item) => <button key={item} className={selected === item ? "quiz-option selected" : "quiz-option"} onClick={() => setSelected(item)}>{selected === item ? <Check size={16} /> : <span className="radio" />}{item}</button>)}</div></section>; }
