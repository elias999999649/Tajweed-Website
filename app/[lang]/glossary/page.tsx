import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { GlossaryDirectory } from "./glossary-directory";

export async function generateMetadata() { return localizeMetadata({ title: "Tajweed Glossary", description: "Search Arabic and English Tajweed terminology with definitions and links to relevant lessons.", alternates: { canonical: "/glossary" } }, await getI18n(), "/glossary"); }

export default async function GlossaryPage() {
  const { t, text, href } = await getI18n();

  return <><SiteHeader /><main id="main-content" tabIndex={-1}><section className="library-hero"><div className="container"><p className="eyebrow">{t("Tajweed glossary")}</p><h1>{t("Understand the words behind the rules.")}</h1><p className="hero-lede">{t("Search the terminology used throughout the curriculum and open the lesson where each term is taught.")}</p></div></section><section className="section"><div className="container"><aside className="alert notice" role="note"><p>{t("These definitions come from study drafts awaiting qualified Tajweed review. Check pronunciation and application with your teacher.")}</p></aside><GlossaryDirectory /></div></section></main><Footer /></>;
}
