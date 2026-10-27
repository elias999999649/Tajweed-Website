"use client";
import { useI18n } from "@/lib/i18n/client";


import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Filter, ListFilter, SlidersHorizontal } from "lucide-react";
import { curriculumAreas } from "@/lib/tajweed/curriculum";
import { tajweedExamples } from "@/lib/tajweed/examples";
import { tajweedRules } from "@/lib/tajweed/rules";
import type { DifficultyLevel, TajweedRuleRecord } from "@/lib/tajweed/types";

type ViewMode = "learning" | "all";

const levels: DifficultyLevel[] = ["Foundation", "Essential", "Intermediate", "Advanced"];

export function TajweedDirectory() {
  const { t, text, href } = useI18n();

  const [viewMode, setViewMode] = useState<ViewMode>("learning");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState<"all" | DifficultyLevel>("all");
  const [prerequisite, setPrerequisite] = useState("all");
  const categories = useMemo(() => [...new Set(tajweedRules.map((rule) => rule.category))].sort(), []);
  const prerequisiteOptions = useMemo(() => tajweedRules.filter((rule) => tajweedRules.some((candidate) => candidate.prerequisites.includes(rule.id))).sort((a, b) => a.name.localeCompare(b.name)), []);
  const matchingRules = useMemo(() => tajweedRules.filter((rule) => {
    const matchesCategory = category === "all" || rule.category === category;
    const matchesLevel = level === "all" || rule.level === level;
    const matchesPrerequisite = prerequisite === "all" || (prerequisite === "none" ? rule.prerequisites.length === 0 : rule.prerequisites.includes(prerequisite));
    return matchesCategory && matchesLevel && matchesPrerequisite;
  }), [category, level, prerequisite]);
  const learningGroups = curriculumAreas.map((area) => ({ ...area, rules: area.rules.map((id) => matchingRules.find((rule) => rule.id === id)).filter((rule): rule is TajweedRuleRecord => Boolean(rule)) })).filter((area) => area.rules.length);
  const allGroups = levels.map((groupLevel) => ({ title: groupLevel, summary: "Browse all lessons", rules: matchingRules.filter((rule) => rule.level === groupLevel) })).filter((group) => group.rules.length);
  const groups = viewMode === "learning" ? learningGroups : allGroups;

  return <section className="directory-shell" aria-label={t("Tajweed rules directory")}>
    <div className="directory-toolbar">
      <div className="directory-mode" role="group" aria-label={t("Directory view")}><button type="button" aria-pressed={viewMode === "learning"} className={viewMode === "learning" ? "directory-mode-button active" : "directory-mode-button"} onClick={() => setViewMode("learning")}><BookOpen size={16} />{t("Curriculum order")}</button><button type="button" aria-pressed={viewMode === "all"} className={viewMode === "all" ? "directory-mode-button active" : "directory-mode-button"} onClick={() => setViewMode("all")}><ListFilter size={16} />{t("Browse all lessons")}</button></div>
      <span className="directory-count">{text(matchingRules.length)}{" "}{t("of")}{" "}{text(tajweedRules.length)}{" "}{t("rules")}</span>
    </div>
    <div className="directory-filters"><div className="filter-heading"><SlidersHorizontal size={16} />{t("Filter the directory")}</div><label htmlFor="directory-category">{t("Category")}<select id="directory-category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{t("All categories")}</option>{categories.map((item) => <option value={item} key={item}>{text(item)}</option>)}</select></label><label htmlFor="directory-level">{t("Learning level")}<select id="directory-level" value={level} onChange={(event) => setLevel(event.target.value as "all" | DifficultyLevel)}><option value="all">{t("All levels")}</option>{levels.map((item) => <option value={item} key={item}>{text(item)}</option>)}</select></label><label htmlFor="directory-prerequisite">{t("Prerequisites")}<select id="directory-prerequisite" value={prerequisite} onChange={(event) => setPrerequisite(event.target.value)}><option value="all">{t("Any prerequisite")}</option><option value="none">{t("No prerequisites")}</option>{prerequisiteOptions.map((item) => <option value={item.id} key={item.id}>{text(item.name)}</option>)}</select></label></div>
    {viewMode === "learning" && <div className="directory-intro"><Filter size={17} /><div><strong>{t("This is the recommended order.")}</strong><span>{t("Start with the foundations, then study the rule families, Madd, stopping and starting, and finally the advanced topics. Use")}{" "}<b>{t("Learn")}</b>{" "}{t("for the guided route and the Rules library when you want to browse or revisit a lesson.")}</span></div></div>}
    <div className="directory-groups">{groups.map((group, index) => <section className="directory-group" key={group.title}><div className="directory-group-heading"><div><span className="level-index">0{text(index + 1)}</span><h2>{text(group.title)}</h2><p>{text(group.summary)}</p></div><span className="directory-group-count">{text(group.rules.length)}{" "}{t("rules")}</span></div><div className="directory-rule-grid">{group.rules.map((rule) => <RuleCard rule={rule} key={rule.id} />)}</div></section>)}</div>
    {!groups.length && <div className="directory-empty"><strong>{t("No rules match these filters.")}</strong><span>{t("Clear one or more filters to continue exploring the directory.")}</span></div>}
  </section>;
}

function RuleCard({ rule }: { rule: TajweedRuleRecord }) {
  const { t, text, href } = useI18n();

  const quranExamplesForRule = tajweedExamples.filter((example) => example.ruleId === rule.id && example.type === "quran");
  const verifiedExamples = quranExamplesForRule.filter((example) => example.verificationStatus === "verified").length;
  const exampleLabel = verifiedExamples > 0 ? `${verifiedExamples} verified ${verifiedExamples === 1 ? "example" : "examples"}` : quranExamplesForRule.length > 0 ? "Examples in review" : "Examples pending review";
  return <a className="directory-rule-card" href={href(`/tajweed/${rule.slug}`)}><div className="directory-card-top"><span className="badge">{text(rule.level)}</span></div><div className="directory-card-title"><h3>{text(rule.name)}</h3>{rule.arabicName && <span lang="ar" dir="rtl">{text(rule.arabicName)}</span>}</div><p>{text(rule.shortDefinition)}</p><div className="directory-card-meta"><span>{text(rule.category)}</span><span>{text(exampleLabel)}</span></div><ArrowRight className="directory-card-arrow" size={17} /></a>;
}
