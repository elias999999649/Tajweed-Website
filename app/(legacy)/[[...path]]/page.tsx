import type { Metadata } from "next";
import { tajweedRules } from "@/lib/tajweed/rules";
import { tajweedLevels, tajweedTopics } from "@/lib/taxonomy";
import { articles } from "@/lib/articles/content";
import { absoluteUrl } from "@/lib/seo";
import { localizedHref } from "@/lib/i18n";

export const dynamicParams = false;
const routes = ["", "learn", "tajweed", "glossary", "practice", "articles", "about", "sources", "editorial-policy", "search", ...tajweedRules.map((rule) => `tajweed/${rule.slug}`), ...tajweedLevels.map((level) => `learn/${level.slug}`), ...tajweedTopics.map((topic) => `learn/${topic.slug}`), ...articles.map((article) => `articles/${article.slug}`), "learn/essential", "learn/advanced"];
export function generateStaticParams() { return [...new Set(routes)].map((path) => ({ path: path ? path.split("/") : [] })); }
function destination(path: string[] = []) { return localizedHref("en", "/" + path.join("/").replace(/^learn\/essential$/, "learn/essential-rules").replace(/^learn\/advanced$/, "learn/advanced-topics")); }
export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }): Promise<Metadata> { return { title: "Continue to Tajweed101", robots: { index: false, follow: true }, alternates: { canonical: absoluteUrl(destination((await params).path)) } }; }
export default async function LegacyPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const href = destination((await params).path);
  return <><meta httpEquiv="refresh" content={`0;url=${href}`} /><script dangerouslySetInnerHTML={{ __html: `(function(){var target=${JSON.stringify(href)};try{var preferred=localStorage.getItem("tajweed-language");if(["en","ar","ur","id","fr","tr"].includes(preferred))target=target.replace(/^\\/en(?=\\/)/,"/"+preferred);}catch(e){}location.replace(target+location.search+location.hash);})();` }} /><main><h1>Tajweed101</h1><p>The guide is now available in five languages.</p><a href={href}>Continue to the English guide</a><p><a href="/ar/" lang="ar" dir="rtl">العربية</a> · <a href="/ur/" lang="ur" dir="rtl">اردو</a> · <a href="/id/" lang="id">Bahasa Indonesia</a> · <a href="/fr/" lang="fr">Français</a></p></main></>;
}
