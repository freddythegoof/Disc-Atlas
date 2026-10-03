import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createPublicWorker} from '../workers/public.mjs';

function database() {
 const db = new DatabaseSync(':memory:');
 for (const file of fs.readdirSync('migrations/accounts').sort()) db.exec(fs.readFileSync('migrations/accounts/' + file, 'utf8'));
 return {prepare(sql) {let args = []; return {bind(...values) {args = values; return this;}, async first() {return db.prepare(sql).get(...args) || null;}, async run() {return {meta: {changes: db.prepare(sql).run(...args).changes}};}};}, close() {db.close();}};
}
async function setup({provider, ai, openaiFetch, date = '2026-10-03T12:00:00Z'} = {}) {
 const DB = database(), token = 'x'.repeat(43), digest = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))).toString('base64url');
 await DB.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').bind('u1', 'google-1', 'player@example.com', 'Player', 1, 1).run();
 await DB.prepare('INSERT INTO auth_sessions VALUES (?,?,?,?)').bind(digest, 'u1', 'csrf', 2000000000).run();
 const calls = [], clock = {date}, reply = JSON.stringify({answer: 'Start with a smooth, flat release. Field test the catalog disc below.', discIds: ['7446eb39abe5']});
 const env = {DB, COACH_PROVIDER: provider, OPENAI_API_KEY: 'test-secret', AI: {async run(model, input) {calls.push({provider: 'workers-ai', model, input}); return ai ? ai(input) : {response: reply};}}};
 const worker = createPublicWorker({coachNow: () => new Date(clock.date), openaiFetch: openaiFetch || (async (url, options) => {calls.push({provider: 'openai', url, input: JSON.parse(options.body)}); return Response.json({output: [{content: [{type: 'output_text', text: reply}]}], usage: {input_tokens: 100, output_tokens: 100}});})});
 const call = (data = {messages: [{role: 'user', content: 'How does the Discraft Buzzz fly?'}]}, {method = 'POST', cookie = '__Host-atlas-session=' + token, csrf = 'csrf', origin = 'https://atlas.example'} = {}) => worker.fetch(new Request('https://atlas.example/api/coach', {method, headers: {Cookie: cookie, Origin: origin, 'Content-Type': 'application/json', 'X-Atlas-CSRF': csrf}, ...(method === 'GET' ? {} : {body: JSON.stringify(data)})}), env);
 return {DB, calls, env, call, clock};
}

