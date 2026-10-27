"use client";

import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { languageNames, locales, localizedHref, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  function changeLanguage(next: Locale) {
    try { localStorage.setItem("tajweed-language", next); } catch { /* Navigation works without storage. */ }
    window.location.assign(localizedHref(next, pathname) + window.location.search + window.location.hash);
  }
  return <label className="language-switcher"><Languages size={17} aria-hidden="true" /><span className="sr-only">{t("Language")}</span><select aria-label={t("Language")} value={locale} onChange={(event) => changeLanguage(event.target.value as Locale)}>{locales.map((language) => <option value={language} key={language} lang={language} dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}>{languageNames[language]}</option>)}</select></label>;
}
