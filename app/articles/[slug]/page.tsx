import type { Metadata } from "next";
import { ArrowRight, BookOpen, ChevronRight, Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/ui";
import { articles, getArticleBySlug } from "@/lib/articles/content";
import { taxonomySources } from "@/lib/taxonomy/sources";
import { tajweedTopics } from "@/lib/taxonomy";
import { getTopicLessonLink } from "@/lib/taxonomy/lessons";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return { title: `${article.title} | Complete Tajweed Guide`, description: article.description, alternates: { canonical: `/articles/${article.slug}` }, openGraph: { title: `${article.title} | Complete Tajweed Guide`, description: article.description, url: `/articles/${article.slug}`, type: "article" }, twitter: { card: "summary", title: `${article.title} | Complete Tajweed Guide`, description: article.description }, robots: article.reviewStatus === "approved" ? undefined : { index: false, follow: true } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const relatedLessons = article.relatedRuleIds.map((id) => tajweedTopics.find((topic) => topic.id === id)).filter(Boolean).map((topic) => topic && getTopicLessonLink(topic)).filter(Boolean);
  const sources = article.sourceIds.map((id) => taxonomySources.find((source) => source.id === id)).filter(Boolean);
  const breadcrumbs = breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Articles", path: "/articles" }, { name: article.title, path: `/articles/${article.slug}` }]);
  const articleLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, dateModified: article.updatedAt, mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`), articleSection: article.category, isAccessibleForFree: true };
  return <><SiteHeader /><main className="article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleLd]) }} /><div className="container article-breadcrumbs"><a href="/">Home</a><ChevronRight size={14} /><a href="/articles">Articles</a><ChevronRight size={14} /><span>{article.title}</span></div><header className="article-hero"><div className="container article-hero-inner"><span className="badge">{article.category}</span><h1>{article.title}</h1><p>{article.description}</p><div className="article-meta"><span>{article.readingTime}</span><span>Updated {article.updatedAt}</span><span>Intent: {article.searchIntent}</span></div></div></header><div className="container article-layout"><article className="article-body">{article.sections.map((section) => <section id={section.heading.toLowerCase().replaceAll(" ", "-")} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}<section className="article-path"><BookOpen size={18} /><div><strong>Continue in the learning path</strong><p>This article connects to a structured lesson sequence.</p><a className="text-link" href={article.learningPathHref}>Open the related learning path <ArrowRight size={14} /></a></div></section><section><h2>Related Tajweed lessons</h2><div className="article-related-links">{relatedLessons.map((link) => link && <a href={`/tajweed/${link.lessonSlug}`} key={link.topic.id}><span>{link.topic.title}<small>{link.topic.category}</small></span><ArrowRight size={15} /></a>)}</div></section><section><h2>Sources</h2><div className="article-sources"><Link2 size={17} /><div>{sources.map((source) => source && <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.title}</a>)}<p>Sources are provided transparently. The article is educational guidance and does not replace qualified instruction.</p></div></div></section></article></div></main><Footer /></>;
}
