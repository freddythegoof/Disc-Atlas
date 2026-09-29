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
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === 'light' ? '#f5f6fa' : value === 'charcoal' ? '#101113' : '#0c1424';
    window.dispatchEvent(new CustomEvent('atlas-theme-change', {detail: value}));
  };
  apply(valid(saved) ? saved : media.matches ? 'midnight' : 'light');
  media.addEventListener('change', () => { if (!valid(saved)) apply(media.matches ? 'midnight' : 'light'); });
  document.addEventListener('DOMContentLoaded', () => {
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
