# Complete Tajweed Guide

A calm, structured way to learn Tajweed: 50 rule lessons, a curriculum path, glossary, articles, and quizzes — all server-rendered, no accounts required.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

Set your real domain before deploying (used for canonical URLs, sitemap, robots, and Open Graph):

```bash
cp .env.example .env.local
# NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Scripts

| Command             | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Development server                                                  |
| `npm run build`     | Production build (also type-checks and prerenders all pages)        |
| `npm run start`     | Serve the production build                                         |
| `npm run lint`      | ESLint with the Next.js core-web-vitals config                      |
| `npm run audit`     | Content integrity audit: quiz generation, cross-references, coverage |
| `npm run font`      | Rebuild the self-hosted Google Sans Flex subset (`app/fonts/`)       |
| `npm run design:test` | Headless Chrome QA: every page in light/dark + mobile, console errors, overflow, tiny text, interactions |
| `npm run design:shots` | Capture before/after screenshots into `.screenshots/`           |

Run `npm run audit` before every deploy. It fails (exit code 1) when a rule
references a missing rule, the curriculum points to a lesson that does not
exist, an example points to a missing rule, or the quiz answer positions look
unshuffled.

## Project structure

```
app/
  page.tsx              homepage
  start-here/           beginner orientation
  learn/                learning path (5 levels + topic pages)
  tajweed/[slug]/       50 rule lessons (quiz, FAQ, examples, sources)
  practice/             filterable practice session
  glossary/             searchable glossary
  articles/             approved articles
  search/               server-rendered search results (noindex)
  not-found.tsx         custom 404
  error.tsx             error boundary
components/             UI components (header, footer, quiz, search palette, …)
lib/
  tajweed/              rules, curriculum, examples, glossary, sources
  taxonomy/             learning levels, topics, topic→lesson resolver
  practice/             practice bank + lesson quiz generation
  search/               ranked, tokenized search
  articles/             article content
scripts/                audit tooling (npm run audit)
docs/                   editorial, SEO, and QA checklists
```

## Content model

- All content lives in typed arrays under `lib/`. No database, no CMS.
- Every rule carries `verificationStatus` and `reviewStatus`. Quran quotations
  are only published when `verified`; instructional examples are clearly
  labelled as teaching constructs, never as Quran citations.
- `lib/taxonomy/lessons.ts` maps each learning-path topic to a published rule
  lesson, so internal links never 404 while lessons are still being written.
  Topics without their own lesson are shown with an "In preparation" badge and
  open the closest related lesson.

## Features

- Fully server-rendered content; client JavaScript only for the header menu,
  theme toggle, quiz interactions, search palette, and directory filters.
- Dark mode with system-preference detection, saved choice, and no flash.
- Self-hosted variable font (Google Sans Flex, subset to ~60 KB with
  `npm run font`) plus Amiri for Arabic so diacritics render consistently
  on every platform.
- ⌘K / Ctrl+K search palette with ranked multi-word matching.
- Seeded option shuffle in all quizzes so the correct answer is never
  consistently the first choice.
- Custom 404 with popular lessons, error boundary with retry.
- `npm run audit` CI gate for content cross-references.

## Conventions

- Keep pages as Server Components; mark interactive islands with
  `"use client"` only.
- Add new rules to `lib/tajweed/rules.ts`, then reference them by id from
  `lib/tajweed/curriculum.ts`. Run `npm run audit` to catch typos.
- Do not publish Quran text as verified without a checked source; unverified
  Quranic examples stay `needs_review` and are withheld from lesson pages.

## Testing checklist before release

1. `npm run lint`
2. `npm run audit`
3. `npm run build`
4. `npm run design:test` (headless Chrome QA over the static export)
5. Follow `docs/QUALITY-AUDIT.md` (mobile, keyboard, screen reader, Arabic
   rendering) and `docs/SEO-AUDIT.md` on the pages you changed.
