import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Tajweed rules, lessons, articles, and glossary terms.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function SearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
