import assert from 'node:assert/strict';
import worker from '../workers/public.mjs';

for (const path of ['/api/account', '/api/bag', '/api/coach', '/signin-with-chatgpt', '/callback']) {
  const response = await worker.fetch(new Request(`https://atlas.example${path}`, {
    headers: {'oai-authenticated-user-id': 'forged', 'oai-authenticated-user-email': 'forged@example.com'},
  }));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match((await response.json()).error, /unavailable/);
}
assert.equal((await worker.fetch(new Request('https://atlas.example/missing'))).status, 404);
console.log('Standalone Worker rejects account and coach requests, including forged identity headers.');
