// Evidence for the Appearance sheet's Done button following the accent (docs/accent-follows-appearance.md): the
// default button unchanged, every other element in the sheet unchanged with an accent chosen, the button following
// a tap at once and after a reload, its label's contrast for every accent in all six themes, and pictures.
// `node tests/accent-done-button-evidence.mjs --before` in a clean checkout of the previous tip records the
// reference to work/accent-done-button/before/; the plain run on the branch compares against it.
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const BEFORE = process.argv.includes('--before');
const mode = BEFORE ? 'before' : 'after';
const work = `work/accent-done-button/${mode}`, docs = 'docs/images/accent-follows-appearance';
for (const dir of [work, docs]) fs.mkdirSync(dir, {recursive: true});
const h = await startHarness({port: Number(process.env.DISPLAY_PORT || 8883), state: `work/accent-done-button/${mode}-d1`});
const {page, base, browser} = h;
const wait = ms => page.waitForTimeout(ms);
const THEMES = ['light', 'paper', 'midnight', 'charcoal', 'dusk', 'black'];
const SHOWN = ['light', 'midnight', 'paper', 'dusk'];
const ACCENTS = ['lime', 'mint', 'aqua', 'sky', 'violet', 'pink', 'coral', 'gold', 'silver'];
// Every accent sits at OKLCH L ~.84, so "lightest" and "darkest" go by WCAG luminance: Mint .641, Pink .567.
const CHOSEN = ['mint', 'gold', 'silver', 'pink'];
const DONE = '#appearanceDialog [data-appearance-close].primary';

const ready = () => page.waitForFunction(() => typeof discs !== 'undefined' && discs.length > 0 && typeof DisplayPalette !== 'undefined');
const load = async () => { await page.goto(base + '/'); await ready(); await wait(2600); };
const setTheme = async theme => {
  await page.evaluate(t => document.querySelector(`#siteMenu [data-theme-choice="${t}"]`).click(), theme);
  await page.waitForFunction(t => document.documentElement.dataset.theme === t && !document.documentElement.classList.contains('theme-switching'), theme);
  await wait(500);
};
// Past the button's transitions (.15–.18s), with room for a loaded machine.
const setAccent = async id => { await page.evaluate(id => DisplayPalette.setAccent(id), id); await wait(700); };
const openSheet = async () => {
  if (await page.locator('#appearanceDialog[open]').count()) return;
  await page.locator('#siteMenuButton').click();await page.locator('[data-appearance-open]').click();
  await page.locator('#appearanceDialog[open]').waitFor();await wait(1200);
};
const closeSheet = async () => { await page.keyboard.press('Escape'); await page.locator('#appearanceDialog:not([open])').waitFor(); await wait(400); };
const actions = async () => { await page.locator('#appearanceDialog .sheet-actions').scrollIntoViewIfNeeded(); await page.mouse.move(2, 2); await wait(300);
  const b = await page.locator('#appearanceDialog .sheet-actions').boundingBox(); return page.screenshot({clip: {x: b.x - 10, y: b.y - 10, width: b.width + 20, height: b.height + 20}}); };

// Every element in the sheet, by a stable path, with every color it paints; the Done button (and anything in it) apart.
const snapshot = () => page.evaluate(done => {
  const dialog = document.getElementById('appearanceDialog'), button = document.querySelector(done);
  const props = ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'outlineStyle', 'fill', 'stroke', 'boxShadow', 'opacity', 'filter'];
  const path = el => { const parts = []; for (let n = el; n && n !== dialog.parentElement; n = n.parentElement)
    parts.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + `:${[...n.parentElement.children].indexOf(n)}`); return parts.join('>'); };
  const rest = {}, doneOut = {};
  for (const el of [dialog, ...dialog.querySelectorAll('*')]) {
    if (el.closest('canvas,[data-stamp-preview]')) continue; // the live 3D stamp preview
    for (const pseudo of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      if (pseudo && cs.content === 'none') continue;
      (button.contains(el) ? doneOut : rest)[path(el) + (pseudo || '')] = Object.fromEntries(props.map(p => [p, cs[p]]));
    }
  }
  return {rest, done: doneOut};
}, DONE);
// The button's paint, read three ways: at rest, hovered, and focused from the keyboard.
const doneStates = async () => {
  const read = () => page.evaluate(done => { const cs = getComputedStyle(document.querySelector(done));
    return {background: cs.backgroundColor, label: cs.color, border: cs.borderTopColor, glow: cs.boxShadow, outline: `${cs.outlineStyle} ${cs.outlineColor}`, filter: cs.filter}; }, DONE);
  const rest = await read();
  await page.hover(DONE);await wait(300);const hover = await read();
  await page.mouse.move(2, 2);await page.focus('#appearanceDialog [data-appearance-reset]');await page.keyboard.press('Tab');await wait(300);
  const focus = {...await read(), focused: await page.evaluate(done => document.activeElement === document.querySelector(done), DONE)};
  await page.focus('#appearanceDialog [data-row="accent"] [aria-checked="true"]');await wait(200);
  return {rest, hover, focus};
};

