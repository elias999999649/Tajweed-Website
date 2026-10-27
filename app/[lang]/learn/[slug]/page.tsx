import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { tajweedLevels, tajweedTopics } from "@/lib/taxonomy";
import { tajweedRules } from "@/lib/tajweed/rules";
import { getTopicLessonLink } from "@/lib/taxonomy/lessons";

const aliases: Record<string, string> = { essential: "essential-rules", advanced: "advanced-topics" };
function resolve(slug: string) { const normalized = aliases[slug] ?? slug; return tajweedLevels.find((level) => level.slug === normalized) ?? tajweedTopics.find((topic) => topic.slug === slug); }
function isLevel(item: NonNullable<ReturnType<typeof resolve>>): item is (typeof tajweedLevels)[number] { return "topicIds" in item; }
export function generateStaticParams() { return [...tajweedLevels.map((level) => ({ slug: level.slug })), ...tajweedTopics.map((topic) => ({ slug: topic.slug }))]; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const item = resolve((await params).slug); if (!item) return {}; const itemIsLevel = isLevel(item); return localizeMetadata({ title: item.title, description: itemIsLevel ? item.purpose : item.summary, alternates: { canonical: `/learn/${item.slug}` }, robots: !itemIsLevel && item.reviewStatus !== "taxonomy-reviewed" ? { index: false, follow: true } : undefined }, await getI18n(), `/learn/${item.slug}`); }

export default async function LearnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, text, href } = await getI18n();

  const slug = (await params).slug;
  const item = resolve(slug);
  if (!item) notFound();
  const itemIsLevel = isLevel(item);
  const topics = itemIsLevel ? tajweedTopics.filter((topic) => item.topicIds.includes(topic.id)).sort((a, b) => a.suggestedOrder - b.suggestedOrder) : [];

  const levelIndex = itemIsLevel ? tajweedLevels.findIndex((l) => l.id === item.id) : -1;
  const prevLevel = levelIndex > 0 ? tajweedLevels[levelIndex - 1] : null;
  const nextLevel = levelIndex >= 0 && levelIndex < tajweedLevels.length - 1 ? tajweedLevels[levelIndex + 1] : null;
  const lessonLink = !itemIsLevel ? getTopicLessonLink(item) : null;
  const relatedStudyLinks = !itemIsLevel ? item.relatedRules.flatMap(id => {
    const rule = tajweedRules.find(rule => rule.id === id);
    if (rule) return [{ id, label: rule.name, path: `/tajweed/${rule.slug}` }];
    const topic = tajweedTopics.find(topic => topic.id === id && topic.id !== item.id);
    return topic ? [{ id, label: topic.title, path: getTopicLessonLink(topic).href }] : [];
  }) : [];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="library-hero">
          <div className="container">
            <div className="breadcrumbs" style={{ marginBottom: "16px" }}>
              <a href={href("/learn")}>{t("Learning Path")}</a>
              <ChevronRight size={14} />
              <span>{itemIsLevel ? t("Level {number}", { number: item.level }) : t(item.category)}</span>
            </div>
            <p className="eyebrow">{itemIsLevel ? t("Level {number} of {count}", { number: item.level, count: 5 }) : t(item.category)}</p>
            <h1 style={{ marginBottom: "14px" }}>{text(item.title)}</h1>
            <p className="hero-lede">{text(itemIsLevel ? item.purpose : item.summary)}</p>
            {!itemIsLevel && lessonLink?.lessonSlug && (
              <div className="hero-actions" style={{ marginTop: "20px" }}>
                <a className="button primary" href={href(`/tajweed/${lessonLink.lessonSlug}`)}>
                  <BookOpen size={16} />{" "}{t("Open Full Rule Lesson")}{" "}<ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        </section>

        {!itemIsLevel && !lessonLink?.lessonSlug && relatedStudyLinks.length > 0 && <section className="section"><div className="container learn-level-inner"><span className="badge">{t("Awaiting qualified review")}</span><h2>{t("Related lessons")}</h2><div className="article-related-links">{relatedStudyLinks.map(link => <a href={href(link.path)} key={link.id}>{t(link.label)}</a>)}</div></div></section>}
        {!itemIsLevel && <section className="section"><div className="container"><div className="learn-level-inner"><h2>{t("Prerequisites")}</h2><div className="article-related-links">{item.prerequisites.map((id) => { const topic = tajweedTopics.find((entry) => entry.id === id); return topic ? <a key={id} href={href(getTopicLessonLink(topic).href)}>{text(topic.title)}<ArrowRight size={16} /></a> : null; })}</div><p>{t("Written explanations can support recognition and understanding. Correct pronunciation, timing, and articulation are best learned through listening, repetition, and qualified feedback.")}</p><a className="text-link" href={href("/editorial-policy")}>{t("Editorial policy")}</a></div></div></section>}
        {itemIsLevel && (
          <section className="section learn-level-section">
            <div className="container learn-level-inner">
              <div className="learn-level-heading">
                <h2>{t("Topics in this Level")}</h2>
                <span className="muted">{text(topics.length)}{" "}{t("modules")}</span>
              </div>

              <div className="learn-topic-list">
                {topics.map((topic, index) => {
                  const link = getTopicLessonLink(topic);
                  return (
                    <a className="learn-topic-row" href={href(link.href)} key={topic.id}>
                      <div className="learn-topic-main">
                        <span className="badge">{text(String(index + 1).padStart(2, "0"))}</span>
                        <div className="learn-topic-copy">
                          <h3>{text(topic.title)}</h3>
                        </div>
                      </div>
                      <ArrowRight size={16} className="learn-topic-arrow" />
                    </a>
                  );
                })}
              </div>

              <div className="learn-level-footer">
                {prevLevel ? (
                  <a className="outline-link" href={href(`/learn/${prevLevel.slug}`)}>{t("Previous")} {t("Level {number}", { number: prevLevel.level })}: {text(prevLevel.title)}
                  </a>
                ) : <div />}
                {nextLevel ? (
                  <a className="button primary" href={href(`/learn/${nextLevel.slug}`)}>{t("Level {number}", { number: nextLevel.level })}: {text(nextLevel.title)} <ArrowRight size={16} />
                  </a>
                ) : (
                  <a className="button primary" href={href("/practice")}>{t("Start Practice")}<ArrowRight size={16} />
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
