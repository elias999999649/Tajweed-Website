import { Footer, SiteHeader } from "@/components/ui";
import { TajweedDirectory } from "./directory";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata = { title: "Tajweed Rules Directory", description: "Browse a structured Tajweed learning path from foundations to advanced topics.", alternates: { canonical: "/tajweed" }, openGraph: { title: "Tajweed Rules Directory | Complete Tajweed Guide", description: "Browse a structured Tajweed learning path from foundations to advanced topics.", url: "/tajweed", type: "website" }, twitter: { card: "summary", title: "Tajweed Rules Directory | Complete Tajweed Guide", description: "Browse a structured Tajweed learning path from foundations to advanced topics." } };

export default function TajweedIndex() {
  return <><SiteHeader /><main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tajweed", path: "/tajweed" }])) }} /><section className="library-hero"><div className="container"><p className="eyebrow">Tajweed rules directory</p><h1>Here is what you should learn first.</h1><p className="hero-lede">Follow the curriculum from foundations to advanced topics, or switch to All Rules when you know what you are looking for. Lessons and examples show their review status so you can distinguish teaching guidance from approved Quran quotations.</p></div></section><section className="section"><div className="container"><TajweedDirectory /></div></section></main><Footer /></>;
}
