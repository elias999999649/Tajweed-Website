import type { Metadata } from "next";
import localFont from "next/font/local";
import { Amiri } from "next/font/google";
import "./globals.css";
import "./lesson-quiz.css";
import { absoluteUrl, siteUrl } from "@/lib/seo";

// Self-hosted fonts: no runtime requests to Google, consistent diacritic rendering.
// Google Sans Flex (variable, 300-700) is rebuilt from the local "google font"
// folder with `python scripts/build-font.py`; Amiri serves all Arabic text.
const googleSansFlex = localFont({
  src: "./fonts/google-sans-flex.woff2",
  weight: "300 700",
  display: "swap",
  variable: "--font-sans",
});
const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

// Applied before first paint so the saved or system theme never flashes.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: "/logo.png", apple: "/logo.png" },
  title: {
    default: "Tajweed101 | Learn Tajweed Online",
    template: "%s | Tajweed101",
  },
  description: "Learn Tajweed online with clear explanations, Quran examples, practice exercises, and a structured path for reading the Quran with confidence.",
  applicationName: "Tajweed101",
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
    <html lang="en" suppressHydrationWarning className={`${googleSansFlex.variable} ${amiri.variable}`}>
      <head>
        <meta name="theme-color" content="#0f5c50" />
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
            logo: absoluteUrl("/logo.png"),
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
