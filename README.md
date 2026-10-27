# Tajweed101

A static, beginner-oriented study companion for Quranic recitation within the **Hafs ʿan ʿĀṣim** teaching scope. Written explanations support listening and feedback from a qualified teacher.

Public origin: [tajweed101.pages.dev](https://tajweed101.pages.dev).

See [the implementation and verification report](docs/IMPLEMENTATION-2026-10-27-PHASE2.md) for the current scope, actual checks, and review limitations. The homepage keeps the sourced Quran 73:4 recitation phrase and the Google Sans Flex/Amiri fonts.

## Content and review status

The repository contains 50 structured lesson drafts, a glossary derived from those lessons, a staged learning path, 13 articles, and 150 review-stage comprehension questions. All lessons still require qualified Tajweed review. The separate verified-only practice bank and Quran-example registry are empty. Draft teaching text is labelled as instructional and is not presented as Quran quotation. Eleven mismatched instructional records are preserved for editorial traceability and withheld from learner pages.

The five translated editions are working translations requiring native-language and qualified Tajweed review. A source reference does not imply endorsement or approval. See [the current content review](docs/CONTENT-REVIEW-2026-10-27.md) and the visible editorial-policy and sources pages. Earlier audit documents are historical snapshots.

## Languages and routes

Six editions are generated: English `/en/`, Arabic `/ar/`, Urdu `/ur/`, Indonesian `/id/`, French `/fr/`, and Turkish `/tr/`. Arabic and Urdu set document-level RTL direction. Language switching preserves the corresponding route, query, and fragment. Navigation uses stable static URLs with trailing slashes. Previous unprefixed English URLs remain as `noindex` compatibility pages linking and redirecting to the corresponding edition; stored language preference is optional.

`app/[lang]/` contains the shared pages. Server-rendered content uses `getI18n()`; interactive components use `useI18n()`. Exact source-language messages map to dictionaries in `lib/i18n/`. Missing keys throw instead of silently displaying English. Each language dictionary is a separate cacheable client chunk, rather than a large object repeated in every page's HTML.

## Study tools

Lessons offer device-only reading/practice records, bookmarks, teacher notes, reading-size controls, print styling, and optional offline saves. `/[lang]/my-learning/` provides a resume link, a review queue, backup import/export and reset. Quiz sessions use explicit answer confirmation, missed-only retries and source-versioned saved answers. `/[lang]/listen/` offers an officially permitted, locally hosted Al-Fatihah recording and an optional two-minute local microphone recorder. Recordings are not uploaded or assessed. Offline saves are limited to selected lessons and language; a new content version removes old copies.

## Development and checks

Use Node.js 24 LTS, as pinned in `.nvmrc` (including the built-in WebSocket used by browser QA). Install dependencies with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run lint` | ESLint |
| `npm run audit` | Content, references, curriculum, and quiz integrity |
| `npm run audit:i18n` | Educational/UI translation coverage and placeholders |
| `npm test` | Study-data, search and publication regression checks |
| `node scripts/performance-budget.mjs` | Compressed static-artifact budgets after build |
| `npm run build` | Production static export into `out/` |
| `npm start` | Local static preview, default port 3000; real 404 responses |
| `npm run audit:export` | Exported HTML, links, anchors, metadata, and sitemap |
| `npm run design:test` | Chrome layout and interaction QA in six languages |
| `npm run design:shots` | Representative screenshots in `.screenshots/` |
| `npm run font` | Rebuild the local Google Sans Flex subset |

Headless scripts discover platform defaults; set `CHROME_BIN` to override the executable. `QA_LOCALES` and `QA_WIDTHS` can narrow a diagnostic run; the default design matrix uses all six editions and 320, 375, 390, 430, 768, 1024, 1280, and 1440 CSS pixels, with additional dark-theme checks. Coverage and actual results belong in the current verification report, not inferred from a checklist.

On Windows, use `npm.cmd` if PowerShell blocks the `npm.ps1` launcher. `QA_PAGE_TYPES` can limit a regression run to named route types; it does not change the exported site languages.

## Deployment and privacy

Next.js 16.3.3 exports static HTML with `output: "export"`, `trailingSlash: true`, and unoptimized static images for Cloudflare Pages. Publish `out/`. `NEXT_PUBLIC_SITE_URL` sets the canonical HTTPS origin; the default is the public project origin above. Source and search pages remain available; search utilities and unreviewed lesson/article pages retain `noindex,follow` as appropriate. Sitemaps contain canonical indexable localized pages only.

There is no server runtime, analytics, tracking, autoplay, or external account dependency. Fonts are served by the exported site; Google Sans Flex and Amiri are bundled locally, with their OFL notices in `public/licenses/`. Browser storage is optional. Security headers remain in `public/_headers`.

## Contributions and license

Read [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), and the relevant installed Next.js guides before changing the app. Do not commit secrets or local environment files.

The repository is **UNLICENSED**. Public visibility does not grant reuse or redistribution rights. Do not describe it as open source without an appropriate license grant.
