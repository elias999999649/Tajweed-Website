import { ArrowRight, BookOpen } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { tajweedLevels } from "@/lib/taxonomy";

export const metadata = { title: "Tajweed Learning Path | Complete Tajweed Guide", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics.", alternates: { canonical: "/learn" }, openGraph: { title: "Tajweed Learning Path | Complete Tajweed Guide", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics.", url: "/learn", type: "website" }, twitter: { card: "summary", title: "Tajweed Learning Path | Complete Tajweed Guide", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics." } };

export default function LearnPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="library-hero">
          <div className="container">
            <p className="eyebrow">Learning path</p>
            <h1>Progress through Tajweed with purpose.</h1>
            <p className="hero-lede">A sequence that builds foundations before asking you to combine rule families.</p>
          </div>
        </section>

        <section className="section learn-level-section">
          <div className="container learn-level-inner">
            <div className="learn-topic-list">
              {tajweedLevels.map((level) => (
                <a key={level.id} href={`/learn/${level.slug}`} className="learn-topic-row">
                  <div className="learn-topic-main">
                    <span className="badge">Level 0{level.level}</span>
                    <div className="learn-topic-copy">
                      <h3>{level.title}</h3>
                      <span className="muted">{level.purpose}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="learn-topic-arrow" />
                </a>
              ))}
            </div>

            <div className="learn-cta-row">
              <div className="learn-cta-copy">
                <strong>Ready to test your knowledge?</strong>
                <span className="muted">Practice with interactive quizzes on every rule.</span>
              </div>
              <a className="button primary" href="/practice">
                <BookOpen size={15} /> Practice Mode
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
