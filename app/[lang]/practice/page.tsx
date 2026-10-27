import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { PracticeHub } from "@/components/practice";

export async function generateMetadata() { return localizeMetadata({ title: "Practice Tajweed", description: "Practise identifying Tajweed rules with focused questions and explanations.", alternates: { canonical: "/practice" }, openGraph: { title: "Practice Tajweed", description: "Practise identifying Tajweed rules with focused questions and explanations.", url: "/practice", type: "website" }, twitter: { card: "summary", title: "Practice Tajweed", description: "Practise identifying Tajweed rules with focused questions and explanations." } }, await getI18n(), "/practice"); }
export default async function PracticePage() {
  const { t, text, href } = await getI18n();

  return <><SiteHeader /><main id="main-content" tabIndex={-1}><section className="practice-hero"><div className="container"><p className="eyebrow">{t("Practice and quizzes")}</p><h1>{t("Make a little practice part of every lesson.")}</h1><p className="hero-lede">{t("Read one explanation, recall its condition, then discuss your pronunciation with a qualified teacher. The recognition questions below are study drafts awaiting qualified review; their scores cannot assess recitation.")}</p><a className="text-link" href={href("/learn")}>{t("Choose a lesson from the learning path")}</a></div></section><section className="section"><div className="container"><PracticeHub /></div></section></main><Footer /></>;
}
