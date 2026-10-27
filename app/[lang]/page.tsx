import { ArrowRight, BookOpen, ListChecks, Target } from "lucide-react";
import { Button, Footer, SearchPanel, SiteHeader } from "@/components/ui";
import { getI18n } from "@/lib/i18n/server";

export default async function Home() {
  const { t, href } = await getI18n();
  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="home-page">
    <section className="hero hero-home"><div className="container hero-grid">
      <div className="hero-copy">
        <p className="eyebrow">{t("For learners of Quran recitation")}</p>
        <h1>{t("Learn Tajweed,")} <span>{t("one step at a time.")}</span></h1>
        <p className="hero-lede">{t("Understand how Arabic letters sound, recognise recitation rules, and build a steady study routine with a qualified teacher.")}</p>
        <div className="hero-actions"><Button href={href("/learn")}>{t("Find your starting point")}</Button><a href={href("/tajweed")} className="outline-link">{t("Browse the lessons")} <BookOpen size={16} aria-hidden="true" /></a></div>
        <p className="hero-scope">{t("Teaching scope: Hafs ʿan ʿĀṣim. No previous knowledge of Tajweed is needed.")}</p>
      </div>
      <figure className="recitation-panel" aria-labelledby="recitation-reference">
        <div className="recitation-ornament" aria-hidden="true" />
        <blockquote cite="https://quran.com/73:4" lang="ar" dir="rtl">وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا</blockquote>
        <figcaption id="recitation-reference"><span lang="ar" dir="rtl">سورة المزمل</span><bdi>73:4</bdi><a href="https://quran.com/73:4" target="_blank" rel="noreferrer">{t("View source")} <ArrowRight size={14} aria-hidden="true" /></a></figcaption>
      </figure>
    </div></section>
    <section className="search-section home-search-section"><div className="container"><SearchPanel /><p className="search-helper">{t("Find a rule, an Arabic term, or a study guide.")}</p></div></section>
    <section className="section home-choice-section"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">{t("Choose your next step")}</p><h2>{t("A clear place to start.")}</h2><p className="section-intro">{t("Follow the path in order, or revisit the topic you need today.")}</p></div></div>
      <div className="home-choice-grid">
        <a className="home-choice-card featured" href={href("/learn")}><span className="home-choice-icon"><Target size={22} aria-hidden="true" /></span><div><h3>{t("I’m new to Tajweed")}</h3><p>{t("Check the reading prerequisites, then work through the foundations.")}</p><strong>{t("Explore the learning path")} <ArrowRight size={16} aria-hidden="true" /></strong></div></a>
        <a className="home-choice-card" href={href("/tajweed")}><span className="home-choice-icon"><BookOpen size={22} aria-hidden="true" /></span><div><h3>{t("I’m looking for a rule")}</h3><p>{t("Browse lessons by topic and level, or search for a familiar term.")}</p><strong>{t("Find a lesson")} <ArrowRight size={16} aria-hidden="true" /></strong></div></a>
        <a className="home-choice-card" href={href("/practice")}><span className="home-choice-icon"><ListChecks size={22} aria-hidden="true" /></span><div><h3>{t("I want to practise")}</h3><p>{t("See the available activities and the review status of the practice bank.")}</p><strong>{t("Open practice")} <ArrowRight size={16} aria-hidden="true" /></strong></div></a>
      </div>
      <div className="home-review-note"><span className="review-note-label">{t("Learn with care")}</span><p>{t("Lesson content is awaiting qualified Tajweed review. Use this guide alongside a teacher; written explanations cannot assess your recitation.")}</p><a className="text-link" href={href("/editorial-policy")}>{t("How content is reviewed")} <ArrowRight size={16} aria-hidden="true" /></a></div>
    </div></section>
    <section className="section study-routine"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">{t("A small, repeatable routine")}</p><h2>{t("Read. Listen. Practise.")}</h2></div><a className="text-link" href={href("/tajweed/what-is-tajweed")}>{t("Open the first lesson")} <ArrowRight size={16} aria-hidden="true" /></a></div>
      <ol className="study-routine-steps"><li><span aria-hidden="true">01</span><h3>{t("Understand one rule")}</h3><p>{t("Read the explanation and check any unfamiliar words in the glossary.")}</p></li><li><span aria-hidden="true">02</span><h3>{t("Hear it with guidance")}</h3><p>{t("Ask your teacher to demonstrate the sound and listen carefully.")}</p></li><li><span aria-hidden="true">03</span><h3>{t("Try, then get feedback")}</h3><p>{t("Recite slowly, repeat, and ask your teacher what to adjust.")}</p></li></ol>
    </div></section>
  </main><Footer /></>;
}
