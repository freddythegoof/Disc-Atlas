import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Hyzer the Disc (Nov 14), the Atlas Coach's face. He acts out the coach's real states only: listening while the
// question box has focus, thinking while a question is in flight, speaking for a length-scaled moment when the
// whole answer lands, error when the question fails (until the next keystroke), sleeping after two quiet minutes,
// idle otherwise. Celebrating has no real event yet, so it must never show. The launcher wears a still image, the
// engine loads only when the panel opens and stops when it closes, dismissal is remembered in this browser, and
// reduced motion holds him still. The backend is mocked: a question containing "fail" gets a 503.
const dir = 'outputs/hyzer-coach';
fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true});
const types = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.webp': 'image/webp'};
const answer = 'Try a stable fairway driver for that wooded hole: a controlled flat release keeps it on line, and the fade at the end is predictable. Field test: throw five at 80% power and note where each one finishes.';
const json = (res, status, data) => {res.writeHead(status, {'Content-Type': 'application/json'}); res.end(JSON.stringify(data));};
const server = http.createServer(async (req, res) => {
 const url = new URL(req.url, 'http://localhost');
 if (url.pathname === '/api/account') return json(res, 200, {user: {name: 'Test Player', email: 'test@example.test'}, csrfToken: 'test', coachReady: true, authReady: true});
 if (url.pathname === '/api/coach' && req.method === 'GET') return json(res, 200, {remaining: 20});
 if (url.pathname === '/api/coach') {
  let body = ''; for await (const chunk of req) body += chunk;
  await new Promise(r => setTimeout(r, 900));
  if (/fail/.test(JSON.parse(body).messages.at(-1).content)) return json(res, 503, {error: 'The AI coach is temporarily unavailable. Please try again later.'});
  return json(res, 200, {answer, discs: [], provider: 'workers-ai', remaining: 19});
 }
 if (url.pathname.startsWith('/api/')) return json(res, 503, {error: 'Frontend test: backend excluded'});
 const file = url.pathname === '/' ? 'web/index.html' : ['/bag-plastics.json', '/bag-models.json'].includes(url.pathname) ? 'source-data' + url.pathname : 'public' + url.pathname;
 if (file.includes('..')) {res.writeHead(400); res.end(); return;}
 try {const data = fs.readFileSync(file); res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'}); res.end(data);} catch {res.writeHead(404); res.end();}
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const errors = [], checks = [];
const check = label => {checks.push(label); console.log('ok -', label);};
const engineRequests = [];
async function page(options = {}) {
 const p = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2, ...options});
 p.on('pageerror', e => errors.push(e.message));
 p.on('console', m => {if (m.type() === 'error' && !/503|Failed to load resource/.test(m.text())) errors.push(m.text());});
 p.on('request', r => {if (/\/vendor\/wobnimo\/|\/hyzer\.mjs/.test(r.url())) engineRequests.push(r.url());});
 return p;
}
const mood = p => p.evaluate(() => document.querySelector('#coachHyzer canvas')?.getAttribute('aria-label')?.replace('Hyzer the Disc, ', '') ?? null);
const waitMood = (p, state, timeout = 8000) => p.waitForFunction(s => document.querySelector('#coachHyzer canvas')?.getAttribute('aria-label') === 'Hyzer the Disc, ' + s, state, {timeout});
// Counts the engine's per-frame work: the module is shared per URL, so patching its prototype reaches the live Hyzer.
const ticksOver = (p, ms) => p.evaluate(async ms => {
 const {Mascot} = await import('/vendor/wobnimo/wobnimo-0.2.0.js'); let n = 0; const tick = Mascot.prototype.tick;
 Mascot.prototype.tick = function (...a) {n++; return tick.apply(this, a);};
 await new Promise(r => setTimeout(r, ms)); Mascot.prototype.tick = tick; return n;
}, ms);
const ask = async (p, text) => {await p.locator('#coachInput').fill(text); await p.locator('#coachInput').press('Enter');};
// The heading plus the panel padding around it, where Hyzer's hops and leaves reach.
const shot = async (p, name) => {const r = await p.locator('.coach-heading').boundingBox(); await p.screenshot({path: `${dir}/${name}.png`, clip: {x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 28}});};
try {
 // Closed: the launcher wears the still; the engine is not even downloaded.
 let p = await page();
 await p.goto(base); await p.waitForTimeout(1500);
 assert.equal(engineRequests.length, 0, 'engine not loaded while the coach is closed');
 assert.ok(await p.locator('.coach-hyzer-still').isVisible(), 'launcher shows the still');
 assert.ok(await p.locator('.coach-label-hyzer').isVisible() && !await p.locator('.coach-label-plain').isVisible(), 'labelled Ask Hyzer');
 assert.equal(await p.locator('#coachButton').getAttribute('aria-label'), 'Ask Hyzer, the Atlas Coach');
 assert.equal(await p.locator('#coachButton .coach-glyph').isVisible(), false, 'the ✦ gives way to the still');
 const height = await p.locator('#coachButton').evaluate(b => b.getBoundingClientRect().height);
 assert.ok(height <= 42, `launcher keeps its pill height (${height}px)`);
 await p.locator('#coachButton').screenshot({path: `${dir}/launcher.png`});
 check('closed: launcher still and "Ask Hyzer", no engine download, no frame cost');

 // Moods follow the coach's real states. Every state he shows is recorded, to prove celebrating never appears.
 await p.locator('#coachButton').click();
 await waitMood(p, 'listening');
 assert.ok(engineRequests.some(u => u.endsWith('/hyzer.mjs')), 'engine loads when the panel opens');
 await p.evaluate(() => {window.hyzerMoods = new Set(); new MutationObserver(() => window.hyzerMoods.add(document.querySelector('#coachHyzer canvas')?.getAttribute('aria-label'))).observe(document.querySelector('#coachHyzer'), {attributes: true, subtree: true, attributeFilter: ['aria-label']});});
 assert.ok(await p.evaluate(() => {const c = document.querySelector('#coachHyzer canvas'); return c && c.closest('#coachDialog') && document.querySelectorAll('.coach-hyzer canvas').length === 1;}), 'Hyzer lives only in the coach panel');
 await p.waitForTimeout(1200); await shot(p, 'listening');
 check('open: live in the panel heading, listening while the question box has focus');
 await p.locator('#coachTitle').click(); await waitMood(p, 'idle'); await p.waitForTimeout(800); await shot(p, 'idle');
 check('idle when the question box loses focus');
 await ask(p, 'Which fairway for a wooded hole?'); await waitMood(p, 'thinking', 500);
 await p.waitForTimeout(500); await shot(p, 'thinking');
 check('thinking while the question is in flight');
 await waitMood(p, 'speaking', 3000); const spoke = Date.now(); await p.waitForTimeout(500); await shot(p, 'speaking');
 await waitMood(p, 'listening', 6000); const speech = Date.now() - spoke;
 assert.ok(speech > 2000 && speech < 4200, `speaks for a length-scaled moment (${speech} ms for ${answer.length} characters)`);
 check(`speaking when the whole answer lands, for ${(speech / 1000).toFixed(1)} s, then back to listening`);
 await ask(p, 'This one should fail'); await waitMood(p, 'thinking', 500); await waitMood(p, 'error', 3000);
 await p.waitForTimeout(1500); assert.equal(await mood(p), 'error', 'error holds'); await shot(p, 'error');
 await p.locator('#coachInput').press('End'); assert.equal(await mood(p), 'error', 'a bare key does not clear it');
 await p.locator('#coachInput').type('!'); await waitMood(p, 'listening', 1000);
 check('error on a failed question, held until the next keystroke');
 const seen = await p.evaluate(() => [...window.hyzerMoods]);
 assert.ok(!seen.some(s => /celebrating/.test(s)), 'never celebrates without a real event: ' + seen.join(', '));
 check('never celebrates (no real bag event yet): saw ' + seen.map(s => s.replace('Hyzer the Disc, ', '')).join(', '));

 // Closing the panel disposes him: the canvas goes and the engine does no more work.
 // (The dialog's close event fires a task after `open` turns false, so wait for the canvas itself.)
 await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('#coachDialog').open && !document.querySelector('#coachHyzer canvas'), null, {timeout: 2000});
 assert.equal(await ticksOver(p, 1500), 0, 'no ticks after close');
 check('closed again: canvas removed, 0 engine ticks in 1.5 s');

 // Dismissal: remembered across reloads, applied before paint, and reversible.
 await p.locator('#coachButton').click(); await waitMood(p, 'listening');
 await p.locator('#coachHyzerToggle').click();
 assert.equal(await p.locator('#coachHyzer canvas').count(), 0, 'hiding removes him at once');
 assert.equal(await p.locator('#coachHyzerToggle').innerText(), 'Show Hyzer the Disc');
 await p.keyboard.press('Escape');
 assert.ok(await p.locator('.coach-label-plain').isVisible() && !await p.locator('.coach-label-hyzer').isVisible(), 'labelled Atlas Coach');
 await p.waitForTimeout(500); await p.locator('#coachButton').screenshot({path: `${dir}/launcher-dismissed.png`});
 assert.ok(await p.locator('#coachButton .coach-glyph').isVisible(), 'the ✦ is back');
 engineRequests.length = 0; await p.reload(); await p.waitForTimeout(800);
 assert.equal(await p.evaluate(() => document.documentElement.dataset.hyzer), 'hidden', 'remembered across reloads');
 assert.equal(await p.locator('.coach-hyzer-still').isVisible(), false);
 assert.equal(await p.locator('#coachButton').getAttribute('aria-label'), 'Atlas Coach');
 await p.locator('#coachButton').click(); await p.waitForTimeout(1200);
 assert.equal(await p.locator('#coachHyzer canvas').count(), 0, 'stays hidden in the panel');
 assert.equal(engineRequests.length, 0, 'a dismissed Hyzer never downloads the engine');
 await p.locator('#coachDialog').screenshot({path: `${dir}/dismissed-panel.png`});
 check('dismissed: remembered across reload, plain ✦ Atlas Coach launcher, no engine download');
 await p.locator('#coachHyzerToggle').click(); await waitMood(p, 'listening', 5000).catch(() => waitMood(p, 'idle', 1));
 await p.keyboard.press('Escape'); await p.reload(); await p.waitForTimeout(800);
 assert.ok(await p.locator('.coach-hyzer-still').isVisible(), 'shown again after reload');
 check('shown again with "Show Hyzer the Disc", and that is remembered too');
 await p.close();

 // Sleeping after two quiet minutes, on a fake clock.
 p = await page();
 await p.clock.install(); await p.goto(base); await p.clock.runFor(1500);
 await p.locator('#coachButton').click(); await p.clock.runFor(1500);
 await p.locator('#coachTitle').click(); await p.clock.runFor(500); assert.equal(await mood(p), 'idle');
 await p.clock.runFor(119000); assert.equal(await mood(p), 'idle', 'still awake just before two minutes');
 await p.clock.runFor(2000); assert.equal(await mood(p), 'sleeping', 'asleep after two quiet minutes');
 await p.mouse.move(1200, 200); await p.mouse.move(1210, 210); await p.clock.runFor(200); assert.equal(await mood(p), 'idle', 'woken by activity');
 check('sleeping after two quiet minutes, woken by activity');
 await p.close();

 // Reduced motion: he settles into a held pose and the engine stops ticking.
 p = await page({reducedMotion: 'reduce'});
 await p.goto(base); await p.waitForTimeout(800);
 await p.locator('#coachButton').click(); await waitMood(p, 'listening'); await p.waitForTimeout(1500);
 const a = await p.locator('#coachHyzer').screenshot(); await p.waitForTimeout(1200); const b = await p.locator('#coachHyzer').screenshot();
 assert.ok(a.equals(b), 'reduced motion: pixel-identical 1.2 s apart');
 assert.equal(await ticksOver(p, 1500), 0, 'reduced motion: no ticks once settled');
 check('reduced motion: fully static Hyzer, 0 engine ticks');
 await p.close();

 // Small screens: the round launcher (list and bag views) wears the still inside its 44px circle.
 for (const view of ['list', 'bag']) {
  p = await page({viewport: {width: 390, height: 844}});
  await p.goto(base + (view === 'bag' ? '/?bag=1' : '')); await p.waitForTimeout(1200);
  if (view === 'bag') await p.evaluate(() => {document.body.dataset.view = 'bag';});
  const r = await p.evaluate(() => {const b = document.querySelector('#coachButton').getBoundingClientRect(), i = document.querySelector('.coach-hyzer-still').getBoundingClientRect(); return {b: [b.width, b.height], centred: Math.abs((i.left + i.right) / 2 - (b.left + b.right) / 2) < 1.5 && Math.abs((i.top + i.bottom) / 2 - (b.top + b.bottom) / 2) < 1.5, img: i.width};});
  assert.ok(r.b[0] <= 44 && r.b[1] <= 44 && r.centred && r.img === 32, `${view} launcher: ${JSON.stringify(r)}`);
  await p.locator('#coachButton').screenshot({path: `${dir}/launcher-${view}.png`});
  await p.close();
 }
 check('round launcher (list, bag): 32px still centred in the 44px circle');

 assert.deepEqual(errors, [], 'no page errors');
 console.log(`\n${checks.length} checks passed. Captures in ${dir}/`);
} finally {await browser.close(); server.close();}
