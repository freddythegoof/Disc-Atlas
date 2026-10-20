// Screenshots for docs/more-packs.md: the Appearance sheet's two pack rows on desktop and phone, a variety pack
// tweaked into a personal mix, and each variety pack on the atlas in Light, Paper, Midnight and Dusk.
// Run with `node tests/more-packs-evidence.mjs` (writes docs/images/more-packs/).
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const dir = 'docs/images/more-packs';
fs.mkdirSync(dir, {recursive: true});
const h = await startHarness({port: Number(process.env.DISPLAY_PORT || 8872), state: 'work/more-packs/evidence-d1'});
const {page, base, browser} = h;
const wait = ms => page.waitForTimeout(ms);
const ready = () => page.waitForFunction(() => typeof discs !== 'undefined' && discs.length > 0 && typeof DisplayPalette !== 'undefined');
const setTheme = async theme => {
  await page.evaluate(t => document.querySelector(`#siteMenu [data-theme-choice="${t}"]`).click(), theme);
  await page.waitForFunction(t => document.documentElement.dataset.theme === t && !document.documentElement.classList.contains('theme-switching'), theme);
  await wait(600);
};
const shot = () => page.screenshot({type: 'png'});
// Side by side, labeled, as one JPEG per row (as tests/display-customization-evidence.mjs does).
async function compose(name, title, images, width = 1800) {
  const sheet = await browser.newPage({viewport: {width, height: 400}});
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ddd;font:15px system-ui;padding:12px">
    <div style="margin:0 0 8px">${title}</div><div style="display:grid;grid-template-columns:repeat(${images.length},1fr);gap:10px;align-items:start">` +
    images.map(([label, png]) => `<figure style="margin:0"><img style="width:100%;display:block;border-radius:6px" src="data:image/png;base64,${png.toString('base64')}"><figcaption style="margin-top:4px;color:#999">${label}</figcaption></figure>`).join('') +
    `</div></body>`);
  await sheet.screenshot({path: `${dir}/${name}.jpg`, type: 'jpeg', quality: 78, fullPage: true});
  await sheet.close();
}
const openSheet = async () => {
  await page.locator('#siteMenuButton').click();await page.locator('[data-appearance-open]').click();
  await page.locator('#appearanceDialog[open]').waitFor();await wait(1200);
};
// An element with a little room, so a selected swatch's ring is not cut at the edge.
const region = async selector => { const b = await page.locator(selector).boundingBox(); return page.screenshot({clip: {x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 8), width: b.width + 16, height: b.height + 16}}); };
const packs = () => region('#appearanceDialog .appearance-packs');

try {
  // The sheet: desktop in Light and Midnight, phone in Paper and Dusk. Each with a variety pack chosen.
  for (const [theme, width, pack] of [['light', 1440, 'grayscale'], ['midnight', 1440, 'neon'], ['paper', 390, 'pastel'], ['dusk', 390, 'jewel']]) {
    await page.setViewportSize({width, height: width < 500 ? 844 : 1000});
    await page.goto(base + '/');await ready();await setTheme(theme);
    await page.evaluate(id => DisplayPalette.applyPack(id), pack);
    await openSheet();
    const top = await shot();
    await page.locator('#appearanceDialog [data-appearance-classes]').scrollIntoViewIfNeeded();await wait(500);
    const rows = await region('#appearanceDialog [data-appearance-classes]');
    await compose(`sheet-${theme}-${width}`, `The Appearance sheet · ${theme} · ${width}px · ${pack} chosen`,
      width < 500 ? [['The sheet', top], ['Pack rows', await (async () => { await page.locator('#appearanceDialog .appearance-packs').scrollIntoViewIfNeeded(); await wait(300); return packs(); })()], ['Class rows: the neutral is last', rows]]
        : [['The sheet', top], ['Class and accent rows: the neutral is last', rows]], width < 500 ? 1500 : 1800);
    await page.keyboard.press('Escape');
  }

  // A tweak: Grayscale, then Driver to Orange, and the sheet says "Your mix".
  await page.setViewportSize({width: 1440, height: 1000});
  await page.goto(base + '/');await ready();await setTheme('light');
  await page.evaluate(() => DisplayPalette.applyPack('grayscale'));
  await openSheet();
  const before = await packs();
  await page.locator('#appearanceDialog [data-row="distance"] [data-swatch="classic"]').click();await wait(400);
  await compose('tweak-light-1440', 'Grayscale, then one tap on Driver: Orange · the pack becomes your mix', [['Grayscale applied', before], ['After the tweak', await packs()]], 1400);
  await page.keyboard.press('Escape');

  // Each variety pack on the atlas, in the four themes that differ most.
  for (const pack of ['grayscale', 'neon', 'pastel', 'vintage', 'jewel']) {
    const panes = [];
    for (const theme of ['light', 'paper', 'midnight', 'dusk']) {
      await page.goto(base + '/');await ready();await setTheme(theme);
      await page.evaluate(id => DisplayPalette.applyPack(id), pack);await wait(1800);
      panes.push([theme[0].toUpperCase() + theme.slice(1), await shot()]);
    }
    const label = await page.evaluate(id => { const p = DisplayPalette.catalog.packs.find(p => p.id === id); return `${p.label}${p.colorblindSafe ? ' (colorblind-safe)' : ' (unlabeled)'}`; }, pack);
    await compose(`atlas-${pack}`, `${label} on the atlas`, panes);
  }
  await page.evaluate(() => DisplayPalette.reset());
  if (h.errors?.length) console.warn('Page errors:', h.errors);
  console.log('More packs evidence written to', dir);
} finally {
  await h.stop();
}
