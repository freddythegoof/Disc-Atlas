import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Oct 8: the map dropdown (Standard / Personalized / My Bag) moves out of the filter bar to the
// top-right corner of the atlas. Position only: same button, same menu, same behavior. This suite
// signs in (the dropdown only exists for a player with a bag), then at four widths, three themes
// and three zoom levels checks the corner, the clearances and the menu, and photographs 1440 and 360.
// LENS_PHASE=before only photographs the old placement, into before/.
const phase=process.env.LENS_PHASE==='before'?'before':'after';
const config='tests/auth.wrangler.jsonc',state='work/lens-corner/d1-qa',port=8821,base=`https://localhost:${port}`,dir=`outputs/lens-corner/${phase}`;
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port',String(port),'--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const THEMES=['light','midnight','charcoal'],WIDTHS=[1440,1024,768,360],ZOOMS=[1,2.5,6];
const errors=[],shots=[],checks=[];
const check=label=>{checks.push(label);console.log('ok -',label);};
const overlaps=(a,b,pad=0)=>a.x<b.x+b.width+pad && a.x+a.width>b.x-pad && a.y<b.y+b.height+pad && a.y+a.height>b.y-pad;
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error' && !/Failed to load resource/.test(m.text()))errors.push(m.text());});
 const setTheme=async theme=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const mapReady=async()=>{await page.waitForFunction(()=>typeof cameraTween!=='undefined' && !cameraTween && groupCache?.items===filtered && !document.querySelector('#mapMarkers').classList.contains('is-regrouping') && !retirementTimer && !retirementFrame);await page.waitForTimeout(300);};
 const overview=async()=>{await page.evaluate(()=>{closeDetail(false);selected=null;zoom=1;pan={x:0,y:0};draw();});await mapReady();};
 const settle=async()=>{await page.evaluate(()=>{document.activeElement?.blur?.();return document.fonts.ready;});await page.mouse.move(1,1);await page.waitForTimeout(250);};

 // Sign in and seed a bag, so the player gets the map dropdown.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 await page.waitForFunction(()=>discs.length>0);
 const colors=['#ed7868','#f0a35e','#70b7cd','#a7c68c','#b99bdd','#e6c668','#d9a3c3','#79b3a8','#f2d7a0','#8fb3e8'];
 await page.evaluate(async colors=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
  const molds=discs.filter(d=>d.speed!=null && isCurrentOrRecent(d)).filter((d,i)=>i%7===0).slice(0,colors.length);
  const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
  for(const [i,d] of molds.entries()){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify({mold_id:d.id,plastic:'Champion',wear:7,weight_g:171,color:colors[i],pocket:'main'})});if(!r.ok)throw Error(await r.text());}
 },colors);
 await page.reload();await page.waitForFunction(()=>discs.length>0 && window.BagApp.mapColors().size>0);
 await page.locator('#mapTab').click();await page.waitForFunction(()=>document.body.dataset.view==='map');
 await page.locator('#atlasLens').waitFor();await overview();

 const lens=page.locator('#lensButton'),menu=page.locator('#lensMenu');
 const label=async()=>(await lens.textContent()).trim();
 // Everything on the map the dropdown must stay clear of, as boxes.
 const surroundings=()=>page.evaluate(()=>{
  const box=n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};},vis=n=>{const b=n.getBoundingClientRect(),s=getComputedStyle(n);return b.width>0 && b.height>0 && s.visibility!=='hidden' && s.display!=='none' && +s.opacity>0.05;};
  const lensBox=box(document.querySelector('#atlasLens')),map=box(document.querySelector('#mapWrap'));
  const named=(label,sel)=>[...document.querySelectorAll(sel)].filter(vis).map(n=>({label,...box(n)}));
  return {lens:lensBox,map,viewport:{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth},
   others:[...named('search','.explore-tools .search'),...named('filters','#filtersToggle'),...named('type chip','#typeChips button'),...named('zoom controls','.map-controls'),...named('caption','.map-caption'),...named('legend dock','.map-toolbar'),
    ...named('disc','#mapMarkers .atlas-marker .disc-art,#mapMarkers .atlas-marker .map-dot'),...named('disc name','#mapMarkers .atlas-marker .marker-name')],
   toolsParent:document.querySelector('#atlasLens').parentElement.className,inTools:!!document.querySelector('.explore-tools #atlasLens'),
   zoomRight:box(document.querySelector('.map-controls')).x+box(document.querySelector('.map-controls')).width,toolsTop:box(document.querySelector('.explore-tools')).y};
 });
 const zoomTo=async target=>{
  await overview();
  for(let i=0;i<40 && await page.evaluate(()=>zoom)<target-0.01;i++){await page.locator('#zoomIn').click();await page.waitForTimeout(120);}
  await mapReady();
 };
 const geometry=async(name,{corner=true,mapItems=true}={})=>{
  await settle();const s=await surroundings();
  assert.ok(s.viewport.scrollWidth<=s.viewport.width,`${name}: no sideways scroll`);
  assert.ok(s.lens.height>=36 && s.lens.width>0,`${name}: dropdown renders ${JSON.stringify(s.lens)}`);
  if(corner){
   assert.ok(!s.inTools,`${name}: the dropdown left the filter bar`);
   const gutter=s.viewport.width-(s.lens.x+s.lens.width);
   assert.ok(s.lens.x>s.map.x+s.map.width/2,`${name}: in the right half of the map`);
   assert.ok(Math.abs(s.lens.x+s.lens.width-s.zoomRight)<=1.5,`${name}: right edge lines up with the zoom controls (${s.lens.x+s.lens.width} vs ${s.zoomRight})`);
   assert.ok(gutter>=14 && gutter<=32,`${name}: sits a regular gutter from the right edge (${gutter})`);
   // Wide screens: level with the search row at the very top. Phones: the right end of the caption row, right under the chips.
   if(s.viewport.width>700)assert.ok(s.lens.y>=s.map.y+8 && s.lens.y<=s.map.y+30,`${name}: tucked into the top of the map (${s.lens.y-s.map.y})`);
   else{const chips=s.others.filter(o=>o.label==='type chip');assert.ok(Math.abs(s.lens.y-(Math.max(...chips.map(c=>c.y+c.height))+8))<=24,`${name}: right under the chip row (${s.lens.y})`);}
  }
  if(corner)for(const o of s.others.filter(o=>mapItems||!/^disc/.test(o.label)))assert.ok(!overlaps(s.lens,o,4),`${name}: clear of ${o.label} ${JSON.stringify(o)} vs ${JSON.stringify(s.lens)}`);
  return s;
 };

 const rest={};
 for(const width of WIDTHS){
  await page.setViewportSize({width,height:width===360?800:width===768?1024:1000});await page.evaluate(()=>{measureMap();});
  for(const theme of THEMES){
   await setTheme(theme);await overview();
   const corner=phase==='after';
   for(const z of ZOOMS){
    await zoomTo(z);
    const s=await geometry(`${width} ${theme} zoom ${z}`,{corner,mapItems:z===1});
    if(z===1)rest[`${width}-${theme}`]=s.lens;
    if(z===1 && (width===1440||width===360)){await settle();await page.screenshot({path:`${dir}/atlas-${width}-${theme}.png`});shots.push(`atlas-${width}-${theme}`);}
   }
   await overview();
   if(phase==='after'){
    // The dropdown works identically: opens under its button inside the screen, marks the current map, closes, switches.
    await lens.click();assert.ok(await menu.isVisible(),`${width} ${theme}: the dropdown opens`);
    const b=await menu.boundingBox(),l=await lens.boundingBox();
    assert.ok(b.x>=0 && b.x+b.width<=width && b.y>=l.y+l.height && b.y+b.height<=await page.evaluate(()=>innerHeight),`${width} ${theme}: the menu sits under the button on screen ${JSON.stringify(b)}`);
    assert.ok(Math.abs((b.x+b.width)-(l.x+l.width))<=1.5 || b.x>=l.x-1,`${width} ${theme}: the menu stays attached to its button`);
    assert.equal(await menu.getByRole('menuitemradio').count(),3);
    assert.equal(await menu.locator('[aria-checked="true"]').getAttribute('data-lens'),'mine');
    if(width===1440||width===360){await settle();await lens.hover().catch(()=>{});await page.screenshot({path:`${dir}/menu-${width}-${theme}.png`});shots.push(`menu-${width}-${theme}`);}
    await page.keyboard.press('Escape');assert.ok(await menu.isHidden(),`${width} ${theme}: Escape closes it`);
    assert.ok(await lens.evaluate(n=>n===document.activeElement),`${width} ${theme}: focus returns to the button`);
   }
  }
 }
 if(phase==='after'){
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{measureMap();});await setTheme('light');await overview();
  // Behavior: choose each map; the label, the checked item and the shown discs follow.
  const shown=()=>page.evaluate(()=>({lens:activeLens(),count:filtered.filter(inLens).length,mine:document.querySelectorAll('#mapMarkers .atlas-marker.is-mine').length}));
  const choose=async name=>{await lens.click();await menu.getByRole('menuitemradio',{name,exact:true}).click();await mapReady();assert.ok(await menu.isHidden(),`Choosing ${name} closes the menu`);assert.equal(await label(),name);};
  await choose('Standard');let s=await shown();assert.equal(s.lens,'default');assert.equal(s.mine,0,'Standard shows the shared atlas without bag rings');
  await choose('My Bag');s=await shown();assert.equal(s.lens,'only');assert.ok(s.mine>0);
  await choose('Personalized');s=await shown();assert.equal(s.lens,'mine');assert.ok(s.mine>0);
  // The Standard map (the shared atlas) lays out differently from Personalized: the corner is clear there too, at every width.
  await choose('Standard');
  for(const width of WIDTHS){await page.setViewportSize({width,height:width===360?800:width===768?1024:1000});await page.evaluate(()=>{measureMap();});await overview();await geometry(`Standard ${width}`);if(width===1440||width===360){await settle();await page.screenshot({path:`${dir}/standard-${width}-light.png`});shots.push(`standard-${width}-light`);}}
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{measureMap();});await overview();await choose('Personalized');
  // Mouse: a second click on the button closes it; a click outside closes it; keyboard: ArrowDown opens, arrows move, Tab closes.
  await lens.click();await lens.click();assert.ok(await menu.isHidden(),'Clicking the button again closes the menu');
  await lens.click();await page.mouse.click(420,30);assert.ok(await menu.isHidden(),"Clicking outside closes the menu");
  await lens.focus();await page.keyboard.press('ArrowDown');assert.ok(await menu.isVisible(),'ArrowDown opens the menu');
  assert.ok(await menu.locator('[aria-checked="true"]').evaluate(n=>n===document.activeElement),'Focus starts on the current map');
  await page.keyboard.press('ArrowUp');await page.keyboard.press('Tab');assert.ok(await menu.isHidden(),'Tab closes the menu');
  // Directory has no map dropdown; the map brings it back in the same corner.
  await page.locator('#directoryTab').click().catch(()=>{});await page.waitForTimeout(250);
  if(await page.evaluate(()=>document.body.dataset.view)==='list'){assert.ok(await page.locator('#atlasLens').isHidden(),'Directory: no map dropdown');await page.locator('#mapTab').click();await page.waitForFunction(()=>document.body.dataset.view==='map');await mapReady();await geometry('after Directory round trip');}
  // Filtering does not move it, and the filter bar closes up without it.
  const beforeFilter=await page.locator('#atlasLens').boundingBox();await page.locator('#typeChips [data-type="putter"]').click();await mapReady();const afterFilter=await geometry('with a type filter');
  assert.deepEqual(afterFilter.lens,{x:beforeFilter.x,y:beforeFilter.y,width:beforeFilter.width,height:beforeFilter.height},'The dropdown stays put while filtering');
  await page.locator('#typeChips [data-type="putter"]').click();await mapReady();
  check(`Map dropdown sits in the top-right corner of the atlas at ${WIDTHS.join('/')} px in ${THEMES.length} themes: aligned with the zoom controls, clear of the filter bar, caption, legend and zoom controls at zoom ${ZOOMS.join('/')}, and clear of every disc and name at 1x (zoomed in, discs pan under it as they do under all map chrome)`);
  check('Same button and menu: opens under the button, marks the current map, Standard / Personalized / My Bag switch the map, click-again, click-outside, Escape, Tab and ArrowDown behave as before, and filtering never moves it');
 }
 assert.deepEqual(errors,[],'No page errors');
 console.log(JSON.stringify({phase,shots,checks:checks.length},null,1));
} finally {
 await browser?.close();
 server.kill();
}
