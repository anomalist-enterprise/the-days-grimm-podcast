// Canonical host: redirect apex -> www (301), preserving path + query.
export async function onRequest(context) {
  const url = new URL(context.request.url)
  if (url.hostname === 'thedaysgrimm.com') {
    url.hostname = 'www.thedaysgrimm.com'
    return Response.redirect(url.toString(), 301)
  }
  return context.next()
}
