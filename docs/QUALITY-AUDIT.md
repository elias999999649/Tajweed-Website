# Performance and accessibility audit checklist

Use this checklist on the homepage, `/tajweed`, `/tajweed/[slug]`, `/learn`, `/learn/[slug]`, `/articles`, `/articles/[slug]`, `/practice`, and `/search` before release.

## Mobile

- [ ] Test at 320px, 375px, 390px, and 430px widths.
- [ ] No horizontal scrolling except intentionally scrollable tables.
- [ ] Navigation opens, closes, and exposes its state to assistive technology.
- [ ] Touch targets are at least comfortably tappable.
- [ ] Search, filters, quizzes, audio controls, and disclosures work without hover.
- [ ] Arabic examples remain readable when text is zoomed to 200%.
- [ ] No fixed element obscures headings, breadcrumbs, or focused controls.

## Desktop

- [ ] Test at 1280px and 1440px widths.
- [ ] Content measure remains comfortable for long-form reading.
- [ ] Sticky navigation and sidebars do not cover anchor targets.
- [ ] Cards and grids do not create excessive empty space or clipped content.
- [ ] Dark mode preserves readable contrast and border visibility.

## Keyboard

- [ ] Complete the primary task using Tab, Shift+Tab, Enter, and Space.
- [ ] Focus order follows the visual and reading order.
- [ ] Every focusable element has a visible `:focus-visible` indicator.
- [ ] There are no keyboard traps.
- [ ] Menus, quizzes, details disclosures, forms, and filters are operable by keyboard.
- [ ] Focus does not unexpectedly submit a form or change context.

## Screen reader

- [ ] Landmark structure includes header, navigation, main, article/sections, and footer.
- [ ] Every page has one meaningful H1.
- [ ] Headings can be navigated in logical order.
- [ ] Icon-only buttons have accessible names.
- [ ] Form inputs have labels or accessible names.
- [ ] Quiz feedback is announced or available in the reading order.
- [ ] Decorative icons are hidden from the accessibility tree.
- [ ] Arabic content uses `lang="ar"` and `dir="rtl"`.
- [ ] Highlights provide text labels and do not depend on color alone.

## Performance

- [ ] Confirm educational pages remain server-rendered HTML.
- [ ] Confirm only interactive components use `"use client"`.
- [ ] Run a production build before measuring.
- [ ] Measure LCP, CLS, INP, total blocking time, and transferred JavaScript.
- [ ] Confirm the chosen font stack is available without build-time network access and does not trigger runtime font requests.
- [ ] Use `next/image` for future raster assets with explicit dimensions and meaningful alt text.
- [ ] Lazy-load below-the-fold images and audio; do not lazy-load the primary content needed for comprehension.
- [ ] Avoid autoplay audio and unnecessary animation libraries.
- [ ] Check that no layout shift occurs when fonts, audio controls, or media load.
- [ ] Audit bundle size after adding search, audio, analytics, or quiz dependencies.

## SEO

- [ ] Inspect rendered HTML with JavaScript disabled.
- [ ] Check title, description, canonical, Open Graph, and Twitter metadata on every indexable route.
- [ ] Confirm `/sitemap.xml` contains only real canonical URLs.
- [ ] Confirm `/robots.txt` is reachable and references the sitemap.
- [ ] Confirm `/search` is `noindex,follow` and is not blocked in robots.txt.
- [ ] Validate only structured data that is visible on the page.
- [ ] Check internal links for 404s, incorrect slugs, and unclear anchor text.
- [ ] Confirm drafts and unreviewed educational content are not promoted as authoritative.

## Arabic text rendering

- [ ] Test with the intended Arabic font loaded and unavailable.
- [ ] Check diacritics at normal, 150%, and 200% zoom.
- [ ] Confirm right-to-left ordering in examples, legends, tables, and mixed Arabic/English text.
- [ ] Confirm highlights do not split or visually obscure diacritics.
- [ ] Confirm Arabic text can be selected and copied without reordered characters.
- [ ] Check contrast in light and dark themes.
- [ ] Verify Quran text is exact against the approved source before publication.
- [ ] Verify Surah names, verse numbers, translations, and audio metadata independently.
