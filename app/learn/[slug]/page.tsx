import type { Metadata } from "next";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { Footer, SiteHeader } from "@/components/ui";
import { tajweedLevels, tajweedTopics } from "@/lib/taxonomy";
import { getTopicLessonLink } from "@/lib/taxonomy/lessons";

const aliases: Record<string, string> = { essential: "essential-rules", advanced: "advanced-topics" };
function resolve(slug: string) { const normalized = aliases[slug] ?? slug; return tajweedLevels.find((level) => level.slug === normalized) ?? tajweedTopics.find((topic) => topic.slug === slug); }
function isLevel(item: NonNullable<ReturnType<typeof resolve>>): item is (typeof tajweedLevels)[number] { return "topicIds" in item; }
export function generateStaticParams() { return [...tajweedLevels.map((level) => ({ slug: level.slug })), ...tajweedTopics.map((topic) => ({ slug: topic.slug }))]; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const item = resolve((await params).slug); if (!item) return {}; const itemIsLevel = isLevel(item); return { title: `${item.title} Learning Path | Complete Tajweed Guide`, description: "A structured learning step in the Complete Tajweed Guide.", alternates: { canonical: `/learn/${item.slug}` }, robots: !itemIsLevel && item.reviewStatus !== "taxonomy-reviewed" ? { index: false, follow: true } : undefined }; }

export default async function LearnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (aliases[slug]) permanentRedirect(`/learn/${aliases[slug]}`);
  const item = resolve(slug);
  if (!item) notFound();
  const itemIsLevel = isLevel(item);
  const topics = itemIsLevel ? tajweedTopics.filter((topic) => item.topicIds.includes(topic.id)).sort((a, b) => a.suggestedOrder - b.suggestedOrder) : [];

  const levelIndex = itemIsLevel ? tajweedLevels.findIndex((l) => l.id === item.id) : -1;
  const prevLevel = levelIndex > 0 ? tajweedLevels[levelIndex - 1] : null;
  const nextLevel = levelIndex >= 0 && levelIndex < tajweedLevels.length - 1 ? tajweedLevels[levelIndex + 1] : null;
  const lessonLink = !itemIsLevel ? getTopicLessonLink(item) : null;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="library-hero">
          <div className="container">
            <div className="breadcrumbs" style={{ marginBottom: "16px" }}>
              <a href="/learn">Learning Path</a>
              <ChevronRight size={14} />
              <span>{itemIsLevel ? `Level 0${item.level}` : item.category}</span>
            </div>
            <p className="eyebrow">{itemIsLevel ? `Level 0${item.level} of 05` : item.category}</p>
            <h1 style={{ marginBottom: "14px" }}>{item.title}</h1>
            <p className="hero-lede">{itemIsLevel ? item.purpose : item.summary}</p>
            {!itemIsLevel && lessonLink && (
              <div className="hero-actions" style={{ marginTop: "20px" }}>
                <a className="button primary" href={`/tajweed/${lessonLink.lessonSlug}`}>
                  <BookOpen size={16} /> Open Full Rule Lesson <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        </section>

        {itemIsLevel && (
          <section className="section learn-level-section">
            <div className="container learn-level-inner">
              <div className="learn-level-heading">
                <h2>Topics in this Level</h2>
                <span className="muted">{topics.length} modules</span>
              </div>

              <div className="learn-topic-list">
                {topics.map((topic, index) => {
                  const link = getTopicLessonLink(topic);
                  return (
                    <a className="learn-topic-row" href={`/tajweed/${link.lessonSlug}`} key={topic.id}>
                      <div className="learn-topic-main">
                        <span className="badge">{String(index + 1).padStart(2, "0")}</span>
                        <div className="learn-topic-copy">
                          <h3>{topic.title}</h3>
                        </div>
                      </div>
                      <ArrowRight size={16} className="learn-topic-arrow" />
                    </a>
                  );
                })}
              </div>

              <div className="learn-level-footer">
                {prevLevel ? (
                  <a className="outline-link" href={`/learn/${prevLevel.slug}`}>
                    ← Level 0{prevLevel.level}: {prevLevel.title}
                  </a>
                ) : <div />}
                {nextLevel ? (
                  <a className="button primary" href={`/learn/${nextLevel.slug}`}>
                    Level 0{nextLevel.level}: {nextLevel.title} <ArrowRight size={16} />
                  </a>
                ) : (
                  <a className="button primary" href="/practice">
                    Start Practice <ArrowRight size={16} />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
