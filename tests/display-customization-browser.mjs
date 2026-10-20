// Display customization in the real site (docs/display-customization.md): the Appearance sheet, every
// class-color consumer agreeing with the palette module, the bag-scoped accent, persistence like the
// theme, and the default left exactly as it was. Run with `node tests/display-customization-browser.mjs`.
import assert from 'node:assert/strict';
import {startHarness} from './display-harness.mjs';

const h = await startHarness();
const {page, base} = h;
const CLASSIC = {light: {distance: '#ce8a00', fairway: '#0072b2', mid: '#008c67', putter: '#bc719b'}, dark: {distance: '#e6a139', fairway: '#0072b2', mid: '#009e73', putter: '#cc79a7'}};
const settle = (ms = 400) => page.waitForTimeout(ms);
const tokens = () => page.evaluate(() => {
  const css = getComputedStyle(document.documentElement), read = n => css.getPropertyValue('--' + n).trim();
  return {root: {distance: read('distance'), fairway: read('fairway'), mid: read('mid'), putter: read('putter')}, colors: {...colors},
    style: document.getElementById('display-palette')?.textContent ?? null, stored: localStorage.getItem('disc-atlas-display')};
});
// Every class-colored surface, read back from the page: atlas markers, legend, chips, directory rows.
const consumers = () => page.evaluate(() => {
  const types = {Putter: 'putter', Midrange: 'mid', Fairway: 'fairway', Distance: 'distance'};
  const markers = [...document.querySelectorAll('.atlas-marker')].filter(n => n.discColor && !n.classList.contains('is-mine') && !n.classList.contains('brand-view'))
    .map(n => ({type: Object.entries(types).find(([label]) => (n.getAttribute('aria-label') || '').includes(label))?.[1], color: n.discColor})).filter(m => m.type);
  const rgb = value => { const probe = document.createElement('i'); probe.style.color = value; document.body.append(probe); const c = getComputedStyle(probe).color; probe.remove(); return c; };
  const chip = type => getComputedStyle(document.querySelector(`#typeChips button[data-type="${type}"]`)).getPropertyValue('--chip-dot').trim();
  const legend = type => getComputedStyle(document.querySelector(`#legend .dot.${type}`)).backgroundColor;
  return {markers, chips: Object.fromEntries(Object.values(types).map(t => [t, rgb(chip(t))])), legend: Object.fromEntries(Object.values(types).map(t => [t, legend(t)])),
    expected: Object.fromEntries(Object.values(types).map(t => [t, rgb(DisplayPalette.classColor(t))]))};
});
const agree = async label => {
  const c = await consumers();
  assert.ok(c.markers.length >= 8, `${label}: markers to check`);
  for (const m of c.markers) assert.equal(m.color, await page.evaluate(t => DisplayPalette.classColor(t), m.type), `${label}: ${m.type} marker`);
  for (const t of Object.keys(c.expected)) {
    assert.equal(c.chips[t], c.expected[t], `${label}: ${t} type chip`);
    assert.equal(c.legend[t], c.expected[t], `${label}: ${t} legend dot`);
  }
};
const openSheet = async () => {
  await page.locator('#siteMenuButton').click();
  await page.locator('[data-appearance-open]').click();
  await page.locator('#appearanceDialog[open]').waitFor();
};
const pick = (row, id) => page.locator(`#appearanceDialog [data-row="${row}"] [data-swatch="${id}"]`).click();

