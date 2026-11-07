// The "Don't see a disc?" link and sheet on the real Worker and a local D1 (docs/disc-request-form.md).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {startServer,openDevice} from './display-harness.mjs';

const dir='work/disc-request',state=dir+'/d1',NONSENSE='qqzzxx nothing',LINK='Don’t see a disc?';
fs.mkdirSync(dir,{recursive:true});
const rows=()=>JSON.parse(execFileSync(process.execPath,['node_modules/wrangler/wrangler-dist/cli.js','d1','execute','disc-atlas-accounts','--local','--json','--config','tests/auth.wrangler.jsonc','--persist-to',state,'--command','SELECT * FROM disc_requests ORDER BY created_at,id'],{stdio:'pipe'}).toString())[0].results;
const site=await startServer({port:8871,state});
const device=await openDevice(site.base),{page}=device;
const shot=async name=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);await page.screenshot({path:`${dir}/${name}.png`});};
const search=async value=>{await page.locator('#search').fill(value);await page.waitForTimeout(80);};
const directoryLink=page.locator('#rows .disc-request-link'),mapLink=page.locator('#emptyRequest');
const sheet=page.locator('#discRequestDialog'),form=page.locator('#discRequestForm');
const field=name=>form.locator(`[name="${name}"]`),error=name=>form.locator(`[data-error-for="${name}"]`);
const send=()=>page.locator('#discRequestSend').click();
const settled=()=>page.waitForFunction(()=>!document.querySelector('#discRequestSend').disabled);
try{
 await page.goto(site.base);await page.waitForFunction(()=>discs?.length);

 // Map: a search that finds nothing offers the link; a real search and filters alone do not.
 await page.locator('#mapTab').click();await search(NONSENSE);
 await mapLink.waitFor();assert.equal(await mapLink.textContent(),LINK);assert.ok(await page.locator('#empty').isVisible());
 await shot('map-empty');
 await search('Destroyer');assert.ok(!await mapLink.isVisible(),'map: a real search has no link');assert.ok(!await page.locator('#empty').isVisible());
 await search('');await page.evaluate(()=>{$('#speed').value=15;$('#stability').value='unknown';filter();});
 assert.ok(await page.locator('#empty').isVisible(),'filters alone can empty the map');assert.ok(!await mapLink.isVisible(),'map: filters alone have no link');
 await page.evaluate(()=>reset());

 // Directory: the same.
 await page.locator('#listTab').click();await search(NONSENSE);
 await directoryLink.waitFor();assert.equal(await directoryLink.textContent(),LINK);
 assert.equal((await page.locator('#rows > .muted').innerText()).trim(),'No discs match these filters.','the message itself is unchanged');
 await shot('directory-empty');
 const withoutSearch=async()=>{await search('Destroyer');assert.equal(await directoryLink.count(),0,'directory: a real search has no link');assert.ok(await page.locator('#rows .disc-row').count()>0);};
 await withoutSearch();
 await search('');await page.evaluate(()=>{$('#speed').value=15;$('#stability').value='under';selectedTypes.add('putter');filter();});
 assert.equal(await page.locator('#rows .disc-row').count(),0,'filters alone can empty the directory');assert.equal(await directoryLink.count(),0,'directory: filters alone have no link');
 await page.evaluate(()=>reset());

 // The sheet opens from the link with the search carried over and the catalog's brands plus Other.
 await search(NONSENSE);await directoryLink.click();await sheet.waitFor();
 assert.equal(await field('discName').inputValue(),NONSENSE);
 const brands=await field('manufacturer').locator('option').allTextContents();
 assert.equal(brands.at(-1),'Other');assert.ok(brands.includes('Innova')&&brands.includes('Prodigy'));
 assert.equal(brands.length,2+await page.evaluate(()=>manufacturers.length));
 assert.ok(await page.locator('.disc-request-trap').evaluate(n=>n.getBoundingClientRect().right<0),'the honeypot is off screen');
 await shot('sheet');

 // Each input error is inline and keeps everything typed. The Worker decides; no row lands.
 await field('discName').fill('');await field('manufacturer').selectOption('Prodigy');
 await field('note').fill('kept note');await field('email').fill('player@example.com');await field('link').fill('https://example.com/kept');
 await send();await settled();
 assert.match(await error('discName').textContent(),/name/);
 assert.equal(await field('discName').getAttribute('aria-invalid'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'discName');
 for(const [name,value] of [['note','kept note'],['email','player@example.com'],['link','https://example.com/kept'],['manufacturer','Prodigy']])assert.equal(await field(name).inputValue(),value);
 await field('discName').fill('Zephyr');await field('speed').fill('12');await field('glide').fill('5');
 await send();await settled();
 assert.equal(await error('discName').textContent(),'');assert.match(await error('flight').textContent(),/all four/);
 assert.equal(await field('discName').inputValue(),'Zephyr');assert.equal(await field('speed').inputValue(),'12');assert.equal(await field('glide').inputValue(),'5');
 await shot('sheet-errors');
 await field('turn').fill('-2');await field('fade').fill('1.5');await field('link').fill('notalink');
 await send();await settled();
 assert.equal(await error('flight').textContent(),'');assert.match(await error('link').textContent(),/http/);
 assert.equal(await field('link').inputValue(),'notalink');assert.equal(await field('fade').inputValue(),'1.5');
 assert.equal(rows().length,0,'no invalid attempt wrote a row');

 // A real submission lands exactly one row with what was submitted.
 await field('link').fill('https://example.com/zephyr');
 await send();await page.locator('#discRequestThanks').waitFor();
 assert.equal(await page.locator('#discRequestThanks').textContent(),'Thanks — every request is reviewed by a human before a disc is added.');
 assert.ok(!await form.isVisible());
 await shot('sheet-thanks');
 let stored=rows();assert.equal(stored.length,1);
 const {id,created_at,...values}=stored[0];assert.ok(id&&created_at);
 assert.deepEqual(values,{disc_name:'Zephyr',manufacturer:'Prodigy',speed:12,glide:5,turn:-2,fade:1.5,link:'https://example.com/zephyr',note:'kept note',email:'player@example.com',status:'pending'});

 // Done returns to the page; the next opening starts clean.
 await page.locator('#discRequestDone button').click();await sheet.waitFor({state:'hidden'});
 assert.ok(await directoryLink.evaluate(n=>n===document.activeElement),'focus returns to the link');
 await directoryLink.click();await sheet.waitFor();
 assert.ok(await form.isVisible());assert.equal(await field('note').inputValue(),'');assert.equal(await field('discName').inputValue(),NONSENSE);

 // A filled honeypot gets the same thanks and no row.
 await field('manufacturer').selectOption('Other');
 await field('contact_time').evaluate(n=>{n.value='noon';});
 await send();await page.locator('#discRequestThanks').waitFor();
 assert.equal(rows().length,1,'the honeypot stored nothing');
 await page.locator('#discRequestDone button').click();await directoryLink.click();await sheet.waitFor();

 // Dismissing keeps a draft, and a rapid burst meets the throttle with the input intact.
 await field('manufacturer').selectOption('Other');await field('note').fill('burst');
 for(let i=0;i<4;i++){
  await send();await page.locator('#discRequestThanks').waitFor();
  await page.locator('#discRequestDone button').click();await directoryLink.click();await sheet.waitFor();
  await field('manufacturer').selectOption('Other');await field('note').fill('burst');
 }
 assert.equal(rows().length,5);
 await send();await settled();
 assert.match(await page.locator('#discRequestStatus').textContent(),/try again in an hour/);
 assert.equal(await field('note').inputValue(),'burst');assert.ok(await form.isVisible());
 assert.equal(rows().length,5,'the throttle stored nothing');
 await shot('sheet-throttled');
 await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});
 await directoryLink.click();await sheet.waitFor();assert.equal(await field('note').inputValue(),'burst','a dismissed draft stays');

 // A failed network keeps the input too.
 await page.route('**/api/disc-requests',route=>route.abort());await send();await settled();
 assert.match(await page.locator('#discRequestStatus').textContent(),/still here/);assert.equal(await field('note').inputValue(),'burst');
 await page.unroute('**/api/disc-requests');

 // Paper and Dusk, with the Appearance accent on the sheet's primary button and nothing else moved.
 for(const theme of ['paper','dusk']){
  await page.evaluate(theme=>document.querySelector(`[data-theme-choice="${theme}"]`).click(),theme);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);
  await shot('sheet-'+theme);
  const lime=await page.locator('#discRequestSend').evaluate(n=>getComputedStyle(n).backgroundColor);
  await page.evaluate(()=>DisplayPalette.set({accent:'violet'}));await page.waitForTimeout(150);
  const violet=await page.locator('#discRequestSend').evaluate(n=>getComputedStyle(n).backgroundColor);
  assert.notEqual(violet,lime,theme+': the accent reaches the sheet');
  await shot('sheet-'+theme+'-violet');
  await page.evaluate(()=>DisplayPalette.set({accent:'lime'}));await page.waitForTimeout(100);
 }
 await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});

 // A phone: both views, and the sheet fits without sideways scrolling.
 const phone=await openDevice(site.base,{viewport:{width:390,height:844},deviceScaleFactor:2,context:{hasTouch:true,isMobile:true}});
 try{
  await phone.page.goto(site.base);await phone.page.waitForFunction(()=>discs?.length);
  await phone.page.locator('#search').fill(NONSENSE);
  const link=phone.page.locator('#rows .disc-request-link');await link.waitFor();await phone.page.screenshot({path:`${dir}/phone-directory-empty.png`});
  await link.click();await phone.page.locator('#discRequestDialog').waitFor();await phone.page.waitForTimeout(200);
  await phone.page.screenshot({path:`${dir}/phone-sheet.png`});
  assert.ok(await phone.page.locator('#discRequestDialog').evaluate(n=>n.scrollWidth<=n.clientWidth),'no sideways scroll in the sheet');
  const box=await phone.page.locator('#discRequestSend').evaluate(n=>{n.scrollIntoView();const r=n.getBoundingClientRect();return{right:r.right,height:r.height};});
  assert.ok(box.right<=390&&box.height>=44);
  await phone.page.locator('#discRequestDialog .close').click();
  await phone.page.locator('#mapTab').click();await phone.page.waitForTimeout(200);
  await phone.page.locator('#emptyRequest').waitFor();await phone.page.screenshot({path:`${dir}/phone-map-empty.png`});
  assert.deepEqual(phone.errors,[]);
 }finally{await phone.close();}

 assert.deepEqual(device.errors,[]);
 console.log('Disc request browser suite passed.');
}finally{await device.close();site.stop();}
