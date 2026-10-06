import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// My Map: a personal flight map on the My Bag page. Only bagged discs, each at its consensus
// position shifted by the player's stability notes, drawn by the atlas's own map. Signed in only;
// the shared atlas keeps its positions, filters and camera.
const config='tests/auth.wrangler.jsonc',state='work/my-map/d1-qa',base='https://localhost:8805',dir='outputs/my-map';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8805','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const errors=[],shots=[],checks=[],metrics={};
const check=label=>{checks.push(label);console.log('ok -',label);};
// Destroyer: two copies, both More stable (one mold, +10). Firebird: Less stable (−10). The rest carry no note.
const BAG=[['3d60892b6812','#ed7868','more_stable'],['3d60892b6812','#f0a35e','more_stable'],['e70f48273d7f','#70b7cd','less_stable'],['da3c28085382','#a7c68c',null],
 ['0fcd1f2937b1','#b99bdd',null],['e9a88cc4f3b1','#e6c668',null],['ba675aed468a','#d9a3c3',null],['df3915bf7676','#79b3a8',null],['ff4bf9e7743c','#e2d8c1',null],['761c90d342f5','#f29b6b',null]];
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const setTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
 const shot=async(name,target=page)=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);await target.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 const mapReady=async()=>{await page.waitForFunction(()=>!cameraTween && groupCache?.items===filtered && !document.querySelector('#mapMarkers').classList.contains('is-regrouping') && !retirementTimer && !retirementFrame);await page.waitForTimeout(300);};
 const panel=page.locator('#myMapPanel'),views=page.locator('#myBagViews');

 // 1. Signed out: My Bag shows its sign-in teaser; there is no My Map switch or map.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current && discs.length>0);
 await page.locator('#myBagSignIn').waitFor();
 assert.ok(await views.isHidden(),'No view switch signed out');assert.ok(await panel.isHidden(),'No My Map signed out');
 assert.equal(await page.evaluate(()=>myMap),null,'The atlas map is not in personal mode');
 assert.equal(await page.evaluate(()=>document.querySelector('#mapWrap').closest('#myBagView')),null,'The map stays on the atlas');
 await shot('signed-out-1440-light');
 check('Signed out: sign-in teaser, no My Map switch, the map stays on the atlas');

 // 2. Signed in, empty bag: My Map explains itself and offers the Directory; no map is docked.
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 await page.waitForFunction(()=>discs.length>0);
 assert.ok(await views.isVisible(),'Signed in, the view switch appears');
 await page.getByRole('radio',{name:'My map'}).click();
 await page.locator('#myMapEmpty').waitFor();
 assert.equal(await page.locator('#myMapEmptyTitle').textContent(),'Your map is empty.');
 assert.ok(await page.locator('#myMapHost').isHidden() && await page.locator('#bagScene').isHidden(),'Empty: no map, no bag scene');
 assert.equal(await page.evaluate(()=>myMap),null,'Empty: the map is not taken over');
 await shot('empty-1440-light');
 await page.setViewportSize({width:360,height:800});await shot('empty-360-light');await page.setViewportSize({width:1440,height:1000});
 check('Signed in, empty bag: empty state with a Directory link, no map docked');

 // 3. Seed a bag: ten bagged copies (nine molds), a stored disc, and an unrated bagged mold.
 const extras=await page.evaluate(ids=>({stored:discs.find(d=>d.speed!=null && !ids.includes(d.id) && isCurrentOrRecent(d)).id,unrated:discs.find(d=>d.speed==null && !ids.includes(d.id)).id}),BAG.map(b=>b[0]));
 const rows=[...BAG.map(([mold_id,color,stability_bias])=>({mold_id,plastic:'Champion',wear:7,weight_g:171,color,pocket:'main',stability_bias})),
  {mold_id:extras.stored,plastic:'Champion',wear:7,weight_g:171,color:'#ff00ff',pocket:'main',in_bag:false},
  {mold_id:extras.unrated,plastic:'Champion',wear:7,weight_g:171,color:'#00ffff',pocket:'main'}];
 await page.evaluate(async rows=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
  for(const disc of rows){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());}
 },rows);

 // 4. Populated: only bagged rated molds, at consensus ± the notes; speed untouched.
 await page.reload();await page.waitForFunction(()=>discs.length>0 && window.BagApp.mapColors().size>0);
 await page.getByRole('radio',{name:'My map'}).click();
 await page.waitForFunction(()=>myMap && document.querySelector('#mapWrap').closest('#myMapHost'));await mapReady();
 const molds=[...new Set(BAG.map(b=>b[0]))];
 const plotted=await page.evaluate(()=>({ids:filtered.map(d=>d.id).sort(),markers:document.querySelectorAll('#mapMarkers .atlas-marker').length,
  members:groupCache.groups.flatMap(g=>g.members.map(m=>m.id)).sort(),immersive:!document.body.classList.contains('my-bag-mode'),
  shift:Object.fromEntries([...myMap.shifts]),dx:Object.fromEntries([...atlasPositions].map(([id,p])=>[id,[p.x-sharedPositions.get(id).x,p.y-sharedPositions.get(id).y]]))}));
 metrics.populated=plotted;
 assert.deepEqual(plotted.ids,[...molds].sort(),'Only bagged, rated molds are on My Map (no Storage, no unrated)');
 assert.deepEqual(plotted.members,[...molds].sort(),'Every one of them is in a map group');
 assert.ok(plotted.markers>=1 && !plotted.immersive,'Markers draw in the docked, non-immersive frame');
 assert.equal(plotted.shift['3d60892b6812'],10,'Two More stable copies: +10');assert.equal(plotted.shift['e70f48273d7f'],-10,'Less stable: −10');
 for(const id of molds){
  const [dx,dy]=plotted.dx[id],want=(plotted.shift[id]||0)/100;
  assert.ok(Math.abs(dx-want)<1e-9,`${id} moves ${want} on the stability axis (got ${dx})`);assert.equal(dy,0,`${id} keeps its speed`);
 }
 assert.match(await page.locator('#myMapSummary').textContent(),/9 discs · 2 moved by your stability notes/);
 assert.match(await page.locator('#myMapNote').textContent(),/1 disc in your bag has no flight ratings yet/);
 assert.ok(await page.locator('#bagScene').isHidden() && await page.locator('#myBagContents').isHidden(),'The bag scene and list step aside');
 await shot('populated-1440-light');await shot('populated-map-1440-light',page.locator('#myMapPanel'));
 check('Populated: only bagged rated molds, consensus ± stability notes (speed unchanged), summary and unrated note');

 // 5. Details: a disc picked on My Map opens the docked panel with its personal position.
 const destroyer=await page.evaluate(()=>{const g=mapClusters.find(g=>g.members.some(m=>m.id==='3d60892b6812'));return g.key==='3d60892b6812' && g.members.length===1;});
 assert.ok(destroyer,'The Destroyer has its own marker on My Map');
 await page.locator('#mapMarkers .atlas-marker[data-cluster="3d60892b6812"]').click();
 await page.locator('#myBagView #detail .bag-detail-personal').waitFor();
 const facts=await page.locator('#detail .bag-detail-facts').textContent();
 const index=await page.evaluate(()=>score(discs.find(d=>d.id==='3d60892b6812')));
 assert.ok(facts.includes(`Stability ${Math.min(100,index+10)} · consensus ${index}`),'Details show the personal and consensus index: '+facts);
 await shot('detail-1440-light');
 await page.locator('#closeDetail').click();
 check('Details: docked on My Bag, with the copy, its note and its personal stability');

 // 6. A note edited on the bag moves the disc on My Map.
 await page.evaluate(async()=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
  const data=await (await fetch('/api/bag',{cache:'no-store'})).json(),copy=data.discs.find(i=>i.mold_id==='da3c28085382');
  const r=await fetch('/api/bag/discs/'+copy.id,{method:'PATCH',headers,body:JSON.stringify({stability_bias:'more_stable'})});if(!r.ok)throw Error(await r.text());
 });
 await page.getByRole('radio',{name:'Bag'}).click();await page.reload();await page.waitForFunction(()=>discs.length>0 && window.BagApp.mapColors().size>0);
 await page.getByRole('radio',{name:'My map'}).click();await page.waitForFunction(()=>myMap?.shifts.get('da3c28085382')===10);await mapReady();
 assert.match(await page.locator('#myMapSummary').textContent(),/3 moved/);
 check('A saved stability note moves its disc on My Map');

 // 7. Themes and phone width.
 await page.evaluate(()=>{zoom=1;pan={x:0,y:0};draw();});await mapReady();
 await setTheme('midnight');await mapReady();await shot('populated-1440-midnight',page.locator('#myMapPanel'));
 await page.setViewportSize({width:360,height:800});await page.evaluate(()=>{measureMap();draw();});await mapReady();
 await page.locator('#myMapPanel').scrollIntoViewIfNeeded();await shot('populated-360-midnight');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll at 360');
 assert.ok(await page.evaluate(()=>{const r=document.querySelector('.my-map-axis span:last-child').getBoundingClientRect();return r.right<=innerWidth-2;}),'The axis caption fits at 360');
 await setTheme('light');await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{measureMap();draw();});await mapReady();
 check('Populated in Midnight at 1440 and 360');

 // 8. Back to Bag, then the shared atlas: the map returns home with shared positions and the full catalog.
 await page.getByRole('radio',{name:'Bag'}).click();
 assert.equal(await page.evaluate(()=>myMap),null,'Bag view: personal mode off');
 assert.ok(await page.locator('#bagScene').isVisible(),'The bag scene is back');
 // Leave straight from My Map: the header tab must undock it too.
 await page.getByRole('radio',{name:'My map'}).click();await page.waitForFunction(()=>myMap);
 await page.locator('#mapTab').click();await page.waitForFunction(()=>view==='map' && document.body.dataset.view==='map');await mapReady();
 const shared=await page.evaluate(()=>({home:!!document.querySelector('#mapWrap').closest('#atlasMain'),same:atlasPositions===sharedPositions,count:filtered.length,
  immersive:!document.body.classList.contains('my-bag-mode'),consensus:[...atlasPositions].every(([id,p])=>{const d=discs.find(x=>x.id===id);return Math.abs(p.x-window.AtlasLayout.positions([d]).get(id).x)<1e-12;})}));
 metrics.shared=shared;
 assert.ok(shared.home && shared.same && shared.immersive && shared.consensus,'The atlas is untouched: '+JSON.stringify(shared));
 assert.ok(shared.count>molds.length*20,'The atlas shows the catalog, not just the bag');
 check('Leaving: the neutral atlas has its map, consensus positions, full catalog and immersive frame back');

 // 9. Deep return: My Bag remembers My Map, and the map docks again.
 await page.locator('#bagTab').click();await page.waitForFunction(()=>myMap && document.querySelector('#mapWrap').closest('#myMapHost'));
 assert.equal(await page.locator('[data-bag-view="map"]').getAttribute('aria-checked'),'true');await mapReady();
 assert.deepEqual(await page.evaluate(()=>filtered.map(d=>d.id).sort()),[...molds].sort(),'A painted atlas hands over cleanly to My Map');
 await page.locator('#mapTab').click();await page.waitForFunction(()=>!myMap && view==='map');await mapReady();
 assert.ok(await page.evaluate(()=>atlasPositions===sharedPositions && filtered.length>200),'And back again');
 check('Returning to My Bag reopens My Map; atlas ⇄ My Map hand-offs repeat cleanly');

 assert.deepEqual(errors,[],'No page errors');
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,metrics,shots},null,1));
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>My Map</title><style>body{font:14px system-ui;margin:24px;background:#f4f5f7}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:720px;max-height:640px;border:1px solid #ccd;display:block}</style><h1>My Map</h1>${shots.map(s=>`<figure><img src="${s}.png" alt="${s}"><figcaption>${s}</figcaption></figure>`).join('')}`);
 console.log(`PASS my map: ${checks.length} checks, ${shots.length} screenshots in ${dir}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
