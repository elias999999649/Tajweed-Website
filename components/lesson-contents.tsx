"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export function LessonContents({ hasFaq }: { hasFaq: boolean }) {
  const { t } = useI18n();
  const [active, setActive] = useState("definition");
  const links = [
    ["definition", "What is it?"], ["occurs", "When it occurs"],
    ["letters", "Letters involved"], ["pronunciation", "How to pronounce it"],
    ["examples", "Examples"], ["mistakes", "Common mistakes"],
    ["practice", "Practice"], ["quiz", "Quiz"],
    ...(hasFaq ? [["faq", "FAQ"]] : []),
    ["related", "Related rules"], ["sources", "Sources and review notes"],
  ];
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>(".rule-content > section[id]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = Math.min(window.innerHeight * .35, 220);
      let current = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top > readingLine) break;
        current = section;
      }
      if (current) setActive(current.id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);
  const navigation = <nav aria-label={t("On this page")}>{links.map(([id, label]) => <a href={`#${id}`} key={id} aria-current={active === id ? "location" : undefined} onClick={() => setActive(id)}>{t(label)}</a>)}</nav>;
  return <><div className="desktop-contents"><strong>{t("On this page")}</strong>{navigation}</div><details className="mobile-contents"><summary>{t("On this page")}<ChevronDown size={16} aria-hidden="true" /></summary>{navigation}</details></>;
}
