import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { articles } from "@/lib/articles/content";

export async function generateMetadata() { return localizeMetadata({ title: "Articles and Learning Guides", description: "Useful Tajweed articles answering real learner questions about rules, pronunciation, Quran reading, and practice.", alternates: { canonical: "/articles" }, openGraph: { title: "Articles and Learning Guides", description: "Useful Tajweed articles answering real learner questions about rules, pronunciation, Quran reading, and practice.", url: "/articles", type: "website" }, twitter: { card: "summary", title: "Articles and Learning Guides", description: "Useful Tajweed articles answering real learner questions about rules, pronunciation, Quran reading, and practice." } }, await getI18n(), "/articles"); }

export default async function ArticlesPage() {
  const { t, text, href } = await getI18n();

  const publishedArticles = articles.filter((article) => article.reviewStatus === "approved");
  const categories = Array.from(new Set(publishedArticles.map((article) => article.category)));
  return <><SiteHeader /><main id="main-content" tabIndex={-1}><section className="articles-hero"><div className="container"><p className="eyebrow">{t("Articles and learning guides")}</p><h1>{t("Useful answers for the questions between lessons.")}</h1><p className="hero-lede">{t("A small, carefully edited library for learners who want to understand a rule, choose a starting point, or practise with more intention.")}</p></div></section><section className="section"><div className="container article-library">{categories.map((category) => <section key={category} className="article-category"><div className="article-category-heading"><p className="eyebrow">{text(category)}</p><h2>{text(category === "Tajweed Basics" ? "Start with the larger picture" : category === "Tajweed Rules" ? "Make rule names useful" : category === "Learning Tips" ? "Build a steady practice" : "Read with more awareness")}</h2></div><div className="article-grid">{publishedArticles.filter((article) => article.category === category).map((article) => <a className="article-card" href={href(`/articles/${article.slug}`)} key={article.slug}><span className="badge">{text(article.readingTime)}</span><h3>{text(article.title)}</h3><p className="muted">{text(article.description)}</p><span className="text-link">{t("Read the guide")}{" "}<ArrowRight size={14} /></span></a>)}</div></section>)}</div></section></main><Footer /></>;
}
