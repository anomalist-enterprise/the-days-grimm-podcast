// POST /api/blog/generate  — admin-only (header x-admin-key).
// Generates an SEO blog post from a podcast episode with Workers AI and stores it in D1.
// Body (optional JSON): { "videoId": "..." } to target a specific episode;
// otherwise writes about the newest episode that doesn't have a post yet.

const PLAYLIST_ID = 'PLEU_P6cu46UblHKQr3cADL3nIxWNoUddq'
const FEED = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`
const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

const unescapeXml = (s = '') =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&')
const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? unescapeXml(m[1].trim()) : ''
}
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

async function fetchEpisodesRaw() {
  const res = await fetch(FEED, {
    headers: { 'User-Agent': 'TheDaysGrimm/1.0 (+https://www.thedaysgrimm.com)' }
  })
  if (!res.ok) throw new Error(`feed ${res.status}`)
  const xml = await res.text()
  return xml
    .split('<entry>')
    .slice(1)
    .map((raw) => {
      const b = raw.split('</entry>')[0]
      const videoId = pick(b, 'yt:videoId')
      const title = pick(b, 'title')
      const description = pick(b, 'media:description').replace(/\s+/g, ' ').trim()
      const published = pick(b, 'published')
      return { videoId, title, description, ts: published ? Date.parse(published) : 0 }
    })
    .filter((e) => e.videoId)
    .sort((a, b) => b.ts - a.ts)
}

async function generatePost(env, ep) {
  const sys =
    'You write the blog for "The Days Grimm", an Indiana comedy interview podcast (comical, thrilling, controversial) hosted by Brian Day and Thomas Grimm. Write a short post that recaps and teases one specific episode so it gets found in search. HARD RULES: write ONLY from the supplied episode title and description — never invent guests, names, quotes, facts, dates, or numbers that are not given. Real human voice; no AI cliches (no "in today\'s world", "dive in", "buckle up", "without further ado"). Open the first sentence with the concrete subject so a search engine can quote it. ~350-500 words, plain engaging prose, no markdown headings or bullet points.'
  const user =
    `Episode title: ${ep.title}\nEpisode description: ${ep.description || '(none provided)'}\n\n` +
    'Output EXACTLY this format and nothing before or after it:\n' +
    'TITLE: <an SEO post title, ~60-70 characters, NOT identical to the episode title>\n' +
    'EXCERPT: <one hooky sentence, max ~160 characters>\n' +
    'BODY:\n' +
    '<the post — plain-text paragraphs separated by blank lines>'

  const out = await env.AI.run(MODEL, {
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ],
    max_tokens: 1200,
    temperature: 0.7
  })
  const text = String((out && (out.response ?? out.result)) || '').trim()

  const clean = (s) => s.trim().replace(/^["']|["']$/g, '')
  const titleM = text.match(/TITLE:\s*(.+)/i)
  const exM = text.match(/EXCERPT:\s*(.+)/i)
  const bodyM = text.match(/BODY:\s*([\s\S]+)/i)

  const title = clean(titleM ? titleM[1] : ep.title).slice(0, 120)
  const excerpt = clean(exM ? exM[1] : ep.description || ep.title).slice(0, 200)
  let body = (bodyM ? bodyM[1] : text).trim()
  // drop any stray label lines that leaked into the body
  body = body
    .split('\n')
    .filter((l) => !/^\s*(TITLE|EXCERPT|BODY)\s*:/i.test(l))
    .join('\n')
    .trim()
    .slice(0, 8000)

  return { title, excerpt, body }
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!env.BLOG_ADMIN_KEY || request.headers.get('x-admin-key') !== env.BLOG_ADMIN_KEY)
    return json({ error: 'unauthorized' }, 401)
  if (!env.DB) return json({ error: 'no DB binding' }, 500)
  if (!env.AI) return json({ error: 'no AI binding' }, 500)

  try {
    const body = await request.json().catch(() => ({}))
    const eps = await fetchEpisodesRaw()
    if (!eps.length) return json({ error: 'no episodes' }, 502)

    let target
    if (body.videoId) {
      target = eps.find((e) => e.videoId === body.videoId)
    } else {
      for (const e of eps) {
        const exists = await env.DB.prepare('SELECT 1 FROM posts WHERE episode_video_id = ?')
          .bind(e.videoId)
          .first()
        if (!exists) {
          target = e
          break
        }
      }
    }
    if (!target) return json({ message: 'no new episode to write about' })

    const gen = await generatePost(env, target)
    let slug = slugify(gen.title) || slugify(target.title) || `episode-${target.videoId}`
    const clash = await env.DB.prepare('SELECT 1 FROM posts WHERE slug = ?').bind(slug).first()
    if (clash) slug = `${slug}-${target.videoId.slice(0, 6).toLowerCase()}`

    await env.DB.prepare(
      `INSERT INTO posts (slug, title, excerpt, body, episode_video_id, episode_title, episode_url, published_at)
       VALUES (?,?,?,?,?,?,?,?)`
    )
      .bind(
        slug,
        gen.title,
        gen.excerpt,
        gen.body,
        target.videoId,
        target.title,
        `https://www.youtube.com/watch?v=${target.videoId}`,
        new Date().toISOString()
      )
      .run()

    return json({ ok: true, slug, title: gen.title, episode: target.title })
  } catch (e) {
    return json({ error: 'generation failed', message: String(e).slice(0, 200) }, 500)
  }
}
