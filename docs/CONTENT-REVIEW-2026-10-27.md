# Content review — 27 October 2026

This is an engineering and editorial review, not approval by a qualified Tajweed teacher or a native-language reviewer. Every rule keeps its existing `needs_review` / `REQUIRES REVIEW` status. No Quran quotation or verse reference was added, rewritten, or promoted to verified.

## Current state and checks

`npm run audit` passed before and after these changes: 50 rules, 100 review-stage lesson questions, all rule and curriculum references resolved, and an empty verified-only practice bank. The old August audit is historical and contains counts and missing-rule findings that no longer describe this checkout. The current dedicated Quran-example registry is empty; the legacy example registry now contains only draft instructional records.

The review examined the rule registry, curriculum, glossary generation, articles, taxonomy, both quiz generators, instructional examples, and Quran-example validation. It found and repaired the specific items below. It does not certify every sentence or pronunciation treatment as accurate.

## Changes

- Clarified Tanween as an added n sound in connected reading rather than a doubled or lengthened vowel.
- Removed misleading “lighter Ha” and “from the chest” wording; the distinct Arabic letters remain explicit.
- Removed the closed-lips assertion that contradicted the concealed-Meem description of Iqlab; exact lip treatment still belongs with a qualified demonstration.
- Repaired the self-contradictory occurrence sentence for Madd 'Arid li-Sukun and the Madd Lazim Harfi memory tip.
- Removed “stopping Hamzah” as a misleading name for Hamzat al-Qat'.
- Reworded the Munfasil distractor/memory prompt that could imply a shared taught duration was an error.
- Put Arabic letter recognition before basic pronunciation in the foundations curriculum and fixed three article links to the existing essential-rules level.
- Kept taxonomy reading scope consistently at the site's stated Hafs initial scope instead of implying coverage of every reading tradition.
- Replaced overlapping generic occurrence quiz distractors with explicit lesson-definition and sound-practice comprehension questions. Questions remain review-stage and do not certify pronunciation.
- Preserved eleven problematic instructional records verbatim while withholding them from learner-facing exercises. `withheldExampleIssues` in `lib/tajweed/examples.ts` records their exact IDs and concerns. No replacement Arabic was invented.
- Included draft instructional examples in the outstanding-verification report and recognised conceptual lessons without a fixed letter set in the content audit.

## Sources actually consulted

- [Reach the Goal via Tajweed Rules](https://islamicstudies.info/quran/tajweed/Tajweed_Rules.pdf), the repository's comparative reference: printed pp. 13–16 and 24–25 were consulted for Tanween, Iqlab, and Meem trigger distinctions. Text extraction damages Arabic in this PDF, so it was not used to import Quran quotations.
- [Beginner and Intermediate Tajweed Curriculum](https://recitewithlove.com/wp-content/uploads/2015/03/recitewithlovetajweedclassinfo-1.pdf), retrieved successfully and compared for curriculum scope and teacher-led practice. It is an outline, not a source that verifies every detailed lesson assertion.
- The repository's [MCEC curriculum URL](https://mcec.org.uk/documents/SatSchoolQuran.pdf) returned 404 during this review. Its historical references remain traceable; they must not be presented as newly verified.

## Qualified review still required

All 50 lessons, 50 derived glossary entries, all instructional examples, and the educational articles retain their existing review limitations. In particular, obtain qualified decisions for exact Madd durations and route selection, the Ayn exception in surah-opening letter names, Qalqalah degree terminology, Raa exceptions, Hamzat al-Wasl starting-vowel conditions, stop-category definitions, and edition-specific stopping symbols. The Arabic/transliteration/gloss and highlights of all draft exercises also require language and Tajweed review. Translation work must preserve these limitations and requires native-language review before it can be described as such.

The approved practice bank remains empty until the existing approval criteria are actually met. Source retrieval and this engineering pass do not satisfy those criteria. The interface also offers the separate, explicitly labelled review-stage recognition questions; their scores do not assess recitation.

## Exact source-data preservation

A direct comparison with `git HEAD` imported the original and current TypeScript records and compared selected fields as JSON. All comparisons passed:

- 50 rule Arabic names and letter arrays are unchanged. SHA-256: `fe5b8180f0273c73449c68b19086ee8aae68f5ecc36a0c77280bcab38f51711d`.
- All 56 instructional records retain exact Arabic text, highlighted text, transliteration, type, source, source IDs, surah/verse fields and verification status. SHA-256: `68c632bf6e590d94fec724a63d910e6e5b4d4268b6023686cedb8548eef6a248`.
- All 50 rules retain verification status, review status, source IDs and source-reference labels. SHA-256: `38a10298348b000d2110883f0ca546e1df36d775c5ef2ab15b04fdbbb4e67fd1`.

The reported hashes cover the selected fields in stored record order; they are preservation evidence, not evidence of religious correctness. Eleven draft records are withheld by separate review-issue metadata, with their original text retained. Two further visible review notes identify the exact unresolved Ayn/six-count wording and third-root-letter wording without inventing a replacement ruling.

## Arabic translation work

The Arabic dictionary covers the lesson/glossary text, article content, educational prompts and feedback, sources/review notes, metadata and interface messages. Terminology was checked for consistent use of النون الساكنة، التنوين، الإظهار، الإدغام، الإقلاب، الإخفاء، الغنة، التفخيم، الترقيق، الوقف والابتداء. This is an unreviewed working translation, not a native-editor or scholarly approval. Its source's unresolved Madd, Raa, Hamzah and stopping details remain unresolved. `npm run audit:i18n -- ar` passed with zero missing messages and zero invalid placeholders at the end of the translation pass; the root agent will rerun it after integration.

## Homepage quotation retained

The requested “wa rattil al-Qur’ana tartila” phrase is retained in the homepage recitation panel. Its displayed Arabic is copied exactly from the final phrase of 73:4 returned by `quran.ai fetch_quran(73:4, ar-uthmani-hafs)` on 27 October 2026, with a visible [Quran.com 73:4](https://quran.com/73:4) source link. This uses the retrieved Hafs Uthmani spelling rather than reconstructing diacritics or supplying an AI translation. It is a sourced quotation, not a newly approved rule example or an assertion that the draft curriculum has completed review.

The existing English stopping-symbols poster is preserved as a collapsed original reference, explicitly labelled as English and awaiting review in all five editions. Its image text has not been silently translated into new rulings. The surrounding lesson explanations and controls are translated; a teacher still needs to check the poster's provenance and edition-specific instructions.
