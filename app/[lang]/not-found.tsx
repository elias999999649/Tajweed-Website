import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { tajweedRules } from "@/lib/tajweed/rules";

export async function generateMetadata() { return localizeMetadata({ title: "Page Not Found", robots: { index: false, follow: true } }, await getI18n(), "/"); }

export default async function NotFound() {
  const { t, text, href } = await getI18n();

  const popular = ["what-is-tajweed", "ikhfa", "idgham", "madd-tabii", "qalqalah-letters"]
    .map((id) => tajweedRules.find((rule) => rule.id === id))
    .filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));

  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="error-page"><div className="container">
    <p className="error-code">404</p>
    <h1>{t("This page is not in the guide.")}</h1>
    <p className="hero-lede">{t("The address may have changed, or the lesson may still be in preparation. Search the guide, or continue from a popular lesson below.")}</p>
    <div className="error-actions">
      <Link href={href("/")} className="button secondary">{t("Back to the homepage")}</Link>
      <Link href={href("/search")} className="button primary"><Search size={15} />{" "}{t("Search the guide")}</Link>
    </div>
    <div className="error-popular">
      {popular.map((rule) => <Link href={href(`/tajweed/${rule.slug}`)} key={rule.id}><span><strong>{text(rule.name)}</strong><small>{text(rule.category)} · {text(rule.level)}</small></span><ArrowRight size={16} /></Link>)}
    </div>
  </div></main><Footer /></>;
}
