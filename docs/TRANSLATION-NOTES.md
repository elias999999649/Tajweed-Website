# Translation notes — 27 October 2026

The interface uses exactly five locales: English (`en`), Arabic (`ar`), Urdu
(`ur`), Indonesian (`id`), and French (`fr`). English message strings are the
dictionary keys. Dynamic labels use named placeholders so sentence order can
change by language without changing answer indices, route IDs, or Quran text.

These are working translations. Native-language editors and qualified Tajweed
teachers have **not** reviewed them. Existing lesson, example, and source review
statuses remain unchanged. Translated study text is not an authoritative Quran
translation or a religious ruling.

## French and Indonesian terminology

| English source term | French | Indonesian |
| --- | --- | --- |
| Tajweed | tajwid | tajwid |
| Makharij / articulation points | makharij / points d’articulation | makhraj / tempat keluar huruf |
| Sifaat / letter qualities | sifat / qualités des lettres | sifat huruf |
| Noon Sakinah | nun sakin | nun sukun |
| Meem Sakinah | mim sakin | mim sukun |
| Tanween | tanwin | tanwin |
| Ghunnah | ghunna / résonance nasale | ghunnah / dengung |
| Idgham | idgham / fusion | idgam / peleburan |
| Ikhfa | ikhfa / dissimulation | ikhfa / penyamaran |
| Iqlab | iqlab / transformation | iqlab / perubahan |
| Izhar | izhar / prononciation claire | izhar / bacaan jelas |
| Madd | madd / allongement | mad / panjang bacaan |
| Heavy / light | emphatique / léger | tebal / tipis |
| Waqf | waqf / arrêt | waqaf / berhenti |
| Ibtida | ibtida / reprise | ibtida / memulai kembali |
| Counts | temps | harakat, when describing duration |
| Needs qualified review | révision qualifiée requise | perlu tinjauan ahli |

Arabic spellings, quoted Arabic passages, diacritics, transliterations, verse
numbers, and stable content IDs are preserved separately from explanatory
translations. Native editors should check transliteration preferences and the
naturalness of terms such as *discrimination of similar letters*, *madd harfi*,
and *hamzat al-wasl* in context. A qualified reviewer must resolve the existing
review notes, especially the `Ayn` duration exception and the initial-vowel
condition described as the “third root letter”; translation does not resolve
those scholarly questions.

## Validation

`node scripts/extract-translations.mjs` inventories text via the TypeScript AST.
It excludes code directives, CSS values/selectors, SVG paths, route identifiers,
and Quranic Arabic fields. The catalog supports editorial coverage checks; it is
not a machine-translation pipeline.

`node scripts/register.mjs scripts/i18n-audit.mjs` checks required educational
fields, explicit interface messages, dynamic quiz templates, and named
placeholder integrity. Missing messages fail validation instead of silently
falling back to English. This check establishes coverage and structural
consistency, not native-language or scholarly approval.
