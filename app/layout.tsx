import type { Metadata } from "next";
import { Amiri, DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import "./lesson-quiz.css";
import { absoluteUrl, siteUrl } from "@/lib/seo";

// Self-hosted fonts: no runtime requests to Google, consistent Arabic diacritic rendering.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-fraunces", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });
const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

// Applied before first paint so the saved or system theme never flashes.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Learn Tajweed Online | Complete Tajweed Guide",
    template: "%s | Complete Tajweed Guide",
  },
  description: "Learn Tajweed online with clear explanations, Quran examples, practice exercises, and a structured path for reading the Quran with confidence.",
  applicationName: "Complete Tajweed Guide",
  keywords: [
    "tajweed",
    "learn tajweed",
    "tajweed guide",
    "quran recitation",
    "read quran properly",
    "tajweed rules",
    "quran pronunciation",
    "how to learn tajweed",
    "learn quran recitation",
    "tajweed lessons",
    "tajweed examples",
  ],
  authors: [{ name: "Complete Tajweed Guide" }],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Complete Tajweed Guide",
    title: "Learn Tajweed Online | Complete Tajweed Guide",
    description: "Learn Tajweed online with clear explanations, Quran examples, practice exercises, and a structured path for reading the Quran with confidence.",
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Tajweed Online | Complete Tajweed Guide",
    description: "Learn Tajweed online with clear explanations, Quran examples, practice exercises, and a structured path for reading the Quran with confidence.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${dmSans.variable} ${amiri.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0f766e" />
        <meta name="google-site-verification" content="rylsW5TzohyKjKDfX8PxnMCWazZkitUeJoBjVg65Ayw" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Complete Tajweed Guide",
            url: absoluteUrl("/"),
            logo: absoluteUrl("/icon.svg"),
            sameAs: ["https://tajweed101.pages.dev"],
            description: "A structured online Tajweed guide helping learners understand Quranic pronunciation and recitation rules."
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Complete Tajweed Guide",
            url: absoluteUrl("/"),
            description: "Learn Tajweed online with clear explanations, Quranic examples, and practice exercises for proper Quran recitation.",
            inLanguage: "en",
            potentialAction: {
              "@type": "SearchAction",
              target: `${absoluteUrl("/search")}?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          }
        ]) }} />
        {children}
      </body>
    </html>
  );
}
