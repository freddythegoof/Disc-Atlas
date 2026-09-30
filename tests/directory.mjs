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
  await capture('mobile-initial');
  await page.locator('#mapTab').click();await page.reload();await ready();
  assert.equal(await page.locator('body').getAttribute('data-view'),'list','Reload ignores the previous map choice');
  for(const width of [320,700,701,1440]){
   await page.setViewportSize({width,height:900});await page.reload();await ready();
   assert.equal(await page.locator('body').getAttribute('data-view'),width<=700?'list':'map');
  }
  await page.locator('#listTab').click();
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
  assert.deepEqual(errors,[]);
  console.log('PASS: mobile defaults/reload/breakpoint, both speed directions, keyboard, unrated-last, coach/score separation at five widths and three scroll positions.');
 }finally{await context.close();}
}
