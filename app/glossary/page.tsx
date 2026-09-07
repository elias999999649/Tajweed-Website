import { Footer, SiteHeader } from "@/components/ui";
import { GlossaryDirectory } from "./glossary-directory";

export const metadata = { title: "Tajweed Glossary | Complete Tajweed Guide", description: "Search Arabic and English Tajweed terminology with definitions and links to relevant lessons.", alternates: { canonical: "/glossary" } };

export default function GlossaryPage() {
  return <><SiteHeader /><main><section className="library-hero"><div className="container"><p className="eyebrow">Tajweed glossary</p><h1>Understand the words behind the rules.</h1><p className="hero-lede">Search the terminology used throughout the curriculum and open the lesson where each term is taught.</p></div></section><section className="section"><div className="container"><GlossaryDirectory /></div></section></main><Footer /></>;
}
