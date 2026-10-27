"use client";
import { Component, lazy, Suspense, type ReactNode } from "react";
import { languageNames, type Locale } from "./index";

// Imports must be lazy in the CLIENT boundary. Importing all client providers
// from a server layout can merge every dictionary into its shared entry chunk.
const providers = {
  en: lazy(() => import("./providers/en")), ar: lazy(() => import("./providers/ar")),
  ur: lazy(() => import("./providers/ur")), id: lazy(() => import("./providers/id")),
  fr: lazy(() => import("./providers/fr")), tr: lazy(() => import("./providers/tr")),
};
const errorMessages = {
  en: ["The language file could not be loaded.", "Try again"],
  ar: ["تعذر تحميل ملف اللغة.", "أعد المحاولة"],
  ur: ["زبان کی فائل لوڈ نہیں ہوئی۔", "دوبارہ کوشش کریں"],
  id: ["Berkas bahasa tidak dapat dimuat.", "Coba lagi"],
  fr: ["Le fichier de langue ne peut pas être chargé.", "Réessayer"],
  tr: ["Dil dosyası yüklenemedi.", "Yeniden dene"],
};
class LanguageLoadBoundary extends Component<{ locale: Locale; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    const [message, retry] = errorMessages[this.props.locale];
    return <main id="main-content" className="container simple-page"><h1>Tajweed101 · {languageNames[this.props.locale]}</h1><p role="alert">{message}</p><button type="button" className="button primary" onClick={() => window.location.reload()}>{retry}</button></main>;
  }
}
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const Provider = providers[locale];
  return <LanguageLoadBoundary locale={locale}><Suspense fallback={<p className="container language-loading" role="status">Tajweed101 · {languageNames[locale]}…</p>}><Provider>{children}</Provider></Suspense></LanguageLoadBoundary>;
}
