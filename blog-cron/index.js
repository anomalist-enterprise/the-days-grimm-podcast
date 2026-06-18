// Weekly cron: triggers the AI blog generator on the live site.
// (Pages Functions can't host cron triggers, so this standalone Worker does.)
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      fetch('https://www.thedaysgrimm.com/api/blog/generate', {
        method: 'POST',
        headers: { 'x-admin-key': env.BLOG_ADMIN_KEY, 'content-type': 'application/json' },
        body: '{}'
      })
    )
  }
}
