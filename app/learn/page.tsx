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

        <section className="section" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
          <div className="container" style={{ maxWidth: "840px" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              {tajweedLevels.map((level) => (
                <a 
                  key={level.id} 
                  href={`/learn/${level.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "24px",
                    padding: "26px 30px",
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    borderRadius: "14px",
                    boxShadow: "0 4px 20px rgba(19,54,45,.03)",
                    transition: "all 0.18s ease"
                  }}
                  className="learn-row-card"
                >
                  <div style={{ display: "grid", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="badge" style={{ fontSize: "11px" }}>Level 0{level.level}</span>
                    </div>
                    <h3 style={{ margin: "4px 0 2px", fontSize: "20px", letterSpacing: "-.02em" }}>{level.title}</h3>
                    <p className="muted" style={{ margin: 0, fontSize: "14px" }}>{level.purpose}</p>
                  </div>
                  <div style={{ display: "grid", placeItems: "center", width: "42px", height: "42px", flex: "none", color: "var(--green)", background: "var(--warm)", borderRadius: "10px" }}>
                    <ArrowRight size={18} />
                  </div>
                </a>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "40px", padding: "24px 30px", background: "var(--warm)", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <div style={{ display: "grid", gap: "4px" }}>
                <strong style={{ fontSize: "15px" }}>Ready to test your knowledge?</strong>
                <span className="muted" style={{ fontSize: "13px" }}>Practice with interactive Quranic examples and quizzes.</span>
              </div>
              <a className="button primary" href="/practice" style={{ flex: "none" }}>
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
