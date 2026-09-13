import { ArrowRight, BookOpen } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { curriculumAreas } from "@/lib/tajweed/curriculum";
import { tajweedRules } from "@/lib/tajweed/rules";

export const metadata = { title: "Tajweed Learning Path | Complete Tajweed Guide", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics.", alternates: { canonical: "/learn" }, openGraph: { title: "Tajweed Learning Path | Complete Tajweed Guide", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics.", url: "/learn", type: "website" }, twitter: { card: "summary", title: "Tajweed Learning Path | Complete Tajweed Guide", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics." } };

export default function LearnPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="library-hero">
          <div className="container">
            <p className="eyebrow">Learning path</p>
            <h1>Learn Tajweed in the right order.</h1>
            <p className="hero-lede">Start with the reading foundations, learn each rule family, and leave detailed stopping and advanced topics until the skills they need are secure.</p>
            <div className="learn-purpose-note"><strong>How this page differs from the Rules library</strong><span><b>Learn</b> is your step-by-step route. It answers “What should I study next?” The <b>Rules library</b> is your reference tool for browsing, searching, comparing, and revisiting individual lessons.</span></div>
          </div>
        </section>

        <section className="section learn-level-section">
          <div className="container learn-level-inner">
            <div className="learn-path-intro"><span className="badge">Start at Stage 1</span><h2>One clear route from beginner to advanced</h2><p className="muted">The stages below contain every published rule lesson once. Follow them from top to bottom; within each stage, study the lessons in the order shown.</p></div>
            <div className="learn-curriculum-list">
              {curriculumAreas.map((area, index) => {
                const rules = area.rules.map((id) => tajweedRules.find((rule) => rule.id === id)).filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));
                return <section className="learn-curriculum-stage" key={area.id}><div className="learn-curriculum-heading"><span className="badge">Stage {String(index + 1).padStart(2, "0")}</span><div><h2>{area.title}</h2><p className="muted">{area.summary}</p></div><span className="directory-group-count">{rules.length} lessons</span></div><div className="learn-curriculum-rules">{rules.map((rule, ruleIndex) => <a className="learn-topic-row" href={`/tajweed/${rule.slug}`} key={rule.id}><div className="learn-topic-main"><span className="badge">{String(ruleIndex + 1).padStart(2, "0")}</span><div className="learn-topic-copy"><h3>{rule.name}</h3><span className="muted">{rule.shortDefinition}</span></div></div><ArrowRight size={16} className="learn-topic-arrow" /></a>)}</div></section>;
              })}
            </div>
            <div className="learn-cta-row"><div className="learn-cta-copy"><strong>Ready to test your knowledge?</strong><span className="muted">Practice with interactive quizzes on every rule.</span></div><a className="button primary" href="/practice"><BookOpen size={15} /> Practice Mode</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
