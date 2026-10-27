import { isPublishableRule } from "@/lib/editorial/reviews";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ChevronRight, Volume2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { StudyTools } from "@/components/study-tools";
import { studyText } from "@/lib/i18n/study";
import { LessonContents } from "@/components/lesson-contents";
import { LessonQuiz } from "@/components/lesson-quiz";
import { absoluteUrl } from "@/lib/seo";
import { getExamplesByRule } from "@/lib/tajweed/examples";
import { getRuleBySlug, tajweedRules } from "@/lib/tajweed/rules";
import { getLessonQuestions } from "@/lib/practice/quiz";
import { tajweedReferenceSources } from "@/lib/tajweed/sources";
import { referenceLocation } from "@/lib/tajweed/reference-locations";
import { curriculumAreas } from "@/lib/tajweed/curriculum";

export function generateStaticParams() {
  return tajweedRules.map((rule) => ({ slug: rule.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rule = getRuleBySlug(slug);
  if (!rule) return {};
  return localizeMetadata({
    title: rule.name,
    description: rule.shortDefinition,
    alternates: { canonical: absoluteUrl(`/tajweed/${rule.slug}`) },
    openGraph: { title: `${rule.name}`, description: rule.shortDefinition, url: absoluteUrl(`/tajweed/${rule.slug}`), type: "article" },
    robots: isPublishableRule(rule) ? undefined : { index: false, follow: true },
  }, await getI18n(), `/tajweed/${rule.slug}`);
}

async function RelatedLinks({ ids, label }: { ids: string[]; label: string }) {
  const { t, text, href } = await getI18n();

  const rules = ids.map((id) => tajweedRules.find((rule) => rule.id === id)).filter(Boolean);
  if (!rules.length) return null;
  return <div className="related-links"><h3>{text(label)}</h3><div>{rules.map((rule) => rule && <a href={href(`/tajweed/${rule.slug}`)} key={rule.id}><span>{text(rule.name)}</span><ArrowRight size={15} /></a>)}</div></div>;
}

export default async function TajweedRulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, text, href, locale } = await getI18n();

  const { slug } = await params;
  const rule = getRuleBySlug(slug);
  if (!rule) notFound();
  const examples = getExamplesByRule(rule.id);
  const lessonQuizQuestions = getLessonQuestions(slug);
  const verifiedQuranExamples = examples.filter((example) => example.type === "quran" && example.verificationStatus === "verified");
  const teachingExamples = examples.filter((example) => example.type === "instructional");
  const relatedRules = rule.relatedRules.map((id) => tajweedRules.find((item) => item.id === id)).filter((item): item is (typeof tajweedRules)[number] => Boolean(item));
  // Prev/next follows the stored curriculum order across all published rules.
  const orderedRules = curriculumAreas.flatMap((area) => area.rules.map((id) => tajweedRules.find((item) => item.id === id))).filter((item): item is (typeof tajweedRules)[number] => Boolean(item));
  const ruleIndex = orderedRules.findIndex((item) => item.id === rule.id);
  const previousRule = ruleIndex > 0 ? orderedRules[ruleIndex - 1] : null;
  const nextRule = ruleIndex >= 0 && ruleIndex < orderedRules.length - 1 ? orderedRules[ruleIndex + 1] : null;
  const locator = referenceLocation(rule.id);
  const sources = rule.sources.map((id) => tajweedReferenceSources.find((source) => source.id === id)).filter(Boolean);
  const breadcrumbItems = [{ name: t("Home"), url: absoluteUrl(href("/")) }, { name: t("Tajweed"), url: absoluteUrl(href("/tajweed")) }, { name: t(rule.name), url: absoluteUrl(href(`/tajweed/${rule.slug}`)) }];
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) },
    { "@context": "https://schema.org", "@type": "LearningResource", name: t(rule.name), description: t(rule.shortDefinition), educationalLevel: t(rule.level), learningResourceType: "Lesson", inLanguage: locale, creativeWorkStatus: "Draft", url: absoluteUrl(href(`/tajweed/${rule.slug}`)), isAccessibleForFree: true },
  ];

  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="rule-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="container rule-breadcrumbs"><a href={href("/")}>{t("Home")}</a><ChevronRight size={14} /><a href={href("/tajweed")}>{t("Tajweed")}</a><ChevronRight size={14} /><span>{text(rule.name)}</span></div>
    <header className="rule-hero"><div className="container rule-hero-inner"><div><span className="badge">{text(rule.level)}</span><p className="eyebrow">{text(rule.category)}</p><h1>{text(rule.name)}</h1>{rule.arabicName && <p className="rule-arabic-title" lang="ar" dir="rtl">{text(rule.arabicName)}</p>}<p className="rule-intro">{text(rule.shortDefinition)}</p></div><div className="rule-meta"><span><strong>{t("Level")}</strong>{text(rule.level)}</span><span><strong>{t("Category")}</strong>{text(rule.category)}</span><span><strong>{t("Review status")}</strong>{text(isPublishableRule(rule) ? "Verified" : rule.reviewStatus === "DRAFT" ? "Draft" : "Requires Review")}</span></div></div></header>
    <div className="container rule-layout"><aside className="rule-sidebar"><LessonContents lessonId={rule.id} hasFaq={rule.faq.length > 0} /></aside>
      <article className="rule-content"><aside className="alert notice review-notice" role="note"><strong>{t("Study draft - qualified review pending")}</strong><details><summary>{t("Review status")}</summary><p>{t("This lesson is within the Hafs ʿan ʿĀṣim teaching scope. Its explanations and teaching examples have not completed qualified Tajweed review. Use them with a teacher, not as a verified recitation reference.")}</p></details><a href={href("/editorial-policy")}>{t("Read the review policy")}</a></aside>
        {["madd-lazim-harfi", "beginning-with-hamzah"].includes(rule.id) && <aside className="alert notice review-notice" role="note"><strong>{t("What still needs review?")}</strong><div>{rule.reviewNotes.map(note => <p key={note}>{t(note)}</p>)}</div></aside>}<StudyTools id={rule.id} /><section className="lesson-focus"><h2>{studyText(locale, "goal")}</h2><p>{text(rule.shortDefinition)}</p><RelatedLinks ids={rule.prerequisites} label={t("Before you begin")} /></section><section id="definition"><h2>{t("Understand the rule")}</h2><p>{text(rule.detailedExplanation)}</p></section>
        <section id="occurs"><h2>{t("When does it occur?")}</h2><p>{text(rule.whenItOccurs)}</p></section>
        <section id="letters"><h2>{t("Which letters are involved?")}</h2>{rule.letters.length ? <div className="letter-panel"><div className="letter-row" lang="ar" dir="rtl">{rule.letters.map((letter) => <span key={letter}>{text(letter)}</span>)}</div></div> : <p className="muted">{t("This topic is determined by context rather than a fixed letter set.")}</p>}</section>
        <section id="pronunciation"><h2>{t("How is it pronounced?")}</h2><p>{text(rule.pronunciation)}</p><div className="listen-note"><Volume2 size={18} /><span><strong><a href={href("/listen")}>{studyText(locale, "listen")} →</a></strong>{" "}{t("Written explanations support recognition. Use an approved recitation and teacher feedback for sound, timing, and articulation.")}</span></div></section>
        <section id="examples"><h2>{t("Examples")}</h2>{rule.category === "Waqf and Ibtida" && <details className="poster-reference"><summary>{t("Reference poster (English; awaiting review)")}</summary><figure className="symbols-poster"><Image src="/quran-symbols.png" alt={t("Poster explaining Quran reading and stopping symbols")} width={1600} height={850} sizes="(max-width: 800px) 100vw, 760px" loading="eager" /><figcaption>{t("Poster reference: the right side shows common stopping signs; the left side shows other printed reading marks. Use the poster to recognise a sign, then confirm its application in the mushaf and with a qualified teacher.")}</figcaption></figure><div className="symbols-guide"><strong>{t("How to use this poster")}</strong><ol><li>{t("Find the mark in your mushaf.")}</li><li>{t("Read the instruction beside the matching symbol.")}</li><li>{t("Protect the meaning before you stop or continue.")}</li><li>{t("Remember that editions can differ; your teacher and your own mushaf take priority.")}</li></ol></div></details>}<p className="muted">{t("The examples below are clearly labelled teaching examples and are not from the Quran. Use them to notice the rule, then confirm your recitation with a qualified teacher.")}</p><div className="examples-list">{verifiedQuranExamples.map((example) => <QuranExampleCard example={example} key={example.id} />)}{teachingExamples.length > 0 && <div className="teaching-example"><strong>{t("Draft teaching examples - not Quran quotations:")}</strong>{teachingExamples.map((example) => <p key={example.id} lang="ar" dir="rtl">{text(highlightText(example.arabicText, example.highlightedText))} <small lang={locale} dir={locale === "ar" || locale === "ur" ? "rtl" : "ltr"}><bdi lang="en" dir="ltr">{example.transliteration}</bdi> ({text(example.translation)}) — <strong>{t("Not from the Quran")}</strong></small></p>)}</div>}{!verifiedQuranExamples.length && !teachingExamples.length && <p className="muted">{t("Examples for this lesson will appear after verification of the exact text, reference, and rule annotation.")}</p>}</div></section>
        <section id="mistakes"><h2>{t("Common Mistakes")}</h2><ul className="mistake-list">{rule.commonMistakes.map((mistake) => <li key={mistake}>{text(mistake)}</li>)}</ul></section>
        <section id="differences"><h2>{t("Connect this lesson")}</h2><div className="distinction-list">{relatedRules.slice(0, 3).map((related) => <div className="distinction" key={related.id}><h3>{text(related.name)}</h3><p>{text(related.shortDefinition)}</p><a className="text-link" href={href(`/tajweed/${related.slug}`)}>{t("Open lesson:")}{" "}{text(related.name)} <ArrowRight size={14} /></a></div>)}</div></section>
        <section><h2>{t("Remember")}</h2><div className="memory-tip"><SparkIcon /><p>{text(rule.memoryTip)}</p></div></section>
        <section id="practice"><h2>{t("Practice")}</h2><p className="muted">{t("Try to identify the trigger first, say the sound slowly, then listen and repeat. Short, accurate practice is more useful than rushing through many examples.")}</p><ol className="practice-list">{rule.practiceQuestions.map((exercise) => <li key={exercise}>{text(exercise)}</li>)}</ol></section>
        <section id="quiz">
          <LessonQuiz lessonName={rule.name} questions={lessonQuizQuestions} />
        </section>
        {rule.faq.length > 0 && <section id="faq"><h2>{t("Frequently Asked Questions")}</h2><div className="faq-list">{rule.faq.map((item) => <details key={item.question}><summary>{text(item.question)}<ChevronRight size={14} className="faq-chevron" /></summary><p>{text(item.answer)}</p></details>)}</div></section>}
        <section id="related" className="related-section"><RelatedLinks ids={rule.relatedRules} label={t("Related Rules")} /></section>
        <nav className="rule-pager" aria-label={t("Lesson order")}>
          {previousRule ? <a className="pager-prev" href={href(`/tajweed/${previousRule.slug}`)}><small>{t("Previous lesson")}</small><strong>← {text(previousRule.name)}</strong></a> : <a href={href("/learn")}><small>{t("New here?")}</small><strong>{t("Start with the learning path")}</strong></a>}
          {nextRule ? <a className="pager-next" href={href(`/tajweed/${nextRule.slug}`)}><small>{t("Next lesson")}</small><strong>{text(nextRule.name)} →</strong></a> : <a className="pager-next" href={href("/practice")}><small>{t("Finished the library?")}</small><strong>{t("Test yourself in Practice →")}</strong></a>}
        </nav>
        <section id="sources" className="lesson-sources"><h2>{t("Sources and review notes")}</h2>{locator && <p>{t("Reference:")} <a href={locator.url} target="_blank" rel="noreferrer"><bdi lang="en">Reach the Goal via Tajweed Rules · pp. {locator.printed}</bdi></a></p>}<ul>{sources.map((source) => source && <li key={source.id}><a href={href(source.url)} target="_blank" rel="noreferrer">{text(source.title)}</a></li>)}</ul><details><summary>{t("What still needs review?")}</summary><ul>{rule.reviewNotes.map((note) => <li key={note}>{text(note)}</li>)}</ul></details><p className="muted">{t("A reference records the source used for study; it does not mean the source author approved this lesson.")}</p></section><section className="teacher-note"><h2>{t("Important Note")}</h2><p>{t("Tajweed is best learned through both understanding and listening. Written explanations can help you understand the rules, but correct pronunciation, timing, and articulation are best learned by listening to a qualified reciter or teacher and practicing along with them.")}</p><p>{t("For the best results, combine reading, listening, repetition, and guidance from a qualified Tajweed teacher.")}</p></section>
      </article></div>
  </main><Footer /></>;
}

function SparkIcon() { return <span className="memory-icon" aria-hidden="true">✦</span>; }

async function QuranExampleCard({ example }: { example: ReturnType<typeof getExamplesByRule>[number] }) {
  const { t, text, href } = await getI18n();

  return <article className="quran-example-card"><div className="quran-example-head"><div><p className="eyebrow">{t("Quran example")}</p><span className="example-status verified">{t("Verified")}</span></div><span className="muted">{text(example.surah)} {text(example.verse)}</span></div><p className="quran-arabic-prominent" lang="ar" dir="rtl">{text(highlightText(example.arabicText, example.highlightedText))}</p><p className="quran-annotation"><strong>{t("Reference:")}</strong> {text(example.surah)}{t(", verse")}{" "}{text(example.verse)}</p><p className="quran-explanation"><strong>{t("Explanation:")}</strong> {text(example.explanation)}</p></article>;
}

function highlightText(value: string, highlightedText?: string) {
  if (!highlightedText || !value.includes(highlightedText)) return value;
  const position = value.indexOf(highlightedText);
  return <>{value.slice(0, position)}<span className="quran-highlight">{highlightedText}</span>{value.slice(position + highlightedText.length)}</>;
}
