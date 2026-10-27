"use client";
import type { ReactNode } from "react";
import { I18nProvider } from "../client";
import dictionary from "../ur.json";
export default function UrduProvider({ children }: { children: ReactNode }) { return <I18nProvider locale="ur" dictionary={dictionary}>{children}</I18nProvider>; }
