# DEVLOG — The Days Grimm Podcast

## 2026-06-18 — macbook-thomas — Host photos: new Thomas photo + bg-removed cutouts

Did:
- Replaced Thomas's host photo with new upload (_DSF0568).
- Removed backgrounds on BOTH host photos via `rembg` (u2net_human_seg model) → transparent, square, subject-centered. Assets: `Thomas_Grimm.{png,webp}` + `Brian_Day.{png,webp}` (alpha WebP ~100KB, PNG fallback). Removed old `*_Grimm.jpg`/`*_Day.jpg` (orphaned by switch).
- Reworked `Hosts.tsx` image side: dropped the white-bordered box + artistic gradient frames; now a floating `object-contain` cutout over an on-brand red radial glow (Thomas's chosen direction). Improved `alt` text for SEO.
- Verified: `npm run build` green.

Gotchas:
- `<img>` fallback switched `.jpg` → `.png` (JPG has no alpha). WebP carries the alpha and is what browsers actually load.
- rembg CLI not on PATH but the python module works; model download needs network (ran sandbox-off).

## 2026-06-18 — macbook-thomas — Deep SEO / metadata / structured-data pass

Did (all grounded in the real Apple/iTunes lookup + Buzzsprout RSS — no fabrication, per SEOPLAYBOOK.md):
- **Genre realignment.** Meta + schema described the show as "true crime, horror" — Apple genre + RSS say **Comedy Interviews**. Rewrote `description`, `keywords`, OG/Twitter descriptions, and schema `genre` to match the real positioning (comical/thrilling/controversial comedy interviews, hosted by Brian Day & Thomas Grimm, listen on Spotify/Apple/YouTube).
- **Added RSS feed link** (`rss.buzzsprout.com/1536079.rss`) via `<link rel="alternate" type="application/rss+xml">` — was entirely missing; key for podcast discoverability.
- **Rebuilt JSON-LD as a cross-linked `@graph`**: PodcastSeries (now with real cover-art `image`, `webFeed`, `datePublished` 2020-12-06, accurate genre, expanded `sameAs`) + Organization (`The Days Grimm LLC`) + WebSite, linked by `@id`.
- **Meta polish**: `og:image:type`/`:alt`, `twitter:image:alt`, `robots` → `max-image-preview:large, max-snippet:-1`.
- Verified: JSON-LD parses; `npm run build` green.

Real facts captured for later: 285 episodes (Apple), feed Buzzsprout #1536079, first ep 2020-12-06, active to 2026-06, entity "The Days Grimm LLC", cover art mzstatic URL.

Still recommended (not done — needs decision/UI):
- **Title tag** still says "Indiana's Darkest Stories" (true-crime signal, mismatches comedy-interview genre). Brand call — left for Thomas. Suggest e.g. "The Days Grimm Podcast — Indiana's Comedy Interview Podcast".
- **Visible FAQ section + FAQPage schema** (top AEO win; needs UI, so deferred to the refresh — Google requires FAQ schema to match on-page content).
- **Prerendering/SSR** — site is a client-rendered SPA; head meta + schema are static (good) but body prose is JS-rendered, weak for answer engines that don't run JS. Fix in refresh/Cloudflare phase (Worker SSR or vite prerender).
- **PodcastEpisode schema per episode** — needs prerender/SSR since episodes are dynamic from YouTube.

## 2026-06-18 — macbook-thomas — Quick-win SEO + perf fixes; Cloudflare migration planned

Did:
- **Fixed dead canonical domain.** All SEO metadata pointed to `thedaysgrimmpodcast.com` (does not resolve); live site is `thedaysgrimm.com`. Repointed canonical, OG/Twitter URLs (now absolute), schema.org `url`/publisher/logo, `sitemap.xml`, `robots.txt`, and the Reddit User-Agent in `backend/routes/blog.js` → `https://www.thedaysgrimm.com/` (matches current apex→www redirect).
- **Hero perf.** Removed the blocking preload of both ~9MB hero videos (`Hero.tsx` no longer gates paint behind 18MB + an 800ms/5s timer). Now poster-first (`hero-poster.jpg` / `hero-poster-mobile.jpg`, ffmpeg-extracted) with `preload="metadata"` — instant LCP, video streams in after.
- **Stripped dead/placeholder content.** `content.ts` kept only `hosts` (the only export actually rendered). Removed unused `episodes`, `blogPosts`, fabricated `stats` ("50K+ listeners / 4.8★"), `socialLinks`, `podcastLinks` — none were rendered; the stats were the SEO playbook's #1 anti-pattern (fabricated specifics).
- Wrote `REFRESH_AND_CLOUDFLARE_PLAN.md` (full refresh + Cloudflare migration plan).
- Verified: `npm run build` (tsc -b + vite build) green.

Gotchas:
- Live host does apex→www via **307 (temporary)** on Vercel — should be 308 permanent; fixable in Cloudflare config post-migration. Canonical set to `www.` to match current served URL; revisit apex-vs-www when DNS lands on Cloudflare.
- Instagram handle `instagram.com/thedaysgrimmpodcast/` is a real social URL — intentionally NOT changed.
- `PRODUCTION_DEPLOYMENT.md` still has a stale "replace the domain" checklist line — doc only, left as-is.
- Changes are **uncommitted / unpushed** (pushing main auto-deploys via Vercel — awaiting Thomas's OK).

NEXT:
- Decide commit/push (triggers Vercel deploy of the 3 quick wins).
- Full refresh: visual redesign benchmarked vs top-10 podcast sites; PodcastEpisode + FAQPage schema; answer-first copy.
- Cloudflare migration (account being provisioned, 2–24h DNS; no API token yet): Pages + Worker, KV+Cron cache warming, R2 for hero video, Workers AI show-notes.
- Eventual real blog (D1) — AI-written weekly from each episode, for SEO. Replaces Reddit-as-blog.
