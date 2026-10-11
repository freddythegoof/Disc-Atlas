// Plan 16: the main Atlas draws its discs as their 3D models seen from straight above (public/disc3d/
// atlas-art.mjs, glued in by public/atlas-map.js). In a real browser with a GPU:
// - Each render reads as a disc, not a blob: round, its flight plate at its palette colour, its rim a ring
//   that shades darker than the plate all the way round and catches the light on the upper-left side, and
//   an overmold's rim in its own colour from the measured rim width out. Every rated overmold is checked.
// - Levels of detail: one geometry per shape and level, shared; full, mid and low models by size.
// - On the map (desktop and phone, dark and light, 1x and 9x): every curated disc and dot carries its full
//   render, every small disc and mini on the canvas its level's render; nothing waits for one.
// - Nothing else moves: every disc's spot and size and every name's box match the 2D build's
//   (window.ATLAS_3D_OFF) exactly.
// - Clicking discs opens their detail panel with its own 3D viewer; filters, brand views and themes repaint
//   the renders in the new colours; a machine without usable WebGL keeps the 2D orbs.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-3d-browser.mjs   (shots: outputs/atlas-3d/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir='outputs/atlas-3d';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
// A real GPU: software WebGL keeps the orbs by design (atlas-art.mjs).
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const checks=[],errors=[];
const check=label=>{checks.push(label);console.log('ok -',label);};
const VIEWPORTS={desktop:{width:1440,height:900},phone:{width:390,height:844}};

async function open(viewport,{flat=false,noWebGL=false}={}){
 const context=await browser.newContext({viewport:VIEWPORTS[viewport],deviceScaleFactor:viewport==='phone'?2:1});
 if(flat)await context.addInitScript(()=>{window.ATLAS_3D_OFF=true;});
 if(noWebGL)await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){return /webgl/.test(type)?null:get.call(this,type,...rest);};});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 // The suite's own pixel reads draw a willReadFrequently hint; it isn't the page's.
 page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text())&&!(noWebGL&&/creating WebGL context/.test(m.text()))||m.type()==='warning'&&!noWebGL&&!/willReadFrequently/.test(m.text()))errors.push(m.type()+': '+m.text());});
 await page.goto(base);
 if(viewport==='phone')await page.locator('#mapTab').click();
 await page.waitForFunction(()=>filtered.length>0&&mapClusters.length>0&&mapArt.state!=='loading');
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
// Settled as the depth suite settles, and every disc on screen has its render (none pending, none fading).
async function settled(page){
 await page.waitForFunction(()=>!cameraTween&&groupCache&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&
  !document.querySelector('#mapMarkers').classList.contains('is-regrouping')&&!document.querySelector('.marker-position.is-retiring,.marker-position.is-new'));
 await page.waitForTimeout(450);
 await page.evaluate(()=>draw());
 await page.waitForFunction(()=>mapGaps.every(g=>g.on&&g.art===1&&g.rest&&g.strength===(g.named?AtlasGroups.gapLabelAlpha(zoom,g.tier):0))&&mapArt.pending===0&&
  mapGaps.every(g=>!g.drawn||mapArt.state!=='ready'||g.three===1)&&!document.querySelector('.disc-art-3d.is-arriving'));
 await page.waitForTimeout(250);
}
async function show(page,{zoom:z=1,at=[.55,.5],theme='midnight',filter}={}){
 await page.mouse.move(1,1);
 await page.evaluate(([z,at,theme,only])=>{
  document.querySelector(`[data-theme-choice="${theme}"]`).click();
  selected=null;closeDetail(false);document.querySelector('#search').value='';selectedBrands.clear();selectedTypes.clear();
  if(only?.type)selectedTypes.add(only.type);
  if(only?.brands)for(const b of only.brands)selectedBrands.add(b);
  zoom=1;pan={x:0,y:0};filter();
  if(z!==1){const {width:w,height:h}=mapViewport,target=boundedCamera(zoomDestination(z,{x:w*at[0],y:h*at[1]}));zoom=target.zoom;pan={x:target.x,y:target.y};}
  draw();
 },[z,at,theme,filter||null]);
 await settled(page);
}
// Every disc on the map: curated discs and dots (DOM) with their art box, name box and render; small
// discs and minis (canvas) with their spot, size and render's level of detail.
const SCENE=()=>{
 const map=canvas.getBoundingClientRect(),rect=n=>{const r=n.getBoundingClientRect();return {x:+(r.left-map.left).toFixed(2),y:+(r.top-map.top).toFixed(2),w:+r.width.toFixed(2),h:+r.height.toFixed(2)};};
 const live=new Set(mapClusters.map(g=>g.key));
 const marks=[...document.querySelectorAll('#mapMarkers .marker-position')].filter(p=>live.has(p.firstChild.dataset.cluster)).map(p=>{
  const node=p.firstChild,art=node.querySelector('.disc-art'),c=art.querySelector('.disc-art-3d'),name=node.querySelector('.marker-name');
  return {key:node.dataset.cluster,large:node.classList.contains('is-large'),transform:p.style.transform,art:rect(art),
   name:getComputedStyle(name).visibility==='hidden'?null:rect(name),has3d:art.classList.contains('has-3d'),canvas:c?{px:c.width,inArt:c.parentNode===art}:null};
 }).sort((a,b)=>a.key<b.key?-1:1);
 const gaps=mapGaps.filter(g=>g.drawn).map(g=>({key:g.id+'|'+g.tier,tier:g.tier,x:+g.x.toFixed(2),y:+g.y.toFixed(2),size:+g.size.toFixed(3),lod:g.lod,want:mapArt.lods?.(g.size)||null,three:g.three,
  box:g.box&&g.strength>0?{x:+g.box.x.toFixed(2),y:+g.box.y.toFixed(2)}:null})).sort((a,b)=>a.key<b.key?-1:1);
 return {zoom,marks,gaps};
};
const layout=view=>({zoom:view.zoom,marks:view.marks.map(({key,large,transform,art,name})=>({key,large,transform,art,name})),gaps:view.gaps.map(({key,tier,x,y,size,box})=>({key,tier,x,y,size,box}))});

