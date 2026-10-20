/* Display customization (docs/display-customization.md): curated class colors and the bag accent.
   The one source of truth for the active palette. It runs before first paint, right after theme.js, and
   writes CSS custom properties: 2D surfaces use them directly and the WebGL surfaces read them back
   through applyTheme(), so no second table can drift. Untouched, it writes nothing at all, so the
   default is exactly today's palette. Every selectable color is a designed swatch; there is no free input.
   Per browser, like the theme: one localStorage key, no account storage. */
(() => {
  const KEY = 'disc-atlas-display';
  // Which swatch value each theme wears. A new theme joins here and nowhere else.
  const TONES = {light: 'light', midnight: 'dark', charcoal: 'dark', black: 'dark'};
  // UI order follows the atlas chips: Driver, Fairway, Midrange, Putter.
  const CLASSES = [['distance', 'Driver'], ['fairway', 'Fairway'], ['mid', 'Midrange'], ['putter', 'Putter']];
  // [id, label, light value, dark value]. Each row keeps to its own hue sector at the lightness and chroma
  // of Plan 06C's set (light L .44–.76, C .05–.20; dark lifts warm, green and pink hues by .06 L and deep
  // blues by .03), so any combination reads as one palette and classes stay apart (tests/display-palette.mjs).
  // `classic` is today's Okabe-Ito value, exactly.
  const SWATCHES = {
    distance: [
      ['classic', 'Orange', '#ce8a00', '#e6a139'],
      ['ember', 'Ember', '#cc5824', '#e06b39'],
      ['brick', 'Brick', '#a64736', '#ba5947'],
      ['tangerine', 'Tangerine', '#df7b0c', '#f48d2f'],
      ['marigold', 'Marigold', '#d8aa32', '#ecbd4a'],
      ['coral', 'Coral', '#e2856c', '#f6987e'],
      ['sand', 'Sand', '#ba986e', '#cdaa80'],
      ['rust', 'Rust', '#ab5d2b', '#bf6e3e']
    ],
    fairway: [
      ['classic', 'Blue', '#0072b2', '#0072b2'],
      ['sky', 'Sky', '#489bcd', '#52a5d7'],
      ['cobalt', 'Cobalt', '#2c5dbd', '#3566c7'],
      ['ocean', 'Ocean', '#087e9b', '#1c87a5'],
      ['glacier', 'Glacier', '#65b2c4', '#6fbbce'],
      ['navy', 'Navy', '#1c548d', '#255d96'],
      ['steel', 'Steel', '#627e96', '#6a87a0'],
      ['cornflower', 'Cornflower', '#6782ce', '#708bd8']
    ],
    mid: [
      ['classic', 'Bluish green', '#008c67', '#009e73'],
      ['leaf', 'Leaf', '#4a9c42', '#5caf54'],
      ['moss', 'Moss', '#6b8537', '#7d9849'],
      ['jade', 'Jade', '#4fad83', '#63c095'],
      ['teal', 'Teal', '#2a8672', '#409884'],
      ['pine', 'Pine', '#237356', '#388567'],
      ['sage', 'Sage', '#789d7f', '#8ab091'],
      ['lime', 'Lime', '#86bf3c', '#99d352']
    ],
    putter: [
      ['classic', 'Reddish purple', '#bc719b', '#cc79a7'],
      ['plum', 'Plum', '#8f4d89', '#a15e9c'],
      ['violet', 'Violet', '#8459c3', '#966cd7'],
      ['lavender', 'Lavender', '#ae96da', '#c1a9ee'],
      ['orchid', 'Orchid', '#b36bc4', '#c77dd8'],
      ['raspberry', 'Raspberry', '#ba4374', '#ce5686'],
      ['mauve', 'Mauve', '#9f7892', '#b28aa4'],
      ['magenta', 'Magenta', '#c841a5', '#dd56b8']
    ]
  };
  // The bag accent. Lime is today's Stitch accent and writes nothing. Every other swatch sets the whole
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
  // Where the accent setting reaches: My Bag (with its docked My Map), the bag's own sheets and menus, and
  // the Appearance preview. The header, atlas, directory and site menu keep the Disc Atlas lime.
  const ACCENT_SCOPE = ['#myBagView', '#addDiscDialog', '#bagModelDialog', '#lostDiscDialog', '#removeDiscDialog', '#rackStyleMenu', '[data-accent-preview]'];
  const DEFAULTS = {classes: {distance: 'classic', fairway: 'classic', mid: 'classic', putter: 'classic'}, accent: 'lime'};

  const freeze = value => Object.freeze(value);
  const catalog = freeze({
    classes: freeze(CLASSES.map(([key, label]) => freeze({key, label, swatches: freeze(SWATCHES[key].map(([id, name, light, dark]) => freeze({id, label: name, light, dark})))}))),
    accents: freeze(ACCENTS.map(([id, label, chip, light, dark]) => freeze({id, label, chip, light: light && freeze({...light}), dark: dark && freeze({...dark})}))),
    tones: freeze({...TONES}),
    scope: freeze([...ACCENT_SCOPE])
  });
  const swatchOf = (key, id) => catalog.classes.find(c => c.key === key)?.swatches.find(s => s.id === id);
  const accentOf = id => catalog.accents.find(a => a.id === id);
  const clone = value => JSON.parse(JSON.stringify(value));

  // Anything unknown (an old or edited value) falls back to the default for that one slot.
  function normalize(raw) {
    const prefs = clone(DEFAULTS);
    if (!raw || typeof raw !== 'object') return prefs;
    for (const [key] of CLASSES) if (swatchOf(key, raw.classes?.[key])) prefs.classes[key] = raw.classes[key];
    if (accentOf(raw.accent)) prefs.accent = raw.accent;
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
    set: next => commit({...prefs, ...next, classes: {...prefs.classes, ...next?.classes}}),
    reset: () => commit(DEFAULTS)
  };
})();
