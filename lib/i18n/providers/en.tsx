"use client";
import type { ReactNode } from "react";
import { I18nProvider } from "../client";
const dictionary = {};
export default function EnglishProvider({ children }: { children: ReactNode }) { return <I18nProvider locale="en" dictionary={dictionary}>{children}</I18nProvider>; }
