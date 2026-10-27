import { getI18n } from "@/lib/i18n/server";
import { localizeMetadata } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

export async function generateMetadata() { return localizeMetadata({
  title: "Search",
  description: "Search Tajweed rules, lessons, articles, and glossary terms.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
}, await getI18n(), "/search"); }

export default function SearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
