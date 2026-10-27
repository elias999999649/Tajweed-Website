import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { TajweedDirectory } from "./directory";
import { breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata() { return localizeMetadata({ title: "Tajweed Rules Directory", description: "Browse a structured Tajweed learning path from foundations to advanced topics.", alternates: { canonical: "/tajweed" }, openGraph: { title: "Tajweed Rules Directory", description: "Browse a structured Tajweed learning path from foundations to advanced topics.", url: "/tajweed", type: "website" }, twitter: { card: "summary", title: "Tajweed Rules Directory", description: "Browse a structured Tajweed learning path from foundations to advanced topics." } }, await getI18n(), "/tajweed"); }

export default async function TajweedIndex() {
  const { t, text, href } = await getI18n();

  return <><SiteHeader /><main id="main-content" tabIndex={-1}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: t("Home"), path: href("/") }, { name: t("Tajweed"), path: href("/tajweed") }])) }} /><section className="library-hero"><div className="container"><p className="eyebrow">{t("Tajweed rules directory")}</p><h1>{t("Every lesson, clearly organised.")}</h1><p className="hero-lede">{t("Use Curriculum order when you want the recommended sequence from beginner to advanced. Use Browse all lessons when you already know the rule you need or want to compare topics.")}</p><div className="learn-purpose-note"><strong>{t("Choose the right starting point")}</strong><span><b>{t("Learn")}</b>{" "}{t("gives you a step-by-step route from the basics to advanced topics. The")}{" "}<b>{t("Rules library")}</b>{" "}{t("is for finding a particular lesson, comparing rules, or returning to something you have already studied.")}</span></div></div></section><section className="section"><div className="container"><TajweedDirectory /></div></section></main><Footer /></>;
}
