// The capture gate's retake prompts in the product (docs/stamp-pipeline-v2.md §11): a make from a soft photo still makes
// the game asset, and says how a retake would read better: the prompts in their own list under the make's words, one per
// line with a warning mark, scrolled into view (the feel check, Nov 26: at 1280 × 800 they sat below the fold). In the
// real app on the local signed-in harness, with drawn synthetic photos made at run time (never a player's photo):
//   a new photo, soft      · Use photo makes the asset in the sheet; the blurry-photo prompt under it, Retake photo beside;
//   a new photo, sharp     · the same make, no prompt: the status exactly as before, the list and Retake photo hidden;
//   Look → Photo           · the make's words give way to what shows, and the prompts clear with them;
//   one click, soft        · Game asset from the saved soft photo: made and saved, the prompt under it;
//   the original, small    · "Use a higher-resolution original instead" with a small disc: the move-closer prompt;
//   the original, unfilled · a disc with pixels enough that leaves the frame empty: the fill prompt, never "small".
// Screenshots of each prompt, in the default theme and on Paper and Dusk, go to docs/assets/stamp-pipeline-v2/, with the
// whole window once a prompt shows (-viewport). PHOTO_STAMP_ENGINE=webkit runs it at phone size in WebKit with touch.
//   node tests/photo-retake-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
import {frameByHand,keepPhotoLook} from './photo-flow.mjs';
import {RETAKE} from '../public/disc-photo-qa.mjs';
const sharp=createRequire(import.meta.url)('sharp');

