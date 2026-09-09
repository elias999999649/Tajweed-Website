import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, Info, Link2, Volume2 } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { LessonQuiz } from "@/components/lesson-quiz";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { getExamplesByRule } from "@/lib/tajweed/examples";
import { getRuleBySlug, tajweedRules } from "@/lib/tajweed/rules";
import { tajweedReferenceSources } from "@/lib/tajweed/sources";
import { getLessonQuestions } from "@/lib/practice/quiz";

export function generateStaticParams() {
  return tajweedRules.map((rule) => ({ slug: rule.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rule = getRuleBySlug(slug);
  if (!rule) return {};
  return {
    title: `${rule.name} | Complete Tajweed Guide`,
    description: `${rule.name}: definition, occurrence, letters, pronunciation guidance, practice, and related Tajweed lessons.`,
    alternates: { canonical: absoluteUrl(`/tajweed/${rule.slug}`) },
    openGraph: { title: `${rule.name} | Complete Tajweed Guide`, description: rule.shortDefinition, url: absoluteUrl(`/tajweed/${rule.slug}`), type: "article" },
    robots: rule.reviewStatus === "VERIFIED" ? undefined : { index: false, follow: true },
  };
}

function RelatedLinks({ ids, label }: { ids: string[]; label: string }) {
  const rules = ids.map((id) => tajweedRules.find((rule) => rule.id === id)).filter(Boolean);
  if (!rules.length) return null;
  return <div className="related-links"><h3>{label}</h3><div>{rules.map((rule) => rule && <a href={`/tajweed/${rule.slug}`} key={rule.id}><span>{rule.name}</span><ArrowRight size={15} /></a>)}</div></div>;
}

export default async function TajweedRulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rule = getRuleBySlug(slug);
  if (!rule) notFound();
  const examples = getExamplesByRule(rule.id);
  const lessonQuizQuestions = getLessonQuestions(slug);
  const verifiedQuranExamples = examples.filter((example) => example.type === "quran" && example.verificationStatus === "verified");
  const teachingExamples = examples.filter((example) => example.type === "instructional");
  const sources = rule.sources.map((id) => tajweedReferenceSources.find((source) => source.id === id)).filter(Boolean);
  const relatedRules = rule.relatedRules.map((id) => tajweedRules.find((item) => item.id === id)).filter((item): item is (typeof tajweedRules)[number] => Boolean(item));
  // Prev/next follows the stored curriculum order across all published rules.
  const ruleIndex = tajweedRules.findIndex((item) => item.id === rule.id);
  const previousRule = ruleIndex > 0 ? tajweedRules[ruleIndex - 1] : null;
  const nextRule = ruleIndex >= 0 && ruleIndex < tajweedRules.length - 1 ? tajweedRules[ruleIndex + 1] : null;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const breadcrumbItems = [{ name: "Home", url: siteUrl }, { name: "Tajweed", url: `${siteUrl}/tajweed` }, { name: rule.name, url: `${siteUrl}/tajweed/${rule.slug}` }];
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) },
    { "@context": "https://schema.org", "@type": "LearningResource", name: rule.name, description: rule.shortDefinition, educationalLevel: rule.level, learningResourceType: "Tajweed rule lesson", url: `${siteUrl}/tajweed/${rule.slug}`, isAccessibleForFree: true },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: rule.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  ];

  return <><SiteHeader /><main className="rule-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="container rule-breadcrumbs"><a href="/">Home</a><ChevronRight size={14} /><a href="/tajweed">Tajweed</a><ChevronRight size={14} /><span>{rule.name}</span></div>
    <header className="rule-hero"><div className="container rule-hero-inner"><div><span className="badge">{rule.level}</span><p className="eyebrow">{rule.category}</p><h1>{rule.name}</h1>{rule.arabicName && <p className="rule-arabic-title" lang="ar" dir="rtl">{rule.arabicName}</p>}<p className="rule-intro">{rule.shortDefinition}</p></div><div className="rule-meta"><span><strong>Level</strong>{rule.level}</span><span><strong>Category</strong>{rule.category}</span>{isDevelopment && <span><strong>Review status</strong>{rule.reviewStatus === "VERIFIED" ? "Verified" : rule.reviewStatus === "DRAFT" ? "Draft" : "Requires Review"}</span>}</div></div></header>
    <div className="container rule-layout"><aside className="rule-sidebar"><nav aria-label="On this page"><strong>On this page</strong><a href="#definition">What is it?</a><a href="#occurs">When it occurs</a><a href="#letters">Letters involved</a><a href="#pronunciation">How to pronounce it</a><a href="#examples">Quran examples</a><a href="#mistakes">Common mistakes</a><a href="#differences">Important differences</a><a href="#practice">Practice</a><a href="#quiz">Quiz</a><a href="#faq">FAQ</a><a href="#related">Related rules</a><a href="#sources">Sources</a></nav></aside>
      <article className="rule-content"><section className="quick-summary card"><div className="quick-summary-heading"><Info size={19} /><h2>Quick Facts</h2></div><dl><div><dt>Level</dt><dd>{rule.level}</dd></div><div><dt>Category</dt><dd>{rule.category}</dd></div><div><dt>When it occurs</dt><dd>{rule.whenItOccurs}</dd></div><div><dt>Letters involved</dt><dd lang="ar" dir="rtl">{rule.letters.length ? rule.letters.join(" · ") : "Context-dependent"}</dd></div></dl></section>
        <section id="definition"><h2>What is {rule.name}?</h2><p>{rule.detailedExplanation}</p></section>
        <section id="occurs"><h2>When does it occur?</h2><p>{rule.whenItOccurs}</p></section>
        <section id="letters"><h2>Which letters are involved?</h2>{rule.letters.length ? <div className="letter-panel"><div className="letter-row" lang="ar" dir="rtl">{rule.letters.map((letter) => <span key={letter}>{letter}</span>)}</div></div> : <p className="muted">This topic is determined by context rather than a fixed letter set.</p>}</section>
        <section id="pronunciation"><h2>How is it pronounced?</h2><p>{rule.pronunciation}</p><div className="listen-note"><Volume2 size={18} /><span><strong>Listening guidance</strong> Written explanations support recognition. Use an approved recitation and teacher feedback for sound, timing, and articulation.</span></div></section>
        <section id="examples"><h2>Examples</h2><div className="examples-list">{verifiedQuranExamples.map((example) => <QuranExampleCard example={example} key={example.id} />)}{teachingExamples.length > 0 && <div className="teaching-example"><strong>Teaching examples (not Quran quotations):</strong>{teachingExamples.map((example) => <p key={example.id} lang="ar" dir="rtl">{highlightText(example.arabicText, example.highlightedText)} <small dir="ltr">— {example.transliteration} ({example.translation})</small></p>)}</div>}{!verifiedQuranExamples.length && !teachingExamples.length && <p className="muted">Examples for this lesson will appear after verification of the exact text, reference, and rule annotation.</p>}</div></section>
        <section id="mistakes"><h2>Common Mistakes</h2><ul className="mistake-list">{rule.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section>
        <section id="differences"><h2>Important Differences</h2><div className="distinction-list">{relatedRules.slice(0, 3).map((related) => <div className="distinction" key={related.id}><h3>{rule.name} and {related.name}</h3><p>Study the condition, letters, and sound of {rule.name} alongside {related.name} so the two patterns are not treated as interchangeable.</p><a className="text-link" href={`/tajweed/${related.slug}`}>Compare {related.name} <ArrowRight size={14} /></a></div>)}</div></section>
        <section><h2>Remember</h2><div className="memory-tip"><SparkIcon /><p>{rule.memoryTip}</p></div></section>
        <section id="practice"><h2>Practice</h2><ol className="practice-list">{rule.practiceQuestions.map((exercise) => <li key={exercise}>{exercise}</li>)}</ol></section>
        <section id="quiz">
          <LessonQuiz lessonName={rule.name} questions={lessonQuizQuestions} />
        </section>
        {rule.faq.length > 0 && <section id="faq"><h2>Frequently Asked Questions</h2><div className="faq-list">{rule.faq.map((item) => <details key={item.question}><summary>{item.question}<ChevronRight size={14} className="faq-chevron" /></summary><p>{item.answer}</p></details>)}</div></section>}
        <section id="related" className="related-section"><RelatedLinks ids={rule.relatedRules} label="Related Rules" /><RelatedLinks ids={rule.prerequisites} label="Prerequisites" /></section>
        <nav className="rule-pager" aria-label="Lesson order">
          {previousRule ? <a className="pager-prev" href={`/tajweed/${previousRule.slug}`}><small>Previous lesson</small><strong>← {previousRule.name}</strong></a> : <a href="/start-here"><small>New here?</small><strong>Start with the first lesson</strong></a>}
          {nextRule ? <a className="pager-next" href={`/tajweed/${nextRule.slug}`}><small>Next lesson</small><strong>{nextRule.name} →</strong></a> : <a className="pager-next" href="/practice"><small>Finished the library?</small><strong>Test yourself in Practice →</strong></a>}
        </nav>
        <section id="sources"><h2>Sources</h2><div className="source-box"><Link2 size={17} /><div><ul className="source-list">{sources.map((source) => source && <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowRight size={13} /></a><small>{source.note}</small></li>)}</ul></div></div></section>
        <section className="teacher-note"><h2>Important Note</h2><p>Tajweed is best learned through both understanding and listening. Written explanations can help you understand the rules, but correct pronunciation, timing, and articulation are best learned by listening to a qualified reciter or teacher and practicing along with them.</p><p>For the best results, combine reading, listening, repetition, and guidance from a qualified Tajweed teacher.</p></section>
      </article></div>
  </main><Footer /></>;
}

function SparkIcon() { return <span className="memory-icon" aria-hidden="true">✦</span>; }

function QuranExampleCard({ example }: { example: ReturnType<typeof getExamplesByRule>[number] }) {
  return <article className="quran-example-card"><div className="quran-example-head"><div><p className="eyebrow">Quran example</p><span className="example-status verified">Verified</span></div><span className="muted">{example.surah} {example.verse}</span></div><p className="quran-arabic-prominent" lang="ar" dir="rtl">{highlightText(example.arabicText, example.highlightedText)}</p><p className="quran-annotation"><strong>Reference:</strong> {example.surah}, verse {example.verse}</p><p className="quran-explanation"><strong>Explanation:</strong> {example.explanation}</p></article>;
}

function highlightText(text: string, highlightedText?: string) {
  if (!highlightedText || !text.includes(highlightedText)) return text;
  const [before, after] = text.split(highlightedText);
  return <>{before}<span className="quran-highlight">{highlightedText}</span>{after}</>;
}
