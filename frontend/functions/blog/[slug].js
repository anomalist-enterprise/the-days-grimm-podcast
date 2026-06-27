// GET /blog/<slug> — server-rendered blog post (crawlable; Article schema).
const SITE = 'https://www.thedaysgrimm.com'

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Escape a JSON string for safe embedding inside <script type="application/ld+json">.
// JSON.stringify does not escape '<' or '/', so a value containing '</script>' could
// break out of the script element. These chars only ever appear inside JSON string
// values, so escaping them to \uXXXX keeps the JSON valid and identical when parsed.
const escapeJsonLd = (json = '{}') =>
  String(json)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')

const htmlHeaders = () => ({
  'content-type': 'text/html; charset=utf-8',
  'content-security-policy':
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  'cache-control': 'public, max-age=600'
})

const SHELL = (opts) => {
  const { title, description, canonical, jsonld, main } = opts
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta name="theme-color" content="#dc2626" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:site_name" content="The Days Grimm Podcast" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  :root { --crimson:#dc2626; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0a0a0a; color:#e5e5e5; font-family:'Inter',sans-serif; line-height:1.75; }
  a { color:var(--crimson); text-decoration:none; }
  a:hover { text-decoration:underline; }
  .wrap { max-width:760px; margin:0 auto; padding:48px 20px 96px; }
  .eyebrow { color:var(--crimson); font-weight:600; text-transform:uppercase; letter-spacing:.2em; font-size:.75rem; }
  h1 { font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:.02em; line-height:1.05;
       font-size:clamp(2rem,5vw,3.25rem); color:#fff; margin:.4em 0 .3em; font-weight:400; }
  .meta { color:#888; font-size:.9rem; margin-bottom:2rem; }
  .body p { margin:0 0 1.25rem; }
  .episode { margin-top:3rem; padding:20px; border:1px solid rgba(220,38,38,.3); border-radius:16px; background:rgba(255,255,255,.02); }
  .nav { margin-bottom:2.5rem; }
  .nav a { color:#aaa; font-size:.9rem; }
  footer { margin-top:4rem; color:#666; font-size:.85rem; border-top:1px solid #222; padding-top:1.5rem; }
</style>
<script type="application/ld+json">${escapeJsonLd(jsonld)}</script>
</head>
<body>
<div class="wrap">
<div class="nav"><a href="/">&larr; The Days Grimm</a></div>
${main}
<footer>&copy; 2026 The Days Grimm LLC. &middot; <a href="/#blog">More posts</a> &middot; <a href="/">Home</a></footer>
</div>
</body>
</html>`
}

const renderBody = (body) =>
  String(body || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('\n')

export async function onRequest(context) {
  const { params, env } = context
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  if (!env.DB) return new Response('Not found', { status: 404 })

  let post
  try {
    post = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first()
  } catch {
    post = null
  }

  if (!post) {
    const main = `<p class="eyebrow">404</p><h1>Post not found</h1><p>That post doesn't exist (yet). <a href="/#blog">Browse the blog</a>.</p>`
    return new Response(
      SHELL({ title: 'Not found — The Days Grimm', description: 'Post not found.', canonical: `${SITE}/blog/${esc(slug)}`, jsonld: '{}', main }),
      { status: 404, headers: htmlHeaders() }
    )
  }

  const canonical = `${SITE}/blog/${post.slug}`
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: 'The Days Grimm' },
    publisher: { '@type': 'Organization', name: 'The Days Grimm LLC' },
    mainEntityOfPage: canonical,
    url: canonical
  })

  const main = `
<article>
  <p class="eyebrow">The Days Grimm Blog</p>
  <h1>${esc(post.title)}</h1>
  <div class="meta">${esc(dateStr)}</div>
  <div class="body">${renderBody(post.body)}</div>
  ${
    post.episode_url
      ? `<div class="episode"><strong style="color:#fff">Watch the episode:</strong> <a href="${esc(post.episode_url)}" target="_blank" rel="noopener noreferrer">${esc(post.episode_title || 'On YouTube')}</a></div>`
      : ''
  }
</article>`

  return new Response(
    SHELL({ title: `${post.title} — The Days Grimm`, description: post.excerpt, canonical, jsonld, main }),
    { status: 200, headers: htmlHeaders() }
  )
}
