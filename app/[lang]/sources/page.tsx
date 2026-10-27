import { studyText } from "@/lib/i18n/study";
import { recitation } from "@/lib/audio";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { taxonomySources } from "@/lib/taxonomy/sources";
const audioPublisherArabic = "مجمع الملك فهد لطباعة المصحف الشريف";

export async function generateMetadata() { return localizeMetadata({ title: "Sources and Editorial Policy", description: "Review the source and verification approach used by Complete Tajweed Guide.", alternates: { canonical: "/sources" }, openGraph: { title: "Sources and Editorial Policy", description: "Review the source and verification approach used by Complete Tajweed Guide.", url: "/sources", type: "website" }, twitter: { card: "summary", title: "Sources and Editorial Policy", description: "Review the source and verification approach used by Complete Tajweed Guide." } }, await getI18n(), "/sources"); }

export default async function SourcesPage() {
  const { t, text, href, locale } = await getI18n();
 return <><SiteHeader /><main id="main-content" tabIndex={-1} className="simple-page"><div className="container"><p className="eyebrow">{t("Transparency")}</p><h1>{t("Sources and review")}</h1><p className="hero-lede">{t("The site keeps source records separate from lesson copy so learners can see what has been consulted and what still requires review.")}</p><section><h2>{t("Source register")}</h2><div className="source-register">{taxonomySources.map((source) => <article className="source-register-item" key={source.id}><h3>{text(source.title)}</h3><p>{text(source.note)}</p>{source.id === "mcec-quran-curriculum" && <p className="alert notice">{t("This historical source URL returned 404 during the 27 October 2026 review. It has not been newly verified.")}</p>}<a className="text-link" href={href(source.url)} target="_blank" rel="noreferrer">{t("Open source")}{" "}<span aria-hidden="true">→</span></a></article>)}</div></section><section><h2>{studyText(locale, "rights")}</h2><p lang="ar" dir="rtl">{audioPublisherArabic}</p><p><bdi lang="en">Ali al-Hudhaify · Hafs ʿan ʿĀṣim</bdi></p><p><a href={recitation.source} target="_blank" rel="noreferrer">{t("Open source")}</a> ? <a href={recitation.permission} target="_blank" rel="noreferrer">{studyText(locale, "rights")}</a></p><p><a href="/licenses/Google-Sans-Flex-OFL.txt">Google Sans Flex · OFL</a> ? <a href="/licenses/Amiri-OFL.txt">Amiri · OFL</a></p></section><section><h2>{t("Editorial rule")}</h2><p>{t("No Quran quotation, reference, pronunciation claim, or generated citation is published as verified without appropriate source and qualified review.")}</p></section></div></main><Footer /></>; }