try{
 // 1. The renders themselves, from the module, on a board of archetypes and every rated overmold.
 {
  const page=await open('desktop');
  assert.equal(await page.evaluate(()=>mapArt.state),'ready','the atlas has its 3D renderer on a GPU');
  const result=await page.evaluate(async()=>{
   document.documentElement.dataset.theme='light'; // This render check measures the light theme's black default rim.
   const {createAtlasArt,LODS,lodFor}=await import('/disc3d/atlas-art.mjs');
   const {isOvermold}=await import('/disc3d/overmold.mjs');
   const art=await createAtlasArt({dpr:2});
   const rated=discs.filter(d=>d.speed!=null);
   const by=n=>rated.find(d=>(d.catalogName||d.name).toLowerCase()===n);
   const archetypes=['aviar','luna','judge','buzzz','roc3','zone','leopard','teebird','firebird','sidewinder','destroyer','wraith','zeus','tern'].map(by).filter(Boolean);
   const overmolds=rated.filter(d=>isOvermold({manufacturer:d.manufacturer,record:d.name}));
   const rgb=hex=>{const v=parseInt(hex.slice(1),16);return [(v>>16)&255,(v>>8)&255,v&255];};
   const lum=c=>.299*c[0]+.587*c[1]+.114*c[2];
   const hue=([r,g,b])=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;const h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return h*60;};
   // Ring average of the render at a share of its radius, and the mean of an arc (degrees, screen space, 0 = right, 90 = down).
   const sample=(e,f,from=0,to=360)=>{
    const px=e.px,data=e.canvas.getContext('2d').getImageData(0,0,px,px).data,R=e.fill*px/2,out=[0,0,0,0];let n=0;
    for(let a=from;a<to;a+=3){const t=a*Math.PI/180,x=Math.round(px/2-.5+Math.cos(t)*f*R),y=Math.round(px/2-.5+Math.sin(t)*f*R),k=(y*px+x)*4;for(let i=0;i<4;i++)out[i]+=data[k+i];n++;}
    return out.map(v=>v/n);
   };
   const report=d=>{
    const color=colors[typeOf(d)],e=art.render(d,color,94),s=art.debug.shapeOf(d),R=s.shape.diameter/2;
    const plate=sample(e,.25),edge=[.86,.9,.94,.97].map(f=>lum(sample(e,f))),lit=lum(sample(e,.95,195,255)),shade=lum(sample(e,.95,15,75));
    const out={name:(d.catalogName||d.name)+' · '+d.brand,color,px:e.px,lod:e.lod,overmold:s.overmold,plate:plate.slice(0,3).map(Math.round),plateAlpha:plate[3],
     tokenLum:lum(rgb(color)),plateLum:lum(plate),hueShift:Math.abs(((hue(plate)-hue(rgb(color))+540)%360)-180),ringMin:Math.min(...edge),lit,shade,
     outside:sample(e,1+1.2/(e.fill*e.px))[3],inside:sample(e,.99)[3]};
    if(s.overmold){const seam=(R-s.shape.rimWidth)/R;out.seam=seam;out.rim=lum(sample(e,(seam+1)/2));out.inner=lum(sample(e,seam-.08));}
    return out;
   };
   const rows=[...archetypes,...overmolds].map(report);
   // Levels of detail: the thresholds, each level's own image size, and one geometry per shape and level.
   const d=archetypes[0],sizes={low:12,mid:51,full:94};
   const lods=Object.fromEntries(Object.entries(sizes).map(([lod,size])=>{const e=art.render(d,'#ce8a00',size);return [lod,{px:e.px,lod:e.lod,picked:lodFor(size)}];}));
   const before=art.stats.geometries;for(const color of ['#ff0000','#00ff00'])art.render(d,color,94);
   const sharedGeometry=art.stats.geometries===before;
   const segments=Object.fromEntries(Object.entries(LODS).map(([k,v])=>[k,v.segments]));
   // The review board: every overmold and archetype at the three sizes, on the dark and light map.
   const list=[...archetypes,...overmolds.slice(0,24)],cell=104,cols=list.length>19?19:list.length,rowsN=Math.ceil(list.length/cols);
   const board=document.createElement('canvas');board.width=cols*cell*2;board.height=rowsN*cell*2*2;const g=board.getContext('2d');g.scale(2,2);
   [['#0b1016',0],['#f4f1ea',rowsN*cell]].forEach(([bg,y0])=>{g.fillStyle=bg;g.fillRect(0,y0,cols*cell,rowsN*cell);
    document.documentElement.dataset.theme=y0===0?'midnight':'light';
    list.forEach((d,i)=>{const cx=(i%cols)*cell+cell/2,cy=y0+Math.floor(i/cols)*cell+cell/2,color=colors[typeOf(d)];
     for(const [size,dx,dy] of [[76,-8,-6],[40,30,30],[12,-38,38]]){const e=art.render(d,color,size),s=size/e.fill;g.drawImage(e.canvas,cx+dx-s/2,cy+dy-s/2,s,s);}});});
   art.dispose();
   return {rows,lods,sharedGeometry,segments,board:board.toDataURL(),overmolds:overmolds.length};
  });
  fs.writeFileSync(path.join(dir,'renders.png'),Buffer.from(result.board.split(',')[1],'base64'));
  for(const r of result.rows){
   assert.ok(r.inside===255&&r.outside<64,`${r.name}: the render is a round, solid disc (alpha ${r.inside} inside, ${r.outside} past the edge)`);
   assert.ok(r.plateLum>=r.tokenLum*.82&&r.plateLum<=r.tokenLum*1.12,`${r.name}: the plate draws at ${r.plateLum.toFixed(0)} luminance against its palette ${r.tokenLum.toFixed(0)} (${r.plate})`);
   assert.ok(r.hueShift<10,`${r.name}: the plate keeps its palette hue (off by ${r.hueShift.toFixed(1)}°)`);
   if(r.overmold){
    assert.ok(r.rim<35,`${r.name}: the overmold rim draws dark (${r.rim.toFixed(0)}) beyond the seam at ${r.seam.toFixed(3)} R`);
    assert.ok(r.inner>r.tokenLum*.75,`${r.name}: inside the seam the plate keeps its colour (${r.inner.toFixed(0)})`);
   }else{
    assert.ok(r.ringMin<=r.plateLum*.9,`${r.name}: the rim shades into a ring (${r.ringMin.toFixed(0)} against the plate's ${r.plateLum.toFixed(0)})`);
    assert.ok(r.lit>r.shade+6,`${r.name}: the rim catches the light upper left (${r.lit.toFixed(0)}) over lower right (${r.shade.toFixed(0)})`);
   }
  }
  assert.ok(result.overmolds>=80,`every rated overmold is checked (${result.overmolds})`);
  check(`renders read as discs: ${result.rows.length} molds (${result.overmolds} overmolds) are round and solid, their plates at their palette colour and hue, plain rims shaded into a ring lit upper left, overmold rims dark from the measured seam out`);
  assert.deepEqual(Object.fromEntries(Object.entries(result.lods).map(([k,v])=>[k,v.lod])),{low:'low',mid:'mid',full:'full'},'each size picks its level');
  assert.ok(result.lods.low.px<result.lods.mid.px&&result.lods.mid.px<result.lods.full.px,'each level renders at its own resolution');
  assert.ok(result.segments.low<result.segments.mid&&result.segments.mid<result.segments.full,'lower levels have fewer segments');
  assert.ok(result.sharedGeometry,'a recolour reuses the shape\'s geometry');
  check(`levels of detail: minis ${result.segments.low} segments at ${result.lods.low.px}px, small discs ${result.segments.mid} at ${result.lods.mid.px}px, curated discs ${result.segments.full} at ${result.lods.full.px}px; one geometry per shape and level, shared across colours`);
  await page.context().close();
 }

 // 2. On the map: all three tiers carry their renders, and nothing else moves against the 2D build.
 // An Axiom filter is a complete view (every match shows): its leads are curated discs or dots.
 const CAMERAS={far:{zoom:1},mid:{zoom:3},max:{zoom:9},axiom:{zoom:1,filter:{brands:['Axiom']}},'axiom-max':{zoom:9,filter:{brands:['Axiom']}}};
 for(const viewport of Object.keys(VIEWPORTS)){
  const page=await open(viewport),flat=await open(viewport,{flat:true});
  assert.equal(await flat.evaluate(()=>mapArt.state),'off','ATLAS_3D_OFF keeps the orbs');
  const tiers={curated:0,dot:0,small:0,mini:0};
  for(const theme of ['midnight','light'])for(const [name,camera] of Object.entries(CAMERAS)){
   const label=`${viewport} ${theme} ${name}`;
   await show(page,{...camera,theme});await show(flat,{...camera,theme});
   const view=await page.evaluate(SCENE),plain=await flat.evaluate(SCENE);
   assert.deepEqual(layout(view),layout(plain),`${label}: every disc, its size and its name sit exactly where the 2D build puts them`);
   for(const m of view.marks){
    assert.ok(m.has3d&&m.canvas?.inArt,`${label}: ${m.key} carries its render`);
    assert.equal(m.canvas.px,Math.ceil(96*(viewport==='phone'?2:1)),`${label}: ${m.key} uses the full model`);
    tiers[m.large?'curated':'dot']++;
   }
   for(const g of view.gaps){
    assert.ok(g.lod===g.want&&g.three===1,`${label}: ${g.key} (${g.size}px) draws its ${g.want} render, not ${g.lod}`);
    tiers[g.tier]++;
   }
   for(const m of plain.marks)assert.ok(!m.has3d&&!m.canvas,`${label}: the 2D build draws orbs`);
   if(name==='far'&&viewport==='desktop'){
    assert.ok(view.gaps.some(g=>g.tier==='small'&&g.lod==='mid')&&view.gaps.some(g=>g.tier==='mini'&&g.lod==='low'),`${label}: small discs use the mid model, minis the low`);
   }
   await page.locator('#map').screenshot({path:path.join(dir,`${viewport}-${theme}-${name}.png`)});
   if(theme==='midnight')await flat.locator('#map').screenshot({path:path.join(dir,`${viewport}-${theme}-${name}-2d.png`)});
  }
  // A phone never holds all 32 Axiom discs at once, so only the desktop view is complete.
  assert.ok(tiers.curated>0&&tiers.mini>0&&(viewport==="phone"||tiers.dot>0),`${viewport}: curated discs, dots and minis were seen (${JSON.stringify(tiers)})`);
  check(`${viewport}: at 1x, 3x and 9x and in a complete Axiom view at 1x and 9x, in dark and light, ${tiers.curated} curated discs and ${tiers.dot} dots carry full renders and ${tiers.small} small discs and ${tiers.mini} minis their level's render, with every disc, size and name exactly where the 2D build puts them`);

  // Hover still lifts the art, render included.
  await show(page,{zoom:1});
  const hover=await page.evaluate(()=>{const g=mapClusters.find(g=>g.large);return {key:g.key,x:g.x+mapViewport.left,y:g.y+mapViewport.top};});
  if(viewport==='desktop'){
   const size=()=>page.evaluate(key=>document.querySelector(`[data-cluster="${key}"] .disc-art-3d`).getBoundingClientRect().width,hover.key);
   const rest=await size();await page.mouse.move(hover.x,hover.y);await page.waitForTimeout(400);const lifted=await size();
   await page.mouse.move(1,1);await page.waitForTimeout(700);
   assert.ok(Math.abs(lifted/rest-1.06)<.01&&Math.abs(await size()-rest)<.01,`${viewport}: hover lifts the render 6% (${(lifted/rest).toFixed(3)}) and returns it`);
   check(`${viewport}: hover lifts a curated disc's render 6% and returns it`);
  }

  // Clicking discs opens their detail panel, with its 3D viewer.
  // A group of two or three opens the stack chooser instead (unchanged), so the targets are the rest.
  const targets=await page.evaluate(()=>mapClusters.filter(g=>g.members.length===1||g.members.length>3).slice(0,4).map(g=>({id:g.key,name:g.lead.catalogName||g.lead.name})));
  assert.ok(targets.length>=2,`${viewport}: discs to click (${targets.length})`);
  for(const t of targets){
   await page.evaluate(()=>{selected=null;closeDetail(false);});await show(page,{zoom:1});
   const at=await page.evaluate(id=>{const g=mapClusters.find(g=>g.key===id);return g&&{x:g.x+mapViewport.left,y:g.y+mapViewport.top};},t.id);
   assert.ok(at,`${viewport}: ${t.name} is on the map`);
   await page.mouse.click(at.x,at.y);
   await page.waitForFunction(id=>selected?.id===id&&!document.querySelector('#detail').hidden,t.id,{timeout:5000});
   await page.waitForFunction(()=>document.querySelector('#detail [data-disc3d] .disc3d-stage')?.dataset.state==='ready',null,{timeout:15000});
  }
  check(`${viewport}: clicking ${targets.map(t=>t.name).join(', ')} opens each one's detail panel with its 3D viewer`);
  await page.evaluate(()=>{selected=null;closeDetail(false);});

  // Filters: a type filter and a brand view repaint every render in its new colour.
  for(const [label,filter] of [['putters',{type:'putter'}],['brand view',{brands:['Innova','Discraft']}]]){
   await show(page,{zoom:1,filter});
   const res=await page.evaluate(()=>{
    const marks=[...document.querySelectorAll('#mapMarkers .marker-position')].map(p=>p.firstChild).filter(n=>mapClusters.some(g=>g.key===n.dataset.cluster));
    const rgb=c=>{const v=parseInt(c.slice(1),16);return [(v>>16)&255,(v>>8)&255,v&255];};
    return {count:filtered.filter(d=>d.speed!=null).length,marks:marks.map(n=>{
     const g=mapClusters.find(g=>g.key===n.dataset.cluster),c=n.querySelector('.disc-art-3d');if(!c)return {name:g.lead.name,missing:true};
     const px=c.width,k=((px>>1)*px+(px>>2))*4,p=c.getContext('2d').getImageData(0,0,px,px).data.slice(k,k+3),want=rgb(discColor(g.lead));
     return {name:g.lead.name,type:typeOf(g.lead),brand:g.lead.brand,off:Math.max(...[0,1,2].map(i=>Math.abs(p[i]-want[i]*.88)))};
    }),gaps:mapGaps.filter(g=>g.drawn).map(g=>({type:typeOf(g.d),brand:g.d.brand,lod:g.lod}))};
   });
   assert.ok(res.marks.length>0&&res.marks.every(m=>!m.missing),`${viewport} ${label}: every disc has its render`);
   if(filter.type)assert.ok([...res.marks,...res.gaps].every(m=>m.type==='putter'),`${viewport} ${label}: only putters show`);
   if(filter.brands)assert.ok([...res.marks,...res.gaps].every(m=>filter.brands.includes(m.brand)),`${viewport} ${label}: only the chosen brands show`);
   for(const m of res.marks)assert.ok(m.off<60,`${viewport} ${label}: ${m.name} renders in its ${label} colour (off by ${m.off})`);
   await page.locator('#map').screenshot({path:path.join(dir,`${viewport}-filter-${label.replace(' ','-')}.png`)});
  }
  check(`${viewport}: a putter filter and an Innova + Discraft brand view show only their discs, every render repainted in the view's colours`);
  await page.context().close();await flat.context().close();
 }

 // 3. No usable WebGL: the atlas keeps its orbs and works as before.
 {
  const page=await open('desktop',{noWebGL:true});
  await show(page,{zoom:1});
  const res=await page.evaluate(()=>({state:mapArt.state,with3d:document.querySelectorAll('#mapMarkers .has-3d,#mapMarkers .disc-art-3d').length,markers:mapClusters.length,gaps:mapGaps.filter(g=>g.drawn&&g.lod).length}));
  assert.ok(res.state==='failed'&&res.with3d===0&&res.gaps===0&&res.markers>0,`without WebGL the orbs stay (${JSON.stringify(res)})`);
  check('without WebGL the atlas keeps its 2D orbs');
  await page.context().close();
 }

 assert.deepEqual(errors,[],'no page errors or console warnings');
 console.log(`\n${checks.length} checks passed. Screenshots: ${dir}/`);
}finally{await browser.close();server.close();}
