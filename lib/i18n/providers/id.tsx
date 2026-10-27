"use client";
import type { ReactNode } from "react";
import { I18nProvider } from "../client";
import dictionary from "../id.json";
export default function IndonesianProvider({ children }: { children: ReactNode }) { return <I18nProvider locale="id" dictionary={dictionary}>{children}</I18nProvider>; }