// A teal disc with a dark print filling the aligner's default framing of a 3000 × 3000 photo; `blur` softens it the way
// a missed focus does, `k` draws it that share of the size (a third: a disc far from the camera; 0.6: one with pixels
// enough that still leaves the frame empty).
const DIR='work/photo-retake/synthetic';fs.mkdirSync(DIR,{recursive:true});
const photo=async(file,{blur=0,k=1}={})=>{
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="3000"><rect width="3000" height="3000" fill="#3a3530"/><g transform="translate(1500 1500) scale(${k})"><circle r="1410" fill="#5c9daa"/>`+
  `<circle r="640" fill="none" stroke="#1d2026" stroke-width="30"/><text y="60" font-family="Helvetica" font-size="300" font-weight="bold" text-anchor="middle" fill="#1d2026">DRIVER</text>`+
  Array.from({length:16},(_,i)=>`<rect x="${-480+i*60}" y="240" width="16" height="70" fill="#1d2026"/>`).join('')+`</g></svg>`;
 let img=sharp(Buffer.from(svg));if(blur)img=sharp(await img.png().toBuffer()).blur(blur);
 await img.jpeg({quality:92}).toFile(file);return file;
};
const soft=await photo(DIR+'/soft.jpg',{blur:14}),crisp=await photo(DIR+'/sharp.jpg'),far=await photo(DIR+'/small.jpg',{k:1/3}),loose=await photo(DIR+'/loose.jpg',{k:.6});

const engine=process.env.PHOTO_STAMP_ENGINE||'chromium',phone=engine==='webkit';
const SHOTS='docs/assets/stamp-pipeline-v2';fs.mkdirSync(SHOTS,{recursive:true});
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8897),state:'work/photo-retake/d1-test',engine,
 ...phone?{viewport:{width:390,height:844},deviceScaleFactor:2,context:{hasTouch:true,isMobile:true}}:{viewport:{width:1280,height:800}}});
const {page,base,errors}=h;
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
const status=()=>page.locator('#addDiscDialog .bag-photo-status').textContent();
// The prompts on show: each line's words, with whether the list is in the window once its scroll settles.
const prompts=async()=>{
 await page.waitForTimeout(700);
 return page.evaluate(()=>{const list=document.querySelector('#addDiscDialog .photo-retake'),r=list.getBoundingClientRect();
  return {lines:list.hidden?[]:[...list.children].map(li=>li.textContent),marks:list.querySelectorAll('li > svg.photo-retake-mark').length,role:list.getAttribute('role'),
   inView:!list.hidden&&r.top>=0&&Math.max(r.bottom,document.querySelector('#addDiscDialog .bag-photo-retake-photo').getBoundingClientRect().bottom)<=innerHeight,retake:!document.querySelector('#addDiscDialog .bag-photo-retake-photo').hidden};});
};
const done=()=>page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:180000});
// The sheet's photo section, with the status line, in the default theme, then on Paper and Dusk.
const shoot=async name=>{
 const section=page.locator('#bagPhoto');await section.scrollIntoViewIfNeeded();
 const themes=[null,'paper','dusk'],start=await page.evaluate(()=>document.documentElement.dataset.theme||'');
 for(const theme of themes){
  if(theme){await page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);}
  await section.screenshot({path:`${SHOTS}/${name}-${phone?'phone':'desktop'}-${theme||'default'}.png`});
 }
 if(start)await page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`)?.click(),start);
};
try{
 await h.signIn();
 await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'},{mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'}]);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 const items=()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
 const all=await items(),A=all.find(i=>i.mold_id==='3d60892b6812').id,B=all.find(i=>i.mold_id==='7446eb39abe5').id;
 const edit=async id=>{await page.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 const closeSheet=async()=>{await page.evaluate(()=>{window.__sheetClosed=new Promise(r=>document.querySelector('#addDiscDialog').addEventListener('close',()=>setTimeout(r),{once:true}));});await page.keyboard.press('Escape');await page.evaluate(()=>window.__sheetClosed);};
 const usePhoto=async file=>{
  await page.setInputFiles('#addDiscDialog .bag-photo-file',file);await page.waitForSelector('dialog.photo-aligner[open]');await frameByHand(page);
  await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});await done();
 };
 const MADE='Game asset made. It’s saved with the photo when you save this disc.';

 log('new photo, soft');
 await edit(A);await usePhoto(soft);
 assert.equal(await status(),MADE,'the make’s words alone on their line');
 let seen=await prompts();
 assert.deepEqual(seen.lines,[RETAKE.sharpness],'the soft photo is named, on its own line');
 assert.equal(seen.marks,1);assert.equal(seen.role,'status');assert.ok(seen.inView,'scrolled into view');assert.ok(seen.retake,'Retake photo beside it');
 await page.screenshot({path:`${SHOTS}/retake-new-photo-soft-${phone?'phone':'desktop'}-viewport.png`});
 await shoot('retake-new-photo-soft');

 log('new photo, sharp');
 await usePhoto(crisp);
 assert.equal(await status(),MADE,'a sharp photo: the status as before');
 seen=await prompts();assert.deepEqual(seen.lines,[]);assert.ok(!seen.retake);

 log('Look → Photo');
 await usePhoto(soft);assert.deepEqual((await prompts()).lines,[RETAKE.sharpness]);
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Photo'}).first().click();
 assert.match(await status(),/^Showing the photo\./,'no "Game asset made" while the photo shows');
 assert.deepEqual((await prompts()).lines,[],'the prompts clear with the words they came with');

 log('one click, soft');
 // The soft photo saved wearing Photo, then Game asset in one click from it.
 await usePhoto(soft);await keepPhotoLook(page);await page.locator('#saveDisc').click();
 await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
 await edit(A);await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();await done();
 assert.equal(await status(),'Full-color asset made. Saved to your account.');
 assert.deepEqual((await prompts()).lines,[RETAKE.sharpness]);
 const stamp=await page.evaluate(id=>fetch('/api/bag/stamps',{credentials:'same-origin'}).then(r=>r.json()).then(d=>d.stamps.find(s=>s.disc_id===id)||null),A);
 assert.ok(stamp?.color,'the prompt never stops the make: the asset is on the account');
 await shoot('retake-one-click-soft');
 await closeSheet();

 log('original, small');
 // A disc far from the camera, read through "Use a higher-resolution original instead" on a disc whose photo is sharp.
 await edit(B);await usePhoto(crisp);await keepPhotoLook(page);await page.locator('#saveDisc').click();
 await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
 await edit(B);
 const chooser=page.waitForEvent('filechooser');await page.locator('#addDiscDialog .bag-photo-asset-original').click();await (await chooser).setFiles(far);
 await page.waitForSelector('dialog.photo-aligner[open]');
 // The small disc, framed by hand: the aligner's circle drawn down onto it, 0.31 of the photo's 3000 px.
 await frameByHand(page);
 await page.evaluate(()=>{const s=document.querySelector('dialog.photo-aligner [data-photo="scale"]');s.value='0.31';s.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]')||/move closer/.test(document.querySelector('dialog.photo-aligner .photo-aligner-status')?.textContent||''),null,{timeout:180000});
 const lines=await page.evaluate(()=>[...document.querySelector('dialog.photo-aligner[open] .photo-retake, #addDiscDialog .photo-retake').children].map(li=>li.textContent));
 // Worst first: a disc this small is also soft once read across the 2048 crop, so its own prompt may follow.
 assert.ok(lines.includes(RETAKE.resolution),lines.join(' | '));assert.ok(!lines.includes(RETAKE.fill),'small, not unfilled');
 await shoot('retake-original-small');

 log('original, unfilled');
 // 0.6 of the full disc: 1692 px across, pixels enough, yet 0.56 of the 3000 px short side, under the fill line.
 const loose2=page.waitForEvent('filechooser');await page.locator('#addDiscDialog .bag-photo-asset-original').click();await (await loose2).setFiles(loose);
 await page.waitForSelector('dialog.photo-aligner[open]');await frameByHand(page);
 await page.evaluate(()=>{const s=document.querySelector('dialog.photo-aligner [data-photo="scale"]');s.value='0.56';s.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>/Fill the frame/.test(document.querySelector('#addDiscDialog .photo-retake')?.textContent||'')&&!document.querySelector('dialog.photo-aligner[open]')||document.querySelector('dialog.photo-aligner[open] .photo-retake li'),null,{timeout:180000});
 await page.waitForTimeout(700);
 seen=await page.evaluate(()=>[...document.querySelector('dialog.photo-aligner[open] .photo-retake, #addDiscDialog .photo-retake').children].map(li=>li.textContent));
 assert.ok(seen.includes(RETAKE.fill),seen.join(' | '));assert.ok(!seen.includes(RETAKE.resolution),'a disc with pixels enough is not told it is small');
 await page.screenshot({path:`${SHOTS}/retake-original-fill-${phone?'phone':'desktop'}-viewport.png`});
 await shoot('retake-original-fill');

 assert.deepEqual(errors,[]);
 console.log('photo retake prompts ('+engine+'): pass');
}finally{await h.stop();}
