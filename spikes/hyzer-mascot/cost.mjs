// Frame cost of one live 64px Hyzer, reduced-motion stillness of the sheet, and zero ticks after dispose.
// Serve the checkout root first (python3 -m http.server 8871 --bind 127.0.0.1), then: node spikes/hyzer-mascot/cost.mjs
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const b = await chromium.launch({headless: true, args: ['--enable-gpu', '--use-angle=metal']});
const base = 'http://127.0.0.1:8871/spikes/hyzer-mascot/';
for (const [take, state] of [['red','idle'],['red','thinking'],['red','celebrating'],['allRed','idle']]) {
  const p = await b.newPage({viewport: {width: 200, height: 200}, deviceScaleFactor: 2});
  await p.goto(`${base}one.html?take=${take}&state=${state}`); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.cost.length = 0; }); await p.waitForTimeout(5000);
  const r = await p.evaluate(() => { const c = [...window.cost].sort((a,b)=>a-b); return {frames: c.length, mean: c.reduce((a,b)=>a+b,0)/c.length, p95: c[Math.floor(c.length*.95)]}; });
  console.log(take, state, `frames/5s=${r.frames} tick mean=${r.mean.toFixed(3)}ms p95=${r.p95.toFixed(3)}ms`);
  await p.close();
}
// Reduced motion: does the sheet hold still? Two shots 1.5s apart, byte-compared.
const p = await b.newPage({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
await p.goto(base + 'sheet.html'); await p.waitForTimeout(2500);
const a = await p.screenshot(); await p.waitForTimeout(1500); const c = await p.screenshot();
const mounted = await p.evaluate(() => document.querySelectorAll('.live canvas').length);
const ticks = await p.evaluate(async () => { const {Mascot} = await import('./vendor/wobnimo-0.2.0.js'); let n = 0; const tick = Mascot.prototype.tick; Mascot.prototype.tick = function (...x) { n++; return tick.apply(this, x); }; await new Promise(r => setTimeout(r, 2000)); return n; });
console.log('reduced motion: identical screenshots =', a.equals(c), '| mascot ticks in 2s across', mounted, 'settled live mascots =', ticks);
// Coach closed: a page that has loaded the engine but mounted nothing schedules no frames.
const q = await b.newPage(); await q.goto(base + 'one.html'); await q.waitForTimeout(1000);
await q.evaluate(() => window.mascot.dispose()); await q.waitForTimeout(500);
const n = await q.evaluate(() => { window.cost.length = 0; return new Promise(r => setTimeout(() => r(window.cost.length), 2000)); });
console.log('after dispose: ticks in 2s =', n);
await b.close();
