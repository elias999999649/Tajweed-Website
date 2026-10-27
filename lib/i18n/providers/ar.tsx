"use client";
import type { ReactNode } from "react";
import { I18nProvider } from "../client";
import dictionary from "../ar.json";
export default function ArabicProvider({ children }: { children: ReactNode }) { return <I18nProvider locale="ar" dictionary={dictionary}>{children}</I18nProvider>; }
