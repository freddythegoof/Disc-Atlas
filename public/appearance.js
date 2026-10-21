/* The Appearance sheet: one home for the theme, preset packs, the class colors and the accent
   (docs/display-customization.md). Every control is a curated swatch from DisplayPalette's catalog;
   tapping one applies it at once and saves it, like the theme radios. */
(() => {
  const palette = window.DisplayPalette;
  const dialog = document.getElementById('appearanceDialog');
  if (!palette || !dialog) return;
  const $ = selector => dialog.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  // theme.js owns the list (and its order).
  const THEMES = Object.entries(window.DiscAtlasThemes || {}).map(([id, theme]) => [id, theme.label]);

  // A radiogroup of swatches. Arrow keys move the choice, as native radios do.
  const swatchRow = ({group, label, legend, current, swatches}) =>
    `<fieldset class="appearance-row" data-row="${esc(group)}"><legend><span class="appearance-row-title">${legend}${esc(label)}</span><output data-row-name>${esc(current)}</output></legend>` +
    `<div class="appearance-swatches" role="radiogroup" aria-label="${esc(label)} color" style="--count:${swatches.length}">` +
    swatches.map(s => `<button type="button" role="radio" aria-checked="false" tabindex="-1" data-swatch="${esc(s.id)}" aria-label="${esc(s.label)}" title="${esc(s.label)}"></button>`).join('') +
    `</div></fieldset>`;

  function build() {
    const prefs = palette.get();
    $('[data-appearance-theme]').innerHTML = THEMES.map(([id, label]) =>
      `<button type="button" role="radio" aria-checked="false" tabindex="-1" data-theme-option="${id}">${label}</button>`).join('');
    // Packs: a starting point each, in two rows. The label shows only on packs that clear the colorblind floor;
    // the second row is chosen for variety, and its caption says so (docs/more-packs.md).
    $('[data-appearance-packs]').innerHTML = palette.catalog.packs.map((p, i, packs) =>
      (i && p.row !== packs[i - 1].row ? `<p class="appearance-pack-more" data-pack-row-caption>More looks, chosen for variety. Any that are also colorblind-safe say so.</p>` : '') +
      `<button type="button" role="radio" aria-checked="false" tabindex="-1" data-pack="${esc(p.id)}" aria-label="${esc(p.label)}${p.colorblindSafe ? ', colorblind-safe' : ''}">` +
      `<span class="appearance-pack-dots" aria-hidden="true">${palette.catalog.classes.map(c => `<i data-pack-class="${c.key}"></i>`).join('')}<i class="appearance-pack-accent"></i></span>` +
      `<span class="appearance-pack-name">${esc(p.label)}</span>${p.colorblindSafe ? '<small class="appearance-pack-tag" aria-hidden="true">Colorblind-safe</small>' : ''}</button>`).join('');
    $('[data-appearance-classes]').innerHTML = palette.catalog.classes.map(c => swatchRow({
      group: c.key, label: c.label, current: c.swatches.find(s => s.id === prefs.classes[c.key]).label, swatches: c.swatches,
      legend: `<i class="appearance-dot" style="background:var(--${c.key})" aria-hidden="true"></i>`
    })).join('') + swatchRow({
      group: 'accent', label: 'Accent', current: palette.catalog.accents.find(a => a.id === prefs.accent).label, swatches: palette.catalog.accents,
      legend: '<i class="appearance-dot appearance-dot-accent" data-accent-preview aria-hidden="true"></i>'
    });
    // Stamps: ink and finish for the player's own discs, with a live 3D preview.
    $('[data-appearance-stamp]').innerHTML = swatchRow({
      group: 'ink', label: 'Stamp ink', current: palette.catalog.inks.find(i => i.id === prefs.stamp.ink).label, swatches: palette.catalog.inks, legend: ''
    }) + `<fieldset class="appearance-row" data-row="finish"><legend><span class="appearance-row-title">Finish</span><output data-row-name></output></legend>` +
      `<div class="appearance-finishes" role="radiogroup" aria-label="Stamp finish">` +
      palette.catalog.finishes.map(f => `<button type="button" role="radio" aria-checked="false" tabindex="-1" data-swatch="${esc(f.id)}">${esc(f.label)}</button>`).join('') + `</div></fieldset>`;
    paint();
    preview();
  }

  // The stamp preview loads three.js only when the sheet opens, and draws only while it is open.
  let stampPreview = null, loadingPreview = null;
  function preview() {
    const canvas = $('[data-stamp-preview]');
    if (!canvas || window.ATLAS_3D_OFF) return;
    // app.js's catalog is a top-level binding, not a window property.
    const disc = (typeof discs === 'undefined' ? [] : discs).find(d => d.brand === 'Discraft' && d.name === 'Buzzz' && d.stampAsset);
    loadingPreview ??= import('./disc3d/stamp-preview.mjs').then(m => { stampPreview = m.createStampPreview(canvas, disc); return stampPreview; })
      .catch(error => { canvas.closest('.appearance-stamp-preview').dataset.state = 'fallback'; console.warn('Stamp preview unavailable.', error); });
    loadingPreview.then(p => { if (!p || !dialog.open) return; p.setStyle(palette.stampStyle()); p.start(); canvas.closest('.appearance-stamp-preview').dataset.state = 'ready'; });
  }
  dialog.addEventListener('close', () => stampPreview?.stop());

  // Swatches show the value they would wear in the current theme.
  function paint() {
    if (!$('[data-row]')) return; // Not built until the sheet first opens.
    const prefs = palette.get(), tone = palette.toneOf();
    for (const row of dialog.querySelectorAll('[data-row]')) {
      const group = row.dataset.row, accent = group === 'accent';
      const list = accent ? palette.catalog.accents : group === 'ink' ? palette.catalog.inks : group === 'finish' ? palette.catalog.finishes : palette.catalog.classes.find(c => c.key === group).swatches;
      const chosen = accent ? prefs.accent : group === 'ink' ? prefs.stamp.ink : group === 'finish' ? prefs.stamp.finish : prefs.classes[group];
      for (const button of row.querySelectorAll('[data-swatch]')) {
        const swatch = list.find(s => s.id === button.dataset.swatch), on = swatch.id === chosen;
        // Auto ink is today's: near-black on a light plastic, white on a dark one; its swatch shows both.
        if (group !== 'finish') button.style.setProperty('--swatch', accent ? swatch.chip : group === 'ink' ? swatch.hex || 'linear-gradient(135deg,#1b1d21 50%,#f2f2ee 50%)' : swatch[tone]);
        button.setAttribute('aria-checked', String(on));button.tabIndex = on ? 0 : -1;
        if (on) row.querySelector('[data-row-name]').textContent = swatch.label;
      }
    }
    const pack = palette.pack();
    for (const button of dialog.querySelectorAll('[data-pack]')) {
      const p = palette.catalog.packs.find(p => p.id === button.dataset.pack), on = p.id === pack;
      for (const dot of button.querySelectorAll('[data-pack-class]')) {
        const key = dot.dataset.packClass;
        dot.style.background = palette.catalog.classes.find(c => c.key === key).swatches.find(s => s.id === p.classes[key])[tone];
      }
      button.querySelector('.appearance-pack-accent').style.background = palette.catalog.accents.find(a => a.id === p.accent).chip;
      button.setAttribute('aria-checked', String(on));button.tabIndex = on ? 0 : -1;
    }
    // With no pack matched, the first pack takes the group's tab stop.
    if (!pack) dialog.querySelector('[data-pack]').tabIndex = 0;
    $('[data-pack-name]').textContent = pack ? palette.catalog.packs.find(p => p.id === pack).label : 'Your mix';
    const theme = document.documentElement.dataset.theme;
    for (const button of dialog.querySelectorAll('[data-theme-option]')) {
      const on = button.dataset.themeOption === theme;
      button.setAttribute('aria-checked', String(on));button.tabIndex = on ? 0 : -1;
    }
    $('[data-appearance-reset]').disabled = palette.isDefault();
    stampPreview?.setStyle(palette.stampStyle());
  }

  function choose(button) {
    if (button.dataset.pack) { palette.applyPack(button.dataset.pack); return; }
    if (button.dataset.themeOption) {
      // The site menu's radios own the theme (theme.js): saving, the cross-fade, every page's controls.
      document.querySelector(`#siteMenu [data-theme-choice="${button.dataset.themeOption}"]`)?.click();
      return;
    }
    const group = button.closest('[data-row]').dataset.row;
    if (group === 'ink' || group === 'finish') palette.setStamp({[group]: button.dataset.swatch});
    else if (group === 'accent') palette.setAccent(button.dataset.swatch);
    else palette.setClass(group, button.dataset.swatch);
  }

  dialog.addEventListener('click', event => {
    const button = event.target.closest('[role="radio"]');
    if (button) { choose(button); return; }
    if (event.target.closest('[data-appearance-reset]')) { palette.reset(); $('[data-appearance-reset]').blur(); dialog.querySelector('[data-row] [aria-checked="true"]')?.focus(); return; }
    if (event.target.closest('[data-appearance-close]') || event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    const button = event.target.closest('[role="radio"]');
    if (!button || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const radios = [...button.parentElement.querySelectorAll('[role="radio"]')], index = radios.indexOf(button);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? radios.length - 1 :
      (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + radios.length) % radios.length;
    event.preventDefault();
    choose(radios[next]);
    requestAnimationFrame(() => radios[next].focus());
  });
  window.addEventListener('atlas-palette-change', paint);
  window.addEventListener('atlas-theme-change', paint);

  const open = () => { build(); dialog.showModal(); dialog.querySelector('[data-appearance-theme] [aria-checked="true"]')?.focus(); };
  // The site menu closes itself (theme.js) and returns focus to its button first; open after it.
  for (const item of document.querySelectorAll('[data-appearance-open]')) item.addEventListener('click', () => setTimeout(open));
  window.AppearanceSheet = {open};
})();
