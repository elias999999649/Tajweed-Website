# Contributing

Thanks for helping improve Tajweed101.

## Getting started

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev` to start the local development server.
4. Run `npm run lint` and `npm run build` before submitting changes.

## Security and secrets

- Never commit API keys, passwords, access tokens, private keys, `.env` files, local editor settings, or deployment credentials.
- Put local configuration in an ignored `.env.local` file. Use `.env.example` only for clearly fake placeholders.
- Use GitHub Actions secrets or your deployment provider's secret manager for CI/deployment credentials. Never put secrets in `NEXT_PUBLIC_*` variables: they are exposed to visitors in the browser bundle.
- If a credential is committed or reported by a scanner, revoke/rotate it immediately. Removing it in a later commit does not remove it from Git history.
- Keep `.vscode/settings.example.json` generic. Put personal settings in ignored `.vscode/settings.json`.

## Content and pull requests

Please keep Quran quotations and lesson examples accurate and clearly sourced. Explain the purpose of your change in your pull request and include relevant testing notes.

## Languages and verification

The five editions use `/en/`, `/ar/`, `/ur/`, `/id/`, and `/fr/`. Shared pages use `getI18n()` on the server and `useI18n()` in interactive components. Use `href()` for internal destinations and `t()` for interface and educational text. Never translate identifiers, Quranic Arabic, verse references, or review-status enums.

After changing visible English wording, run `node scripts/extract-translations.mjs`, update all four dictionaries in `lib/i18n/`, then run `npm run audit:i18n`. Missing translations fail explicitly. Placeholder names must match. Dictionaries are working translations; do not call them native-reviewed or scholar-approved without the corresponding review.

Run `npm run audit`, `npm run lint`, `npm run build`, `npm run audit:export`, and `npm run design:test`. The exported HTML audit checks links, anchors, canonical URLs, language metadata, structured-data syntax, and sitemap indexing. Browser QA supplements these checks; it does not verify religious content or constitute a complete screen-reader audit.
