import {createAuth} from './auth.mjs';
import {createCoach} from './coach.mjs';
import {createBag} from './bag.mjs';

// Public accounts use Google-backed cookies; Sites identity headers remain untrusted.
export function createPublicWorker(options) {
 const auth = createAuth(options);
 const coach = createCoach(auth, options);
 const bag = createBag(auth);
 return {
  async fetch(request, env = {}) {
    const path = new URL(request.url).pathname;
    if (path === '/api/bag' || path.startsWith('/api/bag/')) return bag.fetch(request, env);
    if (path === '/api/coach') return coach.fetch(request, env);
    if (path === '/api/account' || path.startsWith('/auth/')) return auth.fetch(request, env);
    if (['/signin', '/profile', '/account-settings'].includes(path)) {
      if (!env.ASSETS) return new Response('Not found', {status: 404});
      // Use the canonical asset path so HTML handling keeps the requested account URL.
      const response = await env.ASSETS.fetch(new Request(new URL('/account-page', request.url), request));
      const headers = new Headers(response.headers);headers.set('Cache-Control', 'no-store');
      return new Response(response.body, {status: response.status, headers});
    }
    if (path.startsWith('/api/') || ['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(path)) {
      return Response.json({error: 'Saved bags and the AI coach are not connected on this public atlas yet.'}, {
        status: 503,
        headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'},
      });
    }
    return new Response('Not found', {status: 404});
  },
 };
}
export default createPublicWorker();
