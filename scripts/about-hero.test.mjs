import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// Set PLAYWRIGHT_MODULE to an existing Playwright installation if not installed locally.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = resolve('outputs/about-hero');
await mkdir(output, { recursive: true });
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = resolve('public', '.' + (path === '/about' ? '/about.html' : path));
  if (!file.startsWith(resolve('public') + sep)) {
    res.writeHead(403).end(); return;
  }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

test('About hero renders within budget, pauses, and uses accessible fallbacks', async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.heroFrames = [];
      const draw = WebGL2RenderingContext.prototype.drawElements;
      WebGL2RenderingContext.prototype.drawElements = function (...args) {
        window.heroFrames.push(performance.now());
        return draw.apply(this, args);
      };
    });
    await page.goto(origin + '/about');
    await page.screenshot({ path: output + '/initial.png' });
    assert.equal(await page.locator('.about-hero canvas').count(), 1, 'desktop dark mode has a shader canvas');
    await page.waitForFunction(() => document.querySelector('.about-hero')?.dataset.shader === 'ready');
    await page.waitForTimeout(6500);
    const sample = async (duration = 750) => {
      await page.evaluate(() => { window.heroFrames = []; });
      await page.waitForTimeout(duration);
      return page.evaluate(() => {
        const f = window.heroFrames;
        return { frames: f.length, fps: (f.length - 1) * 1000 / (f.at(-1) - f[0]) };
      });
    };
    const normal = await sample(5000);
    assert.ok(normal.fps > 25 && normal.fps <= 31, JSON.stringify(normal));
    const size = await page.locator('.about-hero canvas').evaluate(c => ({ width: c.width, cssWidth: c.clientWidth }));
    assert.ok(size.width / size.cssWidth >= 0.5 && size.width / size.cssWidth <= 0.75);
    await page.screenshot({ path: output + '/dark-desktop.png', fullPage: true });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const throttled = await sample(5000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    // This short page cannot fully scroll the hero out of a 900px viewport.
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    assert.ok(await page.locator('.about-hero').evaluate(el => el.getBoundingClientRect().bottom < 0));
    const paused = await sample();
    assert.equal(paused.frames, 0, 'no draws while hero is offscreen');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    assert.ok((await sample()).frames > 0, 'resumes on return');
    await page.selectOption('[data-theme-select]', 'light');
    assert.equal((await sample()).frames, 0, 'light theme stops rendering');
    await page.screenshot({ path: output + '/light-desktop.png', fullPage: true });
    await page.selectOption('[data-theme-select]', 'charcoal');
    assert.ok((await sample()).frames > 0, 'charcoal resumes rendering');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: output + '/charcoal-desktop.png', fullPage: true });
    // Exercise the visibility listener without depending on headless tab focus behavior.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal((await sample()).frames, 0, 'hidden document stops rendering');
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.ok((await sample()).frames > 0, 'visible document resumes');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal((await sample()).frames, 0, 'live reduced-motion change stops rendering');
    await page.screenshot({ path: output + '/reduced-motion.png' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal((await sample()).frames, 0, 'mobile stops rendering');
    assert.ok(await page.locator('h1').isVisible(), 'mobile heading remains visible');
    await page.screenshot({ path: output + '/mobile.png', fullPage: true });
    await page.setViewportSize({ width: 700, height: 900 });
    assert.ok((await sample()).frames > 0, '700px is eligible');
    await page.evaluate(() => document.querySelector('.about-hero canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForTimeout(100);
    assert.equal((await sample()).frames, 0, 'context loss stops rendering');
    assert.equal(await page.locator('.about-hero').getAttribute('data-shader'), 'fallback');
    for (const mode of ['light', 'mobile', 'reduced', 'no-webgl', 'cdn-failure']) {
      const fallback = await browser.newPage({ viewport: { width: mode === 'mobile' ? 699 : 1440, height: 900 }, colorScheme: mode === 'light' ? 'light' : 'dark', reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
      const cdn = [];
      fallback.on('request', req => { if (req.url().includes('cdn.jsdelivr.net')) cdn.push(req.url()); });
      if (mode === 'no-webgl') await fallback.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : getContext.call(this, type, ...args); };
      });
      if (mode === 'cdn-failure') await fallback.route('https://cdn.jsdelivr.net/**', route => route.abort());
      await fallback.goto(origin + '/about');
      await fallback.waitForTimeout(1000);
      assert.ok(await fallback.locator('h1').isVisible(), mode + ': readable content');
      assert.notEqual(await fallback.locator('.about-hero').getAttribute('data-shader'), 'ready', mode + ': static fallback');
      if (mode !== 'cdn-failure') assert.equal(cdn.length, 0, mode + ': no Three.js download');
      await fallback.close();
    }
    assert.deepEqual(errors, []);
    const report = { browser: browser.version(), viewport: '1440×900', normal, throttled, paused, size, errors };
    await writeFile(output + '/measurements.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
}).finally(() => server.close());
