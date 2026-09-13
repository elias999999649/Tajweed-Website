import { Footer, SiteHeader } from "@/components/ui";
import { TajweedDirectory } from "./directory";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata = { title: "Tajweed Rules Directory", description: "Browse a structured Tajweed learning path from foundations to advanced topics.", alternates: { canonical: "/tajweed" }, openGraph: { title: "Tajweed Rules Directory | Complete Tajweed Guide", description: "Browse a structured Tajweed learning path from foundations to advanced topics.", url: "/tajweed", type: "website" }, twitter: { card: "summary", title: "Tajweed Rules Directory | Complete Tajweed Guide", description: "Browse a structured Tajweed learning path from foundations to advanced topics." } };

export default function TajweedIndex() {
  return <><SiteHeader /><main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tajweed", path: "/tajweed" }])) }} /><section className="library-hero"><div className="container"><p className="eyebrow">Tajweed rules directory</p><h1>Every lesson, clearly organised.</h1><p className="hero-lede">Use Curriculum order when you want the recommended sequence from beginner to advanced. Use Browse all lessons when you already know the rule you need or want to compare topics.</p><div className="learn-purpose-note"><strong>Choose the right starting point</strong><span><b>Learn</b> gives you a step-by-step route from the basics to advanced topics. The <b>Rules library</b> is for finding a particular lesson, comparing rules, or returning to something you have already studied.</span></div></div></section><section className="section"><div className="container"><TajweedDirectory /></div></section></main><Footer /></>;
}
