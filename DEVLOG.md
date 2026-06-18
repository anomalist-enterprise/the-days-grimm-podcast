# DEVLOG — The Days Grimm Podcast

## 2026-06-18 — macbook-thomas — Visual redesign (round 2): FAQ + AEO + section polish

Did:
- **New FAQ section** (`Faq.tsx`): 7 real, grounded Q&A (positioning, hosts, where-to-listen, guests, cadence, location, contact) as a crimson accordion. Answers stay mounted (height-collapsed) so text is crawlable. Added to Home (before Contact) and to nav.
- **FAQPage JSON-LD** added to the index.html `@graph` (now PodcastSeries + Organization + WebSite + FAQPage), text matched 1:1 to the visible section — top AEO win for ChatGPT/Perplexity citation.
- **About**: pillar icons `text-red-400` → `text-primary` (crimson).
- **Contact**: footer copyright `© 2025 The Days Grimm Podcast` → `© 2026 The Days Grimm LLC` (matches RSS).
- Verified: JSON-LD valid (4 entities, 7 questions); `npm run build` green. Screenshotted FAQ/Hosts/About via playwright-core driving installed Chrome (channel:'chrome', no browser download) — `vite preview` + `document.getElementById(id).scrollIntoView()` (plain hash anchors don't scroll in headless on this SPA).

Notes / NEXT:
- Hosts cutouts + red glow and new Thomas photo confirmed rendering in real Chrome.
- Screenshot harness lives at /tmp/shoot.js (playwright-core in /tmp/node_modules) — reusable for future visual checks.
- Round 3 candidates: "start-here" featured episode; Blog visual polish; Episodes still runtime-depends on Render backend (cold start) — fold into Worker/KV migration.

## 2026-06-18 — macbook-thomas — Visual redesign (round 1) benchmarked vs top podcast sites

Direction (Thomas's picks): blood-crimson palette · bold display headings + Inter body · embed latest YouTube episode in hero. Researched top-10 podcast sites (HEARD model; hero must let you listen in <5s, don't bounce visitors to Spotify).

Did:
- **Design tokens** (`index.css`): primary → blood-crimson (#dc2626/#ef4444/#991b1b); added `--font-display: Anton` (Google Fonts) + base rule applying it (uppercase, tracking) to all h1/h2; recolored scrollbar + glitch accents.
- **Hero** rewrite: display title ("THE DAYS / GRIMM", GRIMM in crimson), eyebrow, three-pillar line, Browse/Subscribe CTAs, "Listen on" Spotify/Apple/YouTube row, and an always-latest **YouTube embed** via uploads playlist `UUHHNbhsJepjr0rsWh1FNjgQ` (UC→UU; no backend/API-key dependency). Kept poster-first video bg. Fixed mobile overflow (stacked GRIMM, tamed eyebrow tracking).
- **Nav**: persistent crimson Subscribe CTA (desktop + mobile menu).
- **Episodes/Hosts**: swapped jarring white borders/glows (`border-white/60`, `shadow-white/*`) → subtle crimson/black on dark.
- **CSP fix** (`vercel.json`): added `frame-src https://www.youtube-nocookie.com https://www.youtube.com` — without it the hero embed is blocked in prod.
- Verified: `npm run build` green; screenshotted hero desktop+mobile via headless Chrome on `vite preview`.

Channel ID: UCHHNbhsJepjr0rsWh1FNjgQ (uploads playlist UU…). Embed uses youtube-nocookie.

NEXT (redesign round 2, not yet done): apply display type/crimson polish to About/Blog/Contact; consider a "featured/start-here" episode; FAQ section (+FAQPage schema) for AEO; Episodes section still depends on Render backend at runtime (cold-start risk) — candidate for the Worker/KV migration.

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
