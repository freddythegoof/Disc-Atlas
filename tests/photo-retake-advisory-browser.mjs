// The capture gate is advisory (docs/stamp-pipeline-v2.md §11): when its analysis fails, every Make path still goes on
// into extraction and makes the game asset, with no retake prompt. The failure is injected where a phone refuses it: the
// glare check's scratch array (16 MiB at the 2048 crop), served from a copy of public/disc-photo-qa.mjs that throws there.
// In the real app on the local signed-in harness, with a drawn soft photo made at run time (never a player's photo), so
// each make would otherwise add the soft-photo prompt:
//   a new photo   · Use photo makes the asset in the sheet; the status exactly as for a sharp photo;
//   one click     · Game asset from the saved photo: made, saved to the account, no prompt;
//   the original  · "Use a higher-resolution original instead": made from the aligner, no prompt.
// PHOTO_STAMP_ENGINE=webkit runs it at phone size in WebKit with touch.
//   node tests/photo-retake-advisory-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
import {frameByHand,keepPhotoLook} from './photo-flow.mjs';
import {RETAKE} from '../public/disc-photo-qa.mjs';
const sharp=createRequire(import.meta.url)('sharp');

// tests/photo-retake-browser.mjs's soft photo: a teal disc with a dark print filling the aligner's default framing.
const DIR='work/photo-retake-advisory/synthetic';fs.mkdirSync(DIR,{recursive:true});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="3000"><rect width="3000" height="3000" fill="#3a3530"/><g transform="translate(1500 1500)"><circle r="1410" fill="#5c9daa"/>`+
 `<circle r="640" fill="none" stroke="#1d2026" stroke-width="30"/><text y="60" font-family="Helvetica" font-size="300" font-weight="bold" text-anchor="middle" fill="#1d2026">DRIVER</text>`+
 Array.from({length:16},(_,i)=>`<rect x="${-480+i*60}" y="240" width="16" height="70" fill="#1d2026"/>`).join('')+`</g></svg>`;
const soft=DIR+'/soft.jpg';
await sharp(await sharp(Buffer.from(svg)).png().toBuffer()).blur(14).jpeg({quality:92}).toFile(soft);

// The gate's module, failing at the glare check's allocation. Each failure is counted on the page, so a make that never
// ran the analysis cannot pass for one that survived it.
const ALLOCATION='const stack=new Int32Array(N);';
const failing=source=>{
 assert.ok(source.includes(ALLOCATION),'the glare check still allocates its scratch array where this suite injects');
 return source.replace(ALLOCATION,"const stack=(globalThis.__gateFailures=(globalThis.__gateFailures||0)+1,(()=>{throw new RangeError('Array buffer allocation failed');})());");
};

const engine=process.env.PHOTO_STAMP_ENGINE||'chromium',phone=engine==='webkit';
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8899),state:'work/photo-retake-advisory/d1-test',engine,
 ...phone&&{viewport:{width:390,height:844},deviceScaleFactor:2,context:{hasTouch:true,isMobile:true}}});
const {page,context,base,errors}=h;
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
const status=()=>page.locator('#addDiscDialog .bag-photo-status').textContent();
const done=()=>page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:180000});
const failures=()=>page.evaluate(()=>globalThis.__gateFailures||0);
try{
 await context.route(/\/disc-photo-qa\.mjs(\?|$)/,async route=>{const response=await route.fetch();await route.fulfill({response,body:failing(await response.text())});});
 await h.signIn();
 await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'}]);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=1);
 const A=(await (await page.request.get(base+'/api/bag')).json()).discs[0].id;
 const edit=async()=>{await page.locator(`[data-bag-edit="${A}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 const stamp=()=>page.evaluate(id=>fetch('/api/bag/stamps',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json()).then(d=>d.stamps.find(s=>s.disc_id===id)||null),A);
 const MADE='Game asset made. It’s saved with the photo when you save this disc.',SAVED='Full-color asset made. Saved to your account.';

 log('a new photo');
 await edit();let before=await failures();
 await page.setInputFiles('#addDiscDialog .bag-photo-file',soft);await page.waitForSelector('dialog.photo-aligner[open]');await frameByHand(page);
 await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});await done();
 assert.equal(await failures(),before+1,'the analysis ran and failed');
 assert.equal(await status(),MADE,'the make went on: the asset made, with no prompt');
 assert.ok(!(await status()).includes(RETAKE.sharpness));

 log('one click');
 await keepPhotoLook(page);await page.locator('#saveDisc').click();
 await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
 await edit();before=await failures();
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();await done();
 assert.equal(await failures(),before+1,'the analysis ran and failed');
 assert.equal(await status(),SAVED);
 const first=await stamp();assert.ok(first?.color,'the asset is on the account');

 log('the original');
 before=await failures();
 const chooser=page.waitForEvent('filechooser');await page.locator('#addDiscDialog .bag-photo-asset-original').click();await (await chooser).setFiles(soft);
 await page.waitForSelector('dialog.photo-aligner[open]');await frameByHand(page);
 await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:180000})
  .catch(async e=>{throw Error('the aligner kept: '+await page.locator('dialog.photo-aligner .photo-aligner-status').textContent(),{cause:e});});
 assert.equal(await failures(),before+1,'the analysis ran and failed');
 assert.equal(await status(),SAVED);
 const second=await stamp();assert.ok(second?.color,'the asset is on the account');
 assert.notDeepEqual(second,first,'a new asset was made from the original');

 assert.deepEqual(errors,[]);
 console.log('photo retake advisory ('+engine+'): pass');
}finally{await h.stop();}
