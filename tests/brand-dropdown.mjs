import assert from 'node:assert/strict';
import fs from 'node:fs';

// The Manufacturer chip leads the type-chip row (before Driver) and opens a searchable, multi-select
// manufacturer list. It edits the same brand filter as the Filters drawer, so either place shows the other's picks.
// Phones keep the chip row on one line; it scrolls sideways instead of wrapping.
export async function checkBrandDropdown(browser,base){
 const dir='outputs/brand-dropdown',errors=[];
 fs.mkdirSync(dir,{recursive:true});
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  try{
   await page.goto(base);await page.waitForFunction(()=>discs.length&&filtered.length);
   if(name==='mobile')await page.locator('#mapTab').click();
   const chip=page.locator('#brandChip'),panel=page.locator('#brandPanel');
   const drawerBox=brand=>page.locator(`#brandOptions input[value="${brand}"]`);
   const state=()=>page.evaluate(()=>({brands:[...selectedBrands].sort(),onlyThose:filtered.every(d=>selectedBrands.has(d.brand)),count:filtered.length}));

   // Placement: first in the chip row, right before Driver.
   const row=await page.locator('#typeChips').evaluate(n=>[...n.children].map(c=>c.id||c.querySelector('button')?.id||c.textContent.trim()));
   assert.deepEqual(row.slice(0,2),['brandChip','Driver'],name+': Manufacturer comes before Driver: '+row);
   assert.equal((await chip.textContent()).trim(),'Manufacturer',name+': idle label');
   assert.equal(await chip.getAttribute('aria-expanded'),'false');
   const driver=await page.locator('#typeChips button[data-type="distance"]').boundingBox();
   const box=await chip.boundingBox();
   assert.ok(Math.abs(box.y-driver.y)<1 && box.x+box.width<=driver.x,name+': same line, left of Driver '+JSON.stringify({box,driver}));

   if(name==='mobile'){
    // One line, scrolling sideways.
    const fit=await page.locator('#typeChips').evaluate(n=>({tops:[...n.querySelectorAll('button[data-type],#brandChip')].map(b=>Math.round(b.getBoundingClientRect().top)),scroll:n.scrollWidth>n.clientWidth,overflow:getComputedStyle(n).overflowX}));
    assert.equal(new Set(fit.tops).size,1,'mobile: chips stay on one line '+JSON.stringify(fit));
    assert.ok(fit.scroll && fit.overflow==='auto','mobile: the row scrolls sideways '+JSON.stringify(fit));
   }

   // Open: focus lands in the search box; the list has every brand with a count.
   await chip.click();
   assert.equal(await chip.getAttribute('aria-expanded'),'true',name+': chip reports open');
   assert.ok(await panel.isVisible(),name+': panel opens');
   assert.ok(await page.locator('#brandChipSearch').evaluate(n=>n===document.activeElement),name+': focus moves to search');
   const listed=await page.locator('#brandChipOptions input[type="checkbox"]').count();
   assert.equal(listed,await page.evaluate(()=>manufacturers.length),name+': every brand is listed');
   const pb=await panel.boundingBox();
   assert.ok(pb.x>=0 && pb.x+pb.width<=viewport.width+0.5 && pb.y+pb.height<=viewport.height+0.5,name+': panel stays on screen '+JSON.stringify(pb));
   await page.screenshot({path:`${dir}/${name}-open.png`});
   if(name==='mobile'){
    // The phone keyboard shrinks the viewport: the panel stays open and fits above it.
    await page.setViewportSize({width:390,height:520});await page.waitForTimeout(150);
    assert.ok(await panel.isVisible(),'mobile: panel survives the keyboard resize');
    const kb=await panel.boundingBox();assert.ok(kb.y+kb.height<=520.5,'mobile: panel fits above the keyboard '+JSON.stringify(kb));
    await page.setViewportSize(viewport);await page.waitForTimeout(150);
   }

   // Search narrows the list.
   await page.locator('#brandChipSearch').fill('inno');
   const found=await page.locator('#brandChipOptions input[type="checkbox"]').evaluateAll(list=>list.map(n=>n.value));
   assert.ok(found.includes('Innova') && found.every(b=>b.toLowerCase().includes('inno')),name+': search filters '+found);

   // Pick Innova: the map filters, the chip names it, the drawer agrees.
   await page.locator('#brandChipOptions input[value="Innova"]').check();
   let s=await state();
   assert.deepEqual(s.brands,['Innova'],name+': Innova selected');assert.ok(s.onlyThose&&s.count>0,name+': only Innova on the map');
   assert.equal((await chip.textContent()).trim(),'Innova',name+': chip names the brand');
   assert.equal(await chip.getAttribute('data-active'),'true',name+': chip shows it is active');
   assert.ok(await drawerBox('Innova').isChecked(),name+': drawer shows the pick');
   assert.ok(await panel.isVisible(),name+': panel stays open for more picks');

   // A second brand.
   await page.locator('#brandChipSearch').fill('discraft');
   await page.locator('#brandChipOptions input[value="Discraft"]').check();
   assert.deepEqual((await state()).brands,['Discraft','Innova']);
   assert.equal((await chip.textContent()).trim(),'2 manufacturers',name+': two manufacturers');
   await page.screenshot({path:`${dir}/${name}-two.png`});

   // Escape closes and hands focus back to the chip.
   await page.keyboard.press('Escape');
   assert.ok(await panel.isHidden(),name+': Escape closes');
   assert.equal(await chip.getAttribute('aria-expanded'),'false');
   assert.ok(await chip.evaluate(n=>n===document.activeElement),name+': focus returns to the chip');

   // The drawer's change shows on the chip.
   await page.evaluate(()=>toggleBrand('Discraft'));
   assert.equal((await chip.textContent()).trim(),'Innova',name+': drawer edits update the chip');

   // Reopen: picks are listed first and checked; outside click closes.
   await chip.click();
   assert.equal(await page.locator('#brandChipSearch').inputValue(),'',name+': search starts empty');
   assert.equal(await page.locator('#brandChipOptions input').first().getAttribute('value'),'Innova',name+': picks first');
   assert.ok(await page.locator('#brandChipOptions input[value="Innova"]').isChecked());
   await page.mouse.click(viewport.width/2,6);
   assert.ok(await panel.isHidden(),name+': outside click closes');

   // Clear empties the filter.
   await chip.click();await page.locator('#brandChipClear').click();
   s=await state();
   assert.deepEqual(s.brands,[],name+': Clear empties the filter');
   assert.equal((await chip.textContent()).trim(),'Manufacturer');
   assert.equal(await chip.getAttribute('data-active'),'false');
   assert.ok(!(await drawerBox('Innova').isChecked()),name+': drawer cleared too');
   await page.keyboard.press('Escape');

   // Type chips still work beside it.
   await page.locator('#typeChips button[data-type="putter"]').click();
   assert.equal(await page.evaluate(()=>type),'putter',name+': type chips unaffected');
   assert.equal(await chip.getAttribute('data-active'),'false',name+': a type chip does not press Manufacturer');
   if(name==='mobile'){
    // The Directory scrolls under the toolbar: an open panel stays under its chip.
    await page.locator('#listTab').click();await page.waitForTimeout(300);
    assert.ok(await page.evaluate(()=>document.scrollingElement.scrollHeight>innerHeight+60),'mobile: the Directory scrolls');
    await chip.click();await page.evaluate(()=>scrollBy(0,60));await page.waitForTimeout(150);
    const [c2,p2]=[await chip.boundingBox(),await panel.boundingBox()];
    assert.ok(await panel.isVisible() && Math.abs(p2.y-(c2.y+c2.height+6))<1.5,'mobile: panel follows its chip on scroll '+JSON.stringify({c2,p2}));
    await page.keyboard.press('Escape');
   }
  }finally{await context.close();}
 }
 assert.deepEqual(errors,[],'No page errors');
 console.log('PASS: Manufacturer chip before Driver, searchable multi-select synced with the drawer, labels, Escape/outside close, Clear, phone row scrolls on one line.');
}
