// Evidence for docs/accent-follows-appearance.md: the top bar (header, primary nav, site menu) in the default state
// and with chosen accents across Light, Midnight, Paper and Dusk on desktop and phone; an accent change landing at
// once; the choice surviving a reload; the page-load sequence with no lime frame; and a contrast table for every
// accent in all six themes.
// `node tests/accent-follows-appearance-evidence.mjs --before` on origin/main records the default top bar (computed
// colors and pixels) to work/accent-follows-appearance/before/; the plain run on the branch compares against it.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {startHarness} from './display-harness.mjs';

const BEFORE = process.argv.includes('--before');
const mode = BEFORE ? 'before' : 'after';
const work = `work/accent-follows-appearance/${mode}`, docs = 'docs/images/accent-follows-appearance';
for (const dir of [work, docs]) fs.mkdirSync(dir, {recursive: true});
const h = await startHarness({port: Number(process.env.DISPLAY_PORT || 8881), state: `work/accent-follows-appearance/${mode}-d1`});
const {page, base, browser, context} = h;
const wait = ms => page.waitForTimeout(ms);
const THEMES = ['light', 'paper', 'midnight', 'charcoal', 'dusk', 'black'];
const SHOWN = ['light', 'midnight', 'paper', 'dusk'];
// Every accent sits at OKLCH L ~.84, so "lightest" and "darkest" go by WCAG luminance: Mint .641, Pink .567.
const CHOSEN = ['mint', 'gold', 'silver', 'pink'];
const WIDTHS = [[1440, 1000], [390, 844]];
const LIME = [163, 230, 53];

const ready = () => page.waitForFunction(() => typeof discs !== 'undefined' && discs.length > 0 && typeof DisplayPalette !== 'undefined');
const load = async (path = '/') => { await page.goto(base + path); await ready(); await wait(2600); };
const setTheme = async theme => {
  await page.evaluate(t => document.querySelector(`#siteMenu [data-theme-choice="${t}"]`).click(), theme);
  await page.waitForFunction(t => document.documentElement.dataset.theme === t && !document.documentElement.classList.contains('theme-switching'), theme);
  await page.mouse.move(2, 600);await wait(500);
};
const setAccent = async id => { await page.evaluate(id => DisplayPalette.setAccent(id), id); await wait(250); };
const box = selector => page.locator(selector).boundingBox();
const clip = async (selector, pad = 0) => { const b = await box(selector); return {x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2}; };
// The menu opened from the keyboard, focus moved to About: the focus ring and the current theme's check both show.
const openMenu = async () => {
  await page.focus('#siteMenuButton');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');
  await page.locator('#siteMenu:not([hidden])').waitFor();await wait(350);
};
const closeMenu = async () => { if (await page.evaluate(() => !document.getElementById('siteMenu').hidden)) await page.keyboard.press('Escape'); await page.mouse.move(2, 600); await wait(250); };

// Every element in the top bar, by a stable path, with every color it paints (and its ::before/::after).
const snapshot = () => page.evaluate(() => {
  const header = document.querySelector('body>header');
  const props = ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'outlineStyle', 'outlineWidth', 'fill', 'stroke', 'boxShadow', 'opacity', 'transform'];
  const tokens = ['--lime', '--accent-fill', '--accent-ink', '--accent-glow', '--accent-soft', '--accent-edge', '--selected', '--on-accent', '--da-accent', '--da-ink', '--da-plate'];
  const path = el => { const parts = []; for (let n = el; n && n !== header.parentElement; n = n.parentElement)
    parts.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.parentElement ? `:${[...n.parentElement.children].indexOf(n)}` : '')); return parts.join('>'); };
  const out = {};
  for (const el of [header, ...header.querySelectorAll('*')]) {
    for (const pseudo of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      if (pseudo && cs.content === 'none') continue;
      out[path(el) + (pseudo || '')] = Object.fromEntries(props.map(p => [p, cs[p]]));
    }
  }
  const hs = getComputedStyle(header), logo = getComputedStyle(header.querySelector('.logo'));
  out.tokens = Object.fromEntries(tokens.map(t => [t, (t.startsWith('--da') ? logo : hs).getPropertyValue(t).trim()]));
  return out;
});
const states = async () => {
  const out = {};
  out.rest = {css: await snapshot(), png: await page.screenshot({clip: await clip('body>header')})};
  await page.hover('#siteMenuButton');await wait(350);
  out.hover = {css: await snapshot(), png: await page.screenshot({clip: await clip('body>header')})};
  await page.mouse.move(2, 600);await wait(250);
  await openMenu();
  out.menu = {css: await snapshot(), png: await page.screenshot({clip: await clip('#siteMenu')})};
  await closeMenu();
  return out;
};

