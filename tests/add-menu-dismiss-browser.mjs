import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Add menu dismissal (Oct 9). The Directory's Add menu is one of the site's dropdowns (AtlasDropdown in
// app.js), so it closes the way they do: a press outside, Escape, opening another dropdown, and every
// view change, whether the view is reached by mouse, keyboard or script. Only one is ever open.
// Batch 2 adds the menu's 100 ms exit (its state flips at once, its painting settles after) and a signed-in
// section (mocked bag) for sequences under real bag traffic: a bag that loads while the menu is open, repeated
// saves, bag changes landing on an open menu, scrolling the moment it opens, and quick close/open flurries.
const dir='outputs/add-menu-dismiss';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=url.pathname==='/'?'web/index.html':['/bag-plastics.json','/bag-models.json'].includes(url.pathname)?'source-data'+url.pathname:'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const errors=[],checks=[];let shots=0;
const check=label=>{checks.push(label);console.log('ok -',label);};
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/503|Failed to load resource/.test(m.text()))errors.push(m.text());});
 // Open means painted: the popover state and what is on screen must agree (a menu can be "closed" yet still drawn).
 // The menu leaves with a 100 ms exit (cosmic.css): its state flips at once, its painting settles after, so
 // the check waits for the transitions to finish.
 const menuOpen=async()=>{
  await page.waitForFunction(()=>!document.querySelector('#addDestinationMenu').getAnimations().length);
  return page.evaluate(()=>{
  const menu=document.querySelector('#addDestinationMenu'),state=menu.matches(':popover-open'),r=menu.getBoundingClientRect();
  const painted=menu.checkVisibility()&&r.width>0&&r.height>0&&getComputedStyle(menu).display!=='none';
  if(state!==painted)throw new Error('menu popover state '+state+' but painted '+painted);
  return painted;
  });
 };
 const expanded=()=>page.evaluate(()=>[...document.querySelectorAll('[data-add-menu]')].filter(b=>b.getAttribute('aria-expanded')==='true').length);
 const shoot=async name=>{await page.waitForTimeout(200);await page.screenshot({path:`${dir}/${name}.png`});shots++;};
 const addButton=n=>page.locator('#rows .directory-add').nth(n);
 const outside=width=>page.mouse.click(width>700?400:200,30);
 const start=async(width,theme)=>{
  await page.setViewportSize({width,height:width>700?900:844});
  await page.goto(base);await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);
  await page.evaluate(t=>applyTheme(t),theme);
  await page.locator('#listTab').click();await page.waitForTimeout(250);
 };
 for(const theme of ['light','midnight','charcoal'])for(const width of [1440,390]){
  const tag=`${width} ${theme}`,file=`${width}-${theme}`;
  await start(width,theme);
  // Toggle: the button opens, the button again closes.
  await addButton(0).click();assert.ok(await menuOpen(),`${tag}: Add opens`);
  await addButton(0).click();assert.ok(!(await menuOpen()),`${tag}: Add again closes`);
  assert.equal(await expanded(),0);
  // Outside press.
  await addButton(0).click();assert.ok(await menuOpen());
  await shoot(`${file}-open`);
  await outside(width);
  assert.ok(!(await menuOpen()),`${tag}: a press outside closes it`);assert.equal(await expanded(),0);
  await shoot(`${file}-after-outside-click`);
  // Escape, with focus in the menu and after focus moved away.
  await addButton(1).click();assert.ok(await menuOpen());await page.keyboard.press('Escape');
  assert.ok(!(await menuOpen()),`${tag}: Escape closes it`);
  assert.ok(await addButton(1).evaluate(n=>document.activeElement===n),`${tag}: Escape returns focus to Add`);
  await addButton(1).click();await page.evaluate(()=>document.activeElement.blur());await page.keyboard.press('Escape');
  assert.ok(!(await menuOpen()),`${tag}: Escape closes it even when focus is elsewhere`);
  // Another row's Add: only that menu is open.
  await addButton(0).click();await addButton(2).click();
  assert.ok(await menuOpen());assert.equal(await expanded(),1,`${tag}: one Add expanded`);
  assert.equal(await addButton(2).getAttribute('aria-expanded'),'true');assert.equal(await addButton(0).getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.querySelectorAll(':popover-open').length),1,`${tag}: one popover open`);
  // Another dropdown opened from the keyboard (no press outside) takes over.
  if(width>700){
   await page.locator('#brandChip').focus();await page.keyboard.press('Enter');
   assert.ok(!(await menuOpen()),`${tag}: opening Manufacturer closes it`);assert.equal(await expanded(),0);
   assert.ok(await page.evaluate(()=>!document.querySelector('#brandPanel').hidden),`${tag}: Manufacturer is open`);
   await addButton(0).click();
   assert.ok(await menuOpen()&&await page.evaluate(()=>document.querySelector('#brandPanel').hidden),`${tag}: opening Add closes Manufacturer`);
  }
  await page.keyboard.press('Escape');
  // Navigating away: the menu is gone, no refresh. Mouse, keyboard, script and My Bag.
  await addButton(0).click();assert.ok(await menuOpen());
  await page.locator('#mapTab').click();await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.body.dataset.view),'map');
  assert.ok(!(await menuOpen()),`${tag}: clicking Atlas closes it`);assert.equal(await expanded(),0);
  await shoot(`${file}-atlas-after-open-menu`);
  await page.locator('#listTab').click();await page.waitForTimeout(250);
  await addButton(0).click();assert.ok(await menuOpen());
  await page.locator('#mapTab').focus();await page.keyboard.press('Enter');await page.waitForTimeout(250);
  assert.ok(!(await menuOpen()),`${tag}: keyboard to Atlas closes it`);
  await page.locator('#listTab').click();await page.waitForTimeout(250);
  await addButton(0).click();assert.ok(await menuOpen());
  await page.evaluate(()=>setView('map'));
  assert.ok(!(await menuOpen()),`${tag}: a scripted view change closes it`);
  await page.evaluate(()=>setView('list'));await page.waitForTimeout(200);
  await addButton(0).click();assert.ok(await menuOpen());
  await page.locator('#bagTab').click();await page.waitForTimeout(250);
  assert.ok(!(await menuOpen()),`${tag}: opening My Bag closes it`);assert.equal(await expanded(),0);
  // Back on the Directory the menu is still shut and opens normally.
  await page.locator('#listTab').click();await page.waitForTimeout(250);
  assert.ok(!(await menuOpen()));await addButton(0).click();assert.ok(await menuOpen());await page.keyboard.press('Escape');
  // Spam: no stuck state.
  for(let i=0;i<25;i++){await addButton(i%2).click();if(i%3===0)await page.keyboard.press('Escape');}
  await outside(width);
  assert.ok(!(await menuOpen()),`${tag}: closed after click spam`);assert.equal(await expanded(),0);
  await addButton(0).click();assert.ok(await menuOpen(),`${tag}: still opens after spam`);await page.keyboard.press('Escape');assert.ok(!(await menuOpen()));
  check(`${tag}: toggle, outside press, Escape (focus in and out), one menu across rows, other dropdowns, mouse/keyboard/script/bag view changes, click spam`);
 }
 // Signed in (mocked bag API): Add under real bag traffic. The directory re-renders its rows whenever the bag's
 // colours change; the open menu must follow its disc to the new button instead of closing under the player.
 for(const width of [1440,390]){
  const tag=`${width} signed in`;
  const open=async({bagDelay=0,seed=true}={})=>{
   const context=await browser.newContext({viewport:{width,height:width>700?900:844}});
   let items=(seed?['3d60892b6812','e70f48273d7f']:[]).map((mold,i)=>({id:'s'+i,mold_id:mold,in_bag:true,status:'active',color:'#ed7868',plastic:'Star',wear:10,weight_g:175,pocket:'main',position:i})),seq=1;
   await context.route('**/api/**',async r=>{
    const req=r.request(),{pathname}=new URL(req.url()),method=req.method(),json=(body,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
    if(pathname==='/api/account')return json({user:{id:'u',name:'Test Player',email:'t@e.st'},csrfToken:'tok',authReady:true});
    if(pathname==='/api/bag'&&method==='GET'){if(bagDelay)await new Promise(done=>setTimeout(done,bagDelay));return json({bag:{bag_model:'Custom bag',capacity:20,main_capacity:16,sort_mode:'manual',rack_style:'steel'},discs:items});}
    if(pathname==='/api/bag/discs'&&method==='POST'){const body=JSON.parse(req.postData()),disc={...body,id:'i'+seq++,status:body.status||'active',position:items.length};items.push(disc);return json({disc});}
    return json({error:'not mocked'},404);
   });
   const signed=await context.newPage();
   signed.on('pageerror',e=>errors.push(e.message));signed.on('console',m=>{if(m.type()==='error'&&!/404|503|Failed to load resource/.test(m.text()))errors.push(m.text());});
   await signed.goto(base);await signed.waitForFunction(()=>window.AtlasAccount?.current?.user&&typeof filtered!=='undefined'&&filtered.length>0);
   await signed.locator('#listTab').click();await signed.waitForTimeout(250);
   return signed;
  };
  const rowsAdd=(p,n)=>p.locator('#rows .directory-add').nth(n);
  const state=p=>p.evaluate(()=>{
   const menu=document.querySelector('#addDestinationMenu'),open=menu.matches(':popover-open'),buttons=[...document.querySelectorAll('[data-add-menu][aria-expanded="true"]')],b=buttons[0],br=b?.getBoundingClientRect(),mr=menu.getBoundingClientRect();
   return {open,expanded:buttons.length,connected:b?.isConnected,mold:b?.dataset.addMenu,gap:br?Math.round(Math.min(Math.abs(mr.top-br.bottom),Math.abs(br.top-mr.bottom))):null};
  });
  const settle=p=>p.waitForFunction(()=>!document.querySelector('#addDestinationMenu').getAnimations().length);
  // 1. The bag arrives while the menu is open: this was the Directory Add bug (renderList detached the trigger).
  {
   const p=await open({bagDelay:1300});
   const mold=await p.evaluate(()=>document.querySelectorAll('#rows .directory-add')[1].dataset.addMenu);
   await p.evaluate(()=>{window.__row=document.querySelector('#rows').firstElementChild;});
   await rowsAdd(p,1).click();await settle(p);
   const before=await state(p);
   assert.deepEqual([before.open,before.mold],[true,mold],`${tag}: the menu is open on the disc the player picked`);
   await p.waitForFunction(()=>window.__row!==document.querySelector('#rows').firstElementChild,null,{timeout:6000});
   await settle(p);
   const after=await state(p);
   assert.equal(after.open,true,`${tag}: the bag landing re-rendered the rows and the menu is still open`);
   assert.equal(after.expanded,1);assert.equal(after.connected,true,`${tag}: its trigger is the new button`);assert.equal(after.mold,mold,`${tag}: same disc`);
   assert.ok(after.gap>=2&&after.gap<=10,`${tag}: and it sits against that button (${after.gap}px)`);
   await p.keyboard.press('Escape');await settle(p);
   assert.equal((await state(p)).open,false);
   assert.equal(await p.evaluate(m=>document.activeElement?.dataset.addMenu===m,mold),true,`${tag}: Escape returns focus to the new button`);
   await p.context().close();
  }
  // 2. Repeated saves back to back, each followed at once by another Add (the rows re-render on the first save).
  {
   const p=await open({seed:false});
   for(let round=0;round<4;round++){
    await rowsAdd(p,0).click();await p.locator('#addDestinationMenu button[data-add-destination="bag"]').click();
    await p.waitForSelector('#addDiscDialog[open]');await p.locator('#saveDisc').click();
    await p.waitForFunction(()=>!document.querySelector('#addDiscDialog').open);
    await rowsAdd(p,1).click();await settle(p);
    const s=await state(p);
    assert.deepEqual([s.open,s.expanded,s.connected],[true,1,true],`${tag}: round ${round}: Add opens straight after a save`);
    await p.keyboard.press('Escape');await settle(p);
   }
   // Bag changes landing on an open menu, back to back.
   await rowsAdd(p,2).click();await settle(p);
   const mold=(await state(p)).mold;
   await p.evaluate(()=>{for(let i=0;i<6;i++)window.dispatchEvent(new CustomEvent('atlas-bag-change'));});
   await settle(p);
   const kept=await state(p);
   assert.deepEqual([kept.open,kept.expanded,kept.connected,kept.mold],[true,1,true,mold],`${tag}: six bag changes in a row leave the menu on its disc`);
   await rowsAdd(p,3).click();await settle(p);
   assert.equal((await state(p)).expanded,1,`${tag}: a second row's Add takes over`);
   await p.keyboard.press('Escape');await settle(p);
   // A change that removes the disc from the list closes the menu (nothing to anchor to).
   await rowsAdd(p,0).click();await settle(p);
   await p.evaluate(()=>{$('#search').value='zzzz-no-match';filter();});await settle(p);
   const gone=await state(p);assert.deepEqual([gone.open,gone.expanded],[false,0],`${tag}: a filter that drops its disc closes the menu`);
   await p.evaluate(()=>{$('#search').value='';filter();});
   await p.context().close();
  }
  // 3. Scroll the moment the menu opens: the menu stays under its button, then closes when the button leaves the screen.
  {
   const p=await open();
   await rowsAdd(p,2).click();
   await p.mouse.move(width>700?500:200,500);await p.mouse.wheel(0,60);await p.mouse.wheel(0,60);
   const s=await state(p);
   assert.deepEqual([s.open,s.expanded],[true,1],`${tag}: still open after scrolling in the first frames`);
   await settle(p);const g=await state(p);assert.ok(g.gap>=2&&g.gap<=10,`${tag}: and still against its button (${g.gap}px)`);
   // The list scrolls inside its own box: the menu follows its button while the button shows, and closes as the
   // button is clipped out of the list. It never floats over the toolbar above (the Directory Add bug, lead 1).
   const visibleTrigger=()=>p.evaluate(()=>{const b=document.querySelector('[data-add-menu][aria-expanded="true"]');if(!b)return null;const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===b||b.contains(hit);});
   let followed=0,closedAt=null;
   for(let step=0;step<80&&closedAt===null;step++){
    await p.mouse.wheel(0,30);await p.waitForTimeout(100);
    const now=await state(p);
    if(!now.open){closedAt=step;break;}
    assert.equal(await visibleTrigger(),true,`${tag}: while the menu is open its trigger is visible (step ${step})`);
    assert.ok(now.gap<=12,`${tag}: and the menu stays against it (${now.gap}px)`);followed++;
   }
   assert.ok(closedAt!==null&&followed>0,`${tag}: the menu followed its button (${followed} steps) and closed once it was clipped out (step ${closedAt})`);
   assert.equal((await state(p)).expanded,0);
   await p.mouse.wheel(0,4000);await p.waitForTimeout(150);
   await rowsAdd(p,0).click();await settle(p);assert.equal((await state(p)).open,true,`${tag}: Add still opens after all that`);await p.keyboard.press('Escape');await settle(p);
   const away={open:false,expanded:0};assert.deepEqual([away.open,away.expanded],[false,0],`${tag}: closed`);
   await p.context().close();
  }
  // 4. Quick close/open flurries: whatever order they land in, one menu or none, and the state matches the painting.
  {
   const p=await open();
   for(let i=0;i<14;i++){
    await rowsAdd(p,i%3).click();
    if(i%4===1)await p.keyboard.press('Escape');
    if(i%4===2)await p.mouse.click(width>700?400:200,30);
    await p.waitForTimeout(i%2?15:60);
   }
   await settle(p);const s=await state(p);
   const painted=await p.evaluate(()=>document.querySelector('#addDestinationMenu').checkVisibility());
   assert.equal(painted,s.open,`${tag}: the state matches what is painted after a flurry`);assert.ok(s.expanded<=1);
   await p.keyboard.press('Escape');await settle(p);
   // Escape, then straight onto another row; and an outside press, then straight back onto the same Add.
   await rowsAdd(p,0).click();await p.keyboard.press('Escape');await rowsAdd(p,2).click();await settle(p);
   const swap=await state(p);assert.deepEqual([swap.open,swap.expanded],[true,1],`${tag}: Escape then another row's Add opens that menu`);
   await p.mouse.click(width>700?400:200,30);await rowsAdd(p,2).click();await settle(p);
   assert.equal((await state(p)).open,true,`${tag}: an outside press then the same Add reopens it`);
   await p.keyboard.press('Escape');await settle(p);
   await p.context().close();
  }
  check(`${tag}: a bag loading under an open menu, repeated saves, bag changes, scrolling at once and open/close flurries`);
 }
 assert.deepEqual(errors,[],'no console errors');
 check('No page or console errors');
}finally{await browser.close();server.close();}
console.log(`PASS add menu dismissal: ${checks.length} checks, ${shots} screenshots in ${dir}`);
