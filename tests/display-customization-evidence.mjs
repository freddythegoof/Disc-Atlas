// Screenshots for docs/display-customization.md: atlas, bag and viewer in the defaults, one hand-mixed palette
// and each pack, light and dark; stamp finishes; the Appearance sheet; Paper and Dusk.
// Run with `node tests/display-customization-evidence.mjs` (writes docs/images/display-customization/).
import fs from 'node:fs';
import {startHarness, BAG} from './display-harness.mjs';

const dir = 'docs/images/display-customization';
fs.mkdirSync(dir, {recursive: true});
const h = await startHarness({port: Number(process.env.DISPLAY_PORT || 8871)});
const {page, base, browser} = h;
const wait = ms => page.waitForTimeout(ms);
// The catalog is in (phones open on the list, so markers are not a signal there).
const ready = () => page.waitForFunction(() => typeof discs !== 'undefined' && discs.length > 0 && typeof DisplayPalette !== 'undefined');
const setTheme = async theme => {
  await page.evaluate(t => document.querySelector(`#siteMenu [data-theme-choice="${t}"]`).click(), theme);
  await page.waitForFunction(t => document.documentElement.dataset.theme === t && !document.documentElement.classList.contains('theme-switching'), theme);
  await wait(600);
};
const shot = () => page.screenshot({type: 'png'});
// Side by side, labeled, as one JPEG per row.
async function compose(name, title, images) {
  const sheet = await browser.newPage({viewport: {width: 1800, height: 400}});
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ddd;font:15px system-ui;padding:12px">
    <div style="margin:0 0 8px">${title}</div><div style="display:grid;grid-template-columns:repeat(${images.length},1fr);gap:10px">` +
    images.map(([label, png]) => `<figure style="margin:0"><img style="width:100%;display:block;border-radius:6px" src="data:image/png;base64,${png.toString('base64')}"><figcaption style="margin-top:4px;color:#999">${label}</figcaption></figure>`).join('') +
    `</div></body>`);
  await sheet.screenshot({path: `${dir}/${name}.jpg`, type: 'jpeg', quality: 74, fullPage: true});
  await sheet.close();
}
// A distance driver that is not in the seeded bag, so it wears its class color (a bag disc wears its own).
const catalogDisc = () => page.evaluate(() => select(discs.find(d => d.name === 'Wraith' && d.brand === 'Innova')));
async function trio(theme) {
  await page.goto(base + '/');await ready();await setTheme(theme);await wait(1800);
  const atlas = await shot();
  await catalogDisc();await page.waitForFunction(() => document.querySelector('#detail .disc3d-stage')?.dataset.state === 'ready');await wait(900);
  const viewer = await page.locator('#detail [data-disc3d]').screenshot();
  await page.goto(base + '/?bag=1');await page.waitForFunction(() => document.querySelector('#bagScene')?.dataset.phase === 'open');await wait(2200);
  const bag = await shot();
  return [['Atlas (personalized map: bag discs in their own colors)', atlas], ['My Bag (class chips, accent)', bag], ['Viewer: a catalog Wraith (not in the bag) in its class color', viewer]];
}

try {
  await h.signIn();
  await h.seedBag([...BAG, {mold_id: '9152771e1f7b', plastic: 'DX', wear: 3, weight_g: 180, color: '#79b3a8', in_bag: false}]);
  const palettes = [
    ['defaults', 'Defaults (Classic: Plan 06C and lime)', p => p.reset()],
    ['mixed', 'Hand-mixed: Tangerine, Navy, Leaf, Orchid, Pink accent', p => p.set({classes: {distance: 'tangerine', fairway: 'navy', mid: 'leaf', putter: 'orchid'}, accent: 'pink'})],
    ['harbor', 'Harbor pack (colorblind-safe)', p => p.applyPack('harbor')],
    ['sunset', 'Sunset pack (colorblind-safe)', p => p.applyPack('sunset')],
    ['field', 'Field pack (not labeled: fails the colorblind floor)', p => p.applyPack('field')],
    ['floodlight', 'Floodlight pack (colorblind-safe)', p => p.applyPack('floodlight')]
  ];
  for (const [id, title, apply] of palettes) for (const theme of ['light', 'midnight']) {
    await page.goto(base + '/');await page.evaluate(`(${apply.toString()})(DisplayPalette)`);
    await compose(`palette-${id}-${theme}`, `${title} · ${theme === 'light' ? 'Light' : 'Midnight'}`, await trio(theme));
  }
  await page.goto(base + '/');await page.evaluate(() => DisplayPalette.reset());

  // The sheet, desktop and phone.
  for (const [theme, width] of [['light', 1440], ['midnight', 1440], ['midnight', 390]]) {
    await page.setViewportSize({width, height: width < 500 ? 844 : 1000});
    await page.goto(base + '/');await ready();await setTheme(theme);
    await page.evaluate(() => DisplayPalette.set({classes: {distance: 'ember', putter: 'lavender'}, accent: 'violet'}));
    await page.locator('#siteMenuButton').click();await page.locator('[data-appearance-open]').click();await wait(1500);
    const top = await shot();await page.locator('.appearance-stamp').scrollIntoViewIfNeeded();await wait(800);
    await compose(`sheet-${theme}-${width}`, `The Appearance sheet · ${theme} · ${width}px`, [['Top: preview, theme, packs, rows', top], ['Bottom: accent, stamps', await shot()]]);
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width: 1440, height: 1000});
  await page.evaluate(() => DisplayPalette.reset());

  // Stamps: the viewer for an owned Buzzz in each finish (3/4 and Top), the bag's pulled Buzzz, map stills.
  await page.goto(base + '/');await ready();await setTheme('midnight');
  const view = name => page.locator('#detail [data-disc3d] button', {hasText: new RegExp('^' + name + '$')}).click();
  const buzzz = async () => { await page.evaluate(() => select(discs.find(d => d.name === 'Buzzz' && d.brand === 'Discraft')));await page.waitForFunction(() => document.querySelector('#detail .disc3d-stage')?.dataset.state === 'ready');await wait(800); };
  const finishes = [];
  for (const [ink, finish, label] of [['auto', 'flat', 'Today: Auto ink, flat'], ['red', 'flat', 'Red ink, flat'], ['gold', 'foil', 'Gold foil'], ['silver', 'rainbow', 'Rainbow foil'], ['silver', 'shatter', 'Shatter foil'], ['gold', 'spin', 'Spin foil, gold']]) {
    await page.evaluate(([ink, finish]) => DisplayPalette.setStamp({ink, finish}), [ink, finish]);await buzzz();
    await view('3/4');await wait(700);const a = await page.locator('#detail .disc3d-stage').screenshot();
    await view('Top');await wait(700);finishes.push([label + ' · 3/4', a], [label + ' · Top', await page.locator('#detail .disc3d-stage').screenshot()]);
  }
  for (let i = 0; i < finishes.length; i += 4) await compose(`stamps-viewer-${i / 4 + 1}`, 'Stamps in the viewer, the player\'s own Buzzz (personalized map). Two angles: the foils respond to light.', finishes.slice(i, i + 4));
  // Neutral: the same Buzzz on the Standard map keeps the official stamp.
  await page.evaluate(() => DisplayPalette.setStamp({ink: 'gold', finish: 'foil'}));
  await page.evaluate(() => document.querySelector('#lensMenu [data-lens="default"]').click());await wait(800);await buzzz();await view('3/4');await wait(700);
  const neutral = await page.locator('#detail .disc3d-stage').screenshot();
  await page.evaluate(() => document.querySelector('#lensMenu [data-lens="mine"]').click());await wait(800);await buzzz();await view('3/4');await wait(700);
  await compose('stamps-neutral-personal', 'Same Buzzz, same setting (gold foil): the Standard map keeps the official stamp; the personalized map wears the player\'s.',
    [['Standard map (neutral)', neutral], ['Personalized map (own disc)', await page.locator('#detail .disc3d-stage').screenshot()]]);
  // Map stills: the marker art itself, large.
  const stills = await page.evaluate(async () => {
    const art = await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(), d = discs.find(d => d.name === 'Buzzz' && d.brand === 'Discraft'), out = [];
    for (const [ink, finish] of [[null, null], ['gold', 'foil'], ['silver', 'rainbow'], ['silver', 'shatter']]) {
      const style = ink && {ink: DisplayPalette.catalog.inks.find(i => i.id === ink).hex, inkId: ink, finish: DisplayPalette.catalog.finishes.find(f => f.id === finish)};
      let e;for (let i = 0; i < 50; i++) { e = art.render(style ? {...d, stampStyle: style} : d, '#b99bdd', 320, undefined, 'full', true);if (e && !e.pending) break;await new Promise(r => setTimeout(r, 100)); }
      out.push([ink ? `${ink} ${finish}` : 'official (neutral)', e.canvas.toDataURL('image/png').split(',')[1]]);
    }
    return out;
  });
  await compose('stamps-map-stills', 'Atlas marker art on the personalized map: one still from above, lit once. It reads as foil; it does not move.', stills.map(([l, b]) => [l, Buffer.from(b, 'base64')]));
  // The bag's pulled Buzzz.
  const pulled = [];
  for (const [ink, finish] of [['gold', 'foil'], ['silver', 'rainbow']]) {
    await page.evaluate(([ink, finish]) => DisplayPalette.setStamp({ink, finish}), [ink, finish]);
    await page.goto(base + '/?bag=1');await page.waitForFunction(() => document.querySelector('#bagScene')?.dataset.phase === 'open');await wait(1500);
    const key = await page.evaluate(() => [...document.querySelectorAll('[data-physical-disc]')].find(n => /Buzzz/.test(n.getAttribute('aria-label') || ''))?.dataset.physicalDisc);
    await page.locator(`[data-physical-disc="${key}"]`).evaluate(n => n.click());await wait(3000);
    pulled.push([`${ink} ${finish}`, await page.screenshot({clip: {x: 860, y: 560, width: 580, height: 440}})]);
  }
  await compose('stamps-bag', 'The bag: a pulled stock disc wears the player\'s stamp.', pulled);
  await page.evaluate(() => DisplayPalette.reset());

  // Paper and Dusk across surfaces.
  for (const theme of ['paper', 'dusk']) {
    await page.goto(base + '/');await ready();await setTheme(theme);await wait(1500);
    const atlas = await shot();
    await catalogDisc();await page.waitForFunction(() => document.querySelector('#detail .disc3d-stage')?.dataset.state === 'ready');await wait(800);
    const viewer = await page.locator('#detail [data-disc3d]').screenshot();
    await page.locator('#detail [data-disc3d] button', {hasText: /^Clay$/}).click();await wait(800);
    const clay = await page.locator('#detail [data-disc3d]').screenshot();
    await page.locator('#detail [data-disc3d] button', {hasText: /^Clay$/}).click();
    await page.locator('#listTab').click();await page.locator('#rows .directory-row').first().waitFor();await wait(1000);
    const directory = await shot();
    await page.goto(base + '/?bag=1');await page.waitForFunction(() => document.querySelector('#bagScene')?.dataset.phase === 'open');await wait(2200);
    const bag = await shot();
    await page.locator('#myBagView [role="tab"],#myBagView button').filter({hasText: /^Storage$/}).first().click();await wait(2500);
    const storage = await shot();
    await compose(`theme-${theme}-app`, `${theme === 'paper' ? 'Paper' : 'Dusk'} · the app`, [['Atlas', atlas], ['Directory', directory], ['My Bag', bag]]);
    await compose(`theme-${theme}-detail`, `${theme === 'paper' ? 'Paper' : 'Dusk'} · viewer, clay, storage`, [['Viewer', viewer], ['Clay', clay], ['Storage', storage]]);
    const pages = [];
    for (const p of ['/about', '/privacy', '/account-settings']) { await page.goto(base + p);await wait(1400);pages.push([p, await shot()]); }
    await compose(`theme-${theme}-pages`, `${theme === 'paper' ? 'Paper' : 'Dusk'} · information and account pages`, pages);
  }
  if (h.errors.length) console.log('page errors:', h.errors);
  console.log('Evidence written to ' + dir);
} finally {
  await h.stop();
}