// Side by side, labeled, as one JPEG (as tests/more-packs-evidence.mjs does); `rows` is [[row label, [[label, png], ...]], ...].
async function compose(name, title, rows, width = 1800) {
  const sheet = await browser.newPage({viewport: {width, height: 400}});
  const cols = Math.max(...rows.map(([, cells]) => cells.length));
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ddd;font:14px system-ui;padding:12px"><div style="margin:0 0 10px;font-size:15px">${title}</div>` +
    rows.map(([label, cells]) => `<div style="margin:0 0 4px;color:#bbb">${label}</div><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;align-items:start;margin-bottom:12px">` +
      cells.map(([caption, png]) => `<figure style="margin:0">${(Array.isArray(png) ? png : [png]).map((p, i, all) =>
        // A stacked cell (the bar, then the open menu) keeps one pixel scale, the menu right-aligned as it opens.
        `<img style="width:${pngWidth(p) / pngWidth(all[0]) * 100}%;display:block;margin-left:auto;border-radius:4px${i ? ';margin-top:6px' : ''}" src="data:image/png;base64,${p.toString('base64')}">`).join('')}` +
        `<figcaption style="margin-top:3px;color:#999;font-size:12px">${caption}</figcaption></figure>`).join('') + `</div>`).join('') + `</body>`);
  await sheet.screenshot({path: `${docs}/${name}.jpg`, type: 'jpeg', quality: 80, fullPage: true});
  await sheet.close();
}
const pngWidth = png => png.readUInt32BE(16);
// How many pixels of two same-sized PNGs differ, measured in a scratch page.
async function pixelDiff(a, b) {
  const sheet = await browser.newPage();
  const result = await sheet.evaluate(async ([a, b]) => {
    const read = async src => { const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
    const [p, q] = await Promise.all([read(a), read(b)]);
    if (p.width !== q.width || p.height !== q.height) return {size: [p.width, p.height, q.width, q.height], diff: -1};
    // How many differ, where (the bounding box), and by how much at most (of 255).
    let diff = 0, box = null, most = 0;
    for (let i = 0; i < p.data.length; i += 4) {
      const d = Math.max(Math.abs(p.data[i] - q.data[i]), Math.abs(p.data[i + 1] - q.data[i + 1]), Math.abs(p.data[i + 2] - q.data[i + 2]));
      if (!d) continue;
      const x = i / 4 % p.width, y = Math.floor(i / 4 / p.width);
      diff++;most = Math.max(most, d);box = box ? [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)] : [x, y, x, y];
    }
    return {size: [p.width, p.height], diff, ...diff && {box, most}};
  }, [a.toString('base64'), b.toString('base64')]);
  await sheet.close();
  return result;
}

