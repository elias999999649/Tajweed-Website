import { FooterContent } from "./footer-content";
import { getI18n } from "@/lib/i18n/server";
export async function Footer() { return <FooterContent i18n={await getI18n()} />; }
