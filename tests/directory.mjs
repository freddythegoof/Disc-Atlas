import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkDirectory(browser,base){
 const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'light'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 fs.mkdirSync('outputs/directory',{recursive:true});
 const ready=()=>page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);
 const capture=async name=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);await page.screenshot({path:`outputs/directory/${name}.png`});};
 try{
  await page.goto(base);await ready();
  assert.equal(await page.locator('body').getAttribute('data-view'),'list','Mobile opens in Directory');
  assert.equal(await page.locator('#sort').inputValue(),'featured','First-time visitors get Featured');
  assert.deepEqual(await page.evaluate(()=>filtered.slice(0,3).map(d=>d.name)),['Destroyer','Buzzz','Zone']);
  await page.evaluate(()=>{$('#collection').value='all';filter();});
  assert.deepEqual(await page.evaluate(()=>filtered.slice(0,3).map(d=>d.name)),['Destroyer','Buzzz','Aviar'],'Featured respects the collection filter');
  await page.evaluate(()=>{$('#collection').value='current';filter();});
  assert.equal(await page.locator('[data-sort="featured"]').getAttribute('aria-pressed'),'true');
  await capture('mobile-initial');
  await page.locator('#mapTab').click();await page.reload();await ready();
  assert.equal(await page.locator('body').getAttribute('data-view'),'list','Reload ignores the previous map choice');
  for(const width of [320,700,701,1440]){
   await page.setViewportSize({width,height:900});await page.reload();await ready();
   assert.equal(await page.locator('body').getAttribute('data-view'),width<=700?'list':'map');
  }
  await page.locator('#listTab').click();
  await capture('featured-desktop');
  await page.locator('[data-sort="name"]').click();
  assert.ok(await page.evaluate(()=>filtered.every((d,i)=>!i||filtered[i-1].name.localeCompare(d.name)<=0)));
  const featured=page.locator('[data-sort="featured"]');
  await featured.focus();await page.keyboard.press('Enter');
  await page.locator('#search').fill('Discraft');
  assert.deepEqual(await page.evaluate(()=>filtered.slice(0,2).map(d=>d.name)),['Buzzz','Zone'],'Featured respects filters');
  await page.locator('#search').fill('');
  assert.ok(await page.evaluate(()=>{
   const ranked=new Set(window.DiscAtlasFeatured.map(d=>d.id)),rest=filtered.filter(d=>!ranked.has(d.id));
   return rest.length>0&&filtered.slice(-rest.length).every((d,i)=>d===rest[i]&&(!i||rest[i-1].name.localeCompare(d.name)<=0));
  }),'Unfeatured molds remain available alphabetically after the curated picks');
  await page.keyboard.press('Tab');
  await featured.focus();await page.keyboard.press('Space');
  assert.equal(await featured.getAttribute('aria-pressed'),'true','Repeated activation keeps Featured');
  for(const theme of ['light','midnight','charcoal']){
   await page.evaluate(theme=>applyTheme(theme),theme);
   assert.ok(await featured.evaluate(el=>getComputedStyle(el).backgroundColor!==getComputedStyle(document.querySelector('[data-sort="name"]')).backgroundColor),'Active sort has a distinct fill');
   await capture(`featured-${theme}`);
  }
  await page.setViewportSize({width:320,height:844});
  await page.waitForTimeout(250);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Featured fits small screens');
  await capture('featured-mobile');
  await page.setViewportSize({width:1440,height:900});
  const speed=page.locator('[data-sort="speed"]');
  const speeds=()=>page.locator('.disc-row .nums').allTextContents().then(rows=>rows.map(s=>Number(s.trim().split('/')[0])));
  await speed.click();let values=await speeds();
  assert.ok(values[0]>=14&&values.every((v,i)=>!i||v<=values[i-1]),'First click sorts fastest first');
  assert.match(await speed.innerText(),/↓/);await capture('speed-fastest');
  await speed.click();values=await speeds();
  assert.ok(values[0]<=1&&values.every((v,i)=>!i||v>=values[i-1]),'Second click sorts slowest first');
  assert.match(await speed.innerText(),/↑/);await capture('speed-slowest');
  await speed.focus();await page.keyboard.press('Enter');
  assert.ok((await speeds())[0]>=14,'Keyboard toggles back to fastest');
  await page.evaluate(()=>{$('#collection').value='all';filter();});
  await speed.click();
  assert.ok(await page.evaluate(()=>{const firstUnknown=filtered.findIndex(d=>d.speed==null);return firstUnknown>0&&filtered.slice(firstUnknown).every(d=>d.speed==null);}), 'Unrated discs remain last in ascending order');
  for(const [sort,label] of [['stability','Stability'],['new','Newest']]){
   const button=page.locator(`[data-sort="${sort}"]`);
   // Include absent dates and scores: neither may jump ahead of real values.
   await page.evaluate(()=>{window.sortFixtures=[{...discs[0],id:'sort-undated',date:null,speed:null,turn:null,fade:null},{...discs[0],id:'sort-empty-date',date:'',speed:null,turn:null,fade:null}];discs.push(...sortFixtures);});
   for(const [direction,action] of [['descending','click'],['ascending','Enter'],['descending','Space']]){
    if(action==='click')await button.click();else{await button.focus();await page.keyboard.press(action);}
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.match(await button.innerText(),direction==='ascending'?/↑/:/↓/);
    const current=sort==='stability'?(direction==='ascending'?'most understable first':'most overstable first'):(direction==='ascending'?'oldest first':'newest first');
    assert.equal(await button.getAttribute('aria-label'),`${label}: ${current}`);
    assert.ok((await button.getAttribute('title')).toLowerCase().startsWith(current+'.'));
    assert.equal(await page.locator('#sortBar [aria-pressed="true"]').count(),1);
    assert.ok(await page.evaluate(({sort,direction})=>{
     const values=filtered.map(d=>sort==='stability'?score(d):d.date?Date.parse(d.date):null);
     let missing=false,previous=null;
     return values.every(v=>{if(v==null||!Number.isFinite(v)){missing=true;return true;}if(missing)return false;const ordered=previous==null||(direction==='ascending'?v>=previous:v<=previous);previous=v;return ordered;});
    },{sort,direction}),`${label} ${direction} orders values with missing values last`);
    if(action!=='Space'){
     await page.evaluate(()=>{discs=discs.filter(d=>!sortFixtures.includes(d));filter();});
     await capture(`${sort}-${direction}`);
     await page.evaluate(()=>{discs.push(...sortFixtures);filter();});
    }
   }
   await button.click();await speed.click();await button.click();
   assert.match(await button.innerText(),/↓/,'Switching sorts restores default direction');
   await page.evaluate(()=>{discs=discs.filter(d=>!sortFixtures.includes(d));filter();});
  }
  for(const width of [320,390,700,701,1440]){
   await page.setViewportSize({width,height:844});
   for(const y of [0,600,2400]){
    await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(80);
    assert.ok(await page.evaluate(()=>{
     const b=document.querySelector('#coachButton').getBoundingClientRect();
     return b.width<=44&&b.height<=44&&[...document.querySelectorAll('.disc-row .score')].every(el=>{
      const r=el.getBoundingClientRect();return b.right<=r.left||b.left>=r.right||b.bottom<=r.top||b.top>=r.bottom;
     });
    }),`Coach never covers scores at ${width}px, scroll ${y}`);
   }
  }
  await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>{reset();document.activeElement.blur();scrollTo(0,0);});
  await capture('coach-clear-index');
  await page.getByRole('button',{name:'Atlas Coach',exact:true}).click();
  assert.ok(await page.locator('#coachDialog').isVisible());
  assert.ok(await page.evaluate(()=>{
   const picks=window.DiscAtlasFeatured;
   return new Set(picks.map(d=>d.id)).size===picks.length&&picks.every(p=>discs.some(d=>d.id===p.id&&d.name===p.name&&d.brand===p.brand));
  }),'Every curated pick matches a distinct catalog record');
  await page.route('**/featured.js',route=>route.abort());
  await page.reload();await ready();await page.locator('#listTab').click();
  assert.ok(await page.evaluate(()=>filtered.length>0&&filtered.every((d,i)=>!i||filtered[i-1].name.localeCompare(d.name)<=0)),'Missing curated asset leaves a usable alphabetical directory');
  assert.deepEqual(errors,[]);
  console.log('PASS: Featured default/ranking/filters/fallback, active sort in three themes, mobile wrapping, other sort directions, Enter/Space, missing values last, accessible labels, coach/score separation.');
 }finally{await context.close();}
}
