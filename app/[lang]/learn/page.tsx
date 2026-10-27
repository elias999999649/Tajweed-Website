import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { curriculumAreas } from "@/lib/tajweed/curriculum";
import { tajweedRules } from "@/lib/tajweed/rules";

export async function generateMetadata() { return localizeMetadata({ title: "Tajweed Learning Path", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics.", alternates: { canonical: "/learn" }, openGraph: { title: "Tajweed Learning Path", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics.", url: "/learn", type: "website" }, twitter: { card: "summary", title: "Tajweed Learning Path", description: "Follow a structured Tajweed learning path from foundations through essential rules, Madd, stopping, and advanced topics." } }, await getI18n(), "/learn"); }

export default async function LearnPage() {
  const { t, text, href } = await getI18n();

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="library-hero">
          <div className="container">
            <p className="eyebrow">{t("Learning path")}</p>
            <h1>{t("Learn Tajweed in the right order.")}</h1>
            <p className="hero-lede">{t("Start with the reading foundations, learn each rule family, and leave detailed stopping and advanced topics until the skills they need are secure.")}</p>
            <div className="learn-purpose-note"><strong>{t("Before you begin")}</strong><span>{t("If you do not yet recognise Arabic letters and short vowels, start with Arabic Letters and Basic Arabic Pronunciation. Read one lesson at a time, practise slowly, and ask a qualified teacher to check the sound.")}</span></div>
          </div>
        </section>

        <section className="section learn-level-section">
          <div className="container learn-level-inner">
            <div className="learn-path-intro"><span className="badge">{t("Start at Stage 1")}</span><h2>{t("One clear route from beginner to advanced")}</h2><p className="muted">{t("The stages below contain all 50 study lessons once. Follow them from top to bottom; within each stage, study the lessons in the order shown. These lessons await qualified Tajweed review.")}</p></div>
            <div className="learn-curriculum-list">
              {curriculumAreas.map((area, index) => {
                const rules = area.rules.map((id) => tajweedRules.find((rule) => rule.id === id)).filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));
                return <details className="learn-curriculum-stage" key={area.id} open={index === 0}><summary className="learn-curriculum-heading"><span className="badge">{t("Stage")}{" "}{text(String(index + 1).padStart(2, "0"))}</span><div><h2>{text(area.title)}</h2><p className="muted">{text(area.summary)}</p></div><span className="directory-group-count">{text(rules.length)}{" "}{t("lessons")}</span></summary><div className="learn-curriculum-rules">{rules.map((rule, ruleIndex) => <a className="learn-topic-row" href={href(`/tajweed/${rule.slug}`)} key={rule.id}><div className="learn-topic-main"><span className="badge">{text(String(ruleIndex + 1).padStart(2, "0"))}</span><div className="learn-topic-copy"><h3>{text(rule.name)}</h3><span className="muted">{text(rule.shortDefinition)}</span></div></div><ArrowRight size={16} className="learn-topic-arrow" /></a>)}</div></details>;
              })}
            </div>
            <div className="learn-cta-row"><div className="learn-cta-copy"><strong>{t("Put understanding into practice")}</strong><span className="muted">{t("Each lesson includes reflection prompts and review-stage recognition questions. Use them with your teacher.")}</span></div><a className="button primary" href={href("/practice")}><BookOpen size={15} />{" "}{t("Practice Mode")}</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
