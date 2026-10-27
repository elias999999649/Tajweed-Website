# Tajweed101 implementation follow-up — 27 October 2026

This report supersedes the earlier five-language implementation snapshot. It describes shipped project changes and separates technical checks from independent religious, linguistic and usability review. It does **not** claim that every item in the 125-point roadmap is complete; see [the item-by-item status](ROADMAP-STATUS-2026-10-27.md).

## Learning experience

- Turkish is added as the sixth edition: `/en/`, `/ar/`, `/ur/`, `/id/`, `/fr/`, `/tr/`. All 50 lesson records, the glossary, 13 articles, quizzes, interface, error states and metadata have coverage checks. Turkish has 1,374 dictionary entries, plus the typed, six-language study-tool messages. Publication titles, Arabic source text and transliteration remain distinguishable from translated explanations.
- The sourced **وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا** panel and Google Sans Flex/Amiri typography remain. The existing distinctive arch motif also appears on six localized sharing cards. Listing headers are shorter; article text uses a centred reading column. Glossary details, study tools, reflection and confidence controls reveal secondary information on demand.
- Lessons now expose a clear focus and prerequisites near the beginning, current-section navigation on phones, bookmarks, notes for a teacher, separate read/practised records, reading-size controls and print styles. Homepage and dashboard resume links use the saved lesson section. The two identified Madd Harfi/Hamzah review concerns are repeated prominently before the teaching content.
- `/[lang]/my-learning/` provides saved lessons, review reminders, an optional weekly reading goal and validated backup import/export/reset. These are self-reported study records, never teacher approval or pronunciation assessment. Storage failures keep the current visit usable and explain the persistence limit.
- One quiz engine serves lessons and mixed practice. There are 150 source-comprehension questions in three purposes: definition, practice guidance and occurrence recognition. Prompts explicitly ask what the lesson states; source-based distractors are not described as religiously false. Learners choose, then check, read the explanation, follow an exact section link, revisit previous answers without re-scoring, inspect results and retry missed questions. Mixed sets contain 5, 10 or 20 questions. Confirmed sessions and optional confidence survive reloads and language changes; edits to the question source invalidate old attempts. Each learning stage links to its own filtered study check.
- Search accepts common spelling variants, single Arabic letters and translated body text, ranks titles more strongly, filters by content type, suppresses duplicate glossary results and has a conservative typo fallback. Directory, glossary and practice filters are shareable in the URL. Broad taxonomy topics no longer masquerade as unrelated single lessons.

## Sources and media

The new listening studio hosts the original Al-Fatihah recording by Ali al-Hudhaify, in Hafs ʿan ʿĀṣim, from the King Fahd Glorious Quran Printing Complex. Its official usage page permits general use of the listed recordings in websites/applications. The file is unchanged, has a recorded hash, does not autoplay, and does not require a third-party request when played. Full-recording repeat is available. Attribution, source and usage-permission links are visible. See [audio/font provenance](AUDIO-AND-FONT-SOURCES.md).

An optional microphone tool asks for access only after Start. It records at most two minutes in memory, stops when its disclosure closes, offers playback/download/delete, and never uploads or grades the learner. Browser testing uses a **fake microphone**, not the user's real microphone.

Primary source availability checks are recorded separately. The MCEC historical URL still returns 404. The reference PDF returned 406 to a direct automated GET, while the web retrieval successfully exposed the 49-page document; this is not recorded as a clean direct-fetch success. Topic locators link to the reference's printed pages and original publication title. Neither a source link nor an official recording establishes approval of this site's lesson wording.

All 50 lessons remain awaiting qualified review. The approved-only practice bank and verified Quran-example registry remain empty. Eleven identified instructional examples remain withheld. No scholar, native editor, learner or accessibility tester is invented. The canonical text, rule annotation, translation and teaching suitability of new Quran examples still need the review process required by the repository.

## Reliability and deployment

Amiri is now bundled locally from official Google Fonts files, alongside the existing Google Sans Flex. Both licenses ship with the export. Builds no longer fetch fonts. A real bundle audit found that server-side provider selection had merged all dictionaries into a shared entry chunk; client-side lazy boundaries now split them into selected-language downloads, with localized failure recovery. The largest compressed JavaScript artifact fell from 402,476 to approximately 87,000 bytes. These are artifact sizes, **not** Lighthouse or field Core Web Vitals.

Explicit offline saving caches only the selected lesson/language and its required fonts/scripts/images, up to 20 lessons. Audio and private notes are not precached. Online reads prefer current responses; content-version changes remove old copies. Version checks refuse an offline save from an older open page after an update and request a reload. A cache-write quota failure cannot replace a fresh online response with stale content. Static lesson content remains visible without application scripts through the no-script rendering support.

Publication guards require documented reviewer identity, qualification, date, evidence, field coverage and a matching content fingerprint. They reject approval based on a status flag alone. Content audits now distinguish structural integrity from readiness, enforce per-lesson quiz counts, check duplicate choices, cycles, curriculum coverage and example highlights, and reject stale/missing approval evidence. Node 24 is pinned, generated caches are removed from Git tracking, Chrome tooling accepts `CHROME_BIN`, and a quality workflow covers the local checks. Static Cloudflare export remains in place. See [deployment and rollback](DEPLOYMENT-AND-ROLLBACK.md).

## Verification evidence

The machine-readable reports are the authority for final counts:

- `i18n-audit-results.json`: all five translated dictionaries have zero missing messages, invalid placeholders, duplicate keys, encoding issues or duplicate quiz option sets.
- `export-audit-results.json`: 702 localized HTML pages, 114 indexable pages, 4,914 language alternates; checks canonicals, descriptions, links, anchors, sitemap, structured-data syntax and prepared redirects.
- `performance-budget-results.json`: bounded compressed HTML/JS/CSS/font/audio artifacts; no field performance claim.
- `design-qa-matrix-initial.json`: the first full 910-state matrix exposed 18 instances of the same small-screen backup-control sizing issue. All 651 interaction assertions passed. The issue was fixed rather than omitted from reporting.
- `design-qa-dashboard-regression.json`: the affected English/Arabic/Turkish dashboard regression passed, together with updated interaction checks and a simulated microphone recording.
- `design-qa-full-matrix.json`: 1,030 layout states and 663 interaction assertions passed after the mobile fix, including the two specific review warnings.
- `design-qa-overview-regression.json`: 60 layout states and 668 interaction assertions passed after the broad-topic, printing and offline-version follow-up fixes.
- `design-qa-results.json`: the final homepage follow-up passed 60 layout states and 668 interaction assertions with no issues. It also measures room for native language labels. Fresh Indonesian phone and tablet screenshots were inspected to confirm the full language name is visible.

Lint, TypeScript, production static export, structural content audit and 15 study/release regression checks have been run. Browser checks cover keyboard behavior, focus, answer confirmation and retention, section links, native selectors, saved notes across languages, offline reload, no-autoplay local audio and storage failure. The zoom checks are reflow equivalents, not native browser zoom. Screenshots are local QA artifacts; manual inspection is limited to the images actually viewed.

Independent teacher/native-language review, real screen-reader/Safari/Firefox/device-text-size testing, real beginners, live Cloudflare configuration verification and deeper approved teaching media remain outstanding. Software checks cannot stand in for those results.
