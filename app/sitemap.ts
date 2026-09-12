import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles/content";
import { tajweedRules } from "@/lib/tajweed/rules";
import { tajweedLevels } from "@/lib/taxonomy";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const staticPages = [
  { path: "/", frequency: "monthly" as const, priority: 1 },
  { path: "/tajweed", frequency: "weekly" as const, priority: 0.9 },
  { path: "/learn", frequency: "monthly" as const, priority: 0.8 },
  { path: "/practice", frequency: "monthly" as const, priority: 0.7 },
  { path: "/about", frequency: "yearly" as const, priority: 0.4 },
  { path: "/sources", frequency: "yearly" as const, priority: 0.5 },
  { path: "/editorial-policy", frequency: "yearly" as const, priority: 0.4 },
  { path: "/glossary", frequency: "monthly" as const, priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedRules = tajweedRules.filter((rule) => rule.verificationStatus === "verified" && rule.reviewStatus === "VERIFIED");
  const publishedArticles = articles.filter((article) => article.reviewStatus === "approved");
  const rulePages = publishedRules.map((rule) => ({ url: absoluteUrl(`/tajweed/${rule.slug}`), changeFrequency: "monthly" as const, priority: rule.level === "Foundation" || rule.level === "Essential" ? 0.8 : 0.7 }));
  const articlePages = publishedArticles.map((article) => ({ url: absoluteUrl(`/articles/${article.slug}`), lastModified: new Date(article.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 }));
  // Learning-path level pages are indexable entry points to the same curriculum.
  const levelPages = tajweedLevels.map((level) => ({ url: absoluteUrl(`/learn/${level.slug}`), changeFrequency: "monthly" as const, priority: 0.7 }));
  return staticPages.map((page) => ({ url: absoluteUrl(page.path), changeFrequency: page.frequency, priority: page.priority })).concat(rulePages, levelPages, { url: absoluteUrl("/articles"), changeFrequency: "weekly" as const, priority: 0.8 }, ...articlePages);
}
