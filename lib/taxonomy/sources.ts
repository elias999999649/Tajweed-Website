import type { TajweedSource } from "./types";

export const taxonomySources: TajweedSource[] = [
  {
    id: "recite-with-love-curriculum",
    title: "Beginner and Intermediate Tajweed Curriculum",
    url: "https://recitewithlove.com/wp-content/uploads/2015/03/recitewithlovetajweedclassinfo-1.pdf",
    sourceType: "curriculum",
    note: "Used as a curriculum-order comparison for Makharij, Sifaat, Noon/Meem rules, Madd, Laam, Raa, and Waqf/Ibtida.",
  },
  {
    id: "mcec-quran-curriculum",
    title: "Saturday School Quran Curriculum",
    url: "https://mcec.org.uk/documents/SatSchoolQuran.pdf",
    sourceType: "curriculum",
    note: "Used to compare staged teaching of Makharij, Sifaat, Madd, Waqf, and recitation practice.",
  },
  {
    id: "quran-foundation-tajweed-api",
    title: "Quran Foundation Tajweed Script Documentation",
    url: "https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/quran-verses-uthmani-tajweed/",
    sourceType: "quran-data",
    note: "Candidate technical source for verified Quran text and Tajweed markup; licensing and editorial review remain required.",
  },
  {
    id: "tajweed-rules-reference",
    title: "Tajweed Rules Reference",
    url: "https://islamicstudies.info/viewer/web/viewer.html?file=%2Fquran%2Ftajweed%2FTajweed_Rules.pdf",
    sourceType: "reference",
    note: "Used as a terminology cross-check for Noon/Tanween, Madd, and related rule families; qualified review remains required before publication.",
  },
];