async function compose(name, title, rows, width = 1800) {
  const sheet = await browser.newPage({viewport: {width, height: 300}});
  const cols = Math.max(...rows.map(([, cells]) => cells.length));
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ddd;font:14px system-ui;padding:12px"><div style="margin:0 0 10px;font-size:15px">${title}</div>` +
    rows.map(([label, cells]) => `<div style="margin:0 0 4px;color:#bbb">${label}</div><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;align-items:start;margin-bottom:12px">` +
      cells.map(([caption, png]) => `<figure style="margin:0"><img style="width:100%;display:block;border-radius:4px" src="data:image/png;base64,${png.toString('base64')}">` +
        `<figcaption style="margin-top:3px;color:#999;font-size:12px">${caption}</figcaption></figure>`).join('') + `</div>`).join('') + `</body>`);
  await sheet.screenshot({path: `${docs}/${name}.jpg`, type: 'jpeg', quality: 82, fullPage: true});
  await sheet.close();
}
async function pixelDiff(a, b) {
  const sheet = await browser.newPage();
  const result = await sheet.evaluate(async ([a, b]) => {
    const read = async src => { const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
    const [p, q] = await Promise.all([read(a), read(b)]);
    if (p.width !== q.width || p.height !== q.height) return {size: [p.width, p.height, q.width, q.height], diff: -1};
    let diff = 0, most = 0;
    for (let i = 0; i < p.data.length; i += 4) { const d = Math.max(Math.abs(p.data[i] - q.data[i]), Math.abs(p.data[i + 1] - q.data[i + 1]), Math.abs(p.data[i + 2] - q.data[i + 2])); if (d) { diff++; most = Math.max(most, d); } }
    return {size: [p.width, p.height], diff, ...diff && {most}};
  }, [a.toString('base64'), b.toString('base64')]);
  await sheet.close();
  return result;
}

const results = {mode, defaults: {}, chosen: {}, contrast: [], change: null, reload: null};
try {
  // 1. The default (never chosen) in all six themes, desktop and phone: the whole sheet's colors, the button's three
  // states, and the action row's pixels. 2. Violet chosen, the same, to show nothing but the button moves.
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    await page.setViewportSize({width, height});await load();
    for (const theme of THEMES) {
      await setTheme(theme);await openSheet();
      const key = `${theme}-${width}`;
      results.defaults[key] = {...await snapshot(), states: await doneStates()};
      fs.writeFileSync(`${work}/default-${key}.png`, await actions());
      await setAccent('violet');
      results.chosen[key] = {...await snapshot(), states: await doneStates()};
      await setAccent('lime');
      await closeSheet();
    }
  }
  fs.writeFileSync(`${work}/sheet-css.json`, JSON.stringify({defaults: results.defaults, chosen: results.chosen}));
  if (!BEFORE) {
    const before = JSON.parse(fs.readFileSync('work/accent-done-button/before/sheet-css.json', 'utf8'));
    const differing = (a, b) => Object.keys({...a, ...b}).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    const report = results.compare = {defaults: [], chosen: []};
    for (const key of Object.keys(before.defaults)) {
      const a = before.defaults[key], b = results.defaults[key];
      report.defaults.push({key, rest: differing(a.rest, b.rest).length, restElements: Object.keys(a.rest).length, done: differing(a.done, b.done).length,
        states: JSON.stringify(a.states) === JSON.stringify(b.states),
        ...await pixelDiff(fs.readFileSync(`work/accent-done-button/before/default-${key}.png`), fs.readFileSync(`${work}/default-${key}.png`))});
      const c = before.chosen[key], d = results.chosen[key];
      report.chosen.push({key, rest: differing(c.rest, d.rest), restElements: Object.keys(c.rest).length, doneBefore: c.states.rest.background, doneAfter: d.states.rest.background});
    }
  }

  // 3. Pictures: the action row in Light, Midnight, Paper and Dusk, desktop and phone, default and four accents.
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    await page.setViewportSize({width, height});await load();
    const rows = [];
    for (const theme of SHOWN) {
      await setTheme(theme);await openSheet();
      const cells = [];
      for (const accent of ['lime', ...CHOSEN]) { await setAccent(accent); cells.push([accent === 'lime' ? 'Default (Lime, never chosen)' : accent[0].toUpperCase() + accent.slice(1), await actions()]); }
      await setAccent('lime');await closeSheet();
      rows.push([theme[0].toUpperCase() + theme.slice(1), cells]);
    }
    await compose(`${mode}-done-${width}`, `The Appearance sheet's Reset and Done · ${mode === 'after' ? 'this branch' : 'previous tip'} · ${width}px`, rows, width < 500 ? 1500 : 1800);
  }

  // 4. Contrast: the label on the button's fill, and its keyboard focus ring on the sheet, every accent, all six themes.
  await page.setViewportSize({width: 1440, height: 1000});await load();
  for (const theme of THEMES) {
    await setTheme(theme);await openSheet();
    for (const accent of ACCENTS) {
      await setAccent(accent);
      results.contrast.push({theme, accent, ...await page.evaluate(done => {
        const button = document.querySelector(done), dialog = document.getElementById('appearanceDialog');
        const rgb = value => { const probe = document.createElement('i'); probe.style.color = value; button.append(probe); const c = getComputedStyle(probe).color; probe.remove();
          const n = c.match(/[\d.]+/g).map(Number); return c.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : [n[0], n[1], n[2], n[3] ?? 1]; };
        const over = (top, under) => top.slice(0, 3).map((c, i) => c * top[3] + under[i] * (1 - top[3]));
        const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round((x + .05) / (y + .05) * 100) / 100; };
        const sheet = over(rgb(getComputedStyle(dialog).backgroundColor), rgb(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()));
        const cs = getComputedStyle(button), fill = over(rgb(cs.backgroundColor), sheet);
        return {fill: cs.backgroundColor, label: ratio(rgb(cs.color), fill), ringOnSheet: ratio(over(rgb(getComputedStyle(button).getPropertyValue('--lime').trim()), sheet), sheet)};
      }, DONE)});
    }
    await setAccent('lime');await closeSheet();
  }

  // 5. Live: tap Violet in the sheet; the Done button changes in the same document, the sheet still open. 6. Reload.
  await load();await setTheme('light');await openSheet();
  await page.evaluate(() => { window.__sameDocument = true; });
  const done = () => page.evaluate(d => ({background: getComputedStyle(document.querySelector(d)).backgroundColor, same: window.__sameDocument === true,
    open: document.getElementById('appearanceDialog').open, stored: localStorage.getItem('disc-atlas-display')}), DONE);
  const before = {...await done(), png: await actions()};
  await page.locator('#appearanceDialog [data-row="accent"] [data-swatch="violet"]').click();
  const t0 = Date.now();
  await page.waitForFunction(d => getComputedStyle(document.querySelector(d)).backgroundColor === 'rgb(206, 192, 255)', DONE, {timeout: 1500}).catch(() => {});
  const landedMs = Date.now() - t0;
  const after = {...await done(), png: await actions()};
  results.change = {before: before.background, after: after.background, sameDocument: after.same, sheetOpen: after.open, landedMs, stored: after.stored};
  await closeSheet();await load();await openSheet();
  const reloaded = {...await done(), png: await actions()};
  results.reload = {background: reloaded.background, sameDocument: reloaded.same, stored: reloaded.stored};
  await compose(`${mode}-done-change-and-reload`, `Light · ${mode === 'after' ? 'this branch' : 'previous tip'} · Violet tapped in the open sheet`,
    [['Reset and Done', [['Before: never chosen', before.png], ['Right after the tap, sheet still open', after.png], ['After a reload', reloaded.png]]]], 1500);
  await closeSheet();await page.evaluate(() => DisplayPalette.reset());

  fs.writeFileSync(`${work}/results.json`, JSON.stringify({...results, defaults: undefined, chosen: undefined}, null, 1));
  console.log(JSON.stringify({change: results.change, reload: results.reload,
    compare: results.compare && {defaults: results.compare.defaults.filter(r => r.rest || r.done || !r.states || r.diff), chosenRestDiffering: results.compare.chosen.filter(r => r.rest.length),
      chosenDone: results.compare.chosen.map(r => `${r.key} ${r.doneBefore} -> ${r.doneAfter}`)},
    contrastMin: Math.min(...results.contrast.map(c => c.label)), ringMin: Math.min(...results.contrast.map(c => c.ringOnSheet))}, null, 1));
  if (h.errors.length) console.log('page errors:', h.errors);
} finally {
  await h.stop();
}
