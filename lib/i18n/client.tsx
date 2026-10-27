"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createI18n, type Dictionary, type I18n, type Locale } from "./index";

const Context = createContext<I18n>(createI18n("en"));
export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  const value = useMemo(() => createI18n(locale, dictionary), [locale, dictionary]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n() { return useContext(Context); }
