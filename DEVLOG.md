# DEVLOG — The Days Grimm Podcast

## 2026-07-23 — sentinel — fix #15658: tighten CSP script-src (drop unsafe-inline/unsafe-eval)
- `frontend/public/_headers`, `vercel.json`, `vite.config.prod.ts`: script-src narrowed from `'self' 'unsafe-inline' 'unsafe-eval'` to `'self'`. No inline `<script>` JS or eval/`new Function` usage found in `frontend/src`; the app's only entry point is the external module script `/src/main.tsx`, so this shouldn't change runtime behavior.
- style-src left untouched (Tailwind/inline styles still need `'unsafe-inline'` there).
- Lane: 2 (awaiting Chris) — no test suite in repo to confirm, so wants a human look/prod smoke test before merge.
- PR: #122
- (Thanks Sentinel — standing red-team. See finding #15658.)

## 2026-06-26 — sentinel — fix #6710: stop leaking internal error/config details to clients
- subscribe.js / blog/generate.js / blog/posts.js now return a generic error and log the real exception via console.error server-side (removed `message`/`error: String(e)` fields).
- backend/routes/blog.js: dropped the `debug` object (subreddit config + upstream status) and raw exception text from the `/api/blog/reddit` responses; debug info is logged server-side only.
- Lane: 2 (awaiting Chris) — SAST code change, no test suite in repo.
- PR: #103
- (Thanks Sentinel — standing red-team. See finding #6710.)

## 2026-06-24 — sentinel — fix #5758: escape JSON-LD before embedding in SSR blog page
- `functions/blog/[slug].js`: added `escJsonLd()` that escapes `<`, `>`, `&` to `\uXXXX` and applied it to the `application/ld+json` script body. `JSON.stringify` doesn't escape `</script>`, so a post field containing it could break out and run stored XSS. JSON stays valid + parses unchanged.
- Lane: 2 (awaiting Chris) — SAST code change, no automated test suite to confirm behavior.
- PR: #102
- (Thanks Sentinel — standing red-team. Future devs: keep ld+json field values escaped for HTML script context.)

## 2026-06-18 — macbook-thomas — D1 AI-written blog (final feature) + weekly cron

Did:
- **D1 database** `the-days-grimm-blog` (id 11d4b7e3-18bd-4764-a66c-c64791f07149), table `posts` (schema.sql). Bound to Pages as `DB`; Workers AI bound as `AI` (wrangler.toml).
- **Generator** `functions/api/blog/generate.js` (POST, header `x-admin-key` = Pages secret BLOG_ADMIN_KEY, also in ~/.config/tdg/cloudflare.env): picks newest episode without a post, Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) writes an SEO post grounded ONLY in episode title+description (no fabrication), stores in D1. NOTE: model returns delimited TITLE/EXCERPT/BODY (NOT JSON — multi-line body broke JSON.parse; that was the first-attempt bug).
- **List** `functions/api/blog/posts.js` (GET, from D1). **SSR post pages** `functions/blog/[slug].js` — full branded HTML, Article JSON-LD + canonical + OG (the real SEO win; crawlable, unlike the SPA). Removed `functions/api/blog/reddit.js`.
- **Blog.tsx + services/blog.ts** rewritten: reads /api/blog/posts, cards link to /blog/<slug>. Seeded 3 posts (#267/#266/#265). VERIFIED rendering.
- **Weekly cron**: standalone Worker `~/the-days-grimm-podcast/blog-cron/` (`tdg-blog-cron`, cron `0 14 * * 1` Mon 14:00 UTC) POSTs the generate endpoint. Gotcha: cron schedule 403'd until a **workers.dev subdomain** was registered for the account (did it: subdomain "thedaysgrimm"); worker has workers_dev=false.

Blog is now fully built + automated (was the last open item). NEXT (optional): sitemap should include /blog/<slug> (currently static single-URL); content-quality review (cross-vendor judge per SEOPLAYBOOK); delete Vercel project.

## 2026-06-18 — macbook-thomas — Cloudflare migration phase 2: backend as Pages Functions + cutover

Did:
- **Episodes backend → Pages Function** `functions/api/episodes.js`: keyless, reads the "Full Length Episodes" playlist RSS (PLEU_P6cu46UblHKQr3cADL3nIxWNoUddq), parses to Episode[], KV-cached (1h). VERIFIED on pages.dev: 15 eps, #267 featured, real dates/thumbnails. Render backend replaced for episodes.
- **Hero embed** repointed to the Full Length Episodes playlist (no Shorts).
- **Blog → Pages Function** `functions/api/blog/reddit.js` (r/thedaysgrimm, flair "Official Blog", KV-cached). BUT Reddit **403s Cloudflare IPs** — returns {posts:[]} gracefully → Blog section shows its "Coming Soon" state. Decision: cut over now with "Coming soon" blog; real blog = D1 AI-written (next).
- **wrangler.toml** (Pages: pages_build_output_dir=dist, KV binding EPISODES_CACHE id 86cb8728…).
- Blog playlists for reference: Full Length=PLEU_P6cu46UblHKQr3cADL3nIxWNoUddq, DOTW=PLEU_P6cu46UbwTka6USmepiRYbmzGNnRk, Comedy Cache=PLEU_P6cu46UZuBj4TlINjFmkDbIetyGUK.

Cutover (live DNS): apex A 216.198.79.1 + www CNAME 91f219462bd02a6f.vercel-dns-017.com → repointed to the-days-grimm.pages.dev. ROLLBACK = restore those two values (apex was A type). Email/TXT (DMARC/DKIM/SPF/_vercel) left untouched.

**CUTOVER COMPLETE 2026-06-18**: both thedaysgrimm.com + www live on Cloudflare Pages (200, /api/episodes serving 15 eps from KV-cached Pages Function). apex→www 301 via `functions/_middleware.js` (token lacks redirect-rule perms, so done in-code). Pages custom-domain status: www active, apex serving (status flag lagged). Vercel now bypassed (project still exists — delete after a few days of confidence). NEXT: D1 AI-written blog (re-enable Blog section); optional delete Vercel project; optional R2 for hero video.

## 2026-06-18 — macbook-thomas — Cloudflare migration: frontend live on Pages (phase 1)

State of the Cloudflare account (token works; stored at ~/.config/tdg/cloudflare.env, chmod 600, OUTSIDE repo — not committed):
- **Zone thedaysgrimm.com is ALREADY ACTIVE on Cloudflare** (NS peaches/vern.ns.cloudflare.com; was Google Domains). DNS today: apex `A 216.198.79.1` + `www CNAME …vercel-dns` (both proxied) → still serving the Vercel site. Email records (DMARC/DKIM/SPF) present — must NOT touch on cutover.
- Account ID cc756da0…; Zone ID e517dc97… (non-secret; in env file).

Did (all NON-destructive — live Vercel site untouched):
- Created **KV namespace** EPISODES_CACHE (id 86cb87280cf843a3b450c4d2040d0ca4).
- Created **Pages project** `the-days-grimm` and deployed the frontend build → **https://the-days-grimm.pages.dev** (verified: 200, security headers applied, Anton renders under CSP, YouTube latest-episode embed loads).
- **CSP fix**: added `https://fonts.googleapis.com` (style-src) + `https://fonts.gstatic.com` (font-src) to vercel.json AND new `frontend/public/_headers` — fonts were at risk of being blocked once CSP enforced. Added `_redirects` (`/* /index.html 200`) for SPA.

Blocked / decisions:
- **R2 NOT enabled** (API can't enable; dashboard toggle). BUT not needed — Pages CDN serves hero.mp4 fine; R2 deferred as pure optimization.
- **Backend not migrated yet.** Plan: Pages Functions `functions/api/episodes` + `functions/api/blog/reddit` with KV cache (same Pages project, same-origin /api, no CORS, no separate Worker). DECISION NEEDED: episodes via YouTube Data API (needs YOUTUBE_API_KEY secret; keeps viewCount/duration/upcoming) vs keyless RSS feed (no quota/secret; loses upcoming + durations).
- **Hero embed shows newest upload incl. Shorts** (currently a #shorts). If they have a dedicated episodes playlist, point embed at that.

NEXT: (1) backend decision → build Pages Functions; (2) cutover apex+www DNS to Pages (CONFIRM-FIRST, live-affecting; keep email records); (3) later D1 blog + Workers AI.

Uncommitted: vercel.json (CSP), frontend/public/_headers, frontend/public/_redirects, this DEVLOG.

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
