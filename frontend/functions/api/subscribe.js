// POST /api/subscribe  { email, hp?, source? }
// Stores newsletter signups in D1. Honeypot (hp) + basic validation for spam.
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!env.DB) return json({ error: 'no DB binding' }, 500)

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
    return json({ error: 'Something went wrong. Try again.', message: String(e).slice(0, 100) }, 500)
  }
}
