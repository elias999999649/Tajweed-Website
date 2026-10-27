"use client";
import type { ReactNode } from "react";
import { I18nProvider } from "../client";
import dictionary from "../fr.json";
export default function FrenchProvider({ children }: { children: ReactNode }) { return <I18nProvider locale="fr" dictionary={dictionary}>{children}</I18nProvider>; }
