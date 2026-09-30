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
  console.log('PASS: contextual header, no duplicate pills, keyboard clear, independent filters, multiple brands, 360px long names, reduced motion, and screenshots.');
 }finally{await context.close();}
}
