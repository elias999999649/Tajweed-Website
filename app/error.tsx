"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return <><SiteHeader /><main className="error-page"><div className="container">
    <p className="error-code">Sorry</p>
    <h1>Something went wrong.</h1>
    <p className="hero-lede">An unexpected error occurred while loading this page. You can try again, or return to the homepage and continue learning.</p>
    <div className="error-actions">
      <button className="button primary" onClick={reset}><RotateCcw size={15} /> Try again</button>
      <a className="button secondary" href="/">Back to the homepage</a>
    </div>
  </div></main><Footer /></>;
}
