"use client";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { studyText } from "@/lib/i18n/study";
import { useStudyData } from "@/lib/learning/store";
export function StartLearningLink({ slugs }: { slugs: Record<string, string> }) {
  const { locale, t, href } = useI18n();
  const { data } = useStudyData();
  const slug = data.last ? slugs[data.last] : undefined;
  return <a className="button primary" href={slug ? href(`/tajweed/${slug}#${data.records[data.last!]?.section ?? "definition"}`) : href("/learn")}>{slug ? studyText(locale, "resume") : t("Find your starting point")}<ArrowRight size={16} aria-hidden="true" /></a>;
}
