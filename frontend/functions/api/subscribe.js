// POST /api/subscribe  { email, hp?, source? }
// Stores newsletter signups in D1. Honeypot (hp) + basic validation for spam,
// plus a per-IP rate limit (reuses the EPISODES_CACHE KV under a distinct key prefix
// so no new binding is needed) to stop bots that just omit the honeypot field.
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254

const RATE_LIMIT_MAX = 5 // submissions
const RATE_LIMIT_WINDOW = 3600 // seconds (1 hour)

// Returns true if this IP is over the limit. Fails open (no throttling) if the
// KV binding is unavailable or errors, so an outage never blocks real signups.
async function isRateLimited(kv, ip) {
  if (!kv || !ip) return false
  try {
    const key = `ratelimit:subscribe:${ip}`
    const count = parseInt((await kv.get(key)) || '0', 10)
    if (count >= RATE_LIMIT_MAX) return true
    await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW })
    return false
  } catch (e) {
    console.error('rate limit check failed:', e)
    return false
  }
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!env.DB) return json({ error: 'no DB binding' }, 500)

  const ip = request.headers.get('CF-Connecting-IP')
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
