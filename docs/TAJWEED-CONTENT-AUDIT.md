# Tajweed Content Completeness Audit

**Audit date:** 2026-08-31

## Executive finding

This project contains a substantial structured Tajweed content layer, not only website structure. The rule registry contains 33 rule records with definitions, detailed explanations, occurrence conditions, pronunciation guidance, common mistakes, practice prompts, FAQs, source IDs, source references, and review notes.

It is not publication-complete. All 33 rule records are marked `needs_review` / `REQUIRES REVIEW`. There are no verified rules, no verified Quran examples, and no generated quiz questions because the quiz bank correctly excludes unverified content.

## Rule inventory

| Rule | Category | Level | Definition present? | Letters present? | Condition present? | Pronunciation explanation present? | Quran examples present? | Examples verified? | Common mistakes present? | Practice present? | Quiz present? | Sources present? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| What is Tajweed? | Foundations | Foundation | Yes | N/A | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Why Tajweed is Studied | Foundations | Foundation | Yes | N/A | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Basic Arabic Pronunciation | Foundations | Foundation | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Arabic Letters | Foundations | Foundation | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Makharij al-Huruf | Foundations | Foundation | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Sifaat al-Huruf | Foundations | Foundation | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Heavy and Light Letters | Foundations | Foundation | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Introduction to Ghunnah | Foundations | Foundation | Yes | Yes | Yes | Yes | 2 review-only | No | Yes | Yes | No | Yes |
| Noon Sakinah | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Tanween | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Izhar | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | 2 review-only | No | Yes | Yes | No | Yes |
| Idgham | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | 2 review-only | No | Yes | Yes | No | Yes |
| Idgham with Ghunnah | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Idgham without Ghunnah | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Iqlab | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Ikhfa | Noon and Tanween | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Meem Sakinah | Meem Sakinah | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Ikhfa Shafawi | Meem Sakinah | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Idgham Shafawi | Meem Sakinah | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Izhar Shafawi | Meem Sakinah | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Qalqalah Letters | Qalqalah | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Qalqalah when letters are sakin | Qalqalah | Essential | Yes | Yes | Yes | Yes | 1 review-only | No | No | Yes | No | Yes |
| Qalqalah Sughra | Qalqalah | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Qalqalah Kubra | Qalqalah | Essential | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Lam in Allah | Lam and Raa | Intermediate | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Lam Shamsiyyah | Lam and Raa | Intermediate | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Lam Qamariyyah | Lam and Raa | Intermediate | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Raa Heavy and Light | Lam and Raa | Intermediate | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |
| Madd Tabii | Madd and lengthening | Intermediate | Yes | Yes | Yes | Yes | 2 review-only | No | Yes | Yes | No | Yes |
| Waqf | Waqf and Ibtida | Intermediate | Yes | N/A | Yes | Yes | 2 review-only | No | Yes | Yes | No | Yes |
| Ibtida | Waqf and Ibtida | Intermediate | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Hamzat al-Wasl | Hamzah | Advanced | Yes | Yes | Yes | Yes | 1 review-only | No | Yes | Yes | No | Yes |
| Hamzat al-Qat' | Hamzah | Advanced | Yes | Yes | Yes | Yes | No | No | Yes | Yes | No | Yes |

**Interpretation:** `N/A` means the concept is not defined by a fixed letter set. `No` under quiz means no structured question is currently generated for that rule. The quiz bank is verification-gated and currently contains 0 questions.

## Findings

### 1. Completely missing rules

The curriculum references 50 rule IDs, but only 33 rule records exist. These 17 curriculum entries have no corresponding rule record:

- `madd-badal`
- `madd-lin`
- `madd-arid-li-sukun`
- `madd-wajib-muttasil`
- `madd-jaiz-munfasil`
- `madd-lazim-kalimi`
- `madd-lazim-harfi`
- `major-stopping-concepts`
- `mushaf-stopping-symbols`
- `when-stopping-affects-pronunciation`
- `beginning-with-hamzah`
- `ghunnah`
- `tafkhim`
- `tarqiq`
- `articulation-and-clarity`
- `common-pronunciation-errors`
- `commonly-confused-letters`

These should not be filled with generated content without source verification.

### 2. Rules that only contain placeholders

No rule consists only of placeholder text. All 33 contain substantive-looking structured copy, but all are review-gated. Four rules do not have fixed letter sets because they are conceptual or context-led: What is Tajweed?, Why Tajweed is Studied, Waqf, and Ibtida.

Some supporting fields are explicitly review placeholders, especially example source strings and missing Arabic spellings in generated glossary fallback entries. They must not be treated as verified content.

### 3. Rules without examples

Fifteen rules have no example record of any type:

- Why Tajweed is Studied
- Basic Arabic Pronunciation
- Arabic Letters
- Makharij al-Huruf
- Sifaat al-Huruf
- Heavy and Light Letters
- Tanween
- Idgham with Ghunnah
- Idgham without Ghunnah
- Idgham Shafawi
- Izhar Shafawi
- Qalqalah Sughra
- Qalqalah Kubra
- Raa Heavy and Light
- Hamzat al-Qat'

The `quranExamples` field is empty in all 33 rule records. The separate example registry contains 7 Quran examples and 17 instructional examples, but none are verified.

### 4. Rules with insufficient examples

Using a minimum of two examples as the threshold for basic comparison practice, 28 rules are insufficient: the 15 rules above have zero examples, and these 13 have only one review-only example:

- What is Tajweed?
- Noon Sakinah
- Ikhfa
- Iqlab
- Meem Sakinah
- Ikhfa Shafawi
- Qalqalah Letters
- Qalqalah when letters are sakin
- Lam in Allah
- Lam Shamsiyyah
- Lam Qamariyyah
- Ibtida
- Hamzat al-Wasl

