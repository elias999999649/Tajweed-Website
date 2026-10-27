"use client";
import type { ReactNode } from "react";
import { I18nProvider } from "../client";
import dictionary from "../tr.json";
export default function TurkishProvider({ children }: { children: ReactNode }) { return <I18nProvider locale="tr" dictionary={dictionary}>{children}</I18nProvider>; }
