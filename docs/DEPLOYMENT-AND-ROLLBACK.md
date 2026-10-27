# Deployment and rollback

Use Node 24 LTS and `npm ci`. Run lint, content and translation audits, regression checks, production build, exported-HTML audit, compressed-artifact budgets and browser QA. The GitHub quality workflow runs the same categories; it has not been executed remotely in this session.

Publish **`out/`**, including `_headers`, `_redirects`, `offline-worker.js`, `audio/`, `social/`, and `licenses/`. Preserve the canonical origin, or set `NEXT_PUBLIC_SITE_URL` before building for a different domain. No server runtime, API credentials or analytics are required. This work changes local source and export files; it does not deploy the public website.

The prebuild step prepares explicit 301 redirects only for equivalent `/[lang]/learn/[topic]` aliases. Broader curriculum overviews remain separate. Unprefixed language-preference compatibility pages remain intact. Local static preview does not emulate Cloudflare redirect/header processing; deployment configuration must also be checked on a preview deployment.

Microphone permission is restricted to this origin and still requires the learner's explicit start action and browser permission. Camera and geolocation remain disabled. CSP constrains framing, object embedding and base URLs; it is not a claim of a complete strict script policy.

For rollback, retain or republish the previously verified static deployment. Keep font and recording license notices with any deployment that includes those assets. Retest the localized lesson aliases, header policies, language switching and representative lesson pages after switching deployments.

Offline copies use a content-versioned cache. A new worker version deletes older Tajweed offline caches, and online visits prefer the current network response. A learner who remains offline cannot receive corrections until reconnecting. If offline support is removed entirely during a rollback, serve a retirement worker at the same `/offline-worker.js` URL for one release: delete `tajweed-offline-*` caches and unregister the worker. Simply deleting the worker file does not retire an existing registration.

Study records use the bounded, versioned `tajweed-study-v1` local schema. Backups contain private learner notes and quiz records. Import validates the entire backup, merges lesson records by update time, restores preferences, and retains current quiz sessions when the same session already exists. Source changes invalidate matching saved quiz attempts. Learners can remove study data and offline copies independently. Microphone recordings are held in memory and are not included in backups.
