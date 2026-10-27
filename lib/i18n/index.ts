export const locales = ["en", "ar", "ur", "id", "fr", "tr"] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = Record<string, string>;
export const languageNames: Record<Locale, string> = { en: "English", ar: "العربية", ur: "اردو", id: "Bahasa Indonesia", fr: "Français", tr: "Türkçe" };
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
export const direction = (locale: Locale) => locale === "ar" || locale === "ur" ? "rtl" : "ltr";
export const normalizeMessage = (value: string) => value.replace(/\s+/g, " ").trim();

export function localizedHref(locale: Locale, path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || /^\/(?:_next|api|fonts)(?:\/|$)/.test(path) || /\.(?:xml|txt|png|svg|ico|woff2?)(?:[?#]|$)/.test(path)) return path;
  const stripped = path.replace(/^\/(en|ar|ur|id|fr|tr)(?=\/|[?#]|$)/, "") || "/";
  const separator = stripped.search(/[?#]/);
  const pathname = separator < 0 ? stripped : stripped.slice(0, separator);
  const suffix = separator < 0 ? "" : stripped.slice(separator);
  return `/${locale}${pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`}${suffix}`;
}

export function createI18n(locale: Locale, dictionary: Dictionary = {}) {
  const translatedValues = new Set(Object.values(dictionary).map(normalizeMessage));
  function t(message: string, values: Record<string, string | number> = {}): string {
    const key = normalizeMessage(message);
    if (!key) return message;
    // Arabic text, transliteration, dates, symbols and the site's proper name
    // retain their source spelling. Educational English always needs a key.
    let translated = locale === "en" || translatedValues.has(key) ? key : dictionary[key];
    // Generated questions combine existing lesson wording with these four
    // fixed messages. Translate each part without changing the answer index.
    if (translated === undefined) {
      const definition = key.match(/^Which definition does this lesson give for (.+)\?$/);
      const practice = key.match(/^Which practice guidance does this lesson give for (.+)\?$/);
      const condition = key.match(/^Which occurrence condition does this lesson state for (.+)\?$/);
      const definitionFeedback = key.match(/^(.+) Compare the other choices with the lesson explanation; they describe different study topics\.$/);
      const practiceFeedback = key.match(/^(.+) The other choices skip the careful listening and feedback needed for pronunciation practice\.$/);
      if (definition && !key.includes("{lesson}")) return t("Which definition does this lesson give for {lesson}?", { lesson: t(definition[1]) });
      if (practice && !key.includes("{lesson}")) return t("Which practice guidance does this lesson give for {lesson}?", { lesson: t(practice[1]) });
      if (condition && !key.includes("{lesson}")) return t("Which occurrence condition does this lesson state for {lesson}?", { lesson: t(condition[1]) });
      if (definitionFeedback && !key.includes("{definition}")) return t("{definition} Compare the other choices with the lesson explanation; they describe different study topics.", { definition: t(definitionFeedback[1]) });
      if (practiceFeedback && !key.includes("{pronunciation}")) return t("{pronunciation} The other choices skip the careful listening and feedback needed for pronunciation practice.", { pronunciation: t(practiceFeedback[1]) });
    }
    if (translated === undefined && (!/[A-Za-z]/.test(key) || /^(?:Tajweed101|Complete Tajweed Guide|Hafs ʿan ʿĀṣim|Ctrl|⌘|K|Enter|Esc|Tab)$/.test(key) || /^(?:https?:\/\/|\/[a-z])/.test(key))) translated = key;
    if (translated === undefined) throw new Error(`Missing ${locale} translation: ${key}`);
    return translated.replace(/\{(\w+)\}/g, (match, name: string) => name in values ? String(values[name]) : match);
  }
  function text<T>(value: T): T {
    return (typeof value === "string" ? t(value) : value) as T;
  }
  return { locale, t, text, href: (path: string) => localizedHref(locale, path), dir: direction(locale) };
}
export type I18n = ReturnType<typeof createI18n>;
