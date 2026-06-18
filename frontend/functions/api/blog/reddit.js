// Cloudflare Pages Function — GET /api/blog/reddit
// Reads "Official Blog"-flaired posts from r/thedaysgrimm. KV-cached.
// Returns { posts: [...] } matching the frontend RedditBlogResponse.
// Note: Reddit can rate-limit/abuse-block datacenter IPs; on failure this
// returns an empty list gracefully (the blog section shows its empty state).

const SUBREDDIT = 'thedaysgrimm'
const DEFAULT_FLAIR = 'Official Blog'
const TTL = 6 * 3600 // 6 hours

const pickThumb = (d) => {
  try {
    const s = d?.preview?.images?.[0]?.source?.url
    if (s) return s.replace(/&amp;/g, '&')
  } catch {
    /* noop */
  }
  const u = d?.url_overridden_by_dest || d?.url
  if (typeof u === 'string' && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(u)) return u
  return null
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${TTL}` }
  })

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 25)
  const flair = url.searchParams.get('flair') ?? DEFAULT_FLAIR
  const author = url.searchParams.get('author') || ''
  const kv = env.EPISODES_CACHE
  const cacheKey = `blog:${SUBREDDIT}:${flair}:${author}:${limit}`

  try {
    if (kv) {
      const cached = await kv.get(cacheKey)
      if (cached) return json(JSON.parse(cached))
    }

    const terms = [`flair_name:"${flair}"`]
    if (author) terms.push(`author:${author}`)
    const q = encodeURIComponent(terms.join(' '))
    const api = `https://www.reddit.com/r/${SUBREDDIT}/search.json?q=${q}&restrict_sr=1&sort=new&limit=${limit}`

    const res = await fetch(api, {
      headers: {
        'User-Agent': 'web:thedaysgrimm-site:1.0 (+https://www.thedaysgrimm.com)',
        Accept: 'application/json'
      }
    })
    if (!res.ok) throw new Error(`reddit ${res.status}`)
    const data = await res.json()

    const posts = (data?.data?.children || [])
      .map(({ data: d }) => ({
        id: d.id,
        title: d.title,
        selftext: (d.selftext || '').slice(0, 500),
        url: `https://www.reddit.com${d.permalink}`,
        createdUtc: d.created_utc,
        author: d.author,
        flair: d.link_flair_text || null,
        thumbnail: pickThumb(d)
      }))
      .filter((p) => p.id)

    const payload = { posts }
    if (kv && posts.length) await kv.put(cacheKey, JSON.stringify(payload), { expirationTtl: TTL })
    return json(payload)
  } catch (e) {
    return json({ posts: [], error: 'unavailable', message: String(e).slice(0, 120) })
  }
}
