// Display customization, no browser: the curated catalog, its design discipline and persistence.
// Run with `node --test tests/display-palette.mjs`. The rendered-token and colorblind checks live in
// tests/palette.mjs (default and every pack labeled colorblind-safe) and the browser suite.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/display-palette.js', import.meta.url), 'utf8');

// A minimal page for the before-paint script: a root with a theme, a head, storage and events.
export function loadPalette({stored = null, theme = 'light', storage = true} = {}) {
  const store = new Map(stored == null ? [] : [['disc-atlas-display', stored]]);
  const events = [], head = [];
  const element = () => ({id: '', textContent: '', get isConnected() { return head.includes(this); }, remove() { head.splice(head.indexOf(this), 1); }});
  const window = {
    dispatchEvent: event => events.push(event),
    localStorage: storage ? {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k)} :
      {getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); }}
  };
  const document = {documentElement: {dataset: {theme}}, createElement: element, head: {append: node => head.push(node)}};
  class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
  vm.runInNewContext(source, {window, document, localStorage: window.localStorage, CustomEvent, JSON, Object});
  return {palette: window.DisplayPalette, store, events, head, document};
}

// Color science shared with tests/palette.mjs: Machado full-severity matrices on linear sRGB, OKLab distance.
export const MATRICES = {normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], protanopia: [[.152286, 1.052583, -.204868], [.114503, .786281, .099216], [-.003882, -.048116, 1.051998]], deuteranopia: [[.367322, .860646, -.227968], [.280085, .672501, .047413], [-.01182, .04294, .968881]]};
const linear = hex => hex.match(/[a-f\d]{2}/gi).map(c => { const v = parseInt(c, 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
const simulate = (rgb, m) => m.map(row => Math.max(0, Math.min(1, row.reduce((s, v, i) => s + v * rgb[i], 0))));
const lab = ([r, g, b]) => {
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
};
export const distance = (a, b, matrix = MATRICES.normal) => Math.hypot(...lab(simulate(linear(a), matrix)).map((v, i) => v - lab(simulate(linear(b), matrix))[i]));
export const minDistance = (hexes, matrix) => { let min = Infinity; for (let i = 0; i < hexes.length; i++) for (let j = 0; j < i; j++) min = Math.min(min, distance(hexes[i], hexes[j], matrix)); return min; };
const oklch = hex => { const [L, a, b] = lab(linear(hex)); return {L, C: Math.hypot(a, b), H: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360}; };
const luminance = hex => { const [r, g, b] = linear(hex); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);

const {palette} = loadPalette();
const {catalog} = palette;
const row = key => catalog.classes.find(c => c.key === key).swatches;

test('Classic is today\'s Plan 06C palette, value for value, read from cosmic.css', () => {
  const css = fs.readFileSync(new URL('../public/cosmic.css', import.meta.url), 'utf8');
  const block = selector => css.slice(css.indexOf(selector + ' {')).split('}')[0];
  const hue = {putter: 'purple', mid: 'green', fairway: 'blue', distance: 'orange'};
  assert.match(css, /--putter:var\(--palette-purple\);--mid:var\(--palette-green\);--fairway:var\(--palette-blue\);--distance:var\(--palette-orange\)/);
  for (const [theme, tone] of Object.entries(catalog.tones)) {
    const text = block(theme === 'light' ? ':root' : `:root[data-theme="${theme}"]`);
    for (const [key, name] of Object.entries(hue)) {
      // A theme that sets no palette of its own (Paper) inherits the :root (Light) values.
      const own = text.match(new RegExp(`--palette-${name}:(#[0-9a-f]{6})`)), value = (own || block(':root').match(new RegExp(`--palette-${name}:(#[0-9a-f]{6})`)))[1];
      assert.equal(row(key)[0].id, 'classic', `${key}: Classic leads the row`);
      assert.equal(row(key)[0][tone], value, `${theme}: Classic ${key} is ${value}`);
    }
  }
  assert.equal(catalog.accents[0].id, 'lime');
  assert.equal(catalog.accents[0].light, null, 'Lime writes nothing: the Stitch tokens stay as they are');
});

test('Untouched, the palette writes nothing and saves nothing', () => {
  const {palette, store, head, events} = loadPalette();
  assert.equal(palette.css(palette.get()), '');
  assert.equal(head.length, 0, 'no style element');
  assert.equal(palette.isDefault(), true);
  assert.equal(store.size, 0);
  assert.equal(events.length, 0);
});

test('Rows are curated: 8 to 12 designed swatches each, valid and unique', () => {
  for (const c of catalog.classes) {
    assert.ok(c.swatches.length >= 8 && c.swatches.length <= 12, `${c.key}: ${c.swatches.length} swatches`);
    assert.equal(new Set(c.swatches.map(s => s.id)).size, c.swatches.length);
    for (const s of c.swatches) for (const v of [s.light, s.dark]) assert.match(v, /^#[0-9a-f]{6}$/);
  }
  assert.ok(catalog.accents.length >= 8 && catalog.accents.length <= 12);
  assert.equal(new Set(catalog.accents.map(a => a.id)).size, catalog.accents.length);
});

test('Shared lightness and chroma discipline, and the 06C dark-theme lift, per swatch', () => {
  const sectors = {distance: [25, 95], fairway: [205, 270], mid: [120, 185], putter: [295, 360]};
  // The neutral grays have no hue to keep; they are held to their own discipline below.
  for (const c of catalog.classes) for (const s of c.swatches.filter(s => !s.neutral)) {
    const light = oklch(s.light), dark = oklch(s.dark), name = `${c.key}/${s.id}`;
    assert.ok(light.L >= .43 && light.L <= .77, `${name}: light L ${light.L.toFixed(3)}`);
    assert.ok(light.C >= .045 && light.C <= .21, `${name}: light C ${light.C.toFixed(3)}`);
    // Dark themes lift (or hold) lightness by at most .08 at about the same chroma, as 06C's set does.
    assert.ok(dark.L - light.L >= -.001 && dark.L - light.L <= .08, `${name}: dark lift ${(dark.L - light.L).toFixed(3)}`);
    assert.ok(Math.abs(dark.C - light.C) <= .025, `${name}: dark chroma drift ${(dark.C - light.C).toFixed(3)}`);
    const [from, to] = sectors[c.key], h = light.H < 20 ? light.H + 360 : light.H;
    assert.ok(h >= from && h <= to, `${name}: hue ${light.H.toFixed(0)} stays in the ${c.key} sector`);
  }
});

test('Neutral grays: one per row, last, a lightness ladder at the same L range and dark lift', () => {
  const ladder = catalog.classes.map(c => {
    const neutrals = c.swatches.filter(s => s.neutral);
    assert.equal(neutrals.length, 1, `${c.key}: one neutral`);
    assert.equal(c.swatches.at(-1), neutrals[0], `${c.key}: the neutral comes after the hued swatches`);
    const s = neutrals[0], light = oklch(s.light), dark = oklch(s.dark);
    for (const v of [s.light, s.dark]) assert.match(v, /^#([0-9a-f]{2})\1\1$/, `${c.key}/${s.id}: a true gray`);
    assert.ok(light.C < .001 && dark.C < .001, `${c.key}/${s.id}: no hue at all`);
    assert.ok(light.L >= .43 && light.L <= .77, `${c.key}/${s.id}: light L ${light.L.toFixed(3)}`);
    assert.ok(dark.L - light.L >= -.001 && dark.L - light.L <= .08, `${c.key}/${s.id}: dark lift ${(dark.L - light.L).toFixed(3)}`);
    return {light: light.L, dark: dark.L};
  });
  // Driver darkest to Putter lightest, in the sheet's row order, at least .1 L apart in both tones.
  for (let i = 1; i < ladder.length; i++) for (const tone of ['light', 'dark'])
    assert.ok(ladder[i][tone] - ladder[i - 1][tone] >= .1, `${catalog.classes[i].key} ${tone}: a full step above ${catalog.classes[i - 1].key}`);
});

test('Any combination keeps the four classes tellable apart (normal vision, light and dark)', t => {
  // 06C's own floor, applied to every mix-and-match combination, not only the packs.
  let worst = {d: Infinity}, count = 0;
  for (const a of row('distance')) for (const b of row('fairway')) for (const c of row('mid')) for (const d of row('putter')) {
    count++;
    for (const tone of ['light', 'dark']) {
      const min = minDistance([a, b, c, d].map(s => s[tone]));
      if (min < worst.d) worst = {d: min, tone, ids: [a.id, b.id, c.id, d.id]};
    }
  }
  assert.equal(count, row('distance').length * row('fairway').length * row('mid').length * row('putter').length);
  assert.ok(worst.d >= .065, `closest combination ${worst.ids} (${worst.tone}) at ${worst.d.toFixed(3)}`);
  t.diagnostic(`${count} combinations; closest ${worst.ids} (${worst.tone}) at ${worst.d.toFixed(3)}`);
});

test('Within a row, every swatch is its own color', () => {
  for (const c of catalog.classes) for (const tone of ['light', 'dark'])
    assert.ok(minDistance(c.swatches.map(s => s[tone])) >= .03, `${c.key} ${tone}`);
});

test('Accent swatches keep today\'s contrast in both tones', () => {
  for (const a of catalog.accents.slice(1)) {
    assert.ok(contrast(a.light.lime, '#ffffff') >= 4.5, `${a.id}: light accent ink on white`);
    assert.ok(contrast(a.light.fill, a.light.ink) >= 4.5, `${a.id}: light button ink on fill`);
    assert.ok(contrast(a.dark.fill, a.dark.ink) >= 4.5, `${a.id}: dark button ink on fill`);
    for (const panel of ['#0c111a', '#18191c', '#0a0a0a']) assert.ok(contrast(a.dark.lime, panel) >= 4.5, `${a.id}: dark accent on ${panel}`);
    assert.ok(oklch(a.light.soft).L > .93 && oklch(a.dark.soft).L < .3, `${a.id}: tints stay tints`);
  }
});

test('Choices persist like the theme: one key, applied before paint, unknown values fall back', () => {
  const first = loadPalette({theme: 'midnight'});
  first.palette.setClass('distance', 'ember');
  first.palette.setAccent('violet');
  const saved = first.store.get('disc-atlas-display');
  assert.deepEqual(JSON.parse(saved), {classes: {distance: 'ember', fairway: 'classic', mid: 'classic', putter: 'classic'}, accent: 'violet', stamp: {ink: 'auto', finish: 'flat'}});
  assert.equal(first.events.at(-1).type, 'atlas-palette-change');
  assert.equal(first.palette.classColor('distance'), '#e06b39', 'midnight wears the dark value');
  assert.equal(first.palette.classColor('distance', 'light'), '#cc5824');

  const again = loadPalette({stored: saved, theme: 'light'});
  assert.equal(again.head.length, 1, 'a returning visitor gets the style before first paint');
  const css = again.head[0].textContent;
  assert.match(css, /html:root\[data-theme="light"\],html:root\[data-theme="paper"\]\{--distance:#cc5824\}/);
  assert.match(css, /html:root\[data-theme="midnight"\],html:root\[data-theme="charcoal"\],html:root\[data-theme="dusk"\],html:root\[data-theme="black"\]\{--distance:#e06b39\}/);
  for (const scope of catalog.scope) assert.ok(css.includes(`html:root[data-theme="light"] ${scope}`), `accent reaches ${scope}`);
  assert.ok(!/html:root\[data-theme="light"\]\{[^}]*--lime/.test(css), 'the accent never lands on the root, so the site chrome keeps its lime');

  const edited = loadPalette({stored: JSON.stringify({classes: {distance: 'neon', mid: 'jade'}, accent: '#ff00ff'})});
  assert.deepEqual(edited.palette.get(), {classes: {distance: 'classic', fairway: 'classic', mid: 'jade', putter: 'classic'}, accent: 'lime', stamp: {ink: 'auto', finish: 'flat'}});
  assert.equal(loadPalette({stored: '{not json'}).palette.isDefault(), true);

  first.palette.reset();
  assert.equal(first.store.has('disc-atlas-display'), false, 'Reset to defaults forgets the setting');
  assert.equal(first.head.length, 0, 'and removes the style');
});

test('No free color input: setters accept catalog ids only', () => {
  const {palette} = loadPalette();
  palette.setClass('putter', '#ff00ff');
  palette.setAccent('rgb(1,2,3)');
  palette.set({classes: {fairway: '#123456'}, accent: 'chartreuse'});
  assert.equal(palette.isDefault(), true);
});

test('Storage disabled still applies the choice for the session', () => {
  const {palette, head} = loadPalette({storage: false});
  palette.setClass('mid', 'teal');
  assert.equal(palette.get().classes.mid, 'teal');
  assert.equal(head.length, 1);
});

test('Packs: four or five designed starting points, Classic first and equal to the defaults', () => {
  const first = catalog.packs.filter(p => p.row === 1);
  assert.ok(first.length >= 4 && first.length <= 5);
  assert.deepEqual(catalog.packs.slice(0, first.length), first, 'the first row comes first');
  assert.equal(new Set(catalog.packs.map(p => p.id)).size, catalog.packs.length);
  assert.equal(new Set(catalog.packs.map(p => p.label)).size, catalog.packs.length);
  assert.deepEqual({id: catalog.packs[0].id, classes: {...catalog.packs[0].classes}, accent: catalog.packs[0].accent, safe: catalog.packs[0].colorblindSafe},
    {id: 'classic', classes: palette.defaults.classes, accent: 'lime', safe: true});
  for (const p of catalog.packs) {
    for (const c of catalog.classes) assert.ok(c.swatches.some(s => s.id === p.classes[c.key]), `${p.id}: ${c.key} is a real swatch`);
    assert.ok(catalog.accents.some(a => a.id === p.accent), `${p.id}: accent is a real swatch`);
  }
});

test('The original five packs are exactly as they shipped', () => {
  // docs/display-customization.md, Part 2. The variety row is additive: none of these may move.
  assert.deepEqual(JSON.parse(JSON.stringify(catalog.packs.filter(p => p.row === 1).map(p => [p.id, p.label, p.classes, p.accent, p.colorblindSafe]))), [
    ['classic', 'Classic', {distance: 'classic', fairway: 'classic', mid: 'classic', putter: 'classic'}, 'lime', true],
    ['harbor', 'Harbor', {distance: 'coral', fairway: 'navy', mid: 'teal', putter: 'lavender'}, 'aqua', true],
    ['sunset', 'Sunset', {distance: 'marigold', fairway: 'cobalt', mid: 'jade', putter: 'raspberry'}, 'coral', true],
    ['field', 'Field', {distance: 'rust', fairway: 'steel', mid: 'moss', putter: 'mauve'}, 'gold', false],
    ['floodlight', 'Floodlight', {distance: 'ember', fairway: 'glacier', mid: 'lime', putter: 'violet'}, 'violet', true]
  ]);
});

test('The variety row: a full row of five, each its own look, and Grayscale is lightness alone', () => {
  const more = catalog.packs.filter(p => p.row === 2);
  assert.equal(more.map(p => p.id).join(), 'grayscale,neon,pastel,vintage,jewel');
  assert.deepEqual(catalog.packs.slice(-more.length), more, 'the second row follows the first');
  assert.equal(new Set(catalog.packs.map(p => JSON.stringify([p.classes, p.accent]))).size, catalog.packs.length, 'no two packs are the same mix');
  // Only Grayscale reaches for the neutrals, and it takes all four.
  for (const p of catalog.packs) {
    const neutral = catalog.classes.filter(c => c.swatches.find(s => s.id === p.classes[c.key]).neutral).length;
    assert.equal(neutral, p.id === 'grayscale' ? 4 : 0, `${p.id}: ${neutral} neutral classes`);
  }
  assert.equal(more.find(p => p.id === 'grayscale').accent, 'silver');
});

test('Every pack resolves on all six themes, light and dark values in their places', () => {
  for (const p of catalog.packs) {
    const {palette, head} = loadPalette();
    palette.applyPack(p.id);
    assert.equal(palette.pack(), p.id, `${p.id}: applied, and recognized as itself`);
    const css = head[0]?.textContent ?? '';
    for (const [theme, tone] of Object.entries(catalog.tones)) for (const c of catalog.classes) {
      const swatch = c.swatches.find(s => s.id === p.classes[c.key]);
      assert.equal(palette.classColor(c.key, theme), swatch[tone], `${p.id}: ${c.key} on ${theme}`);
      // Classic swatches write nothing (cosmic.css already holds them); every other value is written per tone.
      if (swatch.id !== 'classic') assert.match(css, new RegExp(`html:root\\[data-theme="${theme}"\\][^{]*\\{[^}]*--${c.key}:${swatch[tone]}`), `${p.id}: ${c.key} written for ${theme}`);
    }
    if (p.accent !== 'lime') for (const theme of Object.keys(catalog.tones)) assert.ok(css.includes(`html:root[data-theme="${theme}"] #myBagView`), `${p.id}: accent on ${theme}`);
  }
});

test('A pack is labeled colorblind-safe if, and only if, it clears the 06C simulation floor', t => {
  for (const p of catalog.packs) {
    let min = Infinity, normal = Infinity;
    for (const tone of ['light', 'dark']) {
      const hexes = catalog.classes.map(c => c.swatches.find(s => s.id === p.classes[c.key])[tone]);
      for (const vision of ['protanopia', 'deuteranopia']) min = Math.min(min, minDistance(hexes, MATRICES[vision]));
      normal = Math.min(normal, minDistance(hexes));
    }
    assert.equal(p.colorblindSafe, min >= .065, `${p.id}: closest simulated pair ${min.toFixed(3)}, labeled ${p.colorblindSafe}`);
    t.diagnostic(`${p.id}: row ${p.row}, normal ${normal.toFixed(3)}, protan/deutan ${min.toFixed(3)}, ${p.colorblindSafe ? 'labeled' : 'unlabeled'}`);
  }
});

test('A mix saved before the variety row loads, and paints, exactly as it did', () => {
  // Saved by the October 20 build (a Harbor tweak, gold foil stamps); the CSS is what that build wrote for it.
  const saved = '{"classes":{"distance":"coral","fairway":"navy","mid":"leaf","putter":"lavender"},"accent":"aqua","stamp":{"ink":"gold","finish":"foil"}}';
  const {palette, head} = loadPalette({stored: saved});
  assert.equal(JSON.stringify(palette.get()), saved);
  assert.equal(palette.pack(), null, 'still your own mix');
  assert.equal(head[0].textContent.split('\n')[0], 'html:root[data-theme="light"],html:root[data-theme="paper"]{--distance:#e2856c;--fairway:#1c548d;--mid:#4a9c42;--putter:#ae96da}');
  assert.equal(head[0].textContent.split('\n')[2], 'html:root[data-theme="midnight"],html:root[data-theme="charcoal"],html:root[data-theme="dusk"],html:root[data-theme="black"]{--distance:#f6987e;--fairway:#255d96;--mid:#5caf54;--putter:#c1a9ee}');
  // The stored shape is unchanged: a variety pack saves the same four ids and an accent.
  const next = loadPalette();
  next.palette.applyPack('grayscale');
  assert.deepEqual(JSON.parse(next.store.get('disc-atlas-display')), {classes: {distance: 'graphite', fairway: 'pewter', mid: 'ash', putter: 'pearl'}, accent: 'silver', stamp: {ink: 'auto', finish: 'flat'}});
});

test('One tap applies a pack; a tweak afterwards leaves it as your own mix', () => {
  const {palette, store, events} = loadPalette();
  assert.equal(palette.pack(), 'classic', 'the defaults are Classic');
  palette.applyPack('harbor');
  assert.deepEqual(palette.get(), {classes: {distance: 'coral', fairway: 'navy', mid: 'teal', putter: 'lavender'}, accent: 'aqua', stamp: {ink: 'auto', finish: 'flat'}});
  assert.equal(palette.pack(), 'harbor');
  assert.equal(events.length, 1, 'one change, one event');
  palette.setClass('mid', 'leaf');
  assert.equal(palette.pack(), null);
  assert.equal(JSON.parse(store.get('disc-atlas-display')).classes.mid, 'leaf');
  palette.applyPack('classic');
  assert.equal(store.has('disc-atlas-display'), false, 'Classic is the default, so nothing is saved');
  palette.applyPack('no-such-pack');
  assert.equal(palette.pack(), 'classic');
});

test('Stamps: curated inks and finishes; untouched, every stamp is today\'s', () => {
  const {palette} = loadPalette();
  assert.equal(catalog.inks[0].id, 'auto');assert.equal(catalog.inks[0].hex, null, 'Auto is today\'s ink, chosen by the plastic');
  assert.ok(catalog.inks.length >= 8 && catalog.inks.length <= 12);
  for (const ink of catalog.inks.slice(1)) assert.match(ink.hex, /^#[0-9a-f]{6}$/);
  assert.equal(catalog.finishes.map(f => f.id).join(), 'flat,foil,rainbow,shatter,spin');
  assert.equal(Object.keys(catalog.finishes[0]).sort().join(), 'id,label', 'Flat carries no material change');
  for (const f of catalog.finishes.slice(1)) {
    assert.equal(f.metalness, 1, `${f.id}: a foil is metal`);
    assert.ok(f.roughness > 0 && f.roughness < .5, `${f.id}: polished to satin`);
    assert.ok(f.still > 0, `${f.id}: has a still strength for atlas markers`);
  }
  assert.ok(catalog.finishes.filter(f => f.iridescence).length >= 3, 'a rainbow family');
  assert.ok(catalog.finishes.filter(f => f.pattern).length >= 2, 'patterned foils');
  assert.equal(palette.stampStyle(), null, 'default: nothing to restyle');
});

test('Stamp choices persist with the rest, ignore anything uncurated, and leave packs alone', () => {
  const {palette, store} = loadPalette();
  palette.setStamp({ink: 'gold', finish: 'foil'});
  const style = palette.stampStyle();
  assert.equal(style.ink, '#d6a83a');assert.equal(style.inkId, 'gold');assert.equal(style.finish.id, 'foil');
  assert.deepEqual(JSON.parse(store.get('disc-atlas-display')).stamp, {ink: 'gold', finish: 'foil'});
  palette.setStamp({ink: '#ff00ff', finish: 'chrome'});
  assert.deepEqual(palette.get().stamp, {ink: 'gold', finish: 'foil'}, 'no free ink, no invented finish');
  palette.applyPack('sunset');
  assert.deepEqual(palette.get().stamp, {ink: 'gold', finish: 'foil'}, 'a pack sets colors, not stamps');
  assert.equal(palette.pack(), 'sunset');
  palette.setStamp({ink: 'auto'});
  assert.equal(palette.stampStyle().ink, null, 'Auto ink under a foil keeps the plastic-chosen ink');
  assert.equal(palette.css(palette.get()).includes('stamp'), false, 'stamps write no CSS');
  palette.reset();
  assert.equal(palette.stampStyle(), null);
  assert.equal(store.has('disc-atlas-display'), false);
});

test('Every theme in theme.js wears a swatch tone, and the same one theme.js gives it', () => {
  const source = fs.readFileSync(new URL('../public/theme.js', import.meta.url), 'utf8');
  const themes = Object.fromEntries([...source.matchAll(/(\w+): Object\.freeze\(\{label: '[^']+', tone: '(light|dark)'/g)].map(m => [m[1], m[2]]));
  assert.deepEqual(Object.keys(themes), ['light', 'paper', 'midnight', 'charcoal', 'dusk', 'black']);
  assert.equal(JSON.stringify(catalog.tones), JSON.stringify(themes));
});
