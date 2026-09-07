import type { Metadata } from "next";
import "./globals.css";
import "./lesson-quiz.css";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Complete Tajweed Guide",
  description: "A calm, clear way to learn Tajweed through explanation, listening, and practice.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Complete Tajweed Guide", title: "Complete Tajweed Guide", description: "A calm, clear way to learn Tajweed through explanation, listening, and practice.", url: absoluteUrl("/") },
  twitter: { card: "summary_large_image", title: "Complete Tajweed Guide", description: "A calm, clear way to learn Tajweed through explanation, listening, and practice." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{ "@context": "https://schema.org", "@type": "Organization", name: "Complete Tajweed Guide", url: absoluteUrl("/") }, { "@context": "https://schema.org", "@type": "WebSite", name: "Complete Tajweed Guide", url: absoluteUrl("/"), description: "A structured English guide to Tajweed learning." }]) }} />{children}</body>
    </html>
  );
}
