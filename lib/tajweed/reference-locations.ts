// Topic locators from the reference's printed table of contents. These make
// comparison easier; they do not assert approval of the site's lesson wording.
const pages: Record<string, string> = {
  "what-is-tajweed": "5", "why-tajweed-is-studied": "5", "intro-to-ghunnah": "6", ghunnah: "6",
  "qalqalah-letters": "7", "qalqalah-sughra": "7", "qalqalah-kubra": "7",
  "heavy-and-light-letters": "8", tafkhim: "8", tarqiq: "8", "lam-in-allah": "10", "raa-heavy-and-light": "12",
  "noon-sakinah": "13", tanween: "13", izhar: "14", iqlab: "15", idgham: "16–17", "idgham-with-ghunnah": "16", "idgham-without-ghunnah": "17", ikhfa: "18",
  "meem-sakinah": "24–25", "ikhfa-shafawi": "24", "idgham-shafawi": "25", "izhar-shafawi": "25",
  "madd-tabii": "28", "madd-badal": "29", "madd-arid-li-sukun": "30", "madd-lin": "30", "madd-wajib-muttasil": "31", "madd-jaiz-munfasil": "31", "madd-lazim-kalimi": "32–33", "madd-lazim-harfi": "33–34", "when-stopping-affects-pronunciation": "36", "sifaat-al-huruf": "37–43",
};
export function referenceLocation(id: string) { const printed = pages[id]; return printed ? { printed, url: `https://islamicstudies.info/quran/tajweed/Tajweed_Rules.pdf#page=${Number.parseInt(printed) + 4}` } : undefined; }
