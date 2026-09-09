import type { Metadata } from "next";
import { Amiri, Fraunces } from "next/font/google";
import "./globals.css";
import "./lesson-quiz.css";
import { absoluteUrl, siteUrl } from "@/lib/seo";

// Self-hosted fonts: no runtime requests to Google, consistent Arabic diacritic rendering.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-fraunces", display: "swap" });
const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

// Applied before first paint so the saved or system theme never flashes.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

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
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${amiri.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{ "@context": "https://schema.org", "@type": "Organization", name: "Complete Tajweed Guide", url: absoluteUrl("/") }, { "@context": "https://schema.org", "@type": "WebSite", name: "Complete Tajweed Guide", url: absoluteUrl("/"), description: "A structured English guide to Tajweed learning." }]) }} />{children}</body>
    </html>
  );
}
