// Static assets are served by Cloudflare before this handler runs.
// Sites identity headers are not trusted on a public workers.dev origin.
export default {
  fetch(request) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/') || ['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(path)) {
      return Response.json({error: 'Accounts, saved bags, and the AI coach are unavailable on this public atlas.'}, {
        status: 503,
        headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'},
      });
    }
    return new Response('Not found', {status: 404});
  },
};