The five rules with two review-only examples are Introduction to Ghunnah, Izhar, Idgham, Madd Tabii, and Waqf. Two examples do not make them verified; their Arabic text, references, annotation, and source still require review.

### 5. Examples that are not verified

All 24 example records are not verified:

- 7 Quran examples are marked `needs_review`.
- 17 instructional examples are marked `draft`.
- 0 examples are marked `verified`.

Quran example records currently use a generic review-required source string rather than a traceable source ID and independently checked text/reference record. They must remain unpublished in the Quran Examples section.

### 6. Missing source references

- All rule records have source IDs and source reference labels, but all rule verification statuses remain review-required.
- The Quran Foundation API source is defined but is not attached to rule records.
- Example records now have structured `sourceIds`, but the Quran source remains a candidate technical source and does not constitute verification.
- The `quranExamples` arrays in every rule record are empty, so rule-to-example relationships are not stored in the rule records.
- Several related-rule and prerequisite IDs point to records that do not exist, including `strong-letter-qualities`, `tafkhim`, `tarqiq`, `taa`, `madd-badal`, `madd-lin`, `madd-arid-li-sukun`, `madd-wajib-muttasil`, `major-stopping-concepts`, and `how-to-resume`.

### 7. Important Tajweed categories not yet covered

The current registry covers Foundations, Noon and Tanween, Meem Sakinah, Qalqalah, Lam and Raa, Madd and lengthening, Waqf and Ibtida, and Hamzah. The following important areas are missing or incomplete in the rule registry:

- The broader Madd family beyond Madd Tabii
- Detailed Waqf concepts and Mushaf stopping symbols
- Beginning with Hamzah as a dedicated topic
- Dedicated Ghunnah progression beyond the introduction
- Tafkhim and Tarqiq as dedicated records
- Articulation and clarity applications
- Common pronunciation errors and commonly confused letters
- Additional source-verified Quran examples for every major rule family

## Structural fixes made automatically

- The question bank is now generated only from rules marked both `verified` and `VERIFIED`.
- It accepts only Quran examples marked `verified` for example-identification questions.
- Every generated question exposes `options` and the existing `answers` compatibility field, alongside the required answer, explanation, related rule, and difficulty metadata.
- The glossary and rule pages preserve review status instead of exposing unverified content as authoritative.

No missing rule, Quran verse, Arabic text, pronunciation claim, or source verification was invented during this audit.

## Overall conclusion

The project contains real structured educational material and a functioning content model, but it is currently a review-stage Tajweed knowledge base rather than a fully verified published curriculum. The strongest completed layer is the rule structure and educational scaffolding. The largest content gaps are authoritative verification, Quran examples, complete curriculum coverage, structured example sources, and verified quiz questions.

## Post-audit implementation status

- Added a canonical `/start-here` beginner journey generated from the curriculum.
- Changed site search to index the canonical Tajweed rule registry rather than legacy taxonomy route records.
- Updated the sitemap to avoid review-gated rule URLs and include `/start-here` and `/glossary`.
- Added structured candidate source IDs to examples without changing their unverified status.
- Preserved the verified-only quiz gate; no questions are generated until rules and/or examples are actually verified.
- Remaining navigation and legacy learning-topic route inconsistencies require a broader content-model migration and should be addressed before public launch.

## Educational quality pass

The automated quality check is available in `lib/tajweed/content-audit.ts`. It checks every rule for meaningful definitions, explanations, conditions, letters or an explicit context-dependent classification, pronunciation guidance, Quran examples, verified examples, common mistakes, resolved related-rule links, practice prompts, verified quiz questions, sources, level, and prerequisites.

### Complete rules

**None.** A rule is not considered complete unless its factual content and examples are verified. All current records remain review-gated.

### Rules requiring review or improvement

**All 33 current rules.** The primary reasons are the absence of verified Quran examples and verified quiz questions. The following records also need targeted factual correction or scholar review before publication:

- `heavy-and-light-letters`: the current explanation overgeneralizes heaviness and lightness.
- `tanween`: the current letter array is misleading because Tanween is not a fixed four-letter set.
- `izhar`: the current Quran example is not a safe Izhar assignment and must be rechecked.
- `iqlab`: the current explanation must explicitly distinguish the reviewed sound treatment.
- `ikhfa-shafawi` and `idgham-shafawi`: current trigger arrays require correction and source review.
- `izhar-shafawi`: the current letter value is an obvious placeholder and must be replaced only after verification.
- `qalqalah-sughra` and `qalqalah-kubra`: occurrence and distinction are too vague to teach safely.
- `lam-in-allah`, `lam-shamsiyyah`, and `lam-qamariyyah`: the current conditions/letter sets are incomplete or misleading.
- `raa-heavy-and-light`: heavy/light conditions and the Arabic terminology require review.
- `madd-tabii`: the current condition wording requires correction and source verification.
- `waqf` and `ibtida`: the current conditions are too general for applied learning.
- `hamzat-al-wasl` and `hamzat-al-qat`: the current pair is conceptually conflated and must be corrected before publication.

No factual content was silently promoted to verified status. Question generation remains gated on both rule and example verification.

### Quality-pass corrections

- Removed the misleading second trigger from the review-gated Ikhfa Shafawi record.
- Removed the misleading Baa trigger from the review-gated Idgham Shafawi record.
- Removed the ASCII placeholder from the Izhar Shafawi letter field; the correct trigger set remains `REQUIRES SCHOLAR REVIEW` until source verification.
- Kept the Hamzah, Madd, Lam/Raa, Waqf, and Quran-example concerns explicitly review-required because correcting them requires authoritative content review rather than a safe structural edit.
