import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createPublicWorker} from '../workers/public.mjs';

function database() {
 const db = new DatabaseSync(':memory:');
 for (const file of fs.readdirSync('migrations/accounts').sort()) db.exec(fs.readFileSync('migrations/accounts/' + file, 'utf8'));
 return {prepare(sql) {let args = []; return {bind(...values) {args = values; return this;}, async first() {return db.prepare(sql).get(...args) || null;}, async all() {return {results: db.prepare(sql).all(...args)};}, async run() {return {meta: {changes: db.prepare(sql).run(...args).changes}};}};}, close() {db.close();}};
}
function setup({time = Date.UTC(2026, 10, 6, 12)} = {}) {
 const DB = database(), clock = {time}, worker = createPublicWorker({discRequestNow: () => clock.time}), env = {DB};
 const call = (data, {method = 'POST', origin = 'https://atlas.example', ip = '203.0.113.7', type = 'application/json', body} = {}) => worker.fetch(new Request('https://atlas.example/api/disc-requests', {
  method, headers: {Origin: origin, 'Content-Type': type, 'CF-Connecting-IP': ip}, ...(method === 'GET' ? {} : {body: body ?? JSON.stringify(data)})}), env);
 const rows = async () => (await DB.prepare('SELECT * FROM disc_requests ORDER BY created_at,id').bind().all()).results.map(row => ({...row}));
 return {DB, env, worker, clock, call, rows};
}
const valid = {discName: 'Zephyr', manufacturer: 'Other'};
const fieldsOf = async response => (await response.json()).fields;

