import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/ui";
import { ListeningStudio } from "@/components/listening-studio";
import { getI18n } from "@/lib/i18n/server";
import { studyText } from "@/lib/i18n/study";
import { localizeMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata() { const i18n = await getI18n(); return localizeMetadata({}, i18n, "/listen", { title: studyText(i18n.locale, "listen"), description: studyText(i18n.locale, "audioHelp") }); }
export default async function ListenPage() { const { locale } = await getI18n(); return <><SiteHeader /><main id="main-content" tabIndex={-1} className="simple-page"><div className="container"><p className="eyebrow">Tajweed101</p><h1>{studyText(locale, "listen")}</h1><ListeningStudio /></div></main><Footer /></>; }
