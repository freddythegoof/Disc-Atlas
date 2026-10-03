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
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-checked', String(button.dataset.themeChoice === value));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', value === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === 'light' ? '#f7f8fa' : value === 'charcoal' ? '#101113' : '#080b10';
    window.dispatchEvent(new CustomEvent('atlas-theme-change', {detail: value}));
  };
  const choose = value => {
    if (!valid(value)) return;
    saved = value;
    try { localStorage.setItem('disc-atlas-theme', saved); } catch { /* Session only. */ }
    apply(saved);
  };
  apply(valid(saved) ? saved : media.matches ? 'midnight' : 'light');
  media.addEventListener('change', () => { if (!valid(saved)) apply(media.matches ? 'midnight' : 'light'); });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        choose(document.documentElement.dataset.theme === 'light' ? 'midnight' : 'light');
      });
    });
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => choose(button.dataset.themeChoice));
    });
    apply(document.documentElement.dataset.theme);
    const info=document.getElementById('atlasInfo'),button=document.getElementById('siteMenuButton'),menu=document.getElementById('siteMenu');
    if(button&&menu){
      const items=()=>[...menu.querySelectorAll('[role="menuitem"],[role="menuitemradio"]')].filter(item=>!item.closest('[hidden]'));
      const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});};
      const open=index=>{menu.hidden=false;button.setAttribute('aria-expanded','true');const visible=items();visible[index<0?visible.length-1:index].focus({preventScroll:true});};
      button.addEventListener('click',()=>menu.hidden?open(0):close());
      button.addEventListener('keydown',event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowUp'){
          event.preventDefault();open(event.key==='ArrowUp'?-1:0);
        }
      });
      menu.addEventListener('keydown',event=>{
        const visible=items(),index=visible.indexOf(document.activeElement);
        const next=event.key==='ArrowDown'?(index+1)%visible.length:event.key==='ArrowUp'?(index-1+visible.length)%visible.length:
          event.key==='Home'?0:event.key==='End'?visible.length-1:null;
        if(next!==null){event.preventDefault();visible[next].focus({preventScroll:true});}
        else if(event.key==='Tab')close();
      });
      info.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&!menu.hidden){event.preventDefault();event.stopPropagation();close();}
      });
      document.addEventListener('pointerdown',event=>{if(!menu.hidden&&!info.contains(event.target))close();});
      info.addEventListener('focusout',event=>{
        if(!menu.hidden&&event.relatedTarget&&!info.contains(event.relatedTarget))close();
      });
      menu.querySelectorAll('[role="menuitem"]').forEach(item=>item.addEventListener('click',close));
    }
    document.querySelectorAll('[data-theme-select]').forEach(select => {
      select.value = document.documentElement.dataset.theme;
      select.addEventListener('change', () => {
        choose(select.value);
      });
    });
  });
})();
