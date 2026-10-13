/* Shared by the atlas and standalone information pages; runs before paint. */
(() => {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const valid = value => ['light', 'midnight', 'charcoal', 'black'].includes(value);
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
    if (meta) meta.content = value === 'light' ? '#f7f8fa' : value === 'charcoal' ? '#101113' : value === 'black' ? '#000000' : '#080b10';
    const favicon = `/brand/${value}/submark.svg?v=tilted-disc`;
    document.querySelectorAll('link[rel="icon"]').forEach(link => {
      if (link.getAttribute('href') !== favicon) link.setAttribute('href', favicon);
    });
    window.dispatchEvent(new CustomEvent('atlas-theme-change', {detail: value}));
  };
  let requested, transition, timer, version=0;
  const root=document.documentElement;
  const clearSwitch = () => {
    root.classList.remove('theme-switching','theme-snapshots','theme-fading','theme-calm');
    root.style.removeProperty('--theme-transition-bg');
  };
  const switchTheme = value => {
    if(value===requested)return;
    requested=value;
    const current=++version;
    const backdrop=root.style.getPropertyValue('--theme-transition-bg');
    clearTimeout(timer);transition?.skipTransition();transition=null;
    clearSwitch();
    // Reduced motion keeps the cross-fade, shorter (cosmic.css .theme-calm): opacity moves, nothing else.
    root.classList.add('theme-switching');if(reduced.matches)root.classList.add('theme-calm');
    if(document.startViewTransition){
      root.classList.add('theme-snapshots');
      transition=document.startViewTransition(() => {
        if(current!==version)return;
        apply(value);
        // Theme listeners paint synchronously; rAF is paused during snapshot capture.
      });
      transition.ready.catch(()=>{}); // A superseded snapshot can be skipped.
      transition.finished.catch(()=>{}).then(()=>{if(current===version){transition=null;clearSwitch();}});
    }else{
      // Scoped fallback: fade surfaces AND canvases using opacity only. Hold the old
      // backdrop while changing tokens; no permanent colour transitions or white flash.
      root.style.setProperty('--theme-transition-bg',backdrop||getComputedStyle(root).getPropertyValue('--bg'));
      void document.body.offsetWidth;
      root.classList.add('theme-fading');
      timer=setTimeout(()=>{
        if(current!==version)return;
        apply(value);root.classList.remove('theme-fading');
        timer=setTimeout(clearSwitch,140);
      },120);
    }
  };
  const choose = value => {
    if (!valid(value)) return;
    saved = value;
    try { localStorage.setItem('disc-atlas-theme', saved); } catch { /* Session only. */ }
    switchTheme(saved);
  };
  apply(valid(saved) ? saved : media.matches ? 'midnight' : 'light');
  requested=root.dataset.theme;
  media.addEventListener('change', () => { if (!valid(saved)) switchTheme(media.matches ? 'midnight' : 'light'); });
  reduced.addEventListener('change',()=>{
    if(!reduced.matches)return;
    ++version;clearTimeout(timer);transition?.skipTransition();transition=null;clearSwitch();apply(requested);
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        choose(requested === 'light' ? 'midnight' : 'light');
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
