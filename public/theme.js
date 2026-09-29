/* Shared by the atlas and standalone information pages; runs before paint. */
(() => {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'midnight', 'charcoal'].includes(value);
  let saved;
  try { saved = localStorage.getItem('disc-atlas-theme'); } catch { /* Storage may be disabled. */ }
  if (saved === 'dark') saved = 'midnight';
  const apply = value => {
    document.documentElement.dataset.theme = value;
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = value; });
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', value === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === 'light' ? '#f7f8fa' : value === 'charcoal' ? '#101113' : '#080b10';
    window.dispatchEvent(new CustomEvent('atlas-theme-change', {detail: value}));
  };
  apply(valid(saved) ? saved : media.matches ? 'midnight' : 'light');
  media.addEventListener('change', () => { if (!valid(saved)) apply(media.matches ? 'midnight' : 'light'); });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        saved = document.documentElement.dataset.theme === 'light' ? 'midnight' : 'light';
        try { localStorage.setItem('disc-atlas-theme', saved); } catch { /* Session only. */ }
        apply(saved);
      });
    });
    apply(document.documentElement.dataset.theme);
    const info=document.getElementById('atlasInfo');
    document.addEventListener('pointerdown',event=>{if(info&&!info.contains(event.target))info.open=false;});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&info?.open){info.open=false;info.querySelector('summary').focus();}});
    info?.querySelectorAll('button,a').forEach(control=>control.addEventListener('click',()=>{info.open=false;}));
    document.querySelectorAll('[data-theme-select]').forEach(select => {
      select.value = document.documentElement.dataset.theme;
      select.addEventListener('change', () => {
        if (!valid(select.value)) return;
        saved = select.value;
        try { localStorage.setItem('disc-atlas-theme', saved); } catch { /* Keep this session's choice. */ }
        apply(saved);
      });
    });
  });
})();
