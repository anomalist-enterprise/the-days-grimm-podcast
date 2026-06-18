// GET /sitemap.xml — homepage + every blog post from D1 (so posts get discovered/indexed).
const SITE = 'https://www.thedaysgrimm.com'

export async function onRequest(context) {
  const { env } = context
  let posts = []
  try {
    const { results } = await env.DB.prepare(
      'SELECT slug, published_at FROM posts ORDER BY published_at DESC'
    ).all()
    posts = results || []
  } catch {
    posts = []
  }

  const urls = [`  <url><loc>${SITE}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`]
  for (const p of posts) {
    const lastmod = p.published_at ? `<lastmod>${String(p.published_at).slice(0, 10)}</lastmod>` : ''
    urls.push(
      `  <url><loc>${SITE}/blog/${p.slug}</loc>${lastmod}<changefreq>monthly</changefreq><priority>0.7</priority></url>`
    )
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'content-type': 'application/xml', 'cache-control': 'public, max-age=3600' }
  })
}
