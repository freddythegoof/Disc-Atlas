// Captures the Hyzer character sheet at 2x for the write-up: red Take A, the three reds, then reduced motion.
// Serve the checkout root first (python3 -m http.server 8871 --bind 127.0.0.1), then: node spikes/hyzer-mascot/capture.mjs
import fs from 'node:fs';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.SHEET_URL || 'http://127.0.0.1:8871/spikes/hyzer-mascot/sheet.html', out = 'docs/assets/hyzer-mascot';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch({headless: true, args: ['--enable-gpu', '--use-angle=metal'], executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
try {
 for (const reducedMotion of ['no-preference', 'reduce']) {
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 2, reducedMotion});
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url); await page.waitForTimeout(2500);
  if (errors.length) throw Error('Sheet errors: ' + errors.join('; '));
  if (reducedMotion === 'reduce') {await page.locator('section[data-colorway="red"]').screenshot({path: `${out}/sheet-reduced-motion-red.png`}); await page.close(); continue;}
  await page.locator('section[data-colorway="red"]').screenshot({path: `${out}/sheet-red.png`});
  await page.locator('section.ways').screenshot({path: `${out}/sheet-red-three-ways.png`});
  await page.close();
 }
} finally {await browser.close();}
console.log('Wrote', fs.readdirSync(out).join(', '));
