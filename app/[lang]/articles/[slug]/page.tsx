import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, ChevronRight, Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/ui";
import { articles, getArticleBySlug } from "@/lib/articles/content";
import { taxonomySources } from "@/lib/taxonomy/sources";
import { tajweedRules } from "@/lib/tajweed/rules";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return localizeMetadata({ title: article.title, description: article.description, alternates: { canonical: `/articles/${article.slug}` }, openGraph: { title: `${article.title}`, description: article.description, url: `/articles/${article.slug}`, type: "article" }, twitter: { card: "summary", title: `${article.title}`, description: article.description }, robots: article.reviewStatus === "approved" ? undefined : { index: false, follow: true } }, await getI18n(), `/articles/${article.slug}`);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, text, href, locale } = await getI18n();

  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const relatedLessons = article.relatedRuleIds.map((id) => tajweedRules.find((rule) => rule.id === id)).filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));
  const sources = article.sourceIds.map((id) => taxonomySources.find((source) => source.id === id)).filter(Boolean);
  const breadcrumbs = breadcrumbJsonLd([{ name: t("Home"), path: href("/") }, { name: t("Articles"), path: href("/articles") }, { name: t(article.title), path: href(`/articles/${article.slug}`) }]);
  const articleLd = { "@context": "https://schema.org", "@type": "Article", headline: t(article.title), description: t(article.description), inLanguage: locale, dateModified: article.updatedAt, mainEntityOfPage: absoluteUrl(href(`/articles/${article.slug}`)), articleSection: t(article.category), isAccessibleForFree: true };
  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleLd]) }} /><div className="container article-breadcrumbs"><a href={href("/")}>{t("Home")}</a><ChevronRight size={14} /><a href={href("/articles")}>{t("Articles")}</a><ChevronRight size={14} /><span>{text(article.title)}</span></div><header className="article-hero"><div className="container article-hero-inner"><span className="badge">{text(article.category)}</span><h1>{text(article.title)}</h1><p>{text(article.description)}</p><div className="article-meta"><span>{text(article.readingTime)}</span><span>{t("Updated")}{" "}{text(article.updatedAt)}</span></div></div></header><div className="container article-layout"><article className="article-body">{article.reviewStatus !== "approved" && <aside className="alert notice review-notice" role="note"><strong>{t("Study draft - qualified review pending")}</strong><a href={href("/editorial-policy")}>{t("Read the review policy")}</a></aside>}{article.sections.map((section) => <section id={section.heading.toLowerCase().replaceAll(" ", "-")} key={section.heading}><h2>{text(section.heading)}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{text(paragraph)}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{text(bullet)}</li>)}</ul>}</section>)}<section className="article-path"><BookOpen size={18} /><div><strong>{t("Continue in the learning path")}</strong><p>{t("This article connects to a structured lesson sequence.")}</p><a className="text-link" href={href(article.learningPathHref)}>{t("Open the related learning path")}{" "}<ArrowRight size={14} /></a></div></section><section><h2>{t("Related Tajweed lessons")}</h2><div className="article-related-links">{relatedLessons.map((link) => link && <a href={href(`/tajweed/${link.slug}`)} key={link.id}><span>{text(link.name)}<small>{text(link.category)}</small></span><ArrowRight size={15} /></a>)}</div></section><section><h2>{t("Sources")}</h2><div className="article-sources"><Link2 size={17} /><div>{sources.map((source) => source && <a href={href(source.url)} target="_blank" rel="noreferrer" key={source.id}>{text(source.title)}</a>)}<p>{t("Sources are provided transparently. The article is educational guidance and does not replace qualified instruction.")}</p></div></div></section></article></div></main><Footer /></>;
}
