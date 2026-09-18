# Complete Tajweed Guide (Tajweed101)

A calm, beautifully structured web application designed to help learners study Tajweed clearly, step by step. 

🌐 **Live Website:** [tajweed101.pages.dev](https://tajweed101.pages.dev)

---

## 🌟 Overview

**Complete Tajweed Guide** provides a comprehensive, distraction-free environment for mastering the rules of Quranic recitation (*Tajweed* according to the Hafs ʿan ʿĀṣim reading tradition). Built with Next.js (static export), it features:
- **50 Detailed Rule Lessons:** Covering foundational rules (Makharij, Sifaat, Harakat), Noon Sakinah & Tanween, Meem Sakinah, Madd & lengthening, stopping & starting (Waqf & Ibtida), and advanced letter interactions.
- **Structured Learning Path:** Guided stages taking learners from absolute reading prerequisites to advanced recitation topics.
- **Interactive Quizzes & Practice:** Formative exercises and recognition tests with randomized option shuffling.
- **Search Palette:** Instant `Cmd+K` / `Ctrl+K` search across all rules, terms, and topics.
- **Bilingual Typography:** Optimized self-hosted Google Sans Flex for English UI and Amiri for authentic Arabic Qur'anic text with precise diacritics.
- **Dark Mode:** Built-in light/dark theme support with zero flash and system preference detection.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev        # http://localhost:3000
```

### Production Build

```bash
npm run build      # Static export (Next.js with webpack & output: export)
npm run start      # Serve production build locally
```

---

## 🛠️ Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Production static export with type checking and page prerendering |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint (Next.js core web vitals config) |
| `npm run audit` | Run content integrity audit (checks cross-references, rules, curriculum) |
| `npm run font` | Rebuild self-hosted Google Sans Flex font subset (`app/fonts/`) |
| `npm run design:test` | Run headless Chrome QA across all pages (light/dark, mobile, overflow check) |
| `npm run design:shots` | Capture QA screenshots into `.screenshots/` |

---

## 📁 Project Structure

```text
app/
  page.tsx              # Homepage with hero ayah card & entry points
  learn/                # Guided learning curriculum path (5 levels)
  tajweed/[slug]/       # 50 individual rule lessons
  practice/             # Interactive practice session & quiz center
  glossary/             # Searchable Tajweed glossary
  articles/             # Study guides and methodology articles
  search/               # Server-rendered search index
components/             # UI components (Header, Footer, Quiz, Search Palette, etc.)
lib/
  tajweed/              # Rule records, curriculum, examples, glossary
  taxonomy/             # Learning levels and topic-to-lesson resolvers
  practice/             # Practice question generator and banks
  search/               # Ranked multi-word tokenized search
scripts/                # Content integrity audit & QA tooling
docs/                   # Editorial policies, SEO audits, and QA checklists
```

---

## ☁️ Deployment

The project is configured for static site hosting (optimized for **Cloudflare Pages**):
- Output mode: `output: "export"` with `trailingSlash: true` in `next.config.ts`.
- Security headers configured via `public/_headers`.
- Node.js 20 pinned via `.nvmrc`.

---

## 📄 License & Content Model

All lesson content and data are stored in typed TypeScript records under `lib/`. Quran quotations are strictly verified before publishing, and instructional examples are clearly distinguished from Qur'anic citations.
