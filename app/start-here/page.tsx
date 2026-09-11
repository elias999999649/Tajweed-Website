import { ArrowRight, BookOpen, Headphones, Layers3, Target } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { curriculumAreas } from "@/lib/tajweed/curriculum";
import { tajweedRules } from "@/lib/tajweed/rules";

export const metadata = { title: "Where Should I Start? | Complete Tajweed Guide", description: "Find a clear beginner learning order for Tajweed, from foundations through essential, intermediate, and advanced topics.", alternates: { canonical: "/start-here" } };

const icons = [<Target size={20} key="target" />, <Layers3 size={20} key="layers" />, <Headphones size={20} key="headphones" />, <BookOpen size={20} key="book" />];

export default function StartHerePage() {
  const stages = curriculumAreas.slice(0, 4);
  return <><SiteHeader /><main><section className="library-hero"><div className="container"><p className="eyebrow">Start here</p><h1>Where should I start?</h1><p className="hero-lede">Begin with the sound foundations, then move through the rule families in the order they depend on one another. You do not need to memorise everything before you practise.</p></div></section><section className="section"><div className="container start-here-list">{stages.map((stage, index) => { const firstRule = stage.rules.map((id) => tajweedRules.find((rule) => rule.id === id)).find(Boolean); return <article className="start-here-step" key={stage.id}><div className="start-here-icon">{icons[index]}</div><div><span className="level-index">STEP {index + 1}</span><h2>{stage.title}</h2><p>{stage.summary}</p><a className="text-link" href={firstRule ? `/tajweed/${firstRule.slug}` : "/tajweed"}>Begin this stage <ArrowRight size={15} /></a></div></article>; })}</div></section><section className="section soft"><div className="container start-here-note"><Headphones size={22} /><div><p className="eyebrow">A simple study rhythm</p><h2>Listen, notice, repeat, review</h2><p>For each lesson: read the short explanation, identify the trigger, listen to a qualified reciter, repeat a small phrase, and return another day.</p><h2>Listening is part of learning</h2><p>Written explanations help you recognise a rule, but pronunciation, timing, and articulation develop through listening, repetition, and guidance from a qualified Tajweed teacher.</p><a className="text-link" href="/practice">Go to practice <ArrowRight size={15} /></a></div></div></section></main><Footer /></>;
}
