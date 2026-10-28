/* Display customization (docs/display-customization.md): curated class colors and the accent.
   The one source of truth for the active palette. It runs before first paint, right after theme.js, and
   writes CSS custom properties: 2D surfaces use them directly and the WebGL surfaces read them back
   through applyTheme(), so no second table can drift. Untouched, it writes nothing at all, so the
   default is exactly today's palette. Every selectable color is a designed swatch; there is no free input.
   Per browser, like the theme: one localStorage key, no account storage. */
(() => {
  const KEY = 'disc-atlas-display';
  // Which swatch value each theme wears: theme.js's tones (tests/display-palette.mjs holds the two lists equal).
  const TONES = {light: 'light', paper: 'light', midnight: 'dark', charcoal: 'dark', dusk: 'dark', black: 'dark'};
  // UI order follows the atlas chips: Driver, Fairway, Midrange, Putter.
  const CLASSES = [['distance', 'Driver'], ['fairway', 'Fairway'], ['mid', 'Midrange'], ['putter', 'Putter']];
  // [id, label, light value, dark value]. Each row keeps to its own hue sector at the lightness and chroma
  // of Plan 06C's set (light L .44–.76, C .05–.20; dark lifts warm, green and pink hues by .06 L and deep
  // blues by .03), so any combination reads as one palette and classes stay apart (tests/display-palette.mjs).
  // `classic` is today's Okabe-Ito value, exactly. The last swatch in each row is a neutral gray, marked
  // 'neutral' (docs/more-packs.md): one step of a lightness ladder, Driver darkest to Putter lightest, at the
  // same L range and dark lift, placed so every combination still keeps the classes apart.
  const SWATCHES = {
    distance: [
      ['classic', 'Orange', '#ce8a00', '#e6a139'],
      ['ember', 'Ember', '#cc5824', '#e06b39'],
      ['brick', 'Brick', '#a64736', '#ba5947'],
      ['tangerine', 'Tangerine', '#df7b0c', '#f48d2f'],
      ['marigold', 'Marigold', '#d8aa32', '#ecbd4a'],
      ['coral', 'Coral', '#e2856c', '#f6987e'],
      ['sand', 'Sand', '#ba986e', '#cdaa80'],
      ['rust', 'Rust', '#ab5d2b', '#bf6e3e'],
      ['graphite', 'Graphite', '#515151', '#5c5c5c', 'neutral']
    ],
    fairway: [
      ['classic', 'Blue', '#0072b2', '#0072b2'],
      ['sky', 'Sky', '#489bcd', '#52a5d7'],
      ['cobalt', 'Cobalt', '#2c5dbd', '#3566c7'],
      ['ocean', 'Ocean', '#087e9b', '#1c87a5'],
      ['glacier', 'Glacier', '#65b2c4', '#6fbbce'],
      ['navy', 'Navy', '#1c548d', '#255d96'],
      ['steel', 'Steel', '#627e96', '#6a87a0'],
      ['cornflower', 'Cornflower', '#6782ce', '#708bd8'],
      ['pewter', 'Pewter', '#6f6f6f', '#7a7a7a', 'neutral']
    ],
    mid: [
      ['classic', 'Bluish green', '#008c67', '#009e73'],
      ['leaf', 'Leaf', '#4a9c42', '#5caf54'],
      ['moss', 'Moss', '#6b8537', '#7d9849'],
      ['jade', 'Jade', '#4fad83', '#63c095'],
      ['teal', 'Teal', '#2a8672', '#409884'],
      ['pine', 'Pine', '#237356', '#388567'],
      ['sage', 'Sage', '#789d7f', '#8ab091'],
      ['lime', 'Lime', '#86bf3c', '#99d352'],
      ['ash', 'Ash', '#929292', '#a4a4a4', 'neutral']
    ],
    putter: [
      ['classic', 'Reddish purple', '#bc719b', '#cc79a7'],
      ['plum', 'Plum', '#8f4d89', '#a15e9c'],
      ['violet', 'Violet', '#8459c3', '#966cd7'],
      ['lavender', 'Lavender', '#ae96da', '#c1a9ee'],
      ['orchid', 'Orchid', '#b36bc4', '#c77dd8'],
      ['raspberry', 'Raspberry', '#ba4374', '#ce5686'],
      ['mauve', 'Mauve', '#9f7892', '#b28aa4'],
      ['magenta', 'Magenta', '#c841a5', '#dd56b8'],
      ['pearl', 'Pearl', '#b2b2b2', '#c5c5c5', 'neutral']
    ]
  };
  // The accent. Lime is today's Stitch accent and writes nothing. Every other swatch sets the whole
  // accent family at one hue: ink L .47 (6.4:1 or better on white), fill L .84, tint L .96 (light) / .25 (dark).
  const ACCENTS = [
    ['lime', 'Lime', '#a3e635', null, null],
    ['mint', 'Mint', '#28edaf',
      {lime: '#036c4d', soft: '#e1f9ed', selected: '#daf1e6', fill: '#28edaf', ink: '#002417', edge: '#05ac7d', dd: '#036c4d'},
      {lime: '#28edaf', soft: '#0a261c', fill: '#28edaf', ink: '#002417', dd: '#15e6a8'}],
    ['aqua', 'Aqua', '#11e4f6',
      {lime: '#016770', soft: '#dcf9fc', selected: '#d6f0f3', fill: '#11e4f6', ink: '#012225', edge: '#05a5b3', dd: '#016770'},
      {lime: '#11e4f6', soft: '#022629', fill: '#11e4f6', ink: '#012225', dd: '#00ddef'}],
    ['sky', 'Sky', '#95d3ff',
      {lime: '#056190', soft: '#e7f5ff', selected: '#daeefc', fill: '#95d3ff', ink: '#021f32', edge: '#069ce4', dd: '#056190'},
      {lime: '#95d3ff', soft: '#0c2332', fill: '#95d3ff', ink: '#021f32', dd: '#86cdff'}],
    ['violet', 'Violet', '#cec0ff',
      {lime: '#61489b', soft: '#f3f0ff', selected: '#ebe7fc', fill: '#cec0ff', ink: '#1f1732', edge: '#9b7be9', dd: '#61489b'},
      {lime: '#cec0ff', soft: '#221c32', fill: '#cec0ff', ink: '#1f1732', dd: '#c8b7ff'}],
    ['pink', 'Pink', '#ffafd4',
      {lime: '#8e3665', soft: '#ffedf4', selected: '#fae3ed', fill: '#ffafd4', ink: '#2e1220', edge: '#d863a0', dd: '#8e3665'},
      {lime: '#ffafd4', soft: '#2f1823', fill: '#ffafd4', ink: '#2e1220', dd: '#ffa3cf'}],
    ['coral', 'Coral', '#ffb6a7',
      {lime: '#963828', soft: '#feeeeb', selected: '#fde4df', fill: '#ffb6a7', ink: '#31130d', edge: '#e36650', dd: '#963828'},
      {lime: '#ffb6a7', soft: '#311914', fill: '#ffb6a7', ink: '#31130d', dd: '#feac9b'}],
    ['gold', 'Gold', '#f8c20d',
      {lime: '#715700', soft: '#fbf2dc', selected: '#f2ead6', fill: '#f8c20d', ink: '#261b01', edge: '#b48c05', dd: '#715700'},
      {lime: '#f8c20d', soft: '#281f07', fill: '#f8c20d', ink: '#261b01', dd: '#f1bc0c'}],
    ['silver', 'Silver', '#c5cbd2',
      {lime: '#575b60', soft: '#f1f2f4', selected: '#e9eaec', fill: '#c5cbd2', ink: '#1c1d1e', edge: '#8d9399', dd: '#575b60'},
      {lime: '#c5cbd2', soft: '#1f2122', fill: '#c5cbd2', ink: '#1c1d1e', dd: '#bec5cc'}]
  ];
  // Where the accent setting reaches: the top bar (the page's header with its nav and site menu,
  // docs/accent-follows-appearance.md), My Bag (with its docked My Map), the bag's own sheets and menus, and in the
  // Appearance sheet its preview and its Done button (nothing else in the sheet). The logo keeps its brand tokens
  // (brand/site.css); the atlas, directory and page keep the lime.
  const ACCENT_SCOPE = ['body>header', '#myBagView', '#addDiscDialog', '#bagModelDialog', '#lostDiscDialog', '#removeDiscDialog', '#rackStyleMenu', '[data-accent-preview]',
    '#appearanceDialog [data-appearance-close].primary'];
  // Stamp appearance, on the player's own discs in personal contexts only (bag, the viewer for an owned disc,
  // the personalized map, storage). Neutral and catalog surfaces keep the official presentation. Photo discs
  // carry their stamp in the photo and are untouched. Auto is today's ink: near-black or white by the plastic.
  const STAMP_INKS = [
    ['auto', 'Auto', null], ['black', 'Black', '#1b1d21'], ['white', 'White', '#f2f2ee'], ['gold', 'Gold', '#d6a83a'],
    ['silver', 'Silver', '#c9ced5'], ['copper', 'Copper', '#c07444'], ['red', 'Red', '#c9372f'], ['blue', 'Blue', '#3b67c4'],
    ['green', 'Green', '#2f8f57'], ['violet', 'Violet', '#7f55bd'], ['pink', 'Pink', '#e47aae']
  ];
  // Finishes change only the stamp's response to light (disc3d/stamp.mjs): never the design, never the plastic.
  // Flat is today's material. The rest are physical: real reflections and thin-film color where the scene has an
  // environment (viewer, bag, storage); one frozen still on atlas markers (`still` is the reflection strength there).
  const STAMP_FINISHES = [
    ['flat', 'Flat ink', {}],
    ['foil', 'Foil', {metalness: 1, roughness: .38, still: 1.1}],
    ['rainbow', 'Rainbow foil', {metalness: 1, roughness: .36, iridescence: 1, ior: 1.8, thickness: [120, 980], pattern: 'sweep', still: 1.1}],
    ['shatter', 'Shatter foil', {metalness: 1, roughness: .44, iridescence: 1, ior: 1.8, thickness: [180, 900], pattern: 'shatter', still: 1.1}],
    ['spin', 'Spin foil', {metalness: 1, roughness: .42, iridescence: 1, ior: 1.8, thickness: [180, 900], pattern: 'spin', still: 1.1}]
  ];
  const DEFAULTS = {classes: {distance: 'classic', fairway: 'classic', mid: 'classic', putter: 'classic'}, accent: 'lime', stamp: {ink: 'auto', finish: 'flat'}};
  // Preset packs: one tap sets all four classes and the accent; any swatch can be tweaked after. A pack is
  // labeled colorblind-safe only when it clears Plan 06C's protanopia/deuteranopia floor in light and dark
  // (tests/display-palette.mjs proves the label matches; tests/palette.mjs checks the rendered tokens).
  // [id, name, {distance, fairway, mid, putter}, accent, colorblind-safe]
  const PACKS = [
    ['classic', 'Classic', DEFAULTS.classes, 'lime', true],
    ['harbor', 'Harbor', {distance: 'coral', fairway: 'navy', mid: 'teal', putter: 'lavender'}, 'aqua', true],
    ['sunset', 'Sunset', {distance: 'marigold', fairway: 'cobalt', mid: 'jade', putter: 'raspberry'}, 'coral', true],
    ['field', 'Field', {distance: 'rust', fairway: 'steel', mid: 'moss', putter: 'mauve'}, 'gold', false],
    ['floodlight', 'Floodlight', {distance: 'ember', fairway: 'glacier', mid: 'lime', putter: 'violet'}, 'violet', true]
  ];
  // The second row (docs/more-packs.md): looks chosen for variety, not held to the colorblind floor. The label
  // law is the same: a pack carries it only if it measures over the floor, as Grayscale and Jewel do.
  const MORE_PACKS = [
    ['grayscale', 'Grayscale', {distance: 'graphite', fairway: 'pewter', mid: 'ash', putter: 'pearl'}, 'silver', true],
    ['neon', 'Neon', {distance: 'tangerine', fairway: 'sky', mid: 'lime', putter: 'magenta'}, 'mint', false],
    ['pastel', 'Pastel', {distance: 'coral', fairway: 'glacier', mid: 'jade', putter: 'lavender'}, 'pink', false],
    ['vintage', 'Vintage', {distance: 'sand', fairway: 'ocean', mid: 'sage', putter: 'mauve'}, 'coral', false],
    ['jewel', 'Jewel', {distance: 'brick', fairway: 'cobalt', mid: 'pine', putter: 'plum'}, 'gold', true]
  ];

  const freeze = value => Object.freeze(value);
  const catalog = freeze({
    classes: freeze(CLASSES.map(([key, label]) => freeze({key, label, swatches: freeze(SWATCHES[key].map(([id, name, light, dark, kind]) =>
      freeze({id, label: name, light, dark, ...kind === 'neutral' && {neutral: true}})))}))),
    accents: freeze(ACCENTS.map(([id, label, chip, light, dark]) => freeze({id, label, chip, light: light && freeze({...light}), dark: dark && freeze({...dark})}))),
    // `row` is the sheet row a pack sits in: 1 for the original five, 2 for the variety row.
    packs: freeze([...PACKS.map(pack => [...pack, 1]), ...MORE_PACKS.map(pack => [...pack, 2])].map(([id, label, classes, accent, colorblindSafe, row]) =>
      freeze({id, label, classes: freeze({...classes}), accent, colorblindSafe, row}))),
    inks: freeze(STAMP_INKS.map(([id, label, hex]) => freeze({id, label, hex}))),
    finishes: freeze(STAMP_FINISHES.map(([id, label, light]) => freeze({id, label, ...light, ...(light.thickness && {thickness: freeze([...light.thickness])})}))),
    tones: freeze({...TONES}),
    scope: freeze([...ACCENT_SCOPE])
  });
  const swatchOf = (key, id) => catalog.classes.find(c => c.key === key)?.swatches.find(s => s.id === id);
  const accentOf = id => catalog.accents.find(a => a.id === id);
  const inkOf = id => catalog.inks.find(i => i.id === id), finishOf = id => catalog.finishes.find(f => f.id === id);
  // Today's stamp (Auto, Flat) is null, so every renderer runs its old path for it.
  const styleOf = (ink, finish) => ink === 'auto' && finish === 'flat' ? null : {ink: inkOf(ink).hex, inkId: ink, finish: finishOf(finish)};
  const clone = value => JSON.parse(JSON.stringify(value));

  // Anything unknown (an old or edited value) falls back to the default for that one slot.
  function normalize(raw) {
    const prefs = clone(DEFAULTS);
    if (!raw || typeof raw !== 'object') return prefs;
    for (const [key] of CLASSES) if (swatchOf(key, raw.classes?.[key])) prefs.classes[key] = raw.classes[key];
    if (accentOf(raw.accent)) prefs.accent = raw.accent;
    if (catalog.inks.some(i => i.id === raw.stamp?.ink)) prefs.stamp.ink = raw.stamp.ink;
    if (catalog.finishes.some(f => f.id === raw.stamp?.finish)) prefs.stamp.finish = raw.stamp.finish;
    return prefs;
  }
  const isDefault = prefs => JSON.stringify(normalize(prefs)) === JSON.stringify(DEFAULTS);

  const hexToRgb = hex => hex.match(/[a-f\d]{2}/gi).map(c => parseInt(c, 16)).join(',');
  function accentTokens(value, tone) {
    const tokens = {'--lime': value.lime, '--accent-soft': value.soft, '--accent-fill': value.fill, '--accent-ink': value.ink, '--dd-accent': value.dd};
    if (tone === 'light') {
      const edge = hexToRgb(value.edge);
      Object.assign(tokens, {'--selected': value.selected, '--accent-edge': `color-mix(in srgb,${value.edge} 45%,transparent)`,
        '--accent-glow': `0 0 18px -4px rgba(${edge},.45)`, '--dd-glow': `rgba(${edge},.35)`, '--dd-tint': `rgba(${edge},.16)`});
    } else {
      const fill = hexToRgb(value.fill);
      Object.assign(tokens, {'--on-accent': value.ink, '--accent-edge': `rgba(${fill},.33)`, '--accent-glow': `0 0 20px -3px rgba(${fill},.33)`,
        '--dd-glow': `rgba(${fill},.3)`, '--dd-tint': `rgba(${fill},.12)`});
    }
    return tokens;
  }
  const declarations = tokens => Object.entries(tokens).map(([name, value]) => `${name}:${value}`).join(';');

  // `html:root[data-theme=…]` outranks the theme blocks, which are all `:root[data-theme=…]` or `:root`.
  function css(prefs) {
    prefs = normalize(prefs);
    const rules = [];
    for (const tone of ['light', 'dark']) {
      const themes = Object.keys(TONES).filter(theme => TONES[theme] === tone);
      if (!themes.length) continue;
      const roots = themes.map(theme => `html:root[data-theme="${theme}"]`);
      const classTokens = {};
      for (const [key] of CLASSES) if (prefs.classes[key] !== 'classic') classTokens['--' + key] = swatchOf(key, prefs.classes[key])[tone];
      if (Object.keys(classTokens).length) rules.push(`${roots.join(',')}{${declarations(classTokens)}}`);
      const accent = accentOf(prefs.accent);
      if (accent[tone]) rules.push(`${roots.flatMap(root => ACCENT_SCOPE.map(scope => `${root} ${scope}`)).join(',')}{${declarations(accentTokens(accent[tone], tone))}}`);
    }
    return rules.join('\n');
  }

  let prefs = DEFAULTS;
  try { prefs = normalize(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { /* Storage may be disabled. */ }
  let style = null;
  function paint() {
    const text = css(prefs);
    if (!text) { style?.remove(); style = null; return; }
    if (!style) { style = document.createElement('style'); style.id = 'display-palette'; }
    if (style.textContent !== text) style.textContent = text;
    if (!style.isConnected) document.head.append(style);
  }
  function commit(next) {
    next = normalize(next);
    if (JSON.stringify(next) === JSON.stringify(prefs)) return get();
    prefs = next;
    try { isDefault(prefs) ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* Session only. */ }
    paint();
    window.dispatchEvent(new CustomEvent('atlas-palette-change', {detail: get()}));
    return get();
  }
  function get() { return clone(prefs); }
  // The value a class or the accent wears right now, in the current (or a named) theme.
  function toneOf(theme = document.documentElement.dataset.theme) { return TONES[theme] || 'light'; }
  function classColor(key, theme) { return swatchOf(key, prefs.classes[key])?.[toneOf(theme)]; }

  paint();
  window.DisplayPalette = {
    catalog, defaults: freeze(clone(DEFAULTS)), get, css, normalize, isDefault: () => isDefault(prefs), toneOf, classColor,
    setClass: (key, id) => swatchOf(key, id) ? commit({...prefs, classes: {...prefs.classes, [key]: id}}) : get(),
    setAccent: id => accentOf(id) ? commit({...prefs, accent: id}) : get(),
    applyPack: id => { const pack = catalog.packs.find(p => p.id === id); return pack ? commit({...prefs, classes: {...pack.classes}, accent: pack.accent}) : get(); },
    // The pack the current choices match exactly, or null once a swatch has been tweaked away from it.
    pack: () => catalog.packs.find(p => p.accent === prefs.accent && Object.entries(p.classes).every(([key, id]) => prefs.classes[key] === id))?.id ?? null,
    set: next => commit({...prefs, ...next, classes: {...prefs.classes, ...next?.classes}, stamp: {...prefs.stamp, ...next?.stamp}}),
    // Only curated values get through; anything else leaves the current choice as it is.
    setStamp: next => commit({...prefs, stamp: {...prefs.stamp,
      ...catalog.inks.some(i => i.id === next?.ink) && {ink: next.ink}, ...catalog.finishes.some(f => f.id === next?.finish) && {finish: next.finish}}}),
    // What a personal stamp wears: null for today's (Auto, Flat), else the ink (null for Auto) and the finish.
    stampStyle: () => styleOf(prefs.stamp.ink, prefs.stamp.finish),
    // One disc's stamp (docs/stamp-look-extraction.md): its own ink and finish, each null to follow the setting above,
    // so a disc that never chose one wears exactly stampStyle().
    stampStyleFor: choice => styleOf(inkOf(choice?.ink) ? choice.ink : prefs.stamp.ink, finishOf(choice?.finish) ? choice.finish : prefs.stamp.finish),
    reset: () => commit(DEFAULTS)
  };
})();