const results = {mode, defaults: {}, accents: {}, contrast: [], change: null, reload: null, filmstrip: {}};
try {
  // 1. The default top bar: computed colors and pixels, six themes, desktop and phone, at rest, hovered and with the menu open.
  const defaultCells = {};
  for (const [width, height] of WIDTHS) {
    await page.setViewportSize({width, height});await load();
    assert.equal(await page.evaluate(() => DisplayPalette.isDefault() && !document.getElementById('display-palette')), true, 'a visitor who never chose an accent');
    for (const theme of THEMES) {
      await setTheme(theme);
      const s = await states(), key = `${theme}-${width}`;
      for (const [state, {css, png}] of Object.entries(s)) {
        fs.writeFileSync(`${work}/default-${key}-${state}.png`, png);
        results.defaults[`${key}-${state}`] = css;
      }
      if (SHOWN.includes(theme)) (defaultCells[width] ??= []).push([theme, s.rest.png]);
    }
  }
  fs.writeFileSync(`${work}/default-css.json`, JSON.stringify(results.defaults));
  if (!BEFORE) {
    const before = JSON.parse(fs.readFileSync('work/accent-follows-appearance/before/default-css.json', 'utf8'));
    const report = results.defaultCompare = {css: [], pixels: []};
    for (const key of Object.keys(before)) {
      const diffs = Object.keys({...before[key], ...results.defaults[key]}).filter(el => JSON.stringify(before[key][el]) !== JSON.stringify(results.defaults[key]?.[el]));
      report.css.push({key, elements: Object.keys(before[key]).length, differing: diffs});
      const d = await pixelDiff(fs.readFileSync(`work/accent-follows-appearance/before/default-${key}.png`), fs.readFileSync(`${work}/default-${key}.png`));
      report.pixels.push({key, ...d});
    }
  }

  // 2. Chosen accents: the top bar in Light, Midnight, Paper and Dusk, desktop and phone. Each cell is the bar with the
  // site menu open from the keyboard (focus ring on About, the check on the current theme).
  for (const [width, height] of WIDTHS) {
    await page.setViewportSize({width, height});await load();
    const rows = [];
    for (const theme of SHOWN) {
      await setTheme(theme);
      const cells = [];
      let logoLime = null;
      for (const accent of ['lime', ...CHOSEN]) {
        // Past the pill's background and glow transitions (.18s), with room for a loaded machine.
        await setAccent(accent);await wait(450);
        // The logo and wordmark are brand artwork (brand/site.css's --da-* tokens): their pixels never follow the accent.
        const logo = await page.screenshot({clip: await clip('header .logo')});
        if (accent === 'lime') logoLime = logo;
        else {
          const d = await pixelDiff(logoLime, logo);
          (results.logo ??= []).push({theme, width, accent, ...d});
          if (d.diff) for (const [name, png] of [['lime', logoLime], [accent, logo]]) fs.writeFileSync(`${work}/logo-${theme}-${width}-${name}.png`, png);
        }
        // The bar at rest (from the nav to the right edge on desktop), then the menu opened from the keyboard, which on
        // a phone would cover the active pill.
        const nav = await box('body>header nav'), header = await box('body>header');
        const x = width < 500 ? 0 : Math.max(0, nav.x - 24);
        const bar = await page.screenshot({clip: {x, y: 0, width: width - x, height: header.y + header.height}});
        await openMenu();
        const menu = await box('#siteMenu'), mx = Math.max(x, menu.x - 12), my = Math.max(0, menu.y - 8);
        const png = [bar, await page.screenshot({clip: {x: mx, y: my, width: width - mx, height: menu.y + menu.height + 12 - my}})];
        const read = await page.evaluate(() => { const b = document.querySelector('header nav button.active'), cs = getComputedStyle(b);
          return {pill: cs.backgroundColor, label: cs.color, bar: getComputedStyle(b, '::after').backgroundColor, ring: getComputedStyle(document.activeElement).outlineColor,
            check: getComputedStyle(document.querySelector('#siteMenu [aria-checked="true"] .theme-choice-check')).color}; });
        (results.accents[`${theme}-${width}`] ??= {})[accent] = read;
        cells.push([accent === 'lime' ? 'Default (Lime, never chosen)' : accent[0].toUpperCase() + accent.slice(1), png]);
        await closeMenu();
      }
      rows.push([theme[0].toUpperCase() + theme.slice(1), cells]);
    }
    await setAccent('lime');
    await compose(`${mode}-accents-${width}`, `Top bar and site menu · ${mode === 'after' ? 'this branch' : 'origin/main'} · ${width}px · the bar at rest, then the menu opened from the keyboard`, rows, width < 500 ? 1700 : 2400);
  }
  for (const [width] of WIDTHS) await compose(`${mode}-default-${width}`, `Default top bar (no accent ever chosen) · ${mode === 'after' ? 'this branch' : 'origin/main'} · ${width}px`, [['Light, Midnight, Paper, Dusk', defaultCells[width]]], width < 500 ? 1700 : 2400);

  // 3. Contrast: every accent in all six themes, read from the rendered tokens in the top bar.
  await page.setViewportSize({width: 1440, height: 1000});await load();
  for (const theme of THEMES) {
    await setTheme(theme);
    for (const accent of ['lime', ...CHOSEN, 'aqua', 'sky', 'violet', 'coral'].filter((a, i, all) => all.indexOf(a) === i)) {
      await setAccent(accent);
      results.contrast.push({theme, accent, ...await page.evaluate(() => {
        const header = document.querySelector('body>header'), menu = document.getElementById('siteMenu');
        const rgb = (value, within = header) => { const probe = document.createElement('i'); probe.style.color = value; within.append(probe); const c = getComputedStyle(probe).color; probe.remove();
          const n = c.match(/[\d.]+/g).map(Number); return c.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : [n[0], n[1], n[2], n[3] ?? 1]; };
        const over = (top, under) => top.slice(0, 3).map((c, i) => c * top[3] + under[i] * (1 - top[3]));
        const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round((x + .05) / (y + .05) * 100) / 100; };
        const tok = (name, within = header) => rgb(getComputedStyle(within).getPropertyValue(name).trim(), within);
        const page = rgb(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(), document.body);
        const bar = over(rgb(getComputedStyle(header).backgroundColor), page), panel = over(tok('--panel', menu), page), surface = over(tok('--surface', menu), panel);
        const active = document.querySelector('header nav button.active'), cs = getComputedStyle(active);
        return {
          navLabel: ratio(rgb(cs.color), over(rgb(cs.backgroundColor), bar)),
          hoverIcon: ratio(over(tok('--lime'), bar), over(tok('--surface'), bar)),
          focusRingOnBar: ratio(over(tok('--lime'), bar), bar),
          // The menu's focus ring and the current theme's check are the same token on the same panel.
          ringAndCheckOnMenu: ratio(over(tok('--lime', menu), panel), panel),
          checkOnFocusedRow: ratio(over(tok('--lime', menu), surface), surface)
        };
      })});
    }
  }
  await setAccent('lime');

  // 4. An accent change in the Appearance sheet lands on the top bar at once: no reload, the same document.
  await load();await setTheme('light');
  await page.evaluate(() => { window.__sameDocument = true; });
  const pill = () => page.evaluate(() => ({pill: getComputedStyle(document.querySelector('header nav button.active')).backgroundColor, same: window.__sameDocument === true,
    stored: localStorage.getItem('disc-atlas-display')}));
  const barClip = await clip('body>header');
  const beforeChange = {...await pill(), png: await page.screenshot({clip: barClip})};
  await page.locator('#siteMenuButton').click();await page.locator('[data-appearance-open]').click();await page.locator('#appearanceDialog[open]').waitFor();await wait(900);
  await page.locator('#appearanceDialog [data-row="accent"] [data-swatch="violet"]').click();
  const t0 = Date.now();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('header nav button.active')).backgroundColor === 'rgb(206, 192, 255)', null, {timeout: 1500}).catch(() => {});
  const landedMs = Date.now() - t0;
  const inSheet = await page.screenshot({clip: {x: 0, y: 0, width: 1440, height: 1000}});
  await page.keyboard.press('Escape');await wait(500);
  const afterChange = {...await pill(), png: await page.screenshot({clip: barClip})};
  results.change = {before: beforeChange.pill, after: afterChange.pill, sameDocument: afterChange.same, landedMs, stored: afterChange.stored};

  // 5. Persistence: a reload keeps it.
  await load();
  const reloaded = {...await pill(), png: await page.screenshot({clip: barClip})};
  results.reload = {pill: reloaded.pill, sameDocument: reloaded.same, stored: reloaded.stored};
  await compose(`${mode}-change-and-reload`, `Light · ${mode === 'after' ? 'this branch' : 'origin/main'} · Violet chosen in the Appearance sheet`,
    [['The top bar', [['Before: never chosen', beforeChange.png], ['Right after the tap, no reload', afterChange.png], ['After a reload', reloaded.png]]], ['The tap, with the sheet open', [['Appearance sheet', inSheet]]]], 2000);

  // 6. Page load: no lime frame. A frame-by-frame record from the first moment the nav exists, and a screencast of the
  // whole load at 4x CPU throttling, each frame's nav scanned for the lime fill. Violet chosen (from step 4), Midnight.
  for (const [label, theme, accent] of [['violet-midnight', 'midnight', 'violet'], ['violet-light', 'light', 'violet'], ['default-midnight', 'midnight', 'lime']]) {
    await load();await setTheme(theme);await setAccent(accent);
    const navBox = await box('body>header nav');
    const recorder = await context.newPage();
    await recorder.setViewportSize({width: 1440, height: 1000});
    await recorder.addInitScript(() => {
      const t0 = performance.now(), samples = window.__samples = [];
      const sample = () => { const b = document.getElementById('mapTab'); const cs = getComputedStyle(b);
        samples.push({t: Math.round(performance.now() - t0), pill: cs.backgroundColor, bar: getComputedStyle(b, '::after').backgroundColor}); if (samples.length < 90) requestAnimationFrame(sample); };
      new MutationObserver((_, observer) => { if (document.getElementById('mapTab')) { observer.disconnect(); sample(); } }).observe(document, {childList: true, subtree: true});
    });
    const cdp = await context.newCDPSession(recorder);
    await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
    const frames = [];
    cdp.on('Page.screencastFrame', async frame => { frames.push(frame); await cdp.send('Page.screencastFrameAck', {sessionId: frame.sessionId}).catch(() => {}); });
    await cdp.send('Page.startScreencast', {format: 'png', everyNthFrame: 1});
    await recorder.goto(base + '/');
    await recorder.waitForFunction(() => typeof discs !== 'undefined' && discs.length > 0, null, {timeout: 60000});
    await recorder.waitForTimeout(1500);
    await cdp.send('Page.stopScreencast');
    const samples = await recorder.evaluate(() => window.__samples);
    await recorder.close();
    // Scan each frame's nav region for lime pixels (the default lime pill is a positive control).
    const sheet = await browser.newPage({viewport: {width: 1700, height: 400}});
    const scan = await sheet.evaluate(async ({frames, nav, lime}) => {
      const out = [];
      for (const f of frames) {
        const img = new Image(); img.src = 'data:image/png;base64,' + f.data; await img.decode();
        const s = img.width / 1440, c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0);
        const d = x.getImageData(Math.floor(nav.x * s), Math.floor(nav.y * s), Math.ceil(nav.width * s), Math.ceil(nav.height * s)).data;
        let limePx = 0, nonWhite = 0;
        for (let i = 0; i < d.length; i += 4) { if (Math.hypot(d[i] - lime[0], d[i + 1] - lime[1], d[i + 2] - lime[2]) < 36) limePx++; if (d[i] + d[i + 1] + d[i + 2] < 750) nonWhite++; }
        out.push({t: f.metadata.timestamp, limePx, painted: nonWhite > 0});
      }
      return out;
    }, {frames, nav: navBox, lime: LIME});
    // A filmstrip of the first frames that show the nav, cropped to it.
    const strip = scan.map((s, i) => [s, frames[i]]).filter(([s]) => s.painted).slice(0, 8);
    const crops = [];
    for (const [s, f] of strip) {
      const crop = await sheet.evaluate(async ({data, nav}) => { const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
        const k = img.width / 1440, c = new OffscreenCanvas(Math.ceil((nav.width + 40) * k), Math.ceil((nav.height + 20) * k)); c.getContext('2d').drawImage(img, -(nav.x - 20) * k, -(nav.y - 10) * k);
        const blob = await c.convertToBlob(); return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))); }, {data: f.data, nav: navBox});
      crops.push([`+${Math.round((s.t - scan[0].t) * 1000)} ms · lime px ${s.limePx}`, Buffer.from(crop, 'base64')]);
    }
    await sheet.close();
    const limeRgb = `rgb(${LIME.join(', ')})`;
    results.filmstrip[label] = {frames: scan.length, paintedFrames: scan.filter(s => s.painted).length, limeFrames: scan.filter(s => s.painted && s.limePx > 20).length,
      samples: samples.length, firstSample: samples[0], limeSamples: samples.filter(s => s.pill === limeRgb || s.bar === limeRgb).length};
    await compose(`${mode}-load-${label}`, `Page load, ${theme}, accent ${accent} · ${mode === 'after' ? 'this branch' : 'origin/main'} · first painted frames at 4x CPU throttling`, [['Nav, frame by frame', crops]], 2400);
  }
  // Back to the default for whoever runs next.
  await load();await page.evaluate(() => DisplayPalette.reset());

  fs.writeFileSync(`${work}/results.json`, JSON.stringify({...results, defaults: undefined}, null, 1));
  console.log(JSON.stringify({...results, defaults: undefined, accents: undefined, contrast: undefined,
    defaultCompare: results.defaultCompare && {cssDiffering: results.defaultCompare.css.filter(r => r.differing.length), pixelsDiffering: results.defaultCompare.pixels.filter(r => r.diff !== 0)}}, null, 1));
  if (h.errors.length) console.log('page errors:', h.errors);
} finally {
  await h.stop();
}
