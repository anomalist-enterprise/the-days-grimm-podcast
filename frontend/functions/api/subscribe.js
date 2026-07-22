// POST /api/subscribe  { email, hp?, source? }
// Stores newsletter signups in D1. Honeypot (hp) + basic validation for spam,
// plus a per-IP rate limit (reuses the existing EPISODES_CACHE KV binding —
// no new wrangler.toml binding needed) to stop scripted flooding.
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254

// Fixed-window per-IP limit. KV is eventually-consistent, not atomic, so this
// is a best-effort abuse deterrent, not a hard guarantee — sufficient here
// since the goal is stopping naive flood scripts, not a strict quota.
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60 // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5 // per IP per window

async function isRateLimited(kv, ip) {
  if (!kv || !ip) return false // fail open if KV or IP is unavailable
  const key = `ratelimit:subscribe:${ip}`
  const count = parseInt((await kv.get(key)) || '0', 10)
  if (count >= RATE_LIMIT_MAX_REQUESTS) return true
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS })
  return false
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!env.DB) return json({ error: 'no DB binding' }, 500)

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || ''
  if (await isRateLimited(env.EPISODES_CACHE, ip)) {
    return json({ error: 'Too many requests. Please try again later.' }, 429)
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    /* noop */
  }

  // Honeypot: bots fill hidden fields — silently accept so they don't retry.
  if (body.hp) return json({ ok: true })

  const email = String(body.email || '').trim().toLowerCase()
  if (!validEmail(email)) return json({ error: 'Please enter a valid email.' }, 400)
  const source = String(body.source || 'site').slice(0, 40)

  try {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO subscribers (email, source, created_at) VALUES (?, ?, ?)'
    )
      .bind(email, source, new Date().toISOString())
      .run()
    return json({ ok: true })
  } catch (e) {
    console.error('subscribe failed:', e)
    return json({ error: 'Something went wrong. Try again.' }, 500)
  }
}
