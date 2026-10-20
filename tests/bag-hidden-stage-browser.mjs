// A pulled disc while the bag goes out of view: with its details docked beside the bag, switching
// My Bag to the gallery hides the bag canvas, and the details panel and resize observers that
// restage out discs must wait for a bag they can measure. Coming back lays the disc out again.
// Run with `node tests/bag-hidden-stage-browser.mjs`.
import assert from 'node:assert/strict';
import {BAG,startHarness} from './display-harness.mjs';

const h=await startHarness({port:8871,state:'work/bag-hidden-stage/d1'});
const {page,base,errors}=h;
const scene=page.locator('#bagScene');
try{
 await h.signIn();await h.seedBag(BAG.slice(0,2));
 await page.goto(base+'/?bag=1');
 const row=page.locator('[data-bag-inspect]').first(),id=await row.getAttribute('data-bag-inspect');
 await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.engine==='ready',null,{timeout:30000});
 await row.click();
 await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open',null,{timeout:30000});
 await page.locator(`[data-physical-disc="${id}"]`).click();
 await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.out==='1',null,{timeout:15000});
 await page.waitForTimeout(800);
 assert.deepEqual(errors,[],'No page errors before the switch');

 await page.locator('#myBagViews [data-bag-view="gallery"]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').clientWidth);
 await page.waitForTimeout(1500);
 assert.deepEqual(errors,[],'Hiding the bag with a disc out raises no page errors');

 await page.locator('#myBagViews [data-bag-view="bag"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').clientWidth>0);
 await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.out==='1' && s.dataset.staging==='still';},null,{timeout:15000});
 const back=await page.evaluate(key=>{const v=document.querySelector('[data-bag-canvas]').bagViewer;return {out:v.outDiscs,bag:!!v.bagRect()};},id);
 assert.deepEqual(back,{out:[id],bag:true},'Back in the bag view, the disc is still out and the bag measures');
 assert.deepEqual(errors,[],'Returning to the bag raises no page errors');
 console.log('bag hidden stage: ok');
}finally{await h.stop();}