try {
  // --- Signed out, untouched: exactly today's palette, nothing written, nothing saved.
  await page.goto(base + '/');
  await page.locator('.atlas-marker').first().waitFor();await settle(1200);
  let t = await tokens();
  assert.equal(t.style, null, 'untouched: no palette style at all');
  assert.equal(t.stored, null, 'untouched: nothing saved');
  assert.deepEqual(t.root, CLASSIC.light, 'untouched: Plan 06C tokens');
  assert.deepEqual({putter: t.colors.putter, mid: t.colors.mid, fairway: t.colors.fairway, distance: t.colors.distance}, CLASSIC.light, 'the atlas reads 06C');
  await agree('default');

  // --- The Appearance home: beside the theme, in the site menu.
  const menu = await page.evaluate(() => [...document.querySelectorAll('#siteMenu .site-menu-themes')][0].textContent);
  assert.match(menu, /Light.*Midnight.*Charcoal.*Black.*Appearance/s, 'Appearance sits right under the theme radios');
  await openSheet();
  const sheet = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('#appearanceDialog [data-row]')].map(r => [r.dataset.row, r.querySelectorAll('[role="radio"]').length, r.querySelector('[aria-checked="true"]')?.dataset.swatch]),
    theme: document.querySelector('#appearanceDialog [data-theme-option][aria-checked="true"]')?.dataset.themeOption,
    inputs: document.querySelectorAll('#appearanceDialog input').length,
    reset: document.querySelector('[data-appearance-reset]').disabled
  }));
  assert.deepEqual(sheet.rows, [['distance', 9, 'classic'], ['fairway', 9, 'classic'], ['mid', 9, 'classic'], ['putter', 9, 'classic'], ['accent', 9, 'lime'], ['ink', 11, 'auto'], ['finish', 5, 'flat']]);
  assert.equal(sheet.theme, 'light');
  assert.equal(sheet.inputs, 0, 'no free color input anywhere');
  assert.equal(sheet.reset, true, 'Reset is idle at the defaults');

  // --- Mix and match: the atlas, legend, chips and directory follow at once.
  await pick('distance', 'ember');await pick('putter', 'lavender');await pick('accent', 'violet');
  t = await tokens();
  assert.deepEqual(t.root, {...CLASSIC.light, distance: '#cc5824', putter: '#ae96da'});
  assert.deepEqual(JSON.parse(t.stored), {classes: {distance: 'ember', fairway: 'classic', mid: 'classic', putter: 'lavender'}, accent: 'violet', stamp: {ink: 'auto', finish: 'flat'}});
  assert.equal(await page.locator('#appearanceDialog [data-row="distance"] output').innerText(), 'Ember');
  const preview = await page.evaluate(() => ({strip: getComputedStyle(document.querySelector('.appearance-strip .clean-disc')).getPropertyValue('--disc-color').trim(),
    fill: getComputedStyle(document.querySelector('.appearance-bag-add')).backgroundColor}));
  assert.equal(preview.fill, 'rgb(206, 192, 255)', 'the bag-glow preview wears the violet accent');
  await page.keyboard.press('Escape');await settle(1200);
  await agree('mixed');
  // The accent stays in the bag: the header and atlas keep the Disc Atlas lime.
  const accent = await page.evaluate(() => ({bag: getComputedStyle(document.getElementById('myBagView')).getPropertyValue('--lime').trim(),
    root: getComputedStyle(document.documentElement).getPropertyValue('--lime').trim(), sheet: getComputedStyle(document.getElementById('bagModelDialog')).getPropertyValue('--accent-fill').trim()}));
  assert.deepEqual(accent, {bag: '#61489b', root: '#3f6212', sheet: '#cec0ff'});

  // The detail viewer: a catalog disc takes its class color, and follows a change while open.
  await page.evaluate(() => { window.syncs = []; const sync = Disc3D.sync; Disc3D.sync = (panel, d, props) => { syncs.push({id: d.id, color: props.color}); return sync(panel, d, props); }; });
  const destroyer = await page.evaluate(() => { const d = discs.find(d => d.name === 'Destroyer' && d.brand === 'Innova'); select(d); return d.id; });
  await settle(600);
  assert.equal((await page.evaluate(() => syncs.at(-1))).color, '#cc5824', 'the viewer opens in Ember');
  await page.evaluate(() => DisplayPalette.setClass('distance', 'marigold'));await settle(300);
  assert.deepEqual(await page.evaluate(() => syncs.at(-1)), {id: destroyer, color: '#d8aa32'}, 'and repaints when the palette changes');
  await page.evaluate(() => DisplayPalette.setClass('distance', 'ember'));

  // The directory rows bake their color in when they render; a change re-renders them.
  await page.locator('#listTab').click();await page.locator('#rows .directory-row').first().waitFor();
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#rows .disc-thumbnail')].slice(0, 40).map(n => [typeOf(discs.find(d => d.id === n.dataset.discThumbnail)), n.dataset.plateColor]));
  for (const [type, color] of await rows()) assert.equal(color, await page.evaluate(t => DisplayPalette.classColor(t), type), `directory ${type} row`);
  await page.evaluate(() => DisplayPalette.setClass('fairway', 'glacier'));
  for (const [type, color] of await rows()) assert.equal(color, await page.evaluate(t => DisplayPalette.classColor(t), type), `directory ${type} row after a change`);
  await page.evaluate(() => DisplayPalette.setClass('fairway', 'classic'));
  await page.locator('#mapTab').click();await settle(800);

  // --- Persistence, like the theme: applied before first paint on the next visit, per theme tone.
  await page.reload();await page.locator('.atlas-marker').first().waitFor();
  const early = await page.evaluate(() => {
    const style = document.getElementById('display-palette'), nodes = [...document.head.children];
    return {inHead: style?.parentNode === document.head, beforeSheets: nodes.indexOf(style) < nodes.findIndex(n => n.matches('link[href="cosmic.css"]'))};
  });
  assert.deepEqual(early, {inHead: true, beforeSheets: true}, 'the style is written during head parsing, before the stylesheets and first paint');
  assert.deepEqual((await tokens()).root, {...CLASSIC.light, distance: '#cc5824', putter: '#ae96da'});
  await page.locator('#siteMenuButton').click();await page.locator('#siteMenu [data-theme-choice="midnight"]').click();await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'midnight' && !document.documentElement.classList.contains('theme-switching'));await settle(800);
  assert.deepEqual((await tokens()).root, {...CLASSIC.dark, distance: '#e06b39', putter: '#c1a9ee'}, 'Midnight wears each swatch\'s dark value');
  await agree('mixed, midnight');
  assert.equal(await page.evaluate(() => localStorage.getItem('disc-atlas-theme')), 'midnight', 'the theme keeps its own key');

  // --- Keyboard: arrows move the choice within a row, as native radios do. The sheet's theme control drives
  // the site menu's radios.
  await openSheet();
  assert.equal(await page.evaluate(() => document.querySelector('#appearanceDialog [data-theme-option="midnight"]').getAttribute('aria-checked')), 'true');
  await page.locator('#appearanceDialog [data-row="fairway"] [aria-checked="true"]').focus();
  await page.keyboard.press('ArrowRight');await settle(100);
  assert.equal(await page.evaluate(() => DisplayPalette.get().classes.fairway), 'sky');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.swatch), 'sky');
  await page.locator('#appearanceDialog [data-theme-option="charcoal"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'charcoal' && localStorage.getItem('disc-atlas-theme') === 'charcoal');

  // --- Reset to defaults: 06C and today's lime again, the key forgotten.
  await page.locator('[data-appearance-reset]').click();await settle(200);
  t = await tokens();
  assert.equal(t.style, null);assert.equal(t.stored, null);
  assert.deepEqual(t.root, CLASSIC.dark);
  assert.equal(await page.locator('[data-appearance-reset]').isDisabled(), true);
  await page.locator('#appearanceDialog [data-appearance-close].primary').click();
  await agree('reset');
  await page.locator('#siteMenuButton').click();await page.locator('#siteMenu [data-theme-choice="light"]').click();await page.keyboard.press('Escape');

  // --- Packs: one tap sets four classes and the accent; a tweak after it is the player's own mix.
  await openSheet();
  const packs = await page.evaluate(() => [...document.querySelectorAll('#appearanceDialog [data-pack]')].map(b => [b.dataset.pack, b.getAttribute('aria-checked'), !!b.querySelector('.appearance-pack-tag')]));
  assert.deepEqual(packs, [['classic', 'true', true], ['harbor', 'false', true], ['sunset', 'false', true], ['field', 'false', false], ['floodlight', 'false', true],
    ['grayscale', 'false', true], ['neon', 'false', false], ['pastel', 'false', false], ['vintage', 'false', false], ['jewel', 'false', true]]);
  await page.locator('#appearanceDialog [data-pack="harbor"]').click();
  assert.deepEqual(await page.evaluate(() => DisplayPalette.get()), {classes: {distance: 'coral', fairway: 'navy', mid: 'teal', putter: 'lavender'}, accent: 'aqua', stamp: {ink: 'auto', finish: 'flat'}});
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('#appearanceDialog [data-row] [aria-checked="true"]')].map(b => b.dataset.swatch)), ['coral', 'navy', 'teal', 'lavender', 'aqua', 'auto', 'flat'], 'the rows show what the pack chose, and stamps are untouched');
  assert.equal(await page.locator('#appearanceDialog [data-pack-name]').innerText(), 'Harbor');
  await pick('mid', 'leaf');
  assert.equal(await page.locator('#appearanceDialog [data-pack-name]').innerText(), 'Your mix');
  assert.equal(await page.locator('#appearanceDialog [data-pack][aria-checked="true"]').count(), 0);
  await page.locator('#appearanceDialog [data-pack="sunset"]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(() => DisplayPalette.pack()), 'field', 'arrow keys move between packs');
  await page.keyboard.press('Escape');await settle(1200);
  await agree('Field pack');
  await page.evaluate(() => DisplayPalette.reset());await settle(300);

  // --- The variety row (docs/more-packs.md): a second row of five under a plain caption, packs like any other.
  await openSheet();
  const packRows = await page.evaluate(() => {
    const list = document.querySelector('#appearanceDialog [data-appearance-packs]'), caption = list.querySelector('[data-pack-row-caption]');
    const top = id => Math.round(list.querySelector(`[data-pack="${id}"]`).getBoundingClientRect().top);
    return {caption: caption?.textContent, before: caption?.previousElementSibling?.dataset.pack, after: caption?.nextElementSibling?.dataset.pack,
      first: new Set(['classic', 'harbor', 'sunset', 'field', 'floodlight'].map(top)).size, second: new Set(['grayscale', 'neon', 'pastel', 'vintage', 'jewel'].map(top)).size,
      below: top('grayscale') > top('floodlight')};
  });
  assert.deepEqual(packRows, {caption: 'More looks, chosen for variety. Any that are also colorblind-safe say so.', before: 'floodlight', after: 'grayscale', first: 1, second: 1, below: true},
    'two rows of five on desktop, the caption between them');
  await page.locator('#appearanceDialog [data-pack="floodlight"]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(() => DisplayPalette.pack()), 'grayscale', 'arrow keys cross into the second row');
  assert.deepEqual(await page.evaluate(() => DisplayPalette.get()), {classes: {distance: 'graphite', fairway: 'pewter', mid: 'ash', putter: 'pearl'}, accent: 'silver', stamp: {ink: 'auto', finish: 'flat'}});
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('#appearanceDialog [data-row] [aria-checked="true"]')].map(b => b.dataset.swatch)), ['graphite', 'pewter', 'ash', 'pearl', 'silver', 'auto', 'flat'], 'all five settings, shown in the rows');
  t = await tokens();
  assert.deepEqual(t.root, {distance: '#515151', fairway: '#6f6f6f', mid: '#929292', putter: '#b2b2b2'});
  assert.equal(await page.locator('#appearanceDialog [data-pack-name]').innerText(), 'Grayscale');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.appearance-bag-add')).backgroundColor), 'rgb(197, 203, 210)', 'the preview wears the silver accent');
  await page.locator('#appearanceDialog [data-pack="neon"]').click();
  assert.deepEqual(await page.evaluate(() => DisplayPalette.get()), {classes: {distance: 'tangerine', fairway: 'sky', mid: 'lime', putter: 'magenta'}, accent: 'mint', stamp: {ink: 'auto', finish: 'flat'}});
  await pick('putter', 'pearl');
  assert.equal(await page.locator('#appearanceDialog [data-pack-name]').innerText(), 'Your mix', 'a tweak makes it your own');
  assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('disc-atlas-display'))).classes.putter, 'pearl');
  await page.locator('#appearanceDialog [data-pack="grayscale"]').click();
  await page.keyboard.press('Escape');await settle(1200);
  await agree('Grayscale pack');
  // Dark themes wear the lifted ladder.
  await page.locator('#siteMenuButton').click();await page.locator('#siteMenu [data-theme-choice="midnight"]').click();await page.keyboard.press('Escape');await settle(1200);
  assert.deepEqual((await tokens()).root, {distance: '#5c5c5c', fairway: '#7a7a7a', mid: '#a4a4a4', putter: '#c5c5c5'});
  await agree('Grayscale pack, Midnight');
  await page.locator('#siteMenuButton').click();await page.locator('#siteMenu [data-theme-choice="light"]').click();await page.keyboard.press('Escape');
  await page.evaluate(() => DisplayPalette.reset());await settle(300);

  // --- Information pages do not load the palette: the About hero keeps its own clay.
  await page.evaluate(() => DisplayPalette.setClass('distance', 'brick'));
  for (const path of ['/about', '/privacy', '/terms']) {
    await page.goto(base + path);
    assert.equal(await page.evaluate(() => !window.DisplayPalette && !document.getElementById('display-palette')), true, `${path}: untouched`);
  }

  // --- Signed in with a bag: bag discs keep their own colors; class color reaches the bag's chips; the
  // accent reaches the bag's glow, controls and 3D outline; owned discs on the personalized atlas keep theirs.
  await h.signIn();await h.seedBag();
  await page.goto(base + '/?bag=1');await page.waitForFunction(() => document.querySelector('#bagScene')?.dataset.phase === 'open');await settle(1500);
  const bag = () => page.evaluate(() => ({
    discs: [...document.querySelectorAll('.bag-physical-disc')].map(n => n.style.getPropertyValue('--disc-color')).filter(Boolean).sort(),
    chip: getComputedStyle(document.querySelector('.bag-type-out button[data-type-out="distance"]')).getPropertyValue('--chip-dot').trim(),
    scene: getComputedStyle(document.getElementById('bagScene')).getPropertyValue('--lime').trim(),
    add: getComputedStyle(document.getElementById('addBagDisc')).backgroundColor,
    glow: getComputedStyle(document.querySelector('.bag-scene-glow')).backgroundImage
  }));
  const before = await bag();
  await page.evaluate(() => DisplayPalette.set({classes: {distance: 'brick', mid: 'leaf'}, accent: 'gold'}));await settle(300);
  const after = await bag();
  assert.deepEqual(after.discs, before.discs, 'every bag disc keeps its own stored color');
  assert.ok(after.discs.length >= 5);
  assert.equal(after.chip, '#a64736', 'the bag\'s Distance chip wears Brick');
  assert.equal(await page.evaluate(() => { const i = document.createElement('i'); i.style.color = 'var(--distance)'; document.querySelector('.bag-type-out').append(i); const c = getComputedStyle(i).color; i.remove(); return c; }), 'rgb(166, 71, 54)', 'the bag chips wear Brick');
  assert.equal(after.scene, '#715700', 'the 3D bag reads the gold accent where it lives');
  assert.equal(after.add, 'rgb(248, 194, 13)', 'Add discs wears the gold fill');
  assert.notEqual(after.glow, before.glow, 'the floor glow follows the accent');

  await page.locator('#mapTab').click();await settle(1500);
  const atlas = await page.evaluate(() => {
    const mine = [...document.querySelectorAll('.atlas-marker.is-mine')].map(n => n.discColor), bagColors = [...BagApp.mapColors().values()];
    return {mine: mine.length, allBag: mine.every(c => bagColors.includes(c))};
  });
  assert.ok(atlas.mine >= 3 && atlas.allBag, 'owned discs on the personalized atlas keep their bag colors');
  await agree('signed in');
  await page.evaluate(() => DisplayPalette.reset());

  // --- Stamp appearance: the player's own discs in personal contexts; the catalog keeps the official stamp.
  await openSheet();
  await page.locator('#appearanceDialog [data-row="ink"] [data-swatch="gold"]').click();
  await page.locator('#appearanceDialog [data-row="finish"] [data-swatch="foil"]').click();
  assert.deepEqual(await page.evaluate(() => DisplayPalette.get().stamp), {ink: 'gold', finish: 'foil'});
  assert.equal(await page.locator('#appearanceDialog [data-row="finish"] output').innerText(), 'Foil');
  const stampPreview = await page.locator('.appearance-stamp-preview').getAttribute('data-state');
  assert.ok(['ready', 'fallback'].includes(stampPreview), `the stamp preview settles (${stampPreview})`);
  await page.keyboard.press('Escape');await settle(600);
  const stampOf = () => page.evaluate(() => { const m = Disc3D.viewer.debug.stamp.material; return {type: m.type, finish: m.userData.stampFinish || 'flat', metalness: m.metalness}; });
  const openDisc = async name => {
    await page.evaluate(name => select(discs.find(d => d.name === name && d.brand === 'Discraft')), name);
    await page.waitForFunction(() => document.querySelector('#detail .disc3d-stage')?.dataset.state === 'ready');await settle(500);
  };
  await page.evaluate(() => { window.syncs = []; const sync = Disc3D.sync; Disc3D.sync = (panel, d, props) => { syncs.push({id: d.id, color: props.color, stamp: props.stampStyle?.finish.id || null}); return sync(panel, d, props); }; });
  // Personalized atlas, owned Buzzz: gold foil, a physical metal layer.
  assert.equal(await page.evaluate(() => atlasLens), 'mine');
  await openDisc('Buzzz');
  assert.deepEqual(await stampOf(), {type: 'MeshPhysicalMaterial', finish: 'foil', metalness: 1}, 'the owned Buzzz wears gold foil');
  assert.equal((await page.evaluate(() => syncs.at(-1))).color, await page.evaluate(() => BagApp.mapColors().get(discs.find(d => d.name === 'Buzzz' && d.brand === 'Discraft').id)), 'still in its own bag color');
  // A disc the player does not own, on the same map: the official stamp.
  await openDisc('Zone');
  assert.deepEqual(await stampOf(), {type: 'MeshStandardMaterial', finish: 'flat', metalness: .15}, 'a catalog Zone keeps the official stamp');
  // The Standard map is the shared atlas: even the owned Buzzz shows the official stamp there.
  const lens = value => page.evaluate(value => document.querySelector(`#lensMenu [data-lens="${value}"]`).click(), value);
  await lens('default');await settle(800);
  assert.equal(await page.evaluate(() => atlasLens), 'default');
  await openDisc('Buzzz');
  assert.deepEqual(await stampOf(), {type: 'MeshStandardMaterial', finish: 'flat', metalness: .15}, 'the Standard map stays neutral');
  await lens('mine');await settle(1500);
  // The personalized map's marker art for the owned Buzzz carries the style in its cache key; a change re-keys it.
  const artKeys = () => page.evaluate(async () => [...(await (await import('/disc3d/atlas-art.mjs')).getAtlasArt()).debug.images.keys()].filter(k => k.includes('style:')));
  // (Earlier choices, like the moment between tapping Gold and Foil, stay cached under their own keys.)
  const art = await artKeys(), buzzz = await page.evaluate(() => { const d = discs.find(d => d.name === 'Buzzz' && d.brand === 'Discraft'); return d.id + '|full|' + BagApp.mapColors().get(d.id); });
  if (art.some(k => k.startsWith(buzzz))) assert.ok(art.some(k => k.startsWith(buzzz) && k.endsWith('style:gold/foil')), 'the owned Buzzz marker is drawn in gold foil');
  else console.log('Map art: the owned Buzzz was not drawn at full size at this zoom; the viewer and bag checks cover its stamp.');
  // The bag: its pulled stock disc wears the foil; a change of finish redraws it.
  await page.goto(base + '/?bag=1');await page.waitForFunction(() => document.querySelector('#bagScene')?.dataset.phase === 'open');await settle(1500);
  const key = await page.evaluate(() => [...document.querySelectorAll('[data-physical-disc]')].find(n => /Buzzz/.test(n.getAttribute('aria-label') || ''))?.dataset.physicalDisc);
  await page.locator(`[data-physical-disc="${key}"]`).evaluate(n => n.click());
  await page.waitForFunction(() => document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.length > 0, null, {timeout: 15000});
  const layers = () => page.evaluate(() => document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.map(l => [l.finish, l.metalness]));
  assert.deepEqual(await layers(), [['foil', 1]], 'the pulled Buzzz in gold foil');
  await page.evaluate(() => DisplayPalette.setStamp({ink: 'silver', finish: 'rainbow'}));await settle(400);
  assert.deepEqual(await layers(), [['rainbow', 1]], 'and in rainbow foil after a change');
  await page.evaluate(() => DisplayPalette.reset());await settle(400);
  assert.deepEqual(await layers(), [['flat', .15]], 'Reset brings back today\'s stamp');

  assert.deepEqual(h.errors, []);
  console.log('Display customization browser suite passed.');
} finally {
  await h.stop();
}
