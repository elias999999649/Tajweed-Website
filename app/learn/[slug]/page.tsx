import type { Metadata } from "next";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { Footer, SiteHeader } from "@/components/ui";
import { tajweedLevels, tajweedTopics } from "@/lib/taxonomy";

const aliases: Record<string, string> = { essential: "essential-rules", "madd-and-lengthening": "madd", "stopping-and-starting": "stopping-starting", "advanced": "advanced-topics" };
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
            {!itemIsLevel && (
              <div className="hero-actions" style={{ marginTop: "20px" }}>
                <a className="button primary" href={`/tajweed/${item.slug}`}>
                  <BookOpen size={16} /> Open Full Rule Lesson <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        </section>

        {itemIsLevel && (
          <section className="section" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
            <div className="container" style={{ maxWidth: "840px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2 style={{ margin: 0, fontSize: "24px" }}>Topics in this Level</h2>
                <span className="muted" style={{ fontSize: "13px" }}>{topics.length} modules</span>
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                {topics.map((topic, index) => (
                  <a 
                    className="learn-row-card" 
                    href={`/tajweed/${topic.slug}`} 
                    key={topic.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      padding: "20px 24px",
                      background: "var(--white)",
                      border: "1px solid var(--line)",
                      borderRadius: "12px",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      <span className="badge" style={{ fontSize: "11px", padding: "4px 8px" }}>0{index + 1}</span>
                      <div style={{ display: "grid", gap: "3px" }}>
                        <h3 style={{ margin: 0, fontSize: "17px" }}>{topic.title}</h3>
                        <span className="muted" style={{ fontSize: "13px" }}>{topic.category} · {topic.estimatedDifficulty}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: "var(--green)", flex: "none" }} />
                  </a>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--line)" }}>
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
