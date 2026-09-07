export const tajweedReferenceSources = [
  {
    id: "tajweed-rules-reference",
    title: "Tajweed Rules Reference",
    url: "https://islamicstudies.info/viewer/web/viewer.html?file=%2Fquran%2Ftajweed%2FTajweed_Rules.pdf",
    note: "Used as a comparative terminology reference for the rule families and their standard teaching labels.",
  },
  {
    id: "recite-with-love-curriculum",
    title: "Beginner and Intermediate Tajweed Curriculum",
    url: "https://recitewithlove.com/wp-content/uploads/2015/03/recitewithlovetajweedclassinfo-1.pdf",
    note: "Used as a pedagogical ordering reference for foundations, Noon/Meem families, Madd, Waqf, and Ibtida.",
  },
  {
    id: "mcec-quran-curriculum",
    title: "Saturday School Quran Curriculum",
    url: "https://mcec.org.uk/documents/SatSchoolQuran.pdf",
    note: "Used to compare staged teaching of Makharij, Sifaat, Madd, Waqf, and recitation practice."
  },
  {
    id: "quran-foundation-tajweed-api",
    title: "Quran Foundation Tajweed Script Documentation",
    url: "https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/quran-verses-uthmani-tajweed/",
    note: "Candidate technical source for Quran text and markup; editorial review remains required before publication."
  },
] as const;

export const tajweedSourceList = tajweedReferenceSources.map((source) => source.title);
