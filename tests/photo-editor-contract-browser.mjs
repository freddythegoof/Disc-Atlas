import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {photoHarness,playwright} from './photo-harness.mjs';
const baseline=execFileSync('git',['show','f31fd41:public/disc-photo.mjs']).toString();
const harness=await photoHarness();
try{
 for(const engine of ['chromium','webkit']){
  const browser=await playwright[engine].launch({headless:true});
  try{
   const page=await browser.newPage({viewport:{width:430,height:932},hasTouch:true});await page.goto(harness.base);
   await page.route('**/baseline-photo.mjs',route=>route.fulfill({contentType:'text/javascript',body:baseline}));
   const parity=await page.evaluate(async()=>{
    const current=await import('/disc-photo.mjs'),before=await import('/baseline-photo.mjs');
    const image=await current.decodePhoto(await (await fetch('/fixtures/stamped-disc.webp')).blob());
    const rows=[];
    for(const options of [{},{scale:.705,cx:.4707772020725388,cy:.4853886010362694},{scale:.8,aspect:1.2,angle:35,perspective:.12,cx:.4,cy:.6}]){
     const a=current.albedoCanvas(image,options,512),b=before.albedoCanvas(image,options,512);
     const ap=a.canvas.getContext('2d').getImageData(0,0,512,512).data,bp=b.canvas.getContext('2d').getImageData(0,0,512,512).data;
     const x=await current.preparePhoto(image,options),y=await before.preparePhoto(image,options);
     const xb=new Uint8Array(await x.blob.arrayBuffer()),yb=new Uint8Array(await y.blob.arrayBuffer());
     rows.push({pixels:ap.every((v,i)=>v===bp[i]),color:a.color===b.color&&x.color===y.color,bytes:xb.length===yb.length&&xb.every((v,i)=>v===yb[i])});
    }
    image.close();window.editor=current.createPhotoEditor(document.querySelector('#editor'));return rows;
   });
   assert.deepEqual(parity,Array.from({length:3},()=>({pixels:true,color:true,bytes:true})),engine+' baseline processing parity');
   await page.locator('.bag-photo-file').setInputFiles(fileURLToPath(new URL('./fixtures/stamped-disc.webp',import.meta.url)));await page.locator('.photo-aligner[open]').waitFor();
   const guards=await page.evaluate(()=>{
    const dialog=document.querySelector('.photo-aligner'),stage=document.querySelector('.photo-aligner-stage'),button=dialog.querySelector('button');
    const dispatch=(target,type,touches=1)=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:{length:touches}});target.dispatchEvent(event);return event.defaultPrevented;};
    return {stage:getComputedStyle(stage).touchAction,dialog:getComputedStyle(dialog).touchAction,overflow:getComputedStyle(dialog).overflow,
     legacy:['gesturestart','gesturechange','gestureend'].map(t=>dispatch(dialog,t)),
     stageTouches:['touchstart','touchmove','touchend','dblclick'].map(t=>dispatch(stage,t)),
     controlTap:dispatch(button,'touchstart'),controlPinch:dispatch(button,'touchmove',2)};
   });
   assert.deepEqual(guards,{stage:'none',dialog:'manipulation',overflow:'hidden',legacy:[true,true,true],stageTouches:[true,true,true,true],controlTap:false,controlPinch:true},engine+' non-passive Safari guards');
   console.log('PASS: '+engine+' exact baseline pixels/color/WebP for three transforms; non-passive legacy/touch/double-tap guards and usable control taps');
  }finally{await browser.close();}
 }
}finally{await harness.close();}