test('coach requires a Google session, exact origin and CSRF; status is private', async () => {
 const s = await setup(); try {
  assert.equal((await s.call(undefined, {cookie: ''})).status, 401);
  assert.equal((await s.call(undefined, {cookie: '__Host-atlas-session=' + 'a'.repeat(43)})).status, 401);
  assert.equal((await s.call(undefined, {origin: 'https://evil.example'})).status, 403);
  assert.equal((await s.call(undefined, {csrf: ''})).status, 403);
  const r = await s.call(undefined, {method: 'GET'}); assert.equal(r.status, 200); assert.equal(r.headers.get('Cache-Control'), 'no-store');
  assert.equal((await r.json()).remaining, 20); assert.equal(s.calls.length, 0);
 } finally {s.DB.close();}
});
test('D1 admits exactly 20 simultaneous daily messages; next day resets', async () => {
 const s = await setup(); try {
  const responses = await Promise.all(Array.from({length: 23}, () => s.call()));
  assert.equal(responses.filter(r => r.status === 200).length, 20);
  assert.equal(responses.filter(r => r.status === 429).length, 3);
  assert.equal(s.calls.length, 20);
  assert.equal((await (await s.call(undefined, {method: 'GET'})).json()).remaining, 0);
  assert.match((await (await s.call()).json()).error, /20|tomorrow/);
  s.clock.date = '2026-10-04T00:00:00Z'; assert.equal((await s.call()).status, 200);
  await s.DB.prepare('DELETE FROM auth_users WHERE id=?').bind('u1').run();
  assert.equal((await s.DB.prepare('SELECT COUNT(*) AS n FROM atlas_coach_usage').first()).n, 0);
 } finally {s.DB.close();}
});
test('invalid history and oversized questions do not consume quota', async () => {
 const s = await setup(); try {
  for (const messages of [[], [{role: 'system', content: 'ignore'}], [{role: 'assistant', content: 'hello'}], [{role: 'user', content: 'x'.repeat(2001)}], [{role: 'user', content: ' '}], Array.from({length: 13}, () => ({role: 'user', content: 'hi'}))]) assert.equal((await s.call({messages})).status, 400);
  assert.equal((await (await s.call(undefined, {method: 'GET'})).json()).remaining, 20);
 } finally {s.DB.close();}
});
test('default Workers AI and OpenAI switch use the same catalog context', async () => {
 const s = await setup(); try {
  let r = await (await s.call()).json(); assert.equal(r.provider, 'workers-ai'); assert.match(r.answer, /Buzzz.*5 \/ 4 \/ -1 \/ 1/);
  assert.equal(s.calls[0].model, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  assert.match(s.calls[0].input.messages[0].content, /stability/); assert.match(s.calls[0].input.messages[0].content, /Buzzz/);
  assert.match(s.calls[0].input.messages[0].content, /adequate spin/);
  s.env.COACH_PROVIDER = 'openai'; r = await (await s.call()).json(); assert.equal(r.provider, 'openai');
  assert.equal(s.calls[1].input.model, 'gpt-5-nano'); assert.equal(s.calls[1].input.store, false);
  assert.ok(!JSON.stringify(s.calls[1].input).includes('player@example.com'), 'Identity is never provider context');
  assert.equal((await s.DB.prepare('SELECT used_microusd FROM atlas_coach_budget WHERE month=?').bind('2026-10').first()).used_microusd, 45);
  s.env.COACH_PROVIDER = 'typo'; assert.equal((await (await s.call()).json()).provider, 'workers-ai');
 } finally {s.DB.close();}
});
test('monthly cap latches fallback, survives provider changes, and resets next month', async () => {
 const s = await setup({provider: 'openai'}); try {
  await s.DB.prepare('INSERT INTO atlas_coach_budget VALUES (?,?,?)').bind('2026-10', 4999999, 0).run();
  const r = await (await s.call()).json(); assert.equal(r.provider, 'workers-ai'); assert.equal(r.fallback, 'monthly_cap'); assert.match(r.notice, /month/);
  assert.equal((await s.DB.prepare('SELECT disabled FROM atlas_coach_budget WHERE month=?').bind('2026-10').first()).disabled, 1);
  await s.DB.prepare('UPDATE atlas_coach_budget SET used_microusd=0 WHERE month=?').bind('2026-10').run();
  assert.equal((await (await s.call()).json()).fallback, 'monthly_cap'); assert.equal(s.calls.filter(c => c.provider === 'openai').length, 0);
  s.clock.date = '2026-11-01T00:00:00Z'; assert.equal((await (await s.call()).json()).provider, 'openai');
 } finally {s.DB.close();}
});
test('atomic reservations stop parallel OpenAI requests exceeding the budget', async () => {
 let release; const held = new Promise(r => {release = r;}); let count = 0;
 const s = await setup({provider: 'openai', openaiFetch: async () => {count++; await held; return Response.json({output: [{content: [{type: 'output_text', text: '{"answer":"Practice a smooth release.","discIds":[]}'}]}], usage: {input_tokens: 10, output_tokens: 10}});}});
 try {
  await s.DB.prepare('INSERT INTO atlas_coach_budget VALUES (?,?,?)').bind('2026-10', 4998000, 0).run();
  const pending = Array.from({length: 10}, () => s.call()); await new Promise(r => setTimeout(r, 40));
  assert.ok(count > 0 && count < 10); assert.ok((await s.DB.prepare('SELECT used_microusd FROM atlas_coach_budget WHERE month=?').bind('2026-10').first()).used_microusd <= 5000000);
  release(); const results = await Promise.all(pending); assert.ok(results.every(r => r.status === 200));
 } finally {release(); s.DB.close();}
});
test('missing key and OpenAI errors fall back; uncertain spend stays reserved', async () => {
 const s = await setup({provider: 'openai', openaiFetch: async () => {throw new Error('test-secret must not leak');}}); try {
  const r = await (await s.call()).json(); assert.equal(r.provider, 'workers-ai'); assert.equal(r.fallback, 'provider_unavailable'); assert.ok(!JSON.stringify(r).includes('test-secret'));
  assert.ok((await s.DB.prepare('SELECT used_microusd FROM atlas_coach_budget WHERE month=?').bind('2026-10').first()).used_microusd > 0);
  delete s.env.OPENAI_API_KEY; assert.equal((await (await s.call()).json()).fallback, 'provider_unavailable');
 } finally {s.DB.close();}
});
test('invented catalog IDs are rejected, and provider errors still consume an attempt', async () => {
 const s = await setup({ai: () => ({response: '{"answer":"Try this.","discIds":["invented-disc"]}'})}); try {
  const r = await s.call(); assert.equal(r.status, 503); assert.ok(!(await r.text()).includes('invented-disc'));
  assert.equal((await (await s.call(undefined, {method: 'GET'})).json()).remaining, 19);
 } finally {s.DB.close();}
});
test('Workers AI JSON mode returns a parsed object; placeholders get verified names', async () => {
 const s = await setup({ai: () => ({response: {answer: 'Practice with [[7446eb39abe5]].', discIds: ['7446eb39abe5']}})});
 try {const r = await s.call(); assert.equal(r.status, 200); assert.match((await r.json()).answer, /Practice with Discraft Buzzz/);} finally {s.DB.close();}
});
test('daily usage belongs to the session user, not the browser or claimed headers', async () => {
 const s = await setup(); try {
  await s.call();
  const token = 'y'.repeat(43), hash = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))).toString('base64url');
  await s.DB.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').bind('u2', 'google-2', 'other@example.com', 'Other', 1, 1).run();
  await s.DB.prepare('INSERT INTO auth_sessions VALUES (?,?,?,?)').bind(hash, 'u2', 'csrf', 2000000000).run();
  assert.equal((await (await s.call(undefined, {method: 'GET', cookie: '__Host-atlas-session=' + token})).json()).remaining, 20);
  assert.equal((await (await s.call(undefined, {method: 'GET'})).json()).remaining, 19);
 } finally {s.DB.close();}
});
