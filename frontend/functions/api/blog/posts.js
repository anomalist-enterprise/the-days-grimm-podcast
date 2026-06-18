// GET /api/blog/posts?limit=12 — list blog posts from D1 for the frontend.
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' }
  })

export async function onRequest(context) {
  const { request, env } = context
  if (!env.DB) return json({ posts: [] })
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10) || 12, 50)
  try {
    const { results } = await env.DB.prepare(
      'SELECT slug, title, excerpt, episode_title, episode_url, published_at FROM posts ORDER BY published_at DESC LIMIT ?'
    )
      .bind(limit)
      .all()
    return json({ posts: results || [] })
  } catch (e) {
    return json({ posts: [], error: String(e).slice(0, 120) })
  }
}
