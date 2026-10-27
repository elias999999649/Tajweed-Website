import type { Metadata } from "next";
import localFont from "next/font/local";
import { Amiri } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import "../lesson-quiz.css";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { direction, isLocale, locales } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { localizeMetadata } from "@/lib/i18n/metadata";

const sans = localFont({ src: "../fonts/google-sans-flex.woff2", weight: "300 700", display: "swap", variable: "--font-sans" });
const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });
const themeInitScript = `(function(){var d=false;try{d=matchMedia("(prefers-color-scheme: dark)").matches;var t=localStorage.getItem("theme");if(t==="dark"||t==="light")d=t==="dark";}catch(e){}document.documentElement.classList.toggle("dark",d);})();`;
// Each language is a separate, cacheable client chunk. Dictionaries are not
// repeated in every page's HTML or all downloaded by an English reader.
const providers = { en: () => import("@/lib/i18n/providers/en"), ar: () => import("@/lib/i18n/providers/ar"), ur: () => import("@/lib/i18n/providers/ur"), id: () => import("@/lib/i18n/providers/id"), fr: () => import("@/lib/i18n/providers/fr") };

export const dynamicParams = false;
export function generateStaticParams() { return locales.map((lang) => ({ lang })); }
export async function generateMetadata(): Promise<Metadata> {
  return localizeMetadata({ metadataBase: new URL(siteUrl), applicationName: "Tajweed101", icons: { icon: "/logo.png", apple: "/logo.png" }, title: "Learn Tajweed Online", description: "Understand how Arabic letters sound, recognise recitation rules, and build a steady study routine with a qualified teacher.", robots: { index: true, follow: true } }, await getI18n(), "/");
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const Provider = (await providers[lang]()).default;
  return <html lang={lang} dir={direction(lang)} suppressHydrationWarning className={`${sans.variable} ${amiri.variable}`}><head><meta name="theme-color" content="#0f5c50" /><meta name="google-site-verification" content="rylsW5TzohyKjKDfX8PxnMCWazZkitUeJoBjVg65Ayw" /><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head><body><Provider>{children}</Provider><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Tajweed101", url: absoluteUrl(`/${lang}/`), inLanguage: lang }) }} /></body></html>;
}
