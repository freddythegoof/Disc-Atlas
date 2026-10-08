// The main Atlas's background depth dots in a real browser (public/atlas-depth.js). The dots sit
// behind every disc. No dot touches a disc or a disc's name: not at 1x, not on the landing camera,
// not at mid zoom, not at the 9x maximum. They read on all three themes, they stay quieter than any
// name, and zooming flies through them: nearer shells drift outward faster, and every shell drifts
// slower than the discs. Desktop and phone. My Map draws none.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-depth-browser.mjs   (shots: outputs/atlas-depth/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir='outputs/atlas-depth';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const checks=[],errors=[];
const check=label=>{checks.push(label);console.log('ok -',label);};
const VIEWPORTS={desktop:{width:1440,height:900},phone:{width:390,height:844}};
const THEMES=['midnight','charcoal','light'];

async function open(viewport){
 const context=await browser.newContext({viewport:VIEWPORTS[viewport]});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.goto(base);
 if(viewport==='phone')await page.locator('#mapTab').click();
 await page.waitForFunction(()=>filtered.length>0&&mapClusters.length>0);
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
const settled=async page=>{
 await page.waitForFunction(()=>!cameraTween&&groupCache&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&
  !document.querySelector('#mapMarkers').classList.contains('is-regrouping')&&!document.querySelector('.marker-position.is-retiring,.marker-position.is-new'));
 await page.waitForTimeout(450);
};
// Cameras: zoomed out (1x), the landing camera (Destroyer selected, as the page opens), mid zoom and
// the 9x maximum, each about a point of the map (fractions of its width and height).
const CAMERAS={
 out:{zoom:1},
 landing:{landing:true},
 mid:{zoom:3,at:[.55,.5]},
 max:{zoom:9,at:[.55,.5]},
 'max-edge':{zoom:9,at:[.2,.75]},
 'max-landing':{landing:true,zoom:9},
};
async function show(page,camera,theme){
 await page.mouse.move(1,1);
 await page.evaluate(([camera,theme])=>{
  document.querySelector(`[data-theme-choice="${theme}"]`).click();
  selected=null;closeDetail(false);document.querySelector('#search').value='';selectedBrands.clear();type='all';
  zoom=1;pan={x:0,y:0};filter();
  if(camera.landing)focusFeatured();
  if(camera.zoom&&camera.zoom!==1){
   const {width:w,height:h}=mapViewport,at=camera.at?{x:w*camera.at[0],y:h*camera.at[1]}:{x:w/2,y:h/2};
   const target=boundedCamera(zoomDestination(camera.zoom,at));zoom=target.zoom;pan={x:target.x,y:target.y};
  }
  draw();
 },[camera,theme]);
 await settled(page);
 await page.evaluate(()=>draw());
}
// What is on screen, in map pixels: the dots, each marker's art circle, and every name a viewer can
// see (shown names) or reveal by hovering (a dot's name).
const scene=page=>page.evaluate(()=>{
 const map=canvas.getBoundingClientRect(),rect=n=>{const r=n.getBoundingClientRect();return {x:r.left-map.left,y:r.top-map.top,w:r.width,h:r.height};};
 const marks=[...document.querySelectorAll('#mapMarkers .marker-position')].filter(p=>getComputedStyle(p).opacity!=='0').map(p=>{
  const node=p.querySelector('.atlas-marker'),large=node.classList.contains('is-large'),art=rect(node.querySelector(large?'.disc-art':'.map-dot'));
  const name=node.querySelector('.marker-name'),style=getComputedStyle(name);
  return {name:name.firstChild.textContent,large,art:{x:art.x+art.w/2,y:art.y+art.h/2,r:Math.max(art.w,art.h)/2},
   label:rect(name),shown:style.visibility!=='hidden'&&style.opacity!=='0'&&style.display!=='none'};
 });
 return {zoom,map:{w:map.width,h:map.height},dots:depthDots.map(d=>({...d})),marks};
});
const hits=(dot,box)=>{const x=Math.max(box.x,Math.min(dot.x,box.x+box.w)),y=Math.max(box.y,Math.min(dot.y,box.y+box.h));return Math.hypot(dot.x-x,dot.y-y)<dot.r;};
function verify(view,label){
 const {dots,marks}=view;
 assert.ok(marks.length,`${label}: discs show`);
 assert.ok(dots.length,`${label}: depth dots show`);
 const per=dots.length/(view.map.w*view.map.h)*1e5;
 assert.ok(per<=12,`${label}: ${dots.length} dots is clutter (${per.toFixed(1)} per 1e5 px)`);
 let names=0;
 for(const m of marks){
  if(m.shown)names++;
  for(const d of dots){
   assert.ok(!hits(d,m.label),`${label}: a depth dot at ${d.x.toFixed(1)},${d.y.toFixed(1)} sits on ${m.name}'s name${m.shown?'':' (shown on hover)'}`);
   assert.ok(Math.hypot(d.x-m.art.x,d.y-m.art.y)>=m.art.r+d.r,`${label}: a depth dot sits on ${m.name}'s disc`);
  }
 }
 assert.ok(names,`${label}: names show`);
 return names;
}
// WCAG relative luminance and contrast for #rrggbb[aa] colors.
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const luminance=c=>c.map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const [x,y]=[luminance(a),luminance(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
const over=(top,alpha,bottom)=>top.map((v,i)=>Math.round(v*alpha+bottom[i]*(1-alpha)));

try{
 for(const viewport of Object.keys(VIEWPORTS)){
  const page=await open(viewport),counts={};
  for(const theme of THEMES)for(const [name,camera] of Object.entries(CAMERAS)){
   await show(page,camera,theme);
   const view=await scene(page),label=`${viewport} ${name} ${theme} (${view.zoom.toFixed(1)}x)`;
   const names=verify(view,label);
   counts[name]=`${view.dots.length} dots, ${names} names`;
   // The same camera draws the same field.
   const again=await page.evaluate(()=>{draw();return depthDots.map(d=>({...d}));});
   assert.deepEqual(again,view.dots,`${label}: the field is deterministic`);
   await page.screenshot({path:`${dir}/${viewport}-${name}-${theme}.png`});
  }
  console.log(`  ${viewport}: ${Object.entries(counts).map(([k,v])=>k+' '+v).join('; ')}`);
  check(`${viewport}: no depth dot touches a disc or its name at 1x, landing, mid or 9x, in three themes; the field is sparse and deterministic`);

  // Visible but quiet, on every theme: the strongest dot stands off the map, and every name
  // stands off far more. The canvas really paints it.
  for(const theme of THEMES){
   await show(page,CAMERAS.out,theme);
   const tokens=await page.evaluate(()=>{const css=getComputedStyle(document.documentElement),t=n=>css.getPropertyValue('--'+n).trim();return {dot:t('depth-dot'),bg:t('map-bg'),text:t('text'),muted:t('muted')};});
   const dot=rgb(tokens.dot),alpha=parseInt(tokens.dot.slice(7,9)||'ff',16)/255,bg=rgb(tokens.bg);
   // Even the brightest speck (full alpha) stays at most 5:1 and at most a third of a name's contrast.
   const strongest=contrast(over(dot,alpha,bg),bg),name=contrast(rgb(tokens.text),bg);
   assert.ok(strongest>=2.5,`${viewport} ${theme}: the brightest depth dot is lost (contrast ${strongest.toFixed(2)})`);
   assert.ok(strongest<=5&&strongest<=name/3,`${viewport} ${theme}: depth dots (${strongest.toFixed(2)}) compete with names (${name.toFixed(2)})`);
   const painted=await page.evaluate(()=>{
    const d=[...depthDots].sort((a,b)=>b.alpha*b.r-a.alpha*a.r)[0],dpr=canvas.width/mapViewport.width;
    const at=(x,y)=>[...ctx.getImageData(Math.round(x*dpr),Math.round(y*dpr),1,1).data];
    return {dot:at(d.x,d.y),beside:at(d.x+d.r+4,d.y)};
   });
   assert.ok(painted.dot[3]>painted.beside[3]+20,`${viewport} ${theme}: the canvas paints the dot (${painted.dot} vs ${painted.beside})`);
   console.log(`  ${viewport} ${theme}: brightest dot contrast ${strongest.toFixed(2)}, names ${name.toFixed(2)}`);
  }
  check(`${viewport}: dots read on all three themes and stay quieter than any name`);

  // Depth: zoom in about the center. The dots spread outward slower than the discs, and nearer
  // shells spread faster than farther ones; panning moves every dot less than the discs.
  {
   await show(page,{zoom:2,at:[.5,.5]},'midnight');
   const zoomTo=async factor=>page.evaluate(factor=>{
    const {width:w,height:h}=mapViewport,t=boundedCamera(zoomDestination(zoom*factor,{x:w/2,y:h/2}));zoom=t.zoom;pan={x:t.x,y:t.y};draw();
    return {zoom,pan,center:{x:w/2,y:h/2},dots:depthDots.map(d=>({...d})),discs:mapClusters.map(g=>({key:g.key,x:g.actualX,y:g.actualY}))};
   },factor);
   const a=await zoomTo(1),b=await zoomTo(1.25),rates=new Map();
   const keyed=new Map(b.dots.map(d=>[d.key,d]));
   for(const d of a.dots){const e=keyed.get(d.key),r0=Math.hypot(d.x-a.center.x,d.y-a.center.y);if(!e||r0<30)continue;
    const rate=Math.hypot(e.x-b.center.x,e.y-b.center.y)/r0;
    assert.ok(rate>1&&rate<b.zoom/a.zoom,`${viewport}: dot ${d.key} spreads ${rate.toFixed(3)}x as the discs spread ${(b.zoom/a.zoom).toFixed(3)}x`);
    (rates.get(d.shell)||rates.set(d.shell,[]).get(d.shell)).push(rate);
   }
   const mean=[...rates].sort((x,y)=>x[0]-y[0]).map(([shell,list])=>[shell,list.reduce((s,v)=>s+v,0)/list.length]);
   assert.ok(mean.length>=3,`${viewport}: only ${mean.length} shells on screen`);
   for(let i=1;i<mean.length;i++)assert.ok(mean[i][1]<mean[i-1][1],`${viewport}: shell ${mean[i][0]} spreads as fast as nearer shell ${mean[i-1][0]}`);
   const pan=await page.evaluate(()=>{
    const before=new Map(depthDots.map(d=>[d.key,d.x]));pan={x:pan.x+50,y:pan.y};draw();
    return depthDots.filter(d=>before.has(d.key)).map(d=>d.x-before.get(d.key));
   });
   assert.ok(pan.length&&pan.every(dx=>dx>0&&dx<50),`${viewport}: a 50px pan moves dots ${Math.min(...pan).toFixed(1)}–${Math.max(...pan).toFixed(1)}px, under the discs' 50px`);
   console.log(`  ${viewport}: 1.25x zoom spreads shells ${mean.map(([s,r])=>s+':'+r.toFixed(3)).join(' ')}; a 50px pan moves dots ${Math.min(...pan).toFixed(1)}–${Math.max(...pan).toFixed(1)}px`);
  }
  check(`${viewport}: zooming flies through the field: nearer shells spread faster, every shell slower than the discs`);
  await page.context().close();
 }
 assert.deepEqual(errors,[],'page errors');
 console.log(`\n${checks.length} checks passed. Screenshots: ${dir}/`);
}finally{await browser.close();server.close();}
