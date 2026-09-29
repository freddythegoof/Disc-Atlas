(() => {
 const wrap=document.getElementById('stabilityHelp'),button=document.getElementById('stabilityHelpButton'),content=document.getElementById('stabilityHelpContent');
 let pinned=false,suppressed=false;
 const show=value=>{content.hidden=!value;button.setAttribute('aria-expanded',String(value));};
 wrap.addEventListener('pointerenter',e=>{suppressed=false;if(e.pointerType!=='touch')show(true);});
 wrap.addEventListener('pointerleave',()=>{if(!pinned&&!wrap.contains(document.activeElement))show(false);});
 button.addEventListener('focus',()=>{if(!suppressed)show(true);});
 wrap.addEventListener('focusout',e=>{if(!pinned&&!wrap.contains(e.relatedTarget))show(false);});
 button.addEventListener('click',()=>{pinned=!pinned;suppressed=!pinned;show(pinned);});
 document.addEventListener('click',e=>{if(!wrap.contains(e.target)){pinned=false;show(false);}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;suppressed=true;show(false);}});
})();
