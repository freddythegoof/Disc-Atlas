// Renders the coach launcher's still of Hyzer the Disc (idle, no floor shadow) to public/hyzer-still.png.
// The launcher shows this image instead of a live mascot, so the atlas pays no frame cost while the coach is closed.
// Serve the checkout root first (python3 -m http.server 8871 --bind 127.0.0.1), then: node spikes/hyzer-mascot/still.mjs
import fs from 'node:fs';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SHEET_BASE || 'http://127.0.0.1:8871/';
const browser = await chromium.launch({headless: true, args: ['--enable-gpu', '--use-angle=metal'], executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
try {
 const page = await browser.newPage();
 await page.goto(base + 'spikes/hyzer-mascot/one.html?state=idle');
 const png = await page.evaluate(async () => {
  const {snapshot} = await import('/public/vendor/wobnimo/wobnimo-0.2.0.js');
  const {default: hyzer} = await import('/public/hyzer.mjs');
  const canvas = await snapshot(hyzer, {state: 'idle', size: 32, pixelRatio: 2, floor: 0, framing: 0.8, seed: 0.3});
  return canvas.toDataURL('image/png');
 });
 fs.writeFileSync('public/hyzer-still.png', Buffer.from(png.split(',')[1], 'base64'));
 console.log('public/hyzer-still.png', fs.statSync('public/hyzer-still.png').size, 'bytes');
} finally {await browser.close();}
