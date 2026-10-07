import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Oct 5 tweaks: a fuller 1x map with larger discs, the signed-in player's bag on the atlas,
// putters that stow and come back out, hover glow, one-click details, one bag size and zoom.
const config='tests/auth.wrangler.jsonc',state='work/bag-tweaks/d1-qa',base='https://localhost:8804',dir='outputs/bag-3d/tweaks';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8804','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const errors=[],shots=[],checks=[],metrics={};
const check=label=>{checks.push(label);console.log('ok -',label);};
// Grip BX3 as carried (same as the interactions suite): Järn go-to, four putters, eighteen main discs.
const GOTO={mold_id:'ad2bfd8d9d50',plastic:'K1',wear:8,weight_g:174,color:'#4fa3d9',pocket:'goto'};
const PUTTERS=[['ff4bf9e7743c','Luna','#e2d8c1'],['761c90d342f5','Envy','#e6c668'],['3200f16f97df','Pure','#f29b6b'],['3ea9734a60f7','Aviar','#a7c6e8']];
const MAIN=[['3d60892b6812','#ed7868'],['3d60892b6812','#f0a35e'],['e70f48273d7f','#70b7cd'],['da3c28085382','#a7c68c'],['0fcd1f2937b1','#b99bdd'],['e9a88cc4f3b1','#e6c668'],['ba675aed468a','#d9a3c3'],['df3915bf7676','#79b3a8'],['35dae588c670','#f2d7a0'],['6be51219c6db','#8fb3e8'],['f6267498c9d2','#c99070'],['7446eb39abe5','#e8e3d3'],['7446eb39abe5','#9fd6c4'],['5f22688f2ee3','#f08fa8'],['850e9dc7104d','#c5b3f0'],['f5fb00eb9fa5','#b9d27e'],['8769ec70b5ad','#7fc4e0'],['b0b50b6a4551','#e9b44c']];
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const setTheme=async theme=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const shot=async(name,target=page)=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);await target.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 const mapReady=async()=>{await page.waitForFunction(()=>typeof cameraTween!=='undefined' && !cameraTween && groupCache?.items===filtered && !document.querySelector('#mapMarkers').classList.contains('is-regrouping') && !retirementTimer && !retirementFrame);await page.waitForTimeout(300);};
 const overview=async()=>{await page.evaluate(()=>{closeDetail(false);selected=null;zoom=1;pan={x:0,y:0};draw();});await mapReady();};
 // Marker footprints at 1x, in canvas pixels, with the chrome they must stay clear of.
 const coverage=()=>page.evaluate(()=>{
  const c=canvas.getBoundingClientRect(),rect=s=>document.querySelector(s).getBoundingClientRect();
  const arts=[...document.querySelectorAll('#mapMarkers .atlas-marker')].filter(n=>n.checkVisibility()).map(n=>n.querySelector(n.classList.contains('is-large')?'.disc-art':'.map-dot').getBoundingClientRect());
  const large=[...document.querySelectorAll('#mapMarkers .atlas-marker.is-large .disc-art')].map(n=>n.offsetWidth),legend=rect('.map-toolbar');
  const overlaps=arts.filter(r=>r.left<legend.right && r.right>legend.left && r.top<legend.bottom && r.bottom>legend.top).length;
  return {width:c.width,height:c.height,left:Math.min(...arts.map(r=>r.left))-c.left,right:c.right-Math.max(...arts.map(r=>r.right)),top:Math.min(...arts.map(r=>r.top))-rect('.explore-tools').bottom,
   bottom:legend.top-Math.max(...arts.map(r=>r.bottom)),overlaps,large:large.length,largeSize:Math.max(...large),groups:mapClusters.length};
 });

 // 1. Signed out: the 1x map fills the frame with larger disc art.
 await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await mapReady();
 await shot('map-landing-1440-light');
 await overview();
 const wide=await coverage();metrics.map1440=wide;
 assert.equal(Math.round(wide.largeSize),68,'Large disc art is 68px (was 62)');
 assert.ok(wide.left<70 && wide.right<70,'Discs reach close to both sides at 1440: '+JSON.stringify(wide));
 assert.ok(wide.top<40,'Discs start just under the search bar at 1440: '+JSON.stringify(wide));
 assert.ok(wide.bottom<90 && wide.overlaps===0,'Discs reach down toward the axis legend without covering it: '+JSON.stringify(wide));
 assert.ok(wide.large>=36,'The 1x view still names its leads: '+wide.large);
 await shot('map-1x-1440-light');
 await setTheme('midnight');await mapReady();await shot('map-1x-1440-midnight');
 await page.setViewportSize({width:360,height:800});await page.evaluate(()=>{measureMap();});await overview();
 const narrow=await coverage();metrics.map360=narrow;
 assert.ok(narrow.left<50 && narrow.right<50 && narrow.top<60 && narrow.bottom<120 && narrow.overlaps===0,'Phone 1x map fills its frame: '+JSON.stringify(narrow));
 await shot('map-1x-360-midnight');
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{measureMap();});await setTheme('light');
 assert.ok(await page.locator('#atlasLens').isHidden(),'Signed out: no bag lens');
 assert.ok(await page.locator('#siteMenu [data-map-choice="mine"]').evaluate(n=>!!n.closest('[hidden]')),'Signed out: no Default map setting');
 check(`1x map: 68px disc art; discs within ${Math.round(wide.left)}/${Math.round(wide.right)}px of the sides, ${Math.round(wide.top)}px under the search bar, ${Math.round(wide.bottom)}px above the legend at 1440 (${wide.large} named leads); phone ${Math.round(narrow.left)}/${Math.round(narrow.right)}/${Math.round(narrow.top)}/${Math.round(narrow.bottom)}px`);

 // 2. Sign in and seed the bag.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 await page.waitForFunction(()=>discs.length>0);
 const rows=[{...GOTO},...PUTTERS.map(([mold_id,,color])=>({mold_id,plastic:'Base',wear:7,weight_g:173,color,pocket:'putter'})),
  ...MAIN.map(([mold_id,color])=>({mold_id,plastic:'Champion',wear:7,weight_g:171,color,pocket:'main'})),
  // A stored disc is not in the bag, so the atlas keeps its usual color.
  {mold_id:await page.evaluate(ids=>discs.find(d=>d.speed!=null && !ids.includes(d.id) && isCurrentOrRecent(d)).id,[GOTO.mold_id,...PUTTERS.map(p=>p[0]),...MAIN.map(m=>m[0])]),plastic:'Champion',wear:7,weight_g:171,color:'#ff00ff',pocket:'main',in_bag:false}];
 const seeded=await page.evaluate(async rows=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},out=[];
  const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
  for(const disc of rows){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());out.push((await r.json()).disc);}
  return out;
 },rows);
 const mains=seeded.slice(5,23),stored=seeded[23];
 await page.reload();await page.waitForFunction(()=>discs.length>0 && window.BagApp.mapColors().size>0);
 // First copy wins: the Destroyer (two copies) wears the first one's color.
 const want=new Map();for(const d of seeded.slice(0,23))if(!want.has(d.mold_id))want.set(d.mold_id,d.color);

 // 3. The atlas is the player's own: bag discs in their bag colors, leading their groups.
 await page.locator('#mapTab').click();await page.waitForFunction(()=>document.body.dataset.view==='map');
 await page.locator('#atlasLens').waitFor();await page.waitForFunction(n=>window.BagApp.mapColors().size===n,want.size);await overview();
 assert.equal(await page.locator('#lensButton').textContent().then(t=>t.trim()),'Personalized','Signed in, the atlas opens on Personalized');assert.equal(await page.evaluate(()=>activeLens()),'mine');
 const lens=await page.evaluate(want=>{
  const bag=new Map(want),rated=[...bag.keys()].filter(id=>discs.find(d=>d.id===id)?.speed!=null);
  return {rated:rated.length,
   // Every rated bag disc is on the map: it leads its group, or shares one led by another bag disc.
   placed:rated.filter(id=>groupCache.groups.some(g=>g.members.some(m=>m.id===id) && bag.has(g.key))).length,
   painted:[...document.querySelectorAll('#mapMarkers .atlas-marker.is-mine')].map(n=>[n.dataset.cluster,n.style.getPropertyValue('--disc-color')]).filter(([key,color])=>bag.get(key)!==color),
   mine:document.querySelectorAll('#mapMarkers .atlas-marker.is-mine').length,
   legend:!!document.querySelector('#legend .dot.mine'),detailColor:(select(discs.find(d=>d.id==='3d60892b6812')),document.querySelector('#detail .detail-art').style.getPropertyValue('--disc-color'))};
 },[...want]);
 metrics.lens=lens;
 assert.equal(lens.placed,lens.rated,'Every rated bag disc leads or shares a bag-led group: '+JSON.stringify(lens));
 assert.deepEqual(lens.painted,[],'Bag markers wear their bag colors');assert.ok(lens.mine>=8,'Bag markers are marked: '+lens.mine);
 assert.ok(lens.legend,'The legend names the bag ring');assert.equal(lens.detailColor,'#ed7868','The details art uses the bag color');
 assert.equal(await page.evaluate(id=>myColor(discs.find(d=>d.id===id)),stored.mold_id),undefined,'A Storage disc keeps the atlas color');
 await page.evaluate(()=>closeDetail(false));await overview();await shot('map-mine-1x-1440-light');
 await page.evaluate(()=>{const d=discs.find(d=>d.id==='3d60892b6812'),c=AtlasLayout.camera(atlasPositions.get(d.id),canvas.clientWidth,canvas.clientHeight,2.8);zoom=c.zoom;pan={x:c.x,y:c.y};draw();});await mapReady();
 await shot('map-mine-2.8x-1440-light');
 // The map dropdown: Standard, Personalized, My Bag. Its button names the map on screen.
 const lensButton=page.locator('#lensButton'),lensMenu=page.locator('#lensMenu'),label=async()=>(await lensButton.textContent()).trim();
 const visit=async()=>{await page.reload();await page.locator('#atlasLens').waitFor();await page.waitForFunction(()=>window.BagApp.mapColors().size>0);await mapReady();};
 const chooseMap=async name=>{await lensButton.click();await lensMenu.getByRole('menuitemradio',{name,exact:true}).click();await mapReady();};
 const setDefaultMap=async name=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.locator('#siteMenu').getByRole('menuitemradio',{name,exact:true}).click();await page.keyboard.press('Escape');await mapReady();};
 await lensButton.click();
 assert.ok(await lensMenu.isVisible(),'The map button opens its menu');
 assert.deepEqual(await lensMenu.getByRole('menuitemradio').evaluateAll(list=>list.map(n=>[n.textContent.trim(),n.dataset.lens])),[['Standard','default'],['Personalized','mine'],['My Bag','only']],'Three maps, in order');
 assert.equal(await lensMenu.locator('[aria-checked="true"]').getAttribute('data-lens'),'mine','The menu marks the map on screen');
 assert.ok(await lensMenu.locator('[aria-checked="true"]').evaluate(n=>n===document.activeElement),'Focus starts on the current map');
 await page.keyboard.press('Escape');
 assert.ok(await lensMenu.isHidden() && await lensButton.evaluate(n=>n===document.activeElement),'Escape closes and returns focus');
 // My Bag.
 await chooseMap('My Bag');
 assert.ok(await lensMenu.isHidden(),'Choosing closes the menu');assert.equal(await label(),'My Bag');
 const only=await page.evaluate(()=>({filtered:filtered.length,all:filtered.every(d=>window.BagApp.mapColors().has(d.id)),zoom}));
 assert.ok(only.all && only.filtered===want.size && only.zoom===1,'My Bag, framed at 1x: '+JSON.stringify(only));
 await shot('map-only-1x-1440-light');
 // Directory always browses the catalog, independently of the map's My Bag lens.
 for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  await page.setViewportSize(viewport);await page.locator('#listTab').click();
  assert.ok(await page.locator('#atlasLens').isHidden(),`${name}: Directory has no map lens option`);
  assert.ok(await lensMenu.isHidden(),`${name}: Directory has no open map menu`);
  assert.ok(await page.evaluate(()=>filtered.length>window.BagApp.mapColors().size && filtered.every(inCollection)),`${name}: Directory uses the catalog collection`);
  await page.locator('#search').fill('zzzz-no-matching-disc');
  assert.equal((await page.locator('#rows').innerText()).trim(),'No discs match these filters.',`${name}: Directory empty state describes catalog filters`);
  await page.locator('#search').fill('');await shot(`directory-${name}`);
  await page.locator('#mapTab').click();
  assert.equal(await label(),'My Bag',`${name}: returning to the map preserves its lens`);
  assert.ok(await page.evaluate(()=>filtered.length===window.BagApp.mapColors().size && filtered.every(d=>window.BagApp.mapColors().has(d.id))),`${name}: My Bag still shows only bagged molds`);
 }
 await page.setViewportSize({width:1440,height:1000});
 // Standard: the shared atlas.
 await chooseMap('Standard');assert.equal(await label(),'Standard');
 assert.equal(await page.locator('#mapMarkers .atlas-marker.is-mine').count(),0,'Standard has no bag colors');
 assert.equal(await page.locator('#legend .dot.mine').count(),0);
 await overview();await shot('map-default-1x-1440-light');
 // Keyboard: ArrowDown opens on the current map, arrows move, Enter chooses and returns focus.
 await lensButton.focus();await page.keyboard.press('ArrowDown');
 assert.ok(await lensMenu.isVisible(),'ArrowDown opens the menu');
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await mapReady();
 assert.equal(await page.evaluate(()=>activeLens()),'mine','Arrow keys and Enter choose');
 assert.ok(await lensMenu.isHidden() && await lensButton.evaluate(n=>n===document.activeElement),'Focus returns to the button');
 // A switch lasts for the visit: the next visit opens on the default map.
 await chooseMap('My Bag');await visit();
 assert.equal(await page.evaluate(()=>activeLens()),'mine','A new visit opens on the default map (Personalized)');
 // Settings, Default map: the pick shows now and opens every visit.
 await setDefaultMap('Standard');
 assert.equal(await page.evaluate(()=>activeLens()),'default','The setting applies now');assert.equal(await label(),'Standard');
 await visit();assert.equal(await page.evaluate(()=>activeLens()),'default','The setting opens every visit');
 await page.getByRole('button',{name:'Site menu',exact:true}).click();
 assert.equal(await page.locator('#siteMenu [data-map-choice][aria-checked="true"]').getAttribute('data-map-choice'),'default','The menu marks the default map');
 await page.keyboard.press('Escape');
 // A choice saved by the old three-way switch becomes the default map.
 await page.evaluate(()=>{localStorage.clear();localStorage.setItem('atlas-lens','only');});await visit();
 assert.equal(await page.evaluate(()=>activeLens()),'only','A saved Only my discs opens as My Bag');
 await setDefaultMap('Personalized');assert.equal(await page.evaluate(()=>activeLens()),'mine');
 await setTheme('midnight');await chooseMap('My Bag');await shot('map-only-1x-1440-midnight');
 await chooseMap('Personalized');await overview();await shot('map-mine-1x-1440-midnight');
 await page.setViewportSize({width:360,height:800});await page.evaluate(()=>measureMap());await overview();
 const bar=await page.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect();return {tools:r('.explore-tools'),lens:r('#atlasLens'),search:r('.explore-tools .search')};});
 assert.ok(bar.lens.right<=bar.tools.right+1 && Math.abs(bar.lens.top-bar.search.top)<2 && bar.search.width>=90,'Phone: the map button shares the search row: '+JSON.stringify(bar));
 await lensButton.click();const menuBox=await lensMenu.boundingBox();
 assert.ok(menuBox.x>=0 && menuBox.x+menuBox.width<=360.5,'Phone: the map menu stays on screen: '+JSON.stringify(menuBox));
 await shot('map-menu-360-midnight');await page.keyboard.press('Escape');
 await shot('map-mine-1x-360-midnight');
 await page.setViewportSize({width:1440,height:1000});await setTheme('light');
 check(`Bag on the atlas: ${lens.rated} rated bag molds all lead (or share) a bag-led group in their bag colors, ringed, with a legend entry; map dropdown Standard / Personalized / My Bag (My Bag shows ${only.filtered}); keyboard; a switch lasts the visit; Default map setting applies now and every visit; old saved switch migrates; fits the phone search row`);

 // 4. My Bag: one size (no S/M/L), a little larger than the old Medium.
 await page.locator('#bagTab').click();
 const scene=page.locator('#bagScene'),canvasBox=page.locator('[data-bag-canvas]');
 const phase=want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.phase===w,want);
 const viewer=(fn,arg)=>canvasBox.evaluate((n,[source,value])=>new Function('v','arg',`return (${source})(v,arg)`)(n.bagViewer,value),[fn.toString(),arg]);
 const settled=()=>page.waitForFunction(()=>{const v=document.querySelector('[data-bag-canvas]').bagViewer;return v && v.puttersSettled;});
 await phase('open');await settled();await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 assert.equal(await page.locator('input[name="bagSize"],.bag-size-control').count(),0,'No size options');
 const size=await canvasBox.evaluate(n=>n.clientWidth);metrics.bagWidth=size;
 assert.ok(size>560 && size<880 && size===680,'Default bag width is 680px at 1440×1000: '+size);
 check(`One bag size: ${size}px (former M 560, L 880); no size control`);

 // 5. Putters stow when the bag closes and come back out, front first, into their aligned row.
 const putterState=()=>viewer(v=>v.getBagLayoutState().filter(d=>d.pocket==='putter' && !d.empty).sort((a,b)=>a.order-b.order).map(d=>({id:d.id,y:d.pose[1],rest:d.position[1],z:d.pose[2]})));
 const out=await putterState();
 assert.ok(out.every(p=>Math.abs(p.y-p.rest)<1e-6),'Open: putters stand in their row');
 const steps=out.slice(1).map((p,i)=>+(p.y-out[i].y).toFixed(4));assert.ok(steps.every(s=>s===.016),'Open: aligned, each 16 mm higher: '+steps);
 await shot('bag-open-putters-out-1440-light',scene);
 await page.locator('[data-bag-toggle]').click();await phase('closed');await settled();
 await shot('bag-closed-putters-stowed-1440-light',scene);
 const stowed=await putterState();
 assert.ok(stowed.every(p=>Math.abs(p.y-stowed[0].y)<1e-6 && p.y<p.rest-.07),'Closed: putters sink to one height inside the pocket: '+JSON.stringify(stowed));
 const rims=await page.locator('#bagScene [data-pocket="putter"] [data-physical-disc]').evaluateAll(nodes=>nodes.map(n=>n.parentNode.getBoundingClientRect().height));
 assert.ok(rims.every(h=>h>0 && h<22),'Closed: only the rims show (hit targets follow): '+rims);
 assert.equal(await viewer(v=>v.puttersOut),false);
 // Sample until settled: a fixed frame count can truncate the rise on high-refresh displays.
 await canvasBox.evaluate(n=>{const s=n.riseSamples=[];n.samplingRise=true;const tick=()=>{s.push(n.bagViewer.getBagLayoutState().filter(d=>d.pocket==='putter' && !d.empty).sort((a,b)=>a.order-b.order).map(d=>d.pose[1]));if(n.samplingRise)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 await page.locator('[data-bag-toggle]').click();
 await page.waitForTimeout(260);await shot('bag-opening-putters-rising-1440-light',scene);
 await phase('open');await settled();
 const rise=await canvasBox.evaluate(n=>{n.samplingRise=false;return n.riseSamples;}),start=rise[0];
 const firstMove=out.map((_,i)=>rise.findIndex(frame=>frame[i]>start[i]+1e-4));
 assert.ok(firstMove.every((f,i)=>f>=0 && (i===0 || f>=firstMove[i-1])),'Front putter rises first: '+firstMove);
 assert.ok(out.some((p,i)=>Math.max(...rise.map(f=>f[i]))>p.rest+.001),'They spring into the row');
 assert.deepEqual((await putterState()).map(p=>+p.y.toFixed(5)),out.map(p=>+p.rest.toFixed(5)),'Back in the aligned row');
 metrics.putterRiseStartFrames=firstMove;
 check(`Putters: closing the bag sinks them to one height (rims ${rims.map(Math.round).join('/')}px tall); opening raises them front first (start frames ${firstMove.join(', ')}) into the same aligned 16 mm row`);

 // 6. Hover lights the disc up, one at a time.
 const driver=mains[0],driverSlot=page.locator(`[data-physical-disc="${driver.id}"]`);
 const glows=()=>viewer(v=>Object.fromEntries(v.getBagLayoutState().filter(d=>!d.empty).map(d=>[d.id,d.glow])));
 assert.ok(Object.values(await glows()).every(g=>g===0),'At rest nothing glows');
 await driverSlot.hover();await page.waitForTimeout(300);
 const lit=await glows();assert.ok(lit[driver.id]>.3,'The hovered disc lights up: '+lit[driver.id]);
 assert.ok(Object.entries(lit).every(([id,g])=>id===driver.id || g===0),'Only that disc');
 await shot('bag-hover-glow-main-1440-light',scene);
 // A back putter shows only its rim above the ones in front: point there, as a person would.
 const back=out.at(-1).id,rim=await page.locator(`[data-physical-disc="${back}"]`).boundingBox();
 await page.mouse.move(rim.x+rim.width/2,rim.y+3);await page.waitForTimeout(300);
 const lit2=await glows();assert.ok(lit2[back]>.3 && lit2[driver.id]===0 && Object.values(lit2).filter(g=>g>0).length===1,'Moving to a putter moves the light');
 await shot('bag-hover-glow-putter-1440-light',scene);
 // The hover lingers a moment (so the pointer can reach the disc's name and its popup), then fades.
 await page.mouse.move(0,0);await page.waitForTimeout(600);
 assert.ok(Object.values(await glows()).every(g=>g===0),'Pointer gone: nothing glows');
 await driverSlot.focus();await page.waitForTimeout(250);assert.ok((await glows())[driver.id]>.3,'Keyboard focus lights it too');
 await page.locator('[data-bag-toggle]').focus();await page.waitForTimeout(250);
 check('Hover or focus lights only that disc in its own color; it goes out when the pointer or focus leaves');

 // 7. One click slides the disc out (Oct 7: no details); its name's popup opens the details.
 const detail=page.locator('#detail'),openDetails=async id=>{await page.locator(`[data-out-name="${id}"][data-shown]`).click();await page.locator('.bag-disc-popup:not([hidden])').click();await detail.waitFor({state:'visible'});};
 await driverSlot.click();
 await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.staging==='still' && document.querySelector('#bagScene').dataset.out);
 assert.equal(await detail.isVisible(),false,'A disc click opens no details');
 await openDetails(driver.id);assert.equal(await detail.locator('h2').first().innerText(),'Destroyer','The popup opens its details');
 assert.ok(await detail.evaluate(n=>n.contains(document.activeElement)),'Focus moves into the details');
 await shot('bag-click-slide-and-details-1440-light');
 // Escape closes the details; the disc stays out until it is clicked again.
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
 assert.deepEqual(await page.evaluate(()=>document.querySelector('[data-bag-canvas]').bagViewer.outDiscs),[driver.id],'Escape leaves it out');
 await driverSlot.click();await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.length);
 // Keyboard: Enter slides it out; Tab reaches its popup and Enter there opens the details; the next Enter on the disc puts it back.
 await driverSlot.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.staging==='still' && document.querySelector('#bagScene').dataset.out);
 assert.equal(await detail.isVisible(),false);
 await driverSlot.blur();await driverSlot.focus();await page.keyboard.press('Tab');await page.keyboard.press('Enter');await detail.waitFor({state:'visible'});
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
 await driverSlot.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.length);
 const front=out[0].id,frontName=PUTTERS.find(p=>p[0]===seeded.find(d=>d.id===front).mold_id)[1];
 await page.locator(`[data-physical-disc="${front}"]`).click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.staging==='still' && document.querySelector('#bagScene').dataset.out);
 await openDetails(front);assert.equal(await detail.locator('h2').first().innerText(),frontName,'A putter opens its details from its popup too');
 await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.staging==='still' && document.querySelector('#bagScene').dataset.out);await shot('bag-click-putter-details-1440-light');
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
 await page.locator(`[data-physical-disc="${front}"]`).click();await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.length);
 check('One click (or Enter) slides the disc out without details; the popup on its name (Tab, by keyboard) opens them; Escape closes the details and the disc stays out until clicked (or Entered) again');

 // 8. Top view is removed; the putter pocket control remains available.
 assert.equal(await page.getByRole('button',{name:'Top view',exact:true}).count(),0);
 assert.equal(await page.locator('#bagScene [data-bag-pocket]').isEnabled(),true);

 // 9. Zoom: buttons, Ctrl + scroll at the pointer, reset.
 const zoomIn=scene.getByRole('button',{name:'Zoom in'}),zoomOut=scene.getByRole('button',{name:'Zoom out'}),reset=scene.getByRole('button',{name:/^Reset zoom/});
 const anchor=()=>viewer(v=>v.discRects().filter(r=>r.pocket==='putter' && !r.empty).map(r=>[r.left+r.width/2,r.top+r.height/2])[0]);
 const was=await anchor();
 assert.ok(await zoomOut.isDisabled() && await reset.isDisabled(),'At 100% there is nothing to zoom out to');
 const before=await driverSlot.evaluate(n=>n.parentNode.getBoundingClientRect().height);
 await zoomIn.click();await page.waitForTimeout(400);
 assert.equal(+(await viewer(v=>v.zoom)).toFixed(2),1.4,'One step is 140%');
 assert.equal((await reset.innerText()).trim(),'140%');
 const after=await driverSlot.evaluate(n=>n.parentNode.getBoundingClientRect().height);
 assert.ok(Math.abs(after/before-1.4)<.05,'Hit targets zoom with the bag: '+before+' → '+after);
 await shot('bag-zoom-140-1440-light',scene);
 const cbox=await canvasBox.boundingBox(),at={x:cbox.x+cbox.width*.5,y:cbox.y+cbox.height*.2};
 await page.mouse.move(at.x,at.y);await page.keyboard.down('Control');await page.mouse.wheel(0,-100);await page.keyboard.up('Control');await page.waitForTimeout(200);
 const z2=await viewer(v=>v.zoom);assert.ok(z2>3*.9,'Ctrl + scroll zooms in: '+z2);
 const scrolled=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,40);await page.waitForTimeout(200);
 assert.ok(await page.evaluate(()=>scrollY)>scrolled,'A plain scroll still scrolls the page');
 assert.equal(await viewer(v=>v.zoom),z2,'and does not zoom');
 await page.mouse.wheel(0,-40);await page.waitForTimeout(200);await scene.scrollIntoViewIfNeeded();
 await shot('bag-zoom-ctrl-scroll-1440-light',scene);
 assert.ok(await zoomIn.isDisabled(),'Zoom stops at 300%');
 await reset.click();await page.waitForTimeout(400);assert.equal(await viewer(v=>v.zoom),1,'Reset');
 assert.ok(Math.abs((await anchor())[0]-was[0])<1,'Back to the full frame');
 check(`Zoom: + / − / reset buttons (140% steps, 100–300%); Ctrl + scroll zooms at the pointer; a plain scroll still scrolls the page; hit targets scale with the bag`);

 // 10. Phone: the same bag, zoom controls and stowed putters at 360px.
 await page.setViewportSize({width:360,height:800});await scene.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 await shot('bag-open-360-light',scene);
 await page.locator('[data-bag-toggle]').click();await phase('closed');await settled();await shot('bag-closed-360-light',scene);
 await page.locator('[data-bag-toggle]').click();await phase('open');await settled();
 await zoomIn.click();await page.waitForTimeout(400);await shot('bag-zoom-360-light',scene);
 await reset.click();
 await setTheme('charcoal');await page.waitForTimeout(300);await shot('bag-open-360-charcoal',scene);
 check('Phone: open, stowed and zoomed bag at 360px');

 assert.deepEqual(errors,[],'No page errors');
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,metrics,shots},null,1));
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Oct 5 tweaks</title><style>body{font:14px system-ui;margin:24px;background:#f4f5f7}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:720px;max-height:640px;border:1px solid #ccd;display:block}figcaption{margin-top:6px}</style><h1>Oct 5 tweaks</h1><ul>${checks.map(c=>`<li>${c}</li>`).join('')}</ul>${shots.map(s=>`<figure><img src="${s}.png" alt="${s}"><figcaption>${s}</figcaption></figure>`).join('')}`);
 console.log(`PASS bag tweaks: ${checks.length} checks, ${shots.length} screenshots in ${dir}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
