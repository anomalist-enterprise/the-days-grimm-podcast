# The Days Grimm — Refresh + Cloudflare Migration Plan

_Drafted 2026-06-18 by Claude Code on macbook-thomas. Plan-only for hosting (Cloudflare account being set up). Refresh work pending design sign-off._

## 1. Current state

- **Frontend**: React 19 + Vite 8 + Tailwind 4 + Framer Motion. Single `/` route, stacked sections (Hero → About → Hosts → Episodes → Blog → Contact). Dark horror/glitch theme, primary red `#ff6b6b`/`#cc0000`, Inter font. On **Vercel**.
- **Backend**: Express 5 on **Render** (free tier, cold starts). Two live endpoints:
  - `/api/episodes` — YouTube Data API v3, in-memory cache (4h), 4 recent + upcoming handling. Quota-sensitive.
  - `/api/blog/reddit` — subreddit feed filtered by flair/author, in-memory cache (6h). This is the "blog."
- **Live domain**: `thedaysgrimm.com` → redirects to `www.thedaysgrimm.com` (Vercel).

## 2. Critical issues found (fix regardless of redesign)

1. **Dead canonical domain.** Canonical tag, all OG/Twitter URLs, `sitemap.xml`, `robots.txt`, and schema.org `url` all point to `thedaysgrimmpodcast.com` — which does not resolve. Live site is `thedaysgrimm.com`. This misdirects Google + answer engines to a dead host. **Highest-priority SEO fix.**
2. **Hero blocks first paint on ~18 MB of video.** `Hero.tsx` preloads both `hero.mp4` (9.1 MB) + `hero-mobile.mp4` (8.7 MB) and gates render behind them (min 800ms, 5s fallback). LCP/perf killer.
3. **Likely-fabricated content.** `content.ts` has placeholder blog posts (dated Dec 2024) and stats ("50K+ listeners", "4.8★") that need verification — fabricated specifics are the SEO playbook's #1 anti-pattern and a ranking/citation liability.
4. **Stub sitemap.** One URL, wrong domain, stale `lastmod` 2025-01-07.
5. **Stale hardcoded episodes** in `content.ts` (last July 2025) coexist with the live YouTube API path — sources of truth are split.

## 3. Refresh plan (4 workstreams)

### A. Visual redesign
- Keep the horror/glitch brand identity; modernize execution: typography scale, spacing rhythm, section transitions, mobile polish.
- Replace the blocking video-preload hero with a poster-image-first hero + lazy/`preload="none"` video, `<video poster>` for instant LCP.
- _Direction TBD — see Open Decisions._

### B. Content & data
- Single source of truth for episodes = YouTube API (drop hardcoded `content.ts` episodes or use only as fallback).
- Verify or remove the stats and placeholder blog posts. No fabricated specifics.
- Refresh host bios, links, social handles for accuracy.

### C. Code & performance
- Fix hero video weight (poster + lazy load + R2 hosting, see §4).
- Image pipeline: serve `.webp`/AVIF, correct sizing, `loading="lazy"`.
- Tighten build, remove dead code, confirm Lighthouse passes (`.lighthouserc.json` already present).

### D. SEO & AEO (per ~/Desktop/SEOPLAYBOOK.md)
The playbook is pSEO-at-scale (many-page); for a single-page podcast site we apply its **AEO + technical + no-fabrication** core:
- Fix canonical/OG/sitemap/robots to `thedaysgrimm.com` (pick one host, 301 the other).
- Schema: keep `PodcastSeries`, add `PodcastEpisode` per recent episode + a `FAQPage` block (real Q→A about the show).
- Answer-first copy in About/Hosts; real specifics (Evansville/Indiana, episode count from live data), no invented numbers.
- Real sitemap + valid structured data (Rich Results test).

## 4. Cloudflare migration plan (PLAN ONLY — execute once account is ready)

**Target topology:**
- **Frontend → Cloudflare Pages** (static Vite build). Direct port.
- **Express backend → a single Worker** (`/api/*`). Both routes are plain REST: rewrite `googleapis`→`fetch` (YouTube Data API is REST), `axios`/`xml2js`→`fetch` + light parse for Reddit. CORS handled in Worker.
- **Secrets** (`YOUTUBE_API_KEY`, channel id) → Worker secrets via `wrangler`.

**Selected CF features to build in:**
- **KV + Cron cache warming.** Replace in-memory cache with Workers KV (persistent across restarts → protects YouTube quota). A Cron Trigger refreshes episodes (every ~4h) + Reddit (~6h) so visitors never trigger a cold API call.
- **R2 media hosting.** Move `hero.mp4`/`hero-mobile.mp4` (and episode art) to R2 — zero egress, CDN-served. Frontend points `<video>` at the R2/custom-domain URL.
- **Workers AI show-notes.** New endpoint/Cron that generates episode summaries/show-notes from YouTube title+description (later: transcript) for richer episode cards + AEO content. Grounded in real episode data only.

**Not in scope now** (offered, not selected): D1 blog re-platform, newsletter/Email Routing, Turnstile contact form. Easy to add later — all on the same Worker.

**DNS/cutover** (when account ready): add domain to Cloudflare, recreate `vercel.json` security headers as `_headers`/Worker headers, deploy Pages + Worker, verify, then flip nameservers / 301 from Vercel.

## 5. Suggested sequencing

1. **Quick wins now** (no design dependency): fix canonical domain everywhere, real sitemap, hero perf fix, verify/strip fabricated content. Ships value on the *current* Vercel host immediately.
2. **Refresh** (after design sign-off): visual + content + AEO schema/FAQ.
3. **Cloudflare migration** (after account ready): port to Pages + Worker, KV/Cron, R2, Workers AI.

## 6. Open decisions (need Thomas)

1. **Canonical domain** — confirm `thedaysgrimm.com` (recommended, it's live) vs reviving `thedaysgrimmpodcast.com`. Pick one.
2. **Redesign boldness** — modernize within the current horror/glitch identity (lower risk) vs a bigger reinvention. Need a direction / any references.
3. **Stats & blog posts** — are "50K+ listeners / 4.8★" and the two blog posts real? If not, remove or replace with verifiable numbers.
4. **Blog source** — keep Reddit-as-blog, or is the long-term intent a real blog (D1) later?
