import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";
import { tajweedRules } from "@/lib/tajweed/rules";

export const metadata = { title: "Page Not Found | Complete Tajweed Guide", robots: { index: false, follow: true } };

export default function NotFound() {
  const popular = ["what-is-tajweed", "ikhfa", "idgham", "madd-tabii", "qalqalah-letters"]
    .map((id) => tajweedRules.find((rule) => rule.id === id))
    .filter((rule): rule is (typeof tajweedRules)[number] => Boolean(rule));

  return <><SiteHeader /><main className="error-page"><div className="container">
    <p className="error-code">404</p>
    <h1>This page is not in the guide.</h1>
    <p className="hero-lede">The address may have changed, or the lesson may still be in preparation. Search the guide, or continue from a popular lesson below.</p>
    <div className="error-actions">
      <Link href="/" className="button secondary">Back to the homepage</Link>
      <Link href="/search" className="button primary"><Search size={15} /> Search the guide</Link>
    </div>
    <div className="error-popular">
      {popular.map((rule) => <Link href={`/tajweed/${rule.slug}`} key={rule.id}><span><strong>{rule.name}</strong><small>{rule.category} · {rule.level}</small></span><ArrowRight size={16} /></Link>)}
    </div>
  </div></main><Footer /></>;
}
