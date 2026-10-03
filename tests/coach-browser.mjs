import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn, execFileSync} from 'node:child_process';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const wrangler = 'node_modules/wrangler/wrangler-dist/cli.js', config = 'tests/coach.wrangler.jsonc', state = 'work/coach-qa/state', base = 'https://localhost:8798';
const live = process.argv.includes('--live');
const dir = 'outputs/plan-08b' + (live ? '/live' : ''), baselines = [];
fs.mkdirSync(dir, {recursive: true});
const command = args => execFileSync(process.execPath, [wrangler, ...args, '--config', config, '--persist-to', state], {windowsHide: true, stdio: 'pipe'});
if (!process.argv.includes('--skip-build')) execFileSync(process.execPath, ['scripts/build-workers.mjs'], {windowsHide: true, stdio: 'inherit'});
command(['d1', 'migrations', 'apply', 'disc-atlas-accounts', '--local']);
const sql = text => command(['d1', 'execute', 'disc-atlas-accounts', '--local', '--command', text]);
sql('DELETE FROM atlas_coach_usage; DELETE FROM atlas_coach_budget; DELETE FROM auth_users;');
let server, browser, page;
async function start(provider = 'workers-ai') {
 if (server) {server.kill(); await new Promise(resolve => server.once('exit', resolve));}
 // Only the named key enters Wrangler; it is never written to a file or printed.
 const workerEnv = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'TEMP', 'TMP', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
 Object.assign(workerEnv, {OPENAI_API_KEY: live ? process.env.OPENAI_API_KEY || '' : 'test-only-key', CLOUDFLARE_INCLUDE_PROCESS_ENV: 'true'});
 server = spawn(process.execPath, [wrangler, 'dev', '--config', config, ...(live ? [] : ['--local']), '--port', '8798', '--ip', '127.0.0.1', '--local-protocol', 'https', '--inspector-port', '0', '--persist-to', state, '--var', 'COACH_PROVIDER:' + provider, '--var', 'COACH_QA_LIVE:' + live], {windowsHide: true, env: workerEnv, stdio: ['ignore', 'pipe', 'pipe']});
 for (const stream of [server.stdout, server.stderr]) stream.on('data', data => {for (const line of data.toString().split('\n')) if (line.includes('Coach QA')) console.log(line);});
 const ready = () => new Promise(resolve => {const r = https.get(base, {rejectUnauthorized: false, family: 4}, response => {response.resume(); resolve(response.statusCode === 200);}); r.on('error', () => resolve(false)); r.setTimeout(500, () => r.destroy());});
 const deadline = Date.now() + 45000; while (!await ready()) {if (Date.now() > deadline || server.exitCode !== null) throw Error('Coach dev Worker did not start.'); await new Promise(r => setTimeout(r, 250));}
}
try {
 await start(); browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1440, height: 1000}}), errors = [];
 page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//, async route => {
  const u = new URL(route.request().url()), code = Buffer.from(JSON.stringify({nonce: u.searchParams.get('nonce'), challenge: u.searchParams.get('code_challenge')})).toString('base64');
  const callback = new URL(u.searchParams.get('redirect_uri')); callback.search = new URLSearchParams({code, state: u.searchParams.get('state')}).toString();
  await route.fulfill({contentType: 'text/html', body: `<a href="${callback.href.replaceAll('&', '&amp;')}">Continue as Atlas Player</a>`});
 });
 const capture = async name => {await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200); await page.screenshot({path: `${dir}/${name}.png`});};
 const open = async () => {if (!await page.locator('#coachDialog').isVisible()) await page.getByRole('button', {name: 'Atlas Coach', exact: true}).click(); await page.getByRole('dialog', {name: 'Atlas Coach', exact: true}).waitFor();};
 const close = async () => {await page.keyboard.press('Escape'); await page.waitForFunction(() => document.activeElement === document.querySelector('#coachButton'));};
 const theme = async value => {await page.getByRole('button', {name: 'Site menu', exact: true}).click(); await page.getByRole('menuitemradio', {name: value[0].toUpperCase() + value.slice(1), exact: true}).click(); await page.keyboard.press('Escape');};
 await page.goto(base); await page.waitForFunction(() => window.AtlasAccount?.current);
 await open();
 assert.ok(!await page.locator('#coachForm').isVisible(), 'Signed-out users see a sign-in prompt, not the chat form');
 assert.ok(!await page.locator('#coachMessages').isVisible(), 'Signed-out transcript is hidden');
 for (const name of ['light', 'midnight', 'charcoal']) for (const width of [1440, 360]) {
  await close(); await page.setViewportSize({width, height: width === 360 ? 800 : 1000}); await theme(name); await capture(`closed-${width}-${name}`); await open();
  assert.ok(await page.locator('#coachSignIn').isVisible()); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await capture(`signed-out-${width}-${name}`);
 }
 await page.locator('#coachSignIn').click(); await page.getByRole('link', {name: 'Continue with Google', exact: true}).waitFor();
 const href = await page.getByRole('link', {name: 'Continue with Google', exact: true}).getAttribute('href');
 const redirect = await page.request.get(base + href, {maxRedirects: 0}); assert.equal(redirect.status(), 302);
 await page.goto(redirect.headers().location); await page.getByRole('link', {name: 'Continue as Atlas Player'}).click();
 await page.waitForFunction(() => window.AtlasAccount?.current?.user);
 assert.equal(new URL(page.url()).searchParams.get('coach'), '1', 'Google sign-in returns to the coach');
 await page.locator('#coachInput').waitFor(); await page.waitForFunction(() => !document.querySelector('#coachInput').disabled);
 const send = async question => {await page.locator('#coachInput').fill(question); const began = Date.now(), pending = page.waitForResponse(r => r.url() === base + '/api/coach' && r.request().method() === 'POST', {timeout: 45000}); await page.locator('#coachInput').press('Enter'); const response = await pending; assert.equal(response.status(), 200, JSON.stringify(await response.json())); const data = await response.json(); baselines.push({question, provider: data.provider, answer: data.answer, fallback: data.fallback, elapsedMs: Date.now() - began}); await page.waitForFunction(() => document.querySelector('#coachSend').textContent !== 'Thinking…'); return data;};
 await send('How does the Discraft Buzzz fly?');
 assert.match(await page.locator('#coachMessages').innerText(), /Buzzz/); assert.match(await page.locator('#coachStatus').innerText(), /19/);
 assert.ok(await page.locator('#coachMessages a').count() > 0, 'Catalog source links are shown');
 await page.locator('#coachInput').focus(); await page.keyboard.press('Shift+Enter'); assert.equal(await page.locator('#coachInput').inputValue(), '\n');
 for (const name of ['light', 'midnight', 'charcoal']) for (const width of [1440, 360]) {
  await close(); await page.setViewportSize({width, height: width === 360 ? 800 : 1000}); await theme(name); await open();
  const r = await page.locator('#coachDialog').boundingBox(); assert.ok(r.x >= 0 && r.x + r.width <= width && r.y >= 0 && r.y + r.height <= (width === 360 ? 800 : 1000));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  for (let i = 0; i < 8; i++) {await page.keyboard.press('Tab'); assert.ok(await page.locator('#coachDialog').evaluate(n => n.contains(document.activeElement)), 'Focus stays in the dialog');}
  await capture(`open-${width}-${name}`);
 }
 await close(); await start('openai'); await page.reload(); await page.waitForFunction(() => window.AtlasAccount?.current?.user); await open();
 const alternate = await send('How does the Discraft Buzzz fly?');
 if (live && process.argv.includes('--allow-unavailable-openai') && alternate.provider !== 'openai') {
  assert.equal(alternate.fallback, 'provider_unavailable'); console.log('PENDING: successful OpenAI reply; verified live provider-error fallback.');
 } else {assert.match(await page.locator('#coachProvider').innerText(), /Alternate/); console.log('PASS: OpenAI dev-worker reply.');}
 const month = new Date().toISOString().slice(0, 7);
 sql(`INSERT INTO atlas_coach_budget(month,used_microusd,disabled) VALUES ('${month}',5000000,0) ON CONFLICT(month) DO UPDATE SET used_microusd=5000000,disabled=0;`);
 await send('How should I practice a flat Buzzz throw?'); assert.match(await page.locator('#coachNotice').innerText(), /rest of this month/); assert.match(await page.locator('#coachProvider').innerText(), /Standard/); await capture('monthly-cap-fallback');
 if (!live) {
  // The first actual D1 count is 3; 17 more accepted sends reach exactly 20.
  for (let i = 3; i < 20; i++) await send('How does the Buzzz fly?');
 } else sql('UPDATE atlas_coach_usage SET count=20;');
 await page.reload(); await page.waitForFunction(() => window.AtlasAccount?.current?.user); await open();
 await page.waitForFunction(() => document.querySelector('#coachStatus').textContent.includes('tomorrow'));
 assert.ok(await page.locator('#coachInput').isDisabled()); await capture('daily-cap');
 const blocked = await page.evaluate(async () => {const r = await fetch('/api/coach', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Atlas-CSRF': window.AtlasAccount.current.csrfToken}, body: JSON.stringify({messages: [{role: 'user', content: 'One more?'}]})}); return r.status;}); assert.equal(blocked, 429);
 await close(); await page.evaluate(() => window.AtlasAccount.signOut()); await open(); assert.ok(!await page.locator('#coachMessages').isVisible()); assert.ok(!await page.locator('#coachForm').isVisible());
 assert.deepEqual(errors, []);
 fs.writeFileSync(`${dir}/ab-baseline.json`, JSON.stringify(baselines, null, 2));
 console.log(`PASS: ${live ? 'LIVE Workers AI (OpenAI success: ' + (alternate.provider === 'openai') + ')' : 'fixture AI'} on Wrangler + D1, signed OAuth flow, cap at 20, provider routing, cap fallback, keyboard, 3 themes at 1440/360px. Screenshots: ${dir}.`);
} catch (error) {if (page) await page.screenshot({path: `${dir}/failure.png`}); throw error;}
finally {if (browser) await browser.close(); if (server) server.kill();}
