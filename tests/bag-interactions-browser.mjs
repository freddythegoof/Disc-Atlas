import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-interactions/d1-qa',base='https://localhost:8803',dir='outputs/bag-interactions';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8803','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],shots=[],checks=[],metrics={};
const check=label=>checks.push(label);
const inside=(rect,box,label)=>assert.ok(rect.left>=-1 && rect.top>=-1 && rect.left+rect.width<=box.width+1 && rect.top+rect.height<=box.height+1,`${label} stays inside the canvas: ${JSON.stringify({rect,box})}`);
const overlap=(a,b)=>a.left<b.left+b.width && b.left<a.left+a.width && a.top<b.top+b.height && b.top<a.top+a.height;
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
 const navigations=[];page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations.push(frame.url());});
 const phase=want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.phase===w,want);
 const camera=want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.camera===w,want);
 const viewer=(fn,arg)=>page.locator('[data-bag-canvas]').evaluate((n,[source,value])=>new Function('v','arg',`return (${source})(v,arg)`)(n.bagViewer,value),[fn.toString(),arg]);
 const canvasBox=()=>page.locator('[data-bag-canvas]').evaluate(n=>({width:n.clientWidth,height:n.clientHeight}));
 const local=locator=>locator.evaluate(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};});
 const setTheme=async theme=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const settle=()=>page.waitForTimeout(650);
 const shot=async(state,width,theme,target)=>{
  await page.evaluate(()=>document.fonts.ready);await settle();
  const name=`${state}-${width}-${theme}.png`;await target.screenshot({path:`${dir}/${name}`});shots.push({state,width,theme,name});
 };
 const scene=page.locator('#bagScene'),card=page.locator('[data-bag-slide-out]'),detail=page.locator('#detail');
 const onBagPage=async label=>{
  assert.equal(await page.evaluate(()=>location.pathname+location.search),'/?bag=1',`${label}: URL stays on My Bag`);
  assert.ok(await page.locator('#myBagView').isVisible(),`${label}: My Bag stays visible`);
  assert.equal(await page.evaluate(()=>document.body.dataset.view),'bag',`${label}: no switch to the Directory`);
 };

 // 1. Sign in and seed a bag with discs in all three pockets, plus an unrated mold.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 await page.waitForFunction(()=>discs.length>0);
 const unrated=await page.evaluate(()=>discs.find(d=>d.speed==null && isCurrentOrRecent(d))?.id || discs.find(d=>d.speed==null).id);
 const seeded=await page.evaluate(async unrated=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},rows=[];
  const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
  for(const disc of [
   {mold_id:'3d60892b6812',plastic:'Champion',wear:9,weight_g:172,color:'#70b7cd',pocket:'goto',notes:'Tee shot on 1'},
   {mold_id:'3d60892b6812',plastic:'Star',wear:4,weight_g:170,color:'#ed7868',stability_bias:'less_stable',notes:'Flips up to flat on a hyzer. Keep for tailwind holes.'},
   {mold_id:'35dae588c670',plastic:'Neutron',wear:7,weight_g:175,color:'#a7c68c'},
   {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:180,color:'#b99bdd'},
   {mold_id:'761c90d342f5',plastic:'Electron',wear:6,weight_g:175,color:'#e6c668',pocket:'putter',notes:'Circle 1 only'},
   {mold_id:'ff4bf9e7743c',plastic:'Putter Line Hard',wear:10,weight_g:174,color:'#e2d8c1',pocket:'putter'},
   {mold_id:unrated,plastic:'Other',wear:10,weight_g:170,color:'#d9a3c3'}
  ]){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());rows.push((await r.json()).disc);}
  return rows;
 },unrated);
 const [goto,driver,,,putter,,odd]=seeded;
 await page.reload();await phase('open');await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 navigations.length=0;

 // 2. Slide-out: one click pulls the disc out with only its name, and nothing navigates.
 const driverSlot=page.locator(`[data-physical-disc="${driver.id}"]`);
 await driverSlot.click();await settle();
 await onBagPage('Slide-out');
 assert.equal(await viewer(v=>v.slidDisc),driver.id,'The clicked 3D disc slides out');
 assert.equal(await scene.getAttribute('data-slide'),'out');
 assert.ok(await card.isVisible(),'The slid-out disc gets a target');
 assert.equal((await card.innerText()).trim(),'Destroyer','The slid-out disc shows only its name');
 assert.equal(await page.locator('#bagLiftInfo').evaluate(n=>getComputedStyle(n).visibility),'hidden','No details card while the disc is out');
 assert.ok(!await detail.isVisible(),'Details wait for a second click');
 assert.ok(await card.evaluate(n=>n===document.activeElement),'Focus moves to the slid-out disc');
 const box=await canvasBox();
 inside(await viewer((v,id)=>v.discScreenRect(id),driver.id),box,'Slid-out disc');
 inside(await local(page.locator('.bag-slide-name')),box,'Name label');
 const slidRect=await viewer((v,id)=>v.discScreenRect(id),driver.id),liftWidth=await viewer(v=>v.discRects().find(r=>r.pocket==='putter').width);
 assert.ok(slidRect.width>liftWidth,'The slid-out disc is presented larger than a pocketed disc');
 // Escape slides it back and returns focus to its slot.
 await page.keyboard.press('Escape');await settle();
 assert.equal(await viewer(v=>v.slidDisc),null);assert.ok(!await card.isVisible());assert.ok(await driverSlot.evaluate(n=>n===document.activeElement),'Focus returns to the disc');
 // Clicking elsewhere slides it back; a click on the bag body only puts the disc away (the flap stays open).
 await driverSlot.click();await settle();await page.mouse.click(8,300);await settle();
 assert.equal(await viewer(v=>v.slidDisc),null,'Clicking elsewhere slides the disc back in');
 await driverSlot.click();await settle();
 const body=await page.locator('.bag-3d-stage canvas').boundingBox();await page.mouse.click(body.x+body.width*.12,body.y+body.height*.62);await settle();
 assert.equal(await viewer(v=>v.slidDisc),null);assert.equal(await scene.getAttribute('data-phase'),'open','Dismissing on the bag body does not toggle the flap');
 // Clicking a different disc swaps which one is out.
 await driverSlot.click();await settle();await page.locator(`[data-physical-disc="${putter.id}"]`).click({force:true});await settle();
 assert.equal(await viewer(v=>v.slidDisc),putter.id,'Another disc can be pulled out directly');
 await page.keyboard.press('Escape');await settle();
 check('Slide-out: click pulls the disc out face-on with only its name, no navigation; Escape, outside clicks and the bag body slide it back without toggling the flap');

 // 3. Clicking the slid-out disc opens the details panel on the My Bag page.
 await driverSlot.click();await settle();await card.click();await detail.waitFor({state:'visible'});
 await onBagPage('Details');
 assert.equal(await detail.evaluate(n=>n.parentNode.id),'myBagView','The atlas details panel is docked on My Bag');
 assert.equal(await detail.locator('h2').first().innerText(),'Destroyer');
 const personal=detail.locator('.bag-detail-personal');
 assert.match(await personal.innerText(),/Star[\s\S]*170 g[\s\S]*4\/10[\s\S]*Less stable[\s\S]*Flips up to flat on a hyzer/,'This copy\'s details and personal notes');
 assert.match(await personal.innerText(),/Main compartment/);
 for(const part of ['.numbers','#flight','#addToBag'])assert.equal(await detail.locator(part).count(),1,`Same panel content: ${part}`);
 assert.equal(await detail.locator('#nearbyDiscs').count(),0,'No map-only cluster link on My Bag');
 assert.ok(await page.locator('[data-show-on-atlas]').isEnabled());
 // The name label opens it too, and the other copy of the same mold shows its own notes.
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
 assert.equal(await viewer(v=>v.slidDisc),driver.id,'Closing the panel leaves the disc out');assert.ok(await card.evaluate(n=>n===document.activeElement),'Focus returns to the slid-out disc');
 await page.keyboard.press('Escape');await settle();assert.equal(await viewer(v=>v.slidDisc),null);
 await page.locator(`[data-physical-disc="${goto.id}"]`).click({force:true});await settle();await page.locator('.bag-slide-name').click();await detail.waitFor({state:'visible'});
 assert.match(await personal.innerText(),/Champion[\s\S]*Tee shot on 1/);assert.match(await personal.innerText(),/Go-to/);
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await page.keyboard.press('Escape');await settle();
 // Keyboard: Enter slides out, Enter again opens details.
 await driverSlot.focus();await page.keyboard.press('Enter');await settle();
 assert.equal(await viewer(v=>v.slidDisc),driver.id);await page.keyboard.press('Enter');await detail.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.activeElement?.id==='closeDetail',null,{timeout:3000});
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await page.keyboard.press('Escape');await settle();
 // The list's disc names open the same panel instead of the Directory.
 await page.locator(`#bagLineup [data-bag-inspect="${putter.id}"]`).click();await detail.waitFor({state:'visible'});await onBagPage('List name');
 assert.match(await personal.innerText(),/Electron[\s\S]*Circle 1 only/);
 // Editing from the panel refreshes it.
 await personal.locator('[data-bag-detail-edit]').click();await page.locator('#bagNotes').fill('Circle 1 and 2');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await page.waitForFunction(()=>document.querySelector('#detail .bag-detail-notes')?.textContent==='Circle 1 and 2');
 await page.locator('#closeDetail').click();await detail.waitFor({state:'hidden'});
 // An unrated mold has no map position, so Show on Atlas is disabled with a reason.
 await page.locator(`#bagLineup [data-bag-inspect="${odd.id}"]`).click();await detail.waitFor({state:'visible'});
 assert.ok(await page.locator('[data-show-on-atlas]').isDisabled());assert.match(await detail.locator('#bagDetailUnmapped').innerText(),/no flight ratings/);
 await page.locator('#closeDetail').click();await detail.waitFor({state:'hidden'});
 assert.deepEqual(navigations,[],'No navigation or reload on My Bag');
 check('Details: clicking the slid-out disc or its name opens the atlas panel on My Bag with the disc details plus this copy\'s plastic, weight, wear, pocket, stability and personal notes; keyboard Enter→Enter, list names, edits refresh it');

 // 4. Show on Atlas jumps to the disc, zoomed in on the map, with its details open.
 await driverSlot.click();await settle();await card.click();await detail.waitFor({state:'visible'});
 await page.locator('[data-show-on-atlas]').click();
 await page.waitForFunction(()=>document.body.dataset.view==='map' && !cameraTween);await page.waitForTimeout(500);
 const atlas=await page.evaluate(()=>({url:location.pathname+location.search,selected:selected?.id,zoom,docked:document.querySelector('#detail').parentNode.id,visible:!document.querySelector('#detail').hidden,bag:document.querySelector('#myBagView').hidden,personal:!!document.querySelector('#detail .bag-detail-personal')}));
 assert.deepEqual({...atlas,zoom:undefined},{url:'/',selected:'3d60892b6812',zoom:undefined,docked:'atlasMain',visible:true,bag:true,personal:false});
 assert.ok(atlas.zoom>=4,'Zoomed in past the default view: '+atlas.zoom);
 const marker=await page.evaluate(()=>{const node=document.querySelector('#mapMarkers .atlas-marker.is-selected[data-cluster="3d60892b6812"] .marker-stack');const r=node?.getBoundingClientRect(),panel=document.querySelector('#detail').getBoundingClientRect();return r&&{x:r.left+r.width/2,y:r.top+r.height/2,panelLeft:panel.left,width:innerWidth,height:innerHeight};});
 assert.ok(marker && marker.x>0 && marker.x<marker.panelLeft && marker.y>0 && marker.y<marker.height,'The disc\'s own marker is selected and visible beside the panel '+JSON.stringify(marker));
 metrics.showOnAtlasZoom=atlas.zoom;
 await page.locator('#bagTab').click();await phase('open');await scene.scrollIntoViewIfNeeded();
 check(`Show on Atlas: leaves My Bag for the map at zoom ${atlas.zoom}, the disc's own marker selected and centered beside its details`);

 // 5. Top view: a ~0.6 s eased move to straight above, with every pocket labeled.
 const front=await viewer(v=>v.cameraState),frontRects=await viewer(v=>v.discRects());
 // Sample the camera every frame: the move itself (first to last changed frame) should take about 0.6 s, eased.
 await page.locator('[data-bag-canvas]').evaluate(n=>{const samples=n.cameraSamples=[];const tick=()=>{samples.push([performance.now(),n.bagViewer.cameraState.polar]);if(samples.length<240)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 const clicked=await page.evaluate(()=>performance.now());await page.locator('[data-bag-top-view]').click();
 assert.equal(await scene.getAttribute('data-camera'),'moving');
 await camera('top');const top=await viewer(v=>v.cameraState);
 const samples=await page.locator('[data-bag-canvas]').evaluate(n=>n.cameraSamples);
 const moving=samples.filter(([,p])=>p<front.polar-1e-4 && p>top.polar+1e-4),first=samples.find(([,p])=>p<front.polar-1e-4),last=samples.find(([,p])=>p<=top.polar+1e-4);
 const ms=last[0]-first[0],early=moving.filter(([t])=>t<first[0]+ms*.2),late=moving.filter(([t])=>t>first[0]+ms*.8);
 metrics.topView={ms:Math.round(ms),startDelayMs:Math.round(first[0]-clicked),frames:moving.length,frontPolar:front.polar,topPolar:top.polar};
 assert.ok(moving.length>=10,'The camera passes through intermediate angles '+JSON.stringify(metrics.topView));
 assert.ok(ms>=520 && ms<=760,'About 0.6 s: '+JSON.stringify(metrics.topView));
 // Eased: slow start and slow finish relative to the middle.
 const travel=frames=>frames.length>1?Math.abs(frames.at(-1)[1]-frames[0][1])/(frames.at(-1)[0]-frames[0][0]):0,middle=moving.filter(([t])=>t>first[0]+ms*.4 && t<first[0]+ms*.6);
 assert.ok(travel(middle)>travel(early)*1.5 && travel(middle)>travel(late)*1.5,'Eased in and out');
 assert.ok(top.polar<.01,'Directly above the bag');assert.equal(top.xray,1,'Fabric turns translucent');
 assert.equal(await page.locator('[data-bag-top-view]').getAttribute('aria-pressed'),'true');
 const labels=await page.locator('.bag-pocket-label').evaluateAll(nodes=>nodes.map(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {pocket:n.dataset.pocket,text:n.innerText,size:parseFloat(getComputedStyle(n.querySelector('span')).fontSize),left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};}));
 assert.deepEqual(labels.map(l=>l.pocket).sort(),['goto','main','putter']);
 for(const label of labels){inside(label,box,`${label.pocket} label`);assert.ok(label.size>=11,`${label.pocket} label is readable: ${label.size}px`);}
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)assert.ok(!overlap(labels[i],labels[j]),`Labels do not overlap: ${labels[i].pocket} / ${labels[j].pocket}`);
 const text=Object.fromEntries(labels.map(l=>[l.pocket,l.text]));
 assert.match(text.putter,/TOP POCKET[\s\S]*Envy, Luna/i);assert.match(text.goto,/FRONT POCKET[\s\S]*Destroyer/i);assert.match(text.main,/MAIN COMPARTMENT[\s\S]*Destroyer, Crave, Buzzz/i);
 // Every pocket's discs are on screen, and the hit layer follows the new camera.
 const topRects=await viewer(v=>v.discRects());
 for(const pocket of ['main','putter','goTo'])assert.ok(topRects.some(r=>r.pocket===pocket && !r.empty),`${pocket} disc present`);
 for(const rect of topRects.filter(r=>!r.empty))inside({left:rect.left,top:rect.top,width:rect.width,height:rect.height},box,`${rect.pocket} disc in top view`);
 assert.notDeepEqual(topRects.map(r=>Math.round(r.top)),frontRects.map(r=>Math.round(r.top)),'Hit targets re-measured for the top view');
 const slotTop=await local(page.locator(`[data-physical-disc="${putter.id}"]`)),putterRect=topRects.find(r=>r.id===putter.id);
 assert.ok(Math.abs(slotTop.top-putterRect.top)<1.5,'Hit slots sit on the top-view discs');
 // Interaction keeps working from above: hover lifts, click slides out.
 await page.locator(`[data-physical-disc="${putter.id}"]`).hover({force:true});await settle();
 assert.equal(await viewer(v=>v.liftedDisc),putter.id,'Hover lifts a disc in top view');
 await page.locator(`[data-physical-disc="${putter.id}"]`).click({force:true});await settle();
 assert.equal(await viewer(v=>v.slidDisc),putter.id,'Click slides a disc out in top view');
 inside(await viewer((v,id)=>v.discScreenRect(id),putter.id),box,'Slid-out disc in top view');
 await page.keyboard.press('Escape');await settle();assert.equal(await viewer(v=>v.topView),true,'The first Escape only puts the disc back');
 // The turntable drag still turns the bag from above and eases back; it never toggles the flap.
 const stage=await page.locator('.bag-3d-stage canvas').boundingBox(),cx=stage.x+stage.width*.12,cy=stage.y+stage.height*.8;
 await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+150,cy+4,{steps:8});await page.mouse.up();await page.waitForTimeout(900);
 assert.equal(await scene.getAttribute('data-phase'),'open');assert.ok((await viewer(v=>v.cameraState)).polar<.01,'Dragging keeps the top view');
 // Escape animates back to the default angle.
 await page.mouse.move(0,0);await page.locator('body').press('Escape');await camera('front');
 const back=await viewer(v=>v.cameraState);
 assert.ok(Math.abs(back.polar-front.polar)<1e-3 && Math.abs(back.azimuth-front.azimuth)<1e-3 && Math.abs(back.radius-front.radius)<1e-3,'Back to the default angle');
 assert.equal(back.xray,0);assert.equal(await page.locator('.bag-pocket-label').count(),0);assert.equal(await page.locator('[data-bag-top-view]').getAttribute('aria-pressed'),'false');
 assert.deepEqual((await viewer(v=>v.discRects())).map(r=>Math.round(r.top)),frontRects.map(r=>Math.round(r.top)),'Hit targets return to the front view');
 // The button toggles both ways; opening/closing the flap in top view works too.
 await page.locator('[data-bag-top-view]').click();await camera('top');
 await page.locator('[data-bag-toggle]').click();await phase('closed');await page.locator('[data-bag-toggle]').click();await phase('open');
 assert.ok((await viewer(v=>v.cameraState)).polar<.01);
 await page.locator('[data-bag-top-view]').click();await camera('front');
 // Reduced motion switches instantly.
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-bag-top-view]').click();
 await camera('top');assert.ok((await viewer(v=>v.cameraState)).polar<.01);
 await driverSlot.click({force:true});assert.equal(await viewer(v=>v.slidDisc),driver.id);await page.keyboard.press('Escape');
 await page.locator('[data-bag-top-view]').click();await camera('front');await page.emulateMedia({reducedMotion:'no-preference'});
 check(`Top view: ${metrics.topView.ms} ms eased move (starts ${metrics.topView.startDelayMs} ms after the click) to straight above (polar ${front.polar.toFixed(2)} → ${top.polar.toFixed(3)}), translucent fabric, three non-overlapping pocket labels naming their discs, hit layer re-measured; hover/slide/drag/flap work from above; Escape and the toggle return to the exact default angle; reduced motion is instant`);

 // 6. Standalone viewer with OrbitControls: top view is not clamped by the orbit limits, and orbiting resumes.
 const orbit=await page.evaluate(async()=>{
  const host=document.createElement('div');host.style.cssText='position:fixed;left:0;top:0;width:400px;height:500px;z-index:99';document.body.append(host);
  const {mountBag}=await import('/bag3d/viewer.mjs');const v=await mountBag(host,{interaction:'orbit',animated:false});
  const before=v.cameraState;await v.setTopView(true,{instant:true});const top=v.cameraState;
  await v.setTopView(false,{instant:true});const after=v.cameraState;v.dispose();host.remove();return {before,top,after};
 });
 assert.ok(orbit.top.polar<.01,'Orbit limits do not clamp the top view '+JSON.stringify(orbit));
 assert.ok(Math.abs(orbit.after.polar-orbit.before.polar)<1e-3,'Orbit mode returns to its home angle');
 check('Standalone orbit mode: top view bypasses the orbit polar limit and returns to the home angle');

 // 7. Screenshots: slid out (name only), details on My Bag, settled top view, in every theme at desktop and 360 px.
 for(const theme of themes)for(const width of widths){
  await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);await page.reload();await phase('open');
  await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
  const canvas=page.locator('[data-bag-canvas]'),wbox=await canvasBox();
  await driverSlot.click();await settle();
  inside(await local(page.locator('.bag-slide-name')),wbox,`Name label (${theme} ${width})`);
  await shot('slid-out',width,theme,canvas);
  await card.click();await detail.waitFor({state:'visible'});
  if(width===360)await detail.evaluate(n=>{n.scrollTop=n.querySelector('h2').offsetTop-90;});
  await shot('details',width,theme,page);
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await page.keyboard.press('Escape');
  await page.locator('[data-bag-top-view]').click();await camera('top');await page.mouse.move(0,0);
  const tlabels=await page.locator('.bag-pocket-label').evaluateAll(nodes=>nodes.map(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height,size:parseFloat(getComputedStyle(n.querySelector('span')).fontSize)};}));
  assert.equal(tlabels.length,3);for(const label of tlabels){inside(label,wbox,`Pocket label (${theme} ${width})`);assert.ok(label.size>=11);}
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(!overlap(tlabels[i],tlabels[j]),`Pocket labels do not overlap (${theme} ${width})`);
  await shot('top-view',width,theme,canvas);
  await page.keyboard.press('Escape');await camera('front');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 }
 check(`Screenshots: ${shots.length} (slid out with name only, details panel on My Bag with notes, settled top view) in ${themes.join(', ')} at ${widths.join(' and ')} px; labels inside the canvas and non-overlapping in each`);

 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,checks,metrics,gpuArgs,themes,widths,screenshots:shots,errors},null,2));
 const order=['slid-out','details','top-view'];
 fs.writeFileSync(dir+'/screenshots.html',`<!doctype html><meta charset="utf-8"><title>Bag interactions QA</title><style>body{margin:32px;background:#14191f;color:#e9edf0;font:16px system-ui}section{margin:40px 0}figure{display:inline-block;vertical-align:top;margin:12px}img{width:420px;max-width:100%}.mobile img{width:300px}.wide img{width:640px}a{color:inherit}figcaption{margin-top:6px;font-size:13px}li{margin:4px 0}</style><h1>Bag interactions · local QA</h1><ul>${checks.map(c=>`<li>✓ ${c}</li>`).join('')}</ul>${themes.map(theme=>`<section><h2>${theme}</h2>${order.flatMap(state=>shots.filter(s=>s.theme===theme && s.state===state)).map(s=>`<figure class="${s.width===360?'mobile':s.state==='details'?'wide':''}"><a href="${s.name}"><img src="${s.name}" loading="lazy"></a><figcaption>${s.state} · ${s.width}px</figcaption></figure>`).join('')}</section>`).join('')}`);
 console.log(checks.map(c=>'✓ '+c).join('\n'));
 console.log(`PASS: ${checks.length} checks, ${shots.length} screenshots; no page errors.`);
 await context.close();
} finally {await browser?.close();server.kill();}
