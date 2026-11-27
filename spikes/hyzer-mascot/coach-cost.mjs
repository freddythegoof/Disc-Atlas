// What Hyzer the Disc costs in the real coach panel: bytes the launcher and the panel add, the main-thread hitch
// when the panel first opens (engine download, shader compile, first frame), and the live per-frame tick.
// Start the mocked site first (node spikes/hyzer-mascot/serve.mjs 8872), then: node spikes/hyzer-mascot/coach-cost.mjs
import fs from 'node:fs';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SITE || 'http://127.0.0.1:8872/';
const gz = file => zlib.gzipSync(fs.readFileSync(file), {level: 9}).length;
console.log('bytes (raw / gzip -9):');
for (const file of ['public/vendor/wobnimo/wobnimo-0.2.0.js', 'public/hyzer.mjs', 'public/hyzer-still.png']) console.log(`  ${file}: ${fs.statSync(file).size} / ${gz(file)}`);

const browser = await chromium.launch({headless: true, args: ['--enable-gpu', '--use-angle=metal'], executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
try {
 for (let run = 1; run <= 3; run++) {
  const p = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2});
  await p.goto(base); await p.waitForTimeout(2500);
  // Long tasks (over 50 ms) from the click until he is drawn, and the time until his canvas has a frame.
  const open = await p.evaluate(async () => {
   const long = []; new PerformanceObserver(list => long.push(...list.getEntries().map(e => Math.round(e.duration)))).observe({type: 'longtask'});
   const t0 = performance.now(); document.querySelector('#coachButton').click();
   while (!document.querySelector('#coachHyzer canvas')) await new Promise(r => setTimeout(r, 5));
   const mounted = performance.now() - t0;
   await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
   const drawn = performance.now() - t0; await new Promise(r => setTimeout(r, 300));
   return {mounted: Math.round(mounted), drawn: Math.round(drawn), long};
  });
  const tick = await p.evaluate(async () => {
   const {Mascot} = await import('/vendor/wobnimo/wobnimo-0.2.0.js'); const cost = []; const tick = Mascot.prototype.tick;
   Mascot.prototype.tick = function (...a) {const t = performance.now(); tick.apply(this, a); cost.push(performance.now() - t);};
   await new Promise(r => setTimeout(r, 5000)); Mascot.prototype.tick = tick; cost.sort((a, b) => a - b);
   return {frames: cost.length, mean: cost.reduce((a, b) => a + b, 0) / cost.length, p95: cost[Math.floor(cost.length * 0.95)]};
  });
  console.log(`run ${run}: open→canvas ${open.mounted} ms, →first frame ${open.drawn} ms, long tasks [${open.long.join(', ')}] ms; live tick ${tick.mean.toFixed(3)} ms mean, ${tick.p95.toFixed(3)} ms p95 over ${tick.frames} frames/5 s`);
  await p.close();
 }
} finally {await browser.close();}
