import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { LearningDashboard } from "@/components/learning-dashboard";
import { getI18n } from "@/lib/i18n/server";
import { studyText } from "@/lib/i18n/study";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { tajweedRules } from "@/lib/tajweed/rules";

export async function generateMetadata() {
  const i18n = await getI18n();
  return localizeMetadata({ robots: { index: false, follow: true } }, i18n, "/my-learning", { title: studyText(i18n.locale, "myLearning"), description: studyText(i18n.locale, "private") });
}
export default async function MyLearningPage() {
  const { locale, t, href } = await getI18n();
  return <><SiteHeader /><main id="main-content" tabIndex={-1} className="simple-page"><div className="container"><p className="eyebrow">Tajweed101</p><h1>{studyText(locale, "myLearning")}</h1><LearningDashboard lessons={tajweedRules.map(rule => ({ id: rule.id, title: t(rule.name), url: href(`/tajweed/${rule.slug}`) }))} /><a className="text-link" href={href("/learn")}>{t("Open the related learning path")} →</a></div></main><Footer /></>;
}
