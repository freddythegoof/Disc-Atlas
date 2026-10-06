import assert from 'node:assert/strict';

export async function checkTypeChips(browser,base){
 const errors=[];
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  try{
   await page.goto(base);await page.waitForFunction(()=>discs.length&&filtered.length);
   if(name==='mobile')await page.locator('#mapTab').click();
   const chips=page.locator('#typeChips button');
   assert.deepEqual(await chips.allTextContents(),['Driver','Fairway','Midrange','Putter'],name+': chips in the required order');
   const pressed=()=>chips.evaluateAll(list=>list.filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.textContent));
   const state=()=>page.evaluate(()=>({type,types:[...new Set(filtered.map(typeOf))],count:filtered.length,sidebar:document.querySelector('#types .active').dataset.type}));
   const all=(await state()).count;
   assert.deepEqual(await pressed(),[],name+': default is All, nothing pressed');
   const geometry=await page.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect(),s=r('.explore-tools .search'),c=r('#typeChips');return {searchBottom:s.bottom,searchRight:s.right,chipsTop:c.top,chipsLeft:c.left,searchTop:s.top};});
   if(name==='desktop')assert.ok(geometry.chipsLeft>geometry.searchRight+8&&Math.abs(geometry.chipsTop-geometry.searchTop)<20,'desktop: chips sit beside the search bar with room to breathe');
   else assert.ok(geometry.chipsTop>=geometry.searchBottom,'mobile: chips wrap below the search bar');
   for(const [label,type] of [['Driver','distance'],['Fairway','fairway'],['Midrange','mid'],['Putter','putter']]){
    await chips.filter({hasText:new RegExp('^'+label+'$')}).click();
    const s=await state();
    assert.deepEqual(await pressed(),[label],name+': only '+label+' pressed');
    assert.deepEqual(s.types,[type],name+': '+label+' filters the map to '+type);
    assert.equal(s.sidebar,type,name+': sidebar type list stays in sync');
   }
   await chips.filter({hasText:/^Putter$/}).click();
   const cleared=await state();
   assert.deepEqual(await pressed(),[],name+': clicking the active chip clears the filter');
   assert.equal(cleared.count,all,name+': clearing restores every disc');
   assert.equal(cleared.sidebar,'all',name+': sidebar returns to All');
   await chips.filter({hasText:/^Fairway$/}).click();
   await page.fill('#search','d');
   const combined=await page.evaluate(()=>({n:filtered.length,ok:filtered.every(d=>typeOf(d)==='fairway'&&searchText(d).includes('d'))}));
   assert.ok(combined.n>0&&combined.ok,name+': search and type combine (type AND query)');
   const searchOnly=await page.evaluate(()=>discs.filter(d=>inLens(d)&&searchText(d).includes('d')).length);
   assert.ok(combined.n<searchOnly,name+': the type narrows the search results');
   await page.fill('#search','');
   assert.equal((await state()).types.length,1,name+': type persists after clearing the search');
   await page.locator('#filtersToggle').click();await page.locator('#types [data-type="all"]').click();
   assert.deepEqual(await pressed(),[],name+': sidebar All also clears the chips');
   await page.locator('#types [data-type="mid"]').click();
   assert.deepEqual(await pressed(),['Midrange'],name+': sidebar choice lights the matching chip');
  }finally{await context.close();}
 }
 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: type chips order, wrap, single-select toggle, search combination and sidebar sync on desktop and mobile.');
}
