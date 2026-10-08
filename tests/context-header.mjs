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
  const title=page.getByRole('button',{name:/Clear manufacturer and type filters/});
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
    const links=menu.locator(':scope > a[role="menuitem"]'),items=menu.locator('[role="menuitem"]:visible,[role="menuitemradio"]:visible');
    assert.deepEqual(await links.allTextContents(),['About','Privacy','Terms']);
    assert.deepEqual(await links.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),['/about','/privacy','/terms']);
    assert.equal(await items.count(),7,'Sign in, legal links and all three theme choices participate in menu navigation');
    assert.equal(await button.getAttribute('aria-expanded'),'true');
    const bounds=await menu.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'Open menu stays within viewport');
    assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.screenshot({path:`outputs/plan-07/menu-${width}-${theme}-open.png`,clip:{x:0,y:0,width,height:400}});
    await page.keyboard.press('ArrowDown');assert.ok(await items.nth(1).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('End');assert.ok(await items.last().evaluate(n=>n===document.activeElement));
    await page.keyboard.press('ArrowDown');assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('ArrowUp');assert.ok(await items.last().evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Home');assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
    assert.ok(await button.evaluate(n=>n===document.activeElement),'Escape returns focus to menu button');
    assert.ok(await button.evaluate(n=>getComputedStyle(n).outlineStyle!=='none'&&parseFloat(getComputedStyle(n).outlineWidth)>0),'Keyboard focus is visibly outlined');
    await page.keyboard.press('ArrowUp');assert.ok(await items.last().evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Tab');await menu.waitFor({state:'hidden'});
    await button.focus();await page.keyboard.press('ArrowDown');assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Escape');await button.click();await button.click();assert.equal(await button.getAttribute('aria-expanded'),'false');
    await button.click();await page.mouse.click(10,160);await menu.waitFor({state:'hidden'});
    for(const key of ['Enter','Space']){
     await button.focus();await page.keyboard.press(key);await menu.waitFor({state:'visible'});
     assert.ok(await items.nth(0).evaluate(n=>n===document.activeElement),`${key} opens the menu with focus on About`);
     await page.keyboard.press('Escape');
    }
   }
  }
  for(const [name,path] of [['About','about'],['Privacy','privacy'],['Terms','terms']]){
   await page.route(`**/${path}`,route=>route.fulfill({contentType:'text/html',body:`<h1>${name} route fixture</h1>`}));
   await button.focus();await page.keyboard.press('Enter');
   await menu.getByRole('menuitem',{name,exact:true}).focus();await page.keyboard.press('Enter');await page.waitForURL(`**/${path}`);
   await page.goBack();await button.waitFor();
  }
  assert.deepEqual(errors,[]);console.log('PASS: menu semantics, routes, keyboard navigation, focus, viewport containment and eight screenshots.');
 }finally{await context.close();}
 await checkThemePicker(browser,base);
}

