"use client";
import { useI18n } from "@/lib/i18n/client";


import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Footer, SiteHeader } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, text, href } = useI18n();

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="error-page"><div className="container">
    <p className="error-code">{t("Sorry")}</p>
    <h1>{t("Something went wrong.")}</h1>
    <p className="hero-lede">{t("An unexpected error occurred while loading this page. You can try again, or return to the homepage and continue learning.")}</p>
    <div className="error-actions">
      <button className="button primary" onClick={reset}><RotateCcw size={15} />{" "}{t("Try again")}</button>
      <a className="button secondary" href={href("/")}>{t("Back to the homepage")}</a>
    </div>
  </div></main><Footer /></>;
}
