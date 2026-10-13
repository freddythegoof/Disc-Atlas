/* Short, interruptible responses. The atlas stays still when no one is interacting. */
window.AtlasMotion = (() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const enabled = () => !reduced.matches && !!window.gsap;
  const panels = new WeakMap();
  const cancel = node => {window.gsap?.killTweensOf(node);panels.get(node)?.tween?.kill();};
  function slide(node, from, to, direction, duration, complete) {
    const state={value:from};panels.set(node,state);
    const mobile=innerWidth<700&&node.id==='detail',travel=reduced.matches?0:1;   // reduced motion: a fade, no slide
    const paint=()=>{
      node.style.opacity=state.value;
      const offset=travel*(1-state.value)*(mobile?18:direction==='left'?-14:14);
      node.style.transform=mobile?`translate3d(0,${offset}px,0)`:`translate3d(${offset}px,0,0)`;
    };
    paint();
    state.tween=gsap.to(state,{value:to,duration,ease:'power3.out',onUpdate:paint,onComplete:()=>{
      node.style.transform='';node.style.opacity='';panels.delete(node);complete?.();
    }});
  }
  function reveal(node, direction = 'right') {
    const wasHidden = node.hidden || node.inert,from=panels.get(node)?.value??0;
    cancel(node); node.hidden = false; node.inert = false;
    if (!window.gsap) { node.style.transform='';node.style.opacity='';node.style.height='';return; }
    if (!wasHidden) {
      node.style.transform='';node.style.opacity='';panels.delete(node);
      return;
    }
    slide(node,from,1,direction,.18);
  }
  function dismiss(node, immediate = false) {
    const from=panels.get(node)?.value??1;cancel(node); node.inert = true;
    const finish = () => { node.hidden = true; node.inert = false; if(node.id==='detail'){node.classList.remove('is-expanded');node.querySelectorAll('svg').forEach(svg=>svg.pauseAnimations());}node.style.transform='';node.style.opacity='';node.style.height='';panels.delete(node); };
    if (node.hidden || immediate || !window.gsap) { finish(); return; }
    slide(node,from,0,node.id==='filters'?'left':'right',.12,finish);
  }
  // A user-triggered toggle reads as responsive when it eases out: the height, and the corners that go from
  // the sheet's rounded top to square at full screen, travel together (expo-out, the surface duration).
  function expand(node, change) {
    cancel(node); panels.delete(node);
    // Expanding during the reveal must finish the reveal's opacity and offset.
    node.style.transform = ''; node.style.opacity = '';
    const style = getComputedStyle(node), before = node.getBoundingClientRect().height, radius = parseFloat(style.borderTopLeftRadius) || 0;
    node.style.height = ''; change();
    if (enabled()) {
      const after = node.getBoundingClientRect().height, to = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
      gsap.fromTo(node,{height:before,borderTopLeftRadius:radius,borderTopRightRadius:radius},{height:after,borderTopLeftRadius:to,borderTopRightRadius:to,
        duration:.28,ease:'expo.out',clearProps:'height,borderTopLeftRadius,borderTopRightRadius',overwrite:true});
    }
  }
  function selected(node) {
    if (!enabled() || !node) return;
    const halo=node.querySelector('.marker-halo');
    halo.getAnimations().forEach(animation=>animation.cancel());
    halo.animate([{transform:'scale(1.2)',opacity:.3},{transform:'scale(1)',opacity:1}],{duration:220,easing:'ease-out'});
  }
  function enter(node) {
    // No computed-style reads inside the camera's render loop.
    if (enabled()) node.style.animation='atlas-arrive .2s ease-out';
  }
  let hovered=null,art=null,box=null;
  function releaseHover() {
    if (art && enabled()) gsap.to(art,{x:0,y:0,rotation:0,scale:1,duration:.32,
      ease:'elastic.out(1,0.65)',overwrite:true,clearProps:'transform'});
    else if(art){cancel(art);window.gsap?.set(art,{clearProps:'transform'});}
    hovered=null;art=null;box=null;
  }
  document.addEventListener('pointerover',e=>{
    if (!enabled() || e.pointerType==='touch' || e.buttons || document.querySelector('#map.is-dragging')) return;
    const target=e.target.closest('.atlas-marker, .stack-choice, .inspect-disc, .disc-row, .gap-options button, .compare-item, .bag-item');
    if (!target || target===hovered) return;
    releaseHover();hovered=target;art=target.querySelector('.marker-stack, .disc-art');
    if (!art) return;
    box=target.getBoundingClientRect();
    gsap.to(art,{scale:1.06,y:-3,duration:.18,ease:'power3.out',overwrite:true});
  });
  document.addEventListener('pointermove',e=>{
    if (pressed&&document.querySelector('#map.is-panning')) releasePress();
    if (!art || !box || !enabled() || e.buttons || !hovered.contains(e.target)) return;
    const x=Math.max(-1,Math.min(1,(e.clientX-box.left)/box.width*2-1));
    const y=Math.max(-1,Math.min(1,(e.clientY-box.top)/box.height*2-1));
    gsap.to(art,{x:x*3,y:-3+y*2,rotation:x*3,scale:1.06,duration:.12,ease:'power3.out',overwrite:true});
  });
  document.addEventListener('pointerout',e=>{if(hovered && !hovered.contains(e.relatedTarget))releaseHover();});
  // Press: a marker's art dips to .97 on pointerdown (touch included, where there is no hover) and returns on
  // release, back to the hover pose when the pointer is still over it. GSAP owns .marker-stack, so the press is
  // a tween here, not CSS. Panning lets go of it.
  let pressed=null;
  function releasePress() {
    const stack=pressed;pressed=null;if (!stack) return;
    const over=hovered&&hovered.contains(stack);
    if (enabled()) gsap.to(stack,{x:0,y:over?-3:0,rotation:0,scale:over?1.06:1,duration:.32,ease:'elastic.out(1,0.65)',overwrite:true,clearProps:over?'':'transform'});
    else {cancel(stack);window.gsap?.set(stack,{clearProps:'transform'});}
  }
  document.addEventListener('pointerdown',e=>{
    const stack=e.button===0&&window.gsap?e.target.closest?.('.atlas-marker')?.querySelector('.marker-stack'):null;
    if (!stack) {releaseHover();return;}
    if (hovered&&!hovered.contains(stack)) releaseHover();
    pressed=stack;gsap.to(stack,{x:0,y:0,rotation:0,scale:.97,duration:enabled()?.09:0,ease:'power2.out',overwrite:true});
  });
  document.addEventListener('pointerup',releasePress);
  document.addEventListener('pointercancel',releasePress);
  // iOS Safari applies :active (the press feedback in cosmic.css) only while a touch listener exists.
  document.addEventListener('touchstart',()=>{},{passive:true});
  reduced.addEventListener('change',()=>{
    releaseHover();
    if(reduced.matches)document.querySelectorAll('.marker-halo').forEach(node=>node.getAnimations().forEach(animation=>animation.cancel()));
    for(const tween of window.gsap?.globalTimeline.getChildren()||[])tween.progress(1);
  });
  // `reduced`: the player asked for less motion (travel gives way to fades); `busy`: a reveal or dismiss is running.
  return {enabled,reduced:()=>reduced.matches,busy:node=>panels.has(node),reveal,dismiss,expand,selected,enter};
})();
