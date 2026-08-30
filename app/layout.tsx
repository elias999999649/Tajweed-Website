import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Complete Tajweed Guide",
  description: "A calm, clear way to learn Tajweed through explanation, listening, and practice.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
