// Cloudflare Pages Function — GET /api/episodes
// Keyless: reads the "Full Length Episodes" YouTube playlist RSS feed
// (no API key, no quota). KV-cached. Returns Episode[] matching the frontend.

const PLAYLIST_ID = 'PLEU_P6cu46UblHKQr3cADL3nIxWNoUddq'
const FEED = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`
const CACHE_KEY = 'episodes:fulllength:v1'
const TTL = 3600 // 1 hour

const unescapeXml = (s = '') =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? unescapeXml(m[1].trim()) : ''
}

function parseFeed(xml) {
  return xml
    .split('<entry>')
    .slice(1)
    .map((raw) => {
      const block = raw.split('</entry>')[0]
      const videoId = pick(block, 'yt:videoId')
      let title = pick(block, 'title')
      const published = pick(block, 'published')
      const description = pick(block, 'media:description').replace(/\s+/g, ' ').slice(0, 300)
      const thumbMatch = block.match(/<media:thumbnail[^>]*url="([^"]+)"/)
      const thumbnail = thumbMatch
        ? thumbMatch[1]
        : videoId
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : ''

      // Pull an "Ep. 267" style number out of the title and strip it from the display title.
      let number = ''
      const num = title.match(/\bEp\.?\s*#?(\d+)\b/i)
      if (num) {
        number = `#${num[1]}`
        title = title.replace(/^\s*Ep\.?\s*#?\d+[\s:–—-]*/i, '').trim()
      }

      const ts = published ? Date.parse(published) : 0
      return {
        id: videoId,
        number,
        title,
        description,
        date: ts
          ? new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '',
        duration: '',
        thumbnail,
        viewCount: '',
        featured: false,
        youtubeUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#',
        spotifyUrl: null,
        applePodcastUrl: null,
        isUpcoming: false,
        sortTimestamp: ts
      }
    })
    .filter((e) => e.id)
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${TTL}` }
  })

export async function onRequest(context) {
  const kv = context.env.EPISODES_CACHE
  try {
    if (kv) {
      const cached = await kv.get(CACHE_KEY)
      if (cached) return json(JSON.parse(cached))
    }
    const res = await fetch(FEED, {
      headers: { 'User-Agent': 'TheDaysGrimm/1.0 (+https://www.thedaysgrimm.com)' }
    })
    if (!res.ok) throw new Error(`feed ${res.status}`)
    const xml = await res.text()
    const eps = parseFeed(xml).sort((a, b) => b.sortTimestamp - a.sortTimestamp)
    if (eps.length) eps[0].featured = true
    if (kv && eps.length) await kv.put(CACHE_KEY, JSON.stringify(eps), { expirationTtl: TTL })
    return json(eps)
  } catch {
    return json([]) // graceful: empty list -> frontend shows its empty state
  }
}
