/* Short, interruptible responses. The atlas stays still when no one is interacting. */
window.AtlasMotion = (() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const enabled = () => !reduced.matches && !!window.gsap;
  const cancel = node => window.gsap?.killTweensOf(node);
  function reveal(node, direction = 'right') {
    const wasHidden = node.hidden || node.inert;
    cancel(node); node.hidden = false; node.inert = false;
    if (!enabled()) { window.gsap?.set(node, {clearProps:'transform,opacity,height'}); return; }
    if (!wasHidden) {
      gsap.to(node,{opacity:1,x:0,y:0,duration:.18,ease:'power3.out',clearProps:'transform,opacity',overwrite:true});
      return;
    }
    const mobile = innerWidth < 700 && node.id === 'detail';
    gsap.fromTo(node, {opacity:0, x:mobile?0:direction==='left'?-20:24, y:mobile?35:0},
      {opacity:1, x:0, y:0, duration:.32, ease:'power3.out', clearProps:'transform,opacity', overwrite:true});
  }
  function dismiss(node, immediate = false) {
    cancel(node); node.inert = true;
    const finish = () => { node.hidden = true; node.inert = false; if(node.id==='detail')node.classList.remove('is-expanded'); window.gsap?.set(node,{clearProps:'transform,opacity,height'}); };
    if (node.hidden || immediate || !enabled()) { finish(); return; }
    const mobile = innerWidth < 700 && node.id === 'detail';
    gsap.to(node, {opacity:0, x:mobile?0:node.id==='filters'?-14:18, y:mobile?25:0,
      duration:.16, ease:'power2.in', overwrite:true, onComplete:finish});
  }
  function expand(node, change) {
    cancel(node); const before = node.getBoundingClientRect().height;
    node.style.height = ''; change();
    if (enabled()) gsap.fromTo(node,{height:before},{height:node.getBoundingClientRect().height,
      duration:.35,ease:'power3.inOut',clearProps:'height',overwrite:true});
  }
  function selected(node) {
    if (!enabled() || !node) return;
    const halo=node.querySelector('.marker-halo');
    gsap.fromTo(halo,{scale:1.35,opacity:.25},{scale:1,opacity:1,duration:.48,
      ease:'power3.out',overwrite:true,clearProps:'transform,opacity'});
  }
  function enter(node) {
    // No computed-style reads inside the camera's render loop.
    if (enabled()) node.style.animation='atlas-arrive .2s ease-out';
  }
  let hovered=null,art=null,box=null;
  function releaseHover() {
    if (art && enabled()) gsap.to(art,{x:0,y:0,rotation:0,scale:1,duration:.65,
      ease:'elastic.out(1,0.65)',overwrite:true,clearProps:'transform'});
    else if(art){cancel(art);window.gsap?.set(art,{clearProps:'transform'});}
    hovered=null;art=null;box=null;
  }
  document.addEventListener('pointerover',e=>{
    if (!enabled() || e.pointerType==='touch' || e.buttons || document.querySelector('#map.is-dragging')) return;
    const target=e.target.closest('.atlas-marker, .inspect-disc, .disc-row, .gap-options button, .compare-item, .bag-item');
    if (!target || target===hovered) return;
    releaseHover();hovered=target;art=target.querySelector('.marker-stack, .disc-art');
    if (!art) return;
    box=target.getBoundingClientRect();
    gsap.to(art,{scale:1.08,y:-4,duration:.7,ease:'power3.out',overwrite:true});
  });
  document.addEventListener('pointermove',e=>{
    if (!art || !box || !enabled() || e.buttons || !hovered.contains(e.target)) return;
    const x=Math.max(-1,Math.min(1,(e.clientX-box.left)/box.width*2-1));
    const y=Math.max(-1,Math.min(1,(e.clientY-box.top)/box.height*2-1));
    gsap.to(art,{x:x*3,y:-4+y*2,rotation:x*3,scale:1.08,duration:.3,ease:'power3.out',overwrite:true});
  });
  document.addEventListener('pointerout',e=>{if(hovered && !hovered.contains(e.relatedTarget))releaseHover();});
  document.addEventListener('pointerdown',releaseHover);
  reduced.addEventListener('change',()=>{
    releaseHover();
    for(const tween of window.gsap?.globalTimeline.getChildren()||[])tween.progress(1);
  });
  return {enabled,reveal,dismiss,expand,selected,enter};
})();
