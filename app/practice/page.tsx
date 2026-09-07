import { Footer, SiteHeader } from "@/components/ui";
import { PracticeHub } from "@/components/practice";

export const metadata = { title: "Practice Tajweed | Complete Tajweed Guide", description: "Practise identifying Tajweed rules with focused questions and explanations.", alternates: { canonical: "/practice" }, openGraph: { title: "Practice Tajweed | Complete Tajweed Guide", description: "Practise identifying Tajweed rules with focused questions and explanations.", url: "/practice", type: "website" }, twitter: { card: "summary", title: "Practice Tajweed | Complete Tajweed Guide", description: "Practise identifying Tajweed rules with focused questions and explanations." } };

export default function PracticePage() {
  return <><SiteHeader /><main><section className="practice-hero"><div className="container"><p className="eyebrow">Practice and quizzes</p><h1>Learn by trying to remember.</h1><p className="hero-lede">Use short, focused questions to check recognition and understanding. Every answer includes an explanation so a mistake becomes useful information.</p></div></section><section className="section"><div className="container"><PracticeHub /></div></section></main><Footer /></>;
}
