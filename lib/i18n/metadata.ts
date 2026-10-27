import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { locales, localizedHref, type I18n, type Locale } from "./index";

export const languageAlternates = (path: string) => Object.fromEntries([...locales.map((locale) => [locale, absoluteUrl(localizedHref(locale, path))]), ["x-default", absoluteUrl(localizedHref("en", path))]]);

export function localizeMetadata(source: Metadata, i18n: I18n, path: string): Metadata {
  const { t, locale } = i18n;
  const rawTitle = typeof source.title === "string" ? source.title : "Tajweed101";
  const title = t(rawTitle.replace(/\s*\|\s*Complete Tajweed Guide$/, ""));
  const description = source.description ? t(source.description) : undefined;
  const url = absoluteUrl(localizedHref(locale, path));
  return { ...source, title: { absolute: `${title} | Tajweed101` }, description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, siteName: "Tajweed101", type: source.openGraph && "type" in source.openGraph && source.openGraph.type === "article" ? "article" : "website", locale: ({ en: "en_US", ar: "ar", ur: "ur_PK", id: "id_ID", fr: "fr_FR" } as Record<Locale, string>)[locale], alternateLocale: locales.filter((item) => item !== locale) },
    twitter: { card: "summary", title, description },
  };
}
