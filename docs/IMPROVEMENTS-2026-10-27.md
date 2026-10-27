# Tajweed101 implementation and verification — 27 October 2026

## Learner experience and visual identity

The homepage has a distinct recitation panel containing the requested phrase from Quran 73:4, a visible source link, and the existing Google Sans Flex and Amiri fonts. One primary action leads to the learning path. The study routine has its own section rather than competing with the introduction.

The learning path opens the first stage and lets learners expand later stages when ready. All 50 lesson links remain in rendered HTML. Lessons have a section outline with a current-location indicator, a compact mobile outline, and previous/next links following the actual curriculum. Repeated quick-fact information was consolidated into the existing lesson sections. Review limitations remain visible, with details and sources available on demand.

Navigation, search, filters, disclosures, theme controls, quiz feedback, completion focus, and lesson comparisons were improved. Search recognises localized text and normalises Arabic diacritics and common Urdu letter forms. Incorrect answers include an explanation and a working link to the relevant lesson section. Recognition scores do not claim to assess recitation.

## Exactly five editions

English `/en/`, Arabic `/ar/`, Urdu `/ur/`, Indonesian `/id/`, and French `/fr/` share the same page implementations and stable content identifiers. Arabic and Urdu set document-level RTL direction. Language switching preserves the corresponding route, query, and fragment, and works without browser storage. Optional stored preference also supports return visits through the old URLs.

The lesson explanations, glossary, articles, practice questions, feedback, interface, accessibility labels, and metadata have translation coverage checks. Missing messages fail explicitly. The four dictionaries are separate cacheable language chunks; the full dictionary is not repeated in every page's HTML. Translations are working drafts requiring native-language and qualified Tajweed review.

## Content integrity and remaining qualified review

The editorial pass examined all 50 rule records, the 50 derived glossary entries, 13 articles, curriculum and taxonomy, instructional examples, and both quiz systems. Safe corrections include Tanween wording, Arabic-letter distinctions, Iqlab consistency, Hamzah terminology, curriculum ordering, and ambiguous quiz distractors. Eleven mismatched instructional examples are withheld without changing their Arabic. All rule review statuses remain unchanged.

[The content review](CONTENT-REVIEW-2026-10-27.md) records sources, exact preservation hashes, and specific teacher-review items. Exact Madd durations and routes, Ayn in surah-opening letters, Raa exceptions, Qalqalah degree terminology, Hamzat al-Wasl starting conditions, and stopping-symbol conventions still require qualified decisions. No qualified teacher or native-language editor has approved this work.

The original stopping-symbols poster remains an explicitly labelled English reference awaiting review, inside a disclosure. Its source-image text was not converted into new translated religious rulings. The maintained lesson text and surrounding controls are translated. The historical MCEC source URL returned 404 and is visibly identified as unavailable during this review.

## Deployment and SEO

`output: "export"`, trailing slashes, static images, the public origin, and Cloudflare security headers are preserved. All five editions are generated at build time. Earlier unprefixed URLs have `noindex` compatibility pages leading to the corresponding localized page. Search remains `noindex,follow`; review-stage lessons and articles keep their indexing restrictions. The sitemap contains canonical indexable localized pages and language alternates.

The preview command now serves `out/` with real 404 responses instead of attempting unsupported `next start` for an exported app. Global 404 support handles the multiple root layouts. No analytics, tracking, new external runtime service, or dependency was introduced. The audit loader uses the already-installed TypeScript compiler instead of relying on newer Node's automatic type stripping.

## Checks actually run

- `npm.cmd run audit`: passed; 50 lessons, 100 review-stage questions, resolved references and full curriculum coverage. The separate approved-only question bank remains empty.
- `npm.cmd run audit:i18n`: passed for Arabic, Urdu, Indonesian, and French; zero missing messages, placeholder errors, duplicate dictionary keys, encoding problems, or duplicate translated quiz options.
- `npm.cmd run lint`: passed without warnings.
- `npm.cmd run build`: passed with TypeScript checking and 698 generated pages/assets, including 575 localized HTML pages.
- `npm.cmd run audit:export`: passed; 575 localized pages, 90 indexable pages with unique titles/descriptions, 24,360 internal links, and 3,450 language alternates. Canonicals, anchors, sitemap destinations, robots sitemap reference, search indexing, and structured-data JSON syntax were checked.
- `npm.cmd run design:test`: the full sweep inspected 660 layout states across 13 route types in five editions plus the global 404. It identified RTL glossary/search minimum-width problems and unreliable section tracking. Those were corrected and the affected pages and interactions were rerun; final browser counts are recorded below and in `design-qa-results.json`.
- `npm.cmd run design:shots`: captured representative phone, tablet, desktop, and dark-theme pages in all five editions. Additional 320px RTL glossary/search captures were added after the overflow correction. Representative screenshots were opened for visual inspection.

The browser matrix uses 320, 375, 390, 430, 768, 1024, 1280, and 1440 CSS pixels, with additional 390/1280 dark-theme checks. Interaction coverage includes equivalent-page language switching, keyboard menu and search focus, quiz correctness/backtracking/completion, empty filters, localized glossary search, optional-storage failures, stage disclosures, and reading-location highlights. Computed text-palette pairs are checked against a 4.5:1 contrast threshold. The 200% checks are reflow-equivalent viewport/DPR simulations, not an assertion of testing every browser's native zoom implementation.

This is not a full screen-reader audit, native-language review, scholarly verification, external rich-result validation, or a measured Core Web Vitals certification. Every lesson, translation, and viewport was not manually visually reviewed; the exported HTML and translation audits cover their stated registries and routes, while browser inspection uses representative route types.

### Final browser result

The regression command was `$env:QA_PAGE_TYPES='home,glossary,search,rule-lesson,practice,404'; npm.cmd run design:test`. It passed **260 layout checks and 507/507 interaction assertions**, with **zero reported issues**, across all five editions and the eight listed widths. This rerun covered every route type affected by the RTL, reading-location, and small-screen refinements. The final machine-readable results are in [design-qa-results.json](design-qa-results.json); export and translation results are in [export-audit-results.json](export-audit-results.json) and [i18n-audit-results.json](i18n-audit-results.json).

The final screenshot run generated 34 images. Visual inspection included English and French homepages, Arabic and Urdu layouts, Indonesian instructional examples, and the corrected 320px Arabic glossary and Urdu search pages. The language selector was given additional space on 320px screens to display the Indonesian label.

After that final spacing adjustment, a targeted 320px header probe passed in all five editions: full selected-language label fits, no horizontal overflow, all controls stay in bounds, search remains available in the compact menu, and Escape returns focus. Results are in [header-qa-results.json](header-qa-results.json). The final production build, lint, translation audit, and export audit also passed after the adjustment.
