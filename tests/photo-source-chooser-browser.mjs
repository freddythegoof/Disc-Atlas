import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {photoHarness,playwright} from './photo-harness.mjs';

const harness=await photoHarness(process.argv[2]),results=[];
mkdirSync('outputs/photo-phone',{recursive:true});
const openEditor=async page=>{
 await page.goto(harness.base);await page.addStyleTag({url:harness.base+'/cosmic.css'});
 await page.evaluate(async()=>{
  const sheet=document.createElement('dialog');sheet.id='sheet';sheet.style.cssText='width:min(420px,calc(100vw - 24px));padding:20px;background:var(--panel);color:var(--text)';
  sheet.innerHTML='<h2>Disc details</h2><div class="bag-photo-control" id="source-editor"></div><button id="close-sheet">Close sheet</button>';
  document.body.append(sheet);window.colors=[];window.sheetClosed=false;
  window.editor=(await import('/disc-photo.mjs')).createPhotoEditor(sheet.querySelector('#source-editor'),{onColor:color=>colors.push(color)});
  sheet.addEventListener('close',()=>{editor.reset(null);window.sheetClosed=true;});document.querySelector('#close-sheet').onclick=()=>sheet.close();sheet.showModal();
 });
 await page.locator('#sheet[open]').waitFor();
};
try{
 for(const [engine,device] of [['webkit','iPhone 16 Pro Max'],['chromium','Pixel 7']]){
  const browser=await playwright[engine].launch({headless:true});
  try{
   const options={...playwright.devices[device]};delete options.defaultBrowserType;
   const page=await browser.newPage(options);await openEditor(page);
   const chooser=page.locator('.bag-photo-source-menu'),trigger=page.locator('.bag-photo-choose');
   const open=()=>chooser.evaluate(el=>el.matches(':popover-open'));
   const untouched=async()=>assert.ok(await page.evaluate(()=>!editor.changed&&!editor.debug.used&&!editor.debug.draft&&colors.length===0&&document.querySelector('.bag-photo-thumb').hidden));
   let dialogs=0;page.on('filechooser',()=>dialogs++);
   await trigger.tap();
   // Fails before the fix because Add photo fires the capture input instead of a chooser.
   assert.equal(dialogs,0,engine+': Add photo must offer sources before opening a file dialog');
   assert.equal(await open(),true);assert.deepEqual(await chooser.locator('[data-photo-source]').allTextContents(),['Camera','Photo Library','Files']);
   assert.equal(await page.locator('.bag-photo-file').getAttribute('capture'),null,'default input never forces camera');
   await page.keyboard.press('Escape');assert.equal(await open(),false);assert.equal(await page.locator('#sheet').evaluate(el=>el.open),true,'Escape leaves bag sheet open');assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);await untouched();
   await trigger.tap();await page.locator('#sheet h2').tap();assert.equal(await open(),false);await untouched();
   await trigger.tap();await chooser.locator('[data-photo-source-cancel]').tap();assert.equal(await open(),false);await untouched();
   await trigger.tap();await trigger.tap();assert.equal(await open(),false,'trigger also toggles chooser closed');await untouched();
   const rows=[];let expected;
   for(const [source,accept,capture] of [['camera','image/*','environment'],['library','image/*',null],['files',null,null]]){
    const pick=async()=>{
     await trigger.tap();assert.equal(await open(),true);
     const [fileChooser]=await Promise.all([page.waitForEvent('filechooser'),chooser.locator(`[data-photo-source="${source}"]`).tap()]);
     assert.equal(await open(),false,'choosing a source dismisses popover');
     const input=fileChooser.element(),attrs=await input.evaluate(el=>({source:el.dataset.photoInput,accept:el.getAttribute('accept'),capture:el.getAttribute('capture')}));
     assert.deepEqual(attrs,{source,accept,capture});rows.push(attrs);return fileChooser;
    };
    // A cancelled OS picker (empty selection) cannot mutate an existing photo or sheet.
    await page.evaluate(()=>{window.previous=editor.debug.used;window.previousColors=colors.length;window.previousSheet={changed:editor.changed,thumb:document.querySelector('.bag-photo-thumb img').getAttribute('src'),status:document.querySelector('.bag-photo-status').textContent};});
    const cancelled=await pick();await cancelled.setFiles([]);
    assert.ok(await page.evaluate(()=>editor.debug.used===previous&&colors.length===previousColors&&!editor.debug.draft));
    assert.deepEqual(await page.evaluate(()=>({changed:editor.changed,thumb:document.querySelector('.bag-photo-thumb img').getAttribute('src'),status:document.querySelector('.bag-photo-status').textContent})),await page.evaluate(()=>previousSheet),'OS cancellation leaves sheet unchanged');
    // The same photo and transform must produce identical bytes through all three sources.
    const selected=await pick();await selected.setFiles(fileURLToPath(new URL('./fixtures/stamped-disc.webp',import.meta.url)));
    await page.locator('.photo-aligner[open]').waitFor();
    assert.deepEqual(await page.evaluate(()=>({...editor.debug.draft.options})),{scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5,rotate:0});
    await page.locator('[data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});
    const prepared=await page.evaluate(async()=>{const {blob,color}=editor.debug.used;return {type:blob.type,size:blob.size,color,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))]};});
    assert.equal(prepared.type,'image/webp');assert.ok(prepared.size<=512*1024);if(expected)assert.deepEqual(prepared,expected);else expected=prepared;
    assert.equal(await trigger.innerText(),'Replace photo');
    // Cancelling replacement framing also preserves the current photo.
    await page.evaluate(()=>{window.previous=editor.debug.used;window.previousColors=colors.length;});
    const replacement=await pick();await replacement.setFiles(fileURLToPath(new URL('./fixtures/disc-photo.heic',import.meta.url)));await page.locator('.photo-aligner[open]').waitFor();
    await page.locator('[data-aligner-cancel]').first().click();await page.waitForFunction(()=>editor.debug.draft===null);
    assert.ok(await page.evaluate(()=>editor.debug.used===previous&&colors.length===previousColors));
   }
   for(const theme of ['light','midnight','charcoal']){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await trigger.tap();
    const bounds=await chooser.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=options.viewport.width&&bounds.y+bounds.height<=options.viewport.height,'chooser stays on screen');
    await chooser.screenshot({path:`outputs/photo-phone/source-${engine}-${theme}.png`});await page.keyboard.press('Escape');
   }
   await trigger.tap();await page.evaluate(()=>editor.reset(null));assert.equal(await open(),false,'reset dismisses chooser');
   await trigger.tap();await page.evaluate(()=>document.querySelector('#sheet').close());await page.waitForFunction(()=>sheetClosed);assert.equal(await open(),false,'closing sheet dismisses chooser');
   results.push({engine,version:browser.version(),device,userAgent:await page.evaluate(()=>navigator.userAgent),coarse:await page.evaluate(()=>matchMedia('(pointer:coarse)').matches),routes:rows,prepared:expected,nativeOS:'Not exercised: filechooser interception verifies input routing, not iOS/Android native destinations'});
   await page.close();
   const desktop=await browser.newPage({viewport:{width:1440,height:1000}});await openEditor(desktop);
   const [normal]=await Promise.all([desktop.waitForEvent('filechooser'),desktop.locator('.bag-photo-choose').click()]);
   const attrs=await normal.element().evaluate(el=>({main:el.classList.contains('bag-photo-file'),capture:el.getAttribute('capture'),accept:el.accept}));
   assert.deepEqual(attrs,{main:true,capture:null,accept:'image/jpeg,image/png,image/webp,image/heic,image/heif'});await normal.setFiles([]);
   assert.equal(await desktop.locator('.bag-photo-source-menu').evaluate(el=>el.matches(':popover-open')),false);await desktop.close();
   console.log('PASS: '+engine+' '+device+' sources/capture, Add/Replace, outside/Esc/Cancel, OS/framing cancellation, shared decode/prepare and desktop picker');
  }finally{await browser.close();}
 }
 writeFileSync('outputs/photo-phone/source-chooser.json',JSON.stringify(results,null,2)+'\n');
}finally{await harness.close();}
