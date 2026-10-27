import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { createI18n, isLocale, type Dictionary, type Locale } from "./index";

const dictionaries = {
  en: async (): Promise<Dictionary> => ({}),
  ar: async (): Promise<Dictionary> => (await import("./ar.json")).default,
  ur: async (): Promise<Dictionary> => (await import("./ur.json")).default,
  id: async (): Promise<Dictionary> => (await import("./id.json")).default,
  fr: async (): Promise<Dictionary> => (await import("./fr.json")).default,
};
export const getDictionary = (locale: Locale) => dictionaries[locale]();
export async function getI18n() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return createI18n(locale, await getDictionary(locale));
}
