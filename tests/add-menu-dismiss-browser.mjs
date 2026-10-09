import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Add menu dismissal (Oct 9). The Directory's Add menu is one of the site's dropdowns (AtlasDropdown in
// app.js), so it closes the way they do: a press outside, Escape, opening another dropdown, and every
// view change, whether the view is reached by mouse, keyboard or script. Only one is ever open.
const dir='outputs/add-menu-dismiss';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
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
 const menuOpen=()=>page.evaluate(()=>{
  const menu=document.querySelector('#addDestinationMenu'),state=menu.matches(':popover-open'),r=menu.getBoundingClientRect();
  const painted=menu.checkVisibility()&&r.width>0&&r.height>0&&getComputedStyle(menu).display!=='none';
  if(state!==painted)throw new Error('menu popover state '+state+' but painted '+painted);
  return painted;
 });
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
 assert.deepEqual(errors,[],'no console errors');
 check('No page or console errors');
}finally{await browser.close();server.close();}
console.log(`PASS add menu dismissal: ${checks.length} checks, ${shots} screenshots in ${dir}`);
