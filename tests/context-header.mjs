import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkContextHeader(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const settle=()=>page.waitForFunction(()=>groupCache.items===filtered&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
 const capture=async name=>{await settle();await page.waitForTimeout(250);await page.screenshot({path:`outputs/context-header/${name}.png`});};
 fs.mkdirSync('outputs/context-header',{recursive:true});
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.match(await page.locator('header .logo').innerText(),/Disc Atlas/);
  await capture('no-filter');
  await page.locator('#filtersToggle').click();
  await page.locator('#brandOptions input[value="Innova"]').check();
  assert.match(await page.locator('header').innerText(),/Innova/,'The selected brand is visible in the site header');
  assert.equal(await page.locator('#brandChips button').count(),0,'Header context replaces duplicate brand pills');
  await page.locator('#closeFilters').click();await page.locator('#filters').waitFor({state:'hidden'});
  await page.mouse.move(800,80);await capture('brand-only');
  await page.locator('#filtersToggle').click();await page.locator('#types [data-type="distance"]').click();
  await page.locator('#closeFilters').click();await page.locator('#filters').waitFor({state:'hidden'});
  assert.match(await page.locator('header').innerText(),/Distance drivers/);
  await page.mouse.move(800,80);await capture('brand-and-type');
  const title=page.getByRole('button',{name:/Clear brand and type filters/});
  await title.hover();assert.equal(await title.evaluate(el=>getComputedStyle(el).cursor),'pointer');await capture('hover');
  await title.focus();await page.keyboard.press('Enter');await settle();
  assert.deepEqual(await page.evaluate(()=>({brands:[...selectedBrands],type})),{brands:[],type:'all'});
  assert.match(await page.locator('header .logo').innerText(),/Disc Atlas/);
  assert.ok(await page.locator('header .logo').evaluate(el=>el===document.activeElement),'Clearing retains keyboard focus on the restored title');
  await page.evaluate(()=>{type='mid';filter();});
  assert.match(await page.locator('header .logo').innerText(),/Disc Atlas/,'Type-only keeps the default title');
  await page.evaluate(()=>{selectedBrands.add('Innova');$('#search').value='Destroyer';$('#speed').value=12;filter();});
  await title.click();
  assert.deepEqual(await page.evaluate(()=>({search:$('#search').value,speed:$('#speed').value,type,brands:[...selectedBrands]})),{search:'Destroyer',speed:'12',type:'all',brands:[]});
  await page.evaluate(()=>{reset();selectedBrands.add('Innova');selectedBrands.add('Axiom');filter();});
  assert.match(await page.locator('header').innerText(),/Innova.*Axiom/,'Multiple brand names remain represented');
  await title.click();
  await page.setViewportSize({width:360,height:800});
  await page.evaluate(()=>{document.activeElement.blur();selectedBrands.add('Innova');type='distance';filter();});
  await page.mouse.move(300,150);await capture('mobile-360');
  await page.evaluate(()=>{selectedBrands.clear();selectedBrands.add('Thought Space Athletics');filter();});
  assert.ok(await page.evaluate(()=>{
   const title=document.querySelector('.header-identity').getBoundingClientRect(),actions=document.querySelector('.header-actions').getBoundingClientRect();
   return document.documentElement.scrollWidth<=innerWidth&&title.right<=actions.left&&actions.right<=innerWidth;
  }),'Long brand names at 360px do not overlap or displace controls');
  await capture('mobile-long-brand');
  await page.emulateMedia({reducedMotion:'reduce'});await title.click();
  assert.equal(await page.locator('.header-identity').evaluate(el=>el.getAnimations({subtree:true}).length),0);
  await page.getByRole('button',{name:'Switch to light mode'}).click();
  await page.evaluate(()=>{selectedBrands.add('Innova');type='distance';filter();});await capture('mobile-light');
  assert.deepEqual(errors,[]);
  await checkHeaderMenu(browser,base);
  console.log('PASS: contextual header, no duplicate pills, keyboard clear, independent filters, multiple brands, 360px long names, reduced motion, and screenshots.');
 }finally{await context.close();}
}

export async function checkHeaderMenu(browser,base){
 fs.mkdirSync('outputs/plan-07',{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);
  const button=page.getByRole('button',{name:'Site menu',exact:true}),menu=page.getByRole('menu',{name:'Site information'});
  await button.waitFor();
  assert.equal(await button.getAttribute('aria-haspopup'),'menu');
  for(const theme of ['dark','light']){
   if(theme==='light')await page.getByRole('button',{name:'Switch to light mode'}).click();
   for(const width of [1440,360]){
    await page.setViewportSize({width,height:width===360?800:900});
    await page.waitForFunction(()=>!cameraTween&&groupCache.items===filtered&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping')&&!document.querySelector('.is-new,.is-retiring,.is-updating'));await page.waitForTimeout(250);
    assert.equal(await button.getAttribute('aria-expanded'),'false');
    assert.ok(await page.evaluate(()=>{const r=document.querySelector('.header-actions').getBoundingClientRect(),identity=document.querySelector('.header-identity').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&r.right<=innerWidth&&identity.right<=r.left;}),'Menu fits beside other header controls');
    await page.mouse.move(0,150);await page.evaluate(()=>document.activeElement.blur());
    await page.screenshot({path:`outputs/plan-07/menu-${width}-${theme}-closed.png`,clip:{x:0,y:0,width,height:240}});
    await button.click();await menu.waitFor({state:'visible'});
    const items=menu.getByRole('menuitem');assert.deepEqual(await items.allTextContents(),['About','Privacy','Terms']);
    assert.deepEqual(await items.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),['/about','/privacy','/terms']);
    assert.equal(await button.getAttribute('aria-expanded'),'true');
    const bounds=await menu.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'Open menu stays within viewport');
    assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.screenshot({path:`outputs/plan-07/menu-${width}-${theme}-open.png`,clip:{x:0,y:0,width,height:240}});
    await page.keyboard.press('ArrowDown');assert.ok(await items.nth(1).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('End');assert.ok(await items.nth(2).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('ArrowDown');assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('ArrowUp');assert.ok(await items.nth(2).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Home');assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
    assert.ok(await button.evaluate(n=>n===document.activeElement),'Escape returns focus to menu button');
    assert.ok(await button.evaluate(n=>getComputedStyle(n).outlineStyle!=='none'&&parseFloat(getComputedStyle(n).outlineWidth)>0),'Keyboard focus is visibly outlined');
    await page.keyboard.press('ArrowUp');assert.ok(await items.nth(2).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Tab');await menu.waitFor({state:'hidden'});
    await button.focus();await page.keyboard.press('ArrowDown');assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Escape');await button.click();await button.click();assert.equal(await button.getAttribute('aria-expanded'),'false');
    await button.click();await page.mouse.click(10,160);await menu.waitFor({state:'hidden'});
   }
  }
  await page.route('**/about',route=>route.fulfill({contentType:'text/html',body:'<h1>About route fixture</h1>'}));
  await button.click();await menu.getByRole('menuitem',{name:'About',exact:true}).click();await page.waitForURL('**/about');
  assert.deepEqual(errors,[]);console.log('PASS: menu semantics, routes, keyboard navigation, focus, viewport containment and eight screenshots.');
 }finally{await context.close();}
}