test('a request inserts exactly one row with the submitted values and defaults to pending', async () => {
 const s = setup(); try {
  const full = {discName: '  Distortion ', manufacturer: 'Prodigy', speed: 12, glide: 5.5, turn: -2.5, fade: 0, link: 'https://prodigydisc.com/distortion', note: 'Line one\nLine two', email: 'player@example.com'};
  const response = await s.call(full);
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), {ok: true});
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const [row, ...rest] = await s.rows(); assert.equal(rest.length, 0);
  assert.match(row.id, /^[0-9a-f-]{36}$/); assert.equal(row.created_at, s.clock.time / 1000);
  assert.deepEqual({...row, id: 0, created_at: 0}, {id: 0, created_at: 0, disc_name: 'Distortion', manufacturer: 'Prodigy', speed: 12, glide: 5.5, turn: -2.5, fade: 0, link: 'https://prodigydisc.com/distortion', note: 'Line one\nLine two', email: 'player@example.com', status: 'pending'});
 } finally {s.DB.close();}
});
test('only the disc name and manufacturer are needed; the rest stay NULL', async () => {
 const s = setup(); try {
  for (const blank of [valid, {...valid, speed: null, glide: null, turn: null, fade: null, link: '', note: ' ', email: ''}, {...valid, speed: '', glide: '', turn: '', fade: ''}]) assert.equal((await s.call(blank)).status, 201);
  for (const row of await s.rows()) for (const name of ['speed', 'glide', 'turn', 'fade', 'link', 'note', 'email']) assert.equal(row[name], null, name);
 } finally {s.DB.close();}
});
test('name and manufacturer are required', async () => {
 const s = setup(); try {
  const response = await s.call({discName: '   ', manufacturer: ''});
  assert.equal(response.status, 400);
  assert.deepEqual(Object.keys(await fieldsOf(response)).sort(), ['discName', 'manufacturer']);
  assert.equal((await s.rows()).length, 0);
 } finally {s.DB.close();}
});
test('flight numbers are all-or-none and in sane ranges', async () => {
 const s = setup(); try {
  const good = {speed: 7, glide: 5, turn: -1, fade: 1};
  for (const flight of [{speed: 7}, {speed: 7, glide: 5, turn: -1}, {...good, fade: null}, {...good, fade: ''}]) assert.match((await fieldsOf(await s.call({...valid, ...flight}))).flight, /all four/, JSON.stringify(flight));
  for (const flight of [{...good, speed: 0}, {...good, speed: -1}, {...good, speed: 15.5}, {...good, glide: -1}, {...good, glide: 9}, {...good, turn: -7}, {...good, turn: 4}, {...good, fade: -1}, {...good, fade: 8}, {...good, speed: '7'}]) assert.match((await fieldsOf(await s.call({...valid, ...flight}))).flight, /Speed runs/, JSON.stringify(flight));
  assert.equal((await s.rows()).length, 0);
  for (const flight of [good, {speed: 15, glide: 0, turn: -6, fade: 7}, {speed: .5, glide: 8, turn: 3, fade: 0}]) assert.equal((await s.call({...valid, ...flight})).status, 201, JSON.stringify(flight));
 } finally {s.DB.close();}
});
test('a link must be http(s) and an email must look like one', async () => {
 const s = setup(); try {
  for (const link of ['not a link', 'javascript:alert(1)', 'ftp://example.com/disc', 'data:text/html,hi', 'example.com/disc']) assert.match((await fieldsOf(await s.call({...valid, link}))).link, /http/, link);
  for (const email of ['nope', 'a@b', 'a b@example.com']) assert.match((await fieldsOf(await s.call({...valid, email}))).email, /valid email/, email);
  assert.equal((await s.rows()).length, 0);
  assert.equal((await s.call({...valid, link: 'http://example.com/disc'})).status, 201);
  assert.equal((await s.call({...valid, link: 'https://example.com/disc?id=1', email: 'a@example.com'})).status, 201);
 } finally {s.DB.close();}
});
test('every field has a server-side length cap and rejects control characters', async () => {
 const s = setup(); try {
  for (const [name, max] of [['discName', 120], ['manufacturer', 80], ['note', 500]]) {
   assert.ok((await fieldsOf(await s.call({...valid, [name]: 'x'.repeat(max + 1)})))[name], name);
   assert.equal((await s.call({...valid, [name]: 'x'.repeat(max)})).status, 201, name);
  }
  assert.ok((await fieldsOf(await s.call({...valid, link: 'https://example.com/' + 'x'.repeat(500)}))).link);
  assert.ok((await fieldsOf(await s.call({...valid, email: 'x'.repeat(250) + '@example.com'}))).email);
  assert.ok((await fieldsOf(await s.call({...valid, discName: 'Two\nlines'}))).discName);
  assert.ok((await fieldsOf(await s.call({...valid, note: 'bell\u0007'}))).note);
  assert.ok((await fieldsOf(await s.call({...valid, discName: 7}))).discName);
  assert.equal((await s.call(null, {body: JSON.stringify({...valid, note: 'x'.repeat(9000)})})).status, 400, 'over the body cap');
  assert.equal((await s.call(null, {body: 'not json'})).status, 400);
  assert.equal((await s.call(null, {body: '[1]'})).status, 400);
 } finally {s.DB.close();}
});
test('the honeypot answers like a success and writes nothing, not even a throttle count', async () => {
 const s = setup(); try {
  const response = await s.call({...valid, contact_time: 'noon'});
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), {ok: true});
  assert.equal((await s.rows()).length, 0);
  assert.equal((await s.DB.prepare('SELECT COUNT(*) AS n FROM disc_request_throttle').first()).n, 0);
 } finally {s.DB.close();}
});
test('a burst from one IP is throttled at five an hour, atomically, without touching other IPs', async () => {
 const s = setup(); try {
  const responses = await Promise.all(Array.from({length: 8}, () => s.call(valid)));
  assert.equal(responses.filter(r => r.status === 201).length, 5);
  const refused = responses.filter(r => r.status === 429); assert.equal(refused.length, 3);
  assert.equal((await refused[0].json()).code, 'throttled'); assert.equal(refused[0].headers.get('Retry-After'), '3600');
  assert.equal((await s.rows()).length, 5);
  assert.equal((await s.call(valid, {ip: '203.0.113.8'})).status, 201);
  s.clock.time += 3600 * 1000; assert.equal((await s.call(valid)).status, 201, 'the next hour starts fresh');
 } finally {s.DB.close();}
});
test('invalid requests do not use up the throttle', async () => {
 const s = setup(); try {
  for (let i = 0; i < 10; i++) assert.equal((await s.call({discName: ''})).status, 400);
  assert.equal((await s.call(valid)).status, 201);
 } finally {s.DB.close();}
});
test('no IP address is stored, and the cron clears finished hours', async () => {
 const s = setup(); try {
  await s.call(valid);
  const [row, ...rest] = (await s.DB.prepare('SELECT * FROM disc_request_throttle').bind().all()).results;
  assert.equal(rest.length, 0); assert.match(row.ip_hash, /^[0-9a-f]{64}$/); assert.ok(!JSON.stringify(row).includes('203.0.113'));
  assert.ok(!JSON.stringify(await s.rows()).includes('203.0.113'));
  const run = async () => {const pending = []; await s.worker.scheduled({}, {...s.env, TEXTURES: {delete: async () => {}}}, {waitUntil: p => pending.push(p)}); await Promise.all(pending);};
  const realNow = Date.now; try {
   Date.now = () => s.clock.time; await run();
   assert.equal((await s.DB.prepare('SELECT COUNT(*) AS n FROM disc_request_throttle').first()).n, 1, 'this hour stays');
   Date.now = () => s.clock.time + 3600 * 1000; await run();
   assert.equal((await s.DB.prepare('SELECT COUNT(*) AS n FROM disc_request_throttle').first()).n, 0, 'a finished hour goes');
  } finally {Date.now = realNow;}
  assert.equal((await s.rows()).length, 1, 'requests stay');
 } finally {s.DB.close();}
});
test('there is no public read route, and a cross-origin or non-JSON post is refused', async () => {
 const s = setup(); try {
  await s.call({...valid, email: 'player@example.com'});
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
   const response = await s.call(valid, {method});
   assert.equal(response.status, 405, method); assert.ok(!(await response.text()).includes('player@example.com'));
  }
  assert.equal((await s.worker.fetch(new Request('https://atlas.example/api/disc-requests/1'), s.env)).status, 503, 'no sub-routes: the catch-all answers');
  assert.equal((await s.call(valid, {origin: 'https://evil.example'})).status, 403);
  assert.equal((await s.call(valid, {type: 'text/plain'})).status, 415);
  assert.equal((await s.rows()).length, 1);
 } finally {s.DB.close();}
});
test('storage trouble is a retryable error that logs nothing the visitor typed', async () => {
 const s = setup(), logged = [], realError = console.error; try {
  console.error = (...args) => logged.push(JSON.stringify(args));
  await s.DB.prepare('DROP TABLE disc_requests').run();
  const response = await s.call({...valid, discName: 'SecretName', email: 'player@example.com'});
  assert.equal(response.status, 503); assert.match((await response.json()).error, /try again/);
  assert.ok(logged.length); assert.ok(!logged.join().includes('SecretName')); assert.ok(!logged.join().includes('player@example.com'));
  assert.equal((await s.worker.fetch(new Request('https://atlas.example/api/disc-requests', {method: 'POST', headers: {Origin: 'https://atlas.example', 'Content-Type': 'application/json'}, body: '{}'}), {})).status, 503, 'no database bound');
 } finally {console.error = realError; s.DB.close();}
});