export async function checkThemePicker(browser,base){
 const dir='outputs/plan-07c';fs.mkdirSync(dir,{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const settle=()=>page.waitForFunction(()=>!cameraTween&&groupCache.items===filtered&&!regrouping&&!document.querySelector('.is-new,.is-retiring,.is-updating'));
 const button=page.getByRole('button',{name:'Site menu',exact:true}),menu=page.getByRole('menu',{name:'Site information'});
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light','OS preference is the unsaved initial default');
  await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='midnight');
  await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
  await settle();
  await page.evaluate(()=>{window.themeVisit=performance.timeOrigin;window.themeMapNodes=[...markerNodes.values()];});
  for(const [name,value] of [['Light','light'],['Midnight','midnight'],['Charcoal','charcoal']]){
   await button.click();await page.keyboard.press('End');
   const choice=menu.getByRole('menuitemradio',{name,exact:true});await choice.focus();
   await page.keyboard.press(name==='Midnight'?'Space':'Enter');
   assert.equal(await page.locator('html').getAttribute('data-theme'),value);
   assert.equal(await choice.getAttribute('aria-checked'),'true');
   assert.equal(await menu.locator('[data-theme-choice][aria-checked="true"]').count(),1,'One theme is checked');
   assert.equal(await page.evaluate(()=>localStorage.getItem('disc-atlas-theme')),value);
   assert.ok(await choice.evaluate(n=>n===document.activeElement),'Applying retains keyboard focus');
   assert.ok(await choice.evaluate(n=>getComputedStyle(n).outlineStyle!=='none'),'Theme choice has visible keyboard focus');
   assert.ok(await menu.isVisible(),'Theme preview leaves the menu open');
   assert.ok(await page.evaluate(()=>performance.timeOrigin===themeVisit&&themeMapNodes.every(n=>markerNodes.get(n.dataset.cluster)===n)),'Theme changes do not reload or rebuild markers');
   assert.equal(await menu.evaluate(n=>getComputedStyle(n).backgroundColor),{light:'rgb(255, 255, 255)',midnight:'rgb(12, 17, 26)',charcoal:'rgb(24, 25, 28)'}[value],'Menu uses the selected theme surface');
   await settle();await page.waitForTimeout(250);await page.screenshot({path:`${dir}/menu-1440-${value}.png`,clip:{x:0,y:0,width:1440,height:420}});
   await page.keyboard.press('Escape');assert.ok(await button.evaluate(n=>n===document.activeElement));
  }
  await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('html').getAttribute('data-theme'),'charcoal','Explicit choice wins over OS changes');
  await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();await settle();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'charcoal','Charcoal persists across visits');
  assert.equal(await page.evaluate(()=>themePalette.background),'#101113','Canvas palette updates to Charcoal');
  await page.mouse.move(0,75);await page.screenshot({path:`${dir}/map-charcoal.png`});
  await page.locator('#listTab').click();await page.screenshot({path:`${dir}/directory-charcoal.png`});
  await page.locator('.disc-row').first().click();await page.locator('#detail').waitFor({state:'visible'});
  await page.mouse.move(0,75);
  await page.waitForTimeout(250);await page.screenshot({path:`${dir}/detail-charcoal.png`});
  for(const selector of ['#detail','.disc-row','#siteMenu']){
   assert.ok(await page.locator(selector).first().evaluate(n=>{const color=getComputedStyle(n).color;const sample=document.createElement('span');sample.style.color='var(--text)';document.body.append(sample);const expected=getComputedStyle(sample).color;sample.remove();return color===expected;}),`${selector} uses the Charcoal text token`);
  }
  // Apply every theme with Directory and details already open, without revisiting.
  for(const [name,value,panel,text,grid] of [['Light','light','rgb(255, 255, 255)','rgb(32, 39, 49)','#b2bdcc'],['Midnight','midnight','rgb(12, 17, 26)','rgb(237, 242, 252)','#38475b'],['Charcoal','charcoal','rgb(24, 25, 28)','rgb(241, 242, 245)','#484c55']]){
   await button.click();await menu.getByRole('menuitemradio',{name,exact:true}).click();await page.mouse.move(0,75);await page.waitForTimeout(250);
   assert.equal(await page.locator('#detail').evaluate(n=>getComputedStyle(n).backgroundColor),panel);
   assert.equal(await page.locator('#directory').evaluate(n=>getComputedStyle(n).backgroundColor),panel);
   assert.equal(await page.locator('#detail h2').evaluate(n=>getComputedStyle(n).color),text);
   assert.equal(await page.locator('#flight svg path').first().getAttribute('stroke'),grid,'Open flight sketch recolors immediately');
   assert.equal(await page.locator('html').getAttribute('data-theme'),value);
   await page.keyboard.press('Escape');
   assert.ok(await page.locator('#detail').isVisible(),'Closing the theme menu keeps the detail panel open');
   assert.ok(await button.evaluate(n=>n===document.activeElement),'Closing returns focus to the menu button');
  }
  await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
  await page.setViewportSize({width:360,height:800});
  for(const [name,value] of [['Light','light'],['Midnight','midnight'],['Charcoal','charcoal']]){
   await button.click();await menu.getByRole('menuitemradio',{name,exact:true}).click();
   const r=await menu.boundingBox();assert.ok(r.x>=0&&r.x+r.width<=360&&r.y+r.height<=800,'Theme menu fits at 360px');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.waitForTimeout(250);await page.screenshot({path:`${dir}/menu-360-${value}.png`,clip:{x:0,y:0,width:360,height:420}});
   await page.keyboard.press('Escape');
  }
  // The existing quick toggle and standalone select stay synchronized.
  await page.getByRole('button',{name:'Switch to light mode'}).click();await button.click();
  assert.equal(await menu.getByRole('menuitemradio',{name:'Light',exact:true}).getAttribute('aria-checked'),'true');
  await page.keyboard.press('Escape');
  await page.goto(`${base}/about.html`);await page.locator('[data-theme-select]').selectOption('charcoal');
  await page.goto(base);await button.click();assert.equal(await menu.getByRole('menuitemradio',{name:'Charcoal',exact:true}).getAttribute('aria-checked'),'true');
  assert.deepEqual(errors,[]);console.log('PASS: three themes, keyboard/pointer selection, OS defaults, persistence, shared controls, Charcoal map/directory/detail, desktop/mobile screenshots.');
 }finally{await context.close();}
}
