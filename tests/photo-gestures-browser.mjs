import assert from 'node:assert/strict';
// docs/photo-adder-rework.md: this suite's photos go through today's aligner (tests/photo-flow.mjs).
import {frameByHand} from './photo-flow.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {photoHarness,playwright} from './photo-harness.mjs';

const characterize=process.argv.includes('--characterize'),ref=process.argv.find(a=>/^[0-9a-f]{7,40}$/.test(a));
const selected=process.argv.find(a=>a.startsWith('--scenario='))?.slice(11);
const harness=await photoHarness(ref),results=[];
const near=(actual,want,label)=>assert.ok(Math.abs(actual-want)<1e-5,`${label}: ${actual} != ${want}`);
try{
 const browser=await playwright.chromium.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:430,height:932},hasTouch:true,isMobile:true});
  for(const scenario of ['drag','pinch','mid-drag','cancel','partial-cancel','lostcapture','corrected-pinch','bounds','controls','reset','twist-seam','twist-lift'].filter(s=>!selected||s===selected)){
   const page=await context.newPage();await page.goto(harness.base);
   await page.evaluate(async()=>{
    const {createPhotoEditor}=await import('/disc-photo.mjs');window.editor=createPhotoEditor(document.querySelector('#editor'));
   });
   await page.locator('.bag-photo-file').setInputFiles(fileURLToPath(new URL('./fixtures/stamped-disc.webp',import.meta.url)));
   // The twist scenarios keep the fitted aligner (docs/photo-adder-rework.md): two fingers turn it, a tap moves its dot.
   const fitted=scenario.startsWith('twist-');
   await page.locator('.photo-aligner[open]').waitFor();
   if(fitted)await page.waitForFunction(()=>document.querySelector('.photo-aligner').dataset.fit==='fitted',null,{timeout:90000});else await frameByHand(page);
   await page.evaluate(()=>{
    window.events=[];
    const view=document.querySelector('.photo-aligner-view');
    for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture'])view.addEventListener(type,e=>events.push({event:type,id:e.pointerId,x:e.clientX,y:e.clientY,captured:view.hasPointerCapture(e.pointerId),options:{...editor.debug.draft?.options}}));
   });
   const rect=await page.locator('.photo-aligner-view').boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height/2,k=1.2/rect.width;
   const cdp=await context.newCDPSession(page);
   const point=(id,dx,dy=0)=>({id,x:x+dx,y:y+dy,radiusX:3,radiusY:3,force:1});
   const touch=async(type,points)=>{await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
   const state=()=>page.evaluate(()=>({...editor.debug.draft?.options}));
   const snapshots=[];
   const snap=async label=>{const options=await state();snapshots.push({label,options});return options;};
   if(scenario==='drag'){
    await touch('touchStart',[point(1,0)]);await touch('touchMove',[point(1,24,12)]);const moved=await snap('one-finger drag');await touch('touchEnd',[]);
    if(!characterize){near(moved.cx,.5-24*k*.94,'drag cx');near(moved.cy,.5-12*k*.94,'drag cy');near(moved.scale,.94,'drag scale');}
   }
   if(scenario==='pinch'||scenario==='corrected-pinch'){
    if(scenario==='corrected-pinch')await page.evaluate(()=>{for(const [key,value] of [['aspect',1.2],['angle',35],['perspective',.12]]){const el=document.querySelector(`[data-photo="${key}"]`);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}});
    // Off-center midpoint also moves, so this catches zoom-at-center implementations.
    const before=await state(),start=[point(1,-40,10),point(2,80,10)];
    await touch('touchStart',[start[0]]);await touch('touchStart',start);const landed=await snap('second finger down');
    await touch('touchMove',[point(1,-40,20),point(2,120,20)]);const out=await snap('pinch out + midpoint pan');
    await touch('touchMove',[point(1,-25,20),point(2,105,20)]);const inside=await snap('pinch in');await touch('touchEnd',[]);
    if(!characterize){
     assert.deepEqual(landed,before,'finger landing never changes transform');near(out.scale,.705,'pinch-out scale');near(inside.scale,.94*120/130,'pinch-in scale');
     if(scenario==='pinch'){near(out.cx,.5+20*k*.94-40*k*.705,'anchored cx');near(out.cy,.5+10*k*.94-20*k*.705,'anchored cy');}
     else{
      // Independent projective evaluation (literal corrected transform). Do not call photoPoint.
      const offset=(dx,dy,scale)=>{const a=35*Math.PI/180,c=Math.cos(a),s=Math.sin(a),u=dx*2*k*c+dy*2*k*s,v=-dx*2*k*s+dy*2*k*c,r=1254*scale/2,t=1+.12*v;return [(u*c-v*1.2*s)*r/t,(u*s+v*1.2*c)*r/t];};
      const old=offset(20,10,before.scale),now=offset(40,20,out.scale);
      near(out.cx,.5+(old[0]-now[0])/1254,'corrected anchor cx');near(out.cy,.5+(old[1]-now[1])/1254,'corrected anchor cy');
     }
    }
   }
   if(['mid-drag','cancel','partial-cancel','lostcapture'].includes(scenario)){
    await touch('touchStart',[point(1,-60)]);await touch('touchMove',[point(1,-40)]);const first=await snap('first drag');
    await touch('touchStart',[point(1,-40),point(2,60)]);const landed=await snap('second finger lands');
    await touch('touchMove',[point(1,-30),point(2,70)]);const two=await snap('two-finger pan');
    let released;
    if(scenario==='cancel'){
     await touch('touchCancel',[]);released=await snap('cancel');await touch('touchStart',[point(3,0)]);await touch('touchMove',[point(3,10)]);
    }else{
     if(scenario==='lostcapture')await page.evaluate(()=>{const v=document.querySelector('.photo-aligner-view'),id=events.find(e=>e.event==='pointerdown'&&e.x>215).id;v.releasePointerCapture(id);});
     // CDP cancels all touches together; inject just the single-pointer cancel boundary.
     if(scenario==='partial-cancel')await page.evaluate(()=>{const v=document.querySelector('.photo-aligner-view'),id=events.find(e=>e.event==='pointerdown'&&e.x>215).id;v.dispatchEvent(new PointerEvent('pointercancel',{pointerId:id,pointerType:'touch',bubbles:true}));});
     await touch('touchEnd',[point(2,70)]);released=await snap('second finger lifts / loses capture');
     await touch('touchMove',[point(1,-20)]);
    }
    const end=await snap('continued single drag');await touch('touchEnd',[]);
    if(!characterize){assert.deepEqual(landed,first,'second landing does not jump');assert.deepEqual(released,two,'release/cancel does not jump');near(two.cx,.5-30*k*.94,'mid-drag pan');near(two.scale,.94,'pan preserves scale');near(end.cx,.5-40*k*.94,'lift/cancel recovery');}
   }
   if(scenario==='bounds'){
    await touch('touchStart',[point(1,-20),point(2,20)]);await touch('touchMove',[point(1,-180),point(2,180)]);const enlarged=await snap('scale lower bound');
    await touch('touchMove',[point(1,-10),point(2,10)]);const reduced=await snap('scale upper bound');await touch('touchEnd',[]);
    if(!characterize){near(enlarged.scale,.3,'lower bound');near(reduced.scale,1,'upper bound');near(enlarged.cx,.5,'bound center');near(reduced.cx,.5,'bound center');}
   }
   if(scenario==='controls'){
    await touch('touchStart',[point(1,0)]);await touch('touchMove',[point(1,10)]);await touch('touchEnd',[]);
    await page.keyboard.press('Escape'); // Cancel and start fresh so desktop expectations stay literal.
    await page.waitForFunction(()=>editor.debug.draft===null);
    await page.locator('.bag-photo-file').setInputFiles(fileURLToPath(new URL('./fixtures/stamped-disc.webp',import.meta.url)));await page.locator('.photo-aligner[open]').waitFor();await frameByHand(page);
    await page.locator('.photo-aligner-adjust summary').click();
    const view=page.locator('.photo-aligner-view');await view.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('+');
    await page.evaluate(()=>document.querySelector('.photo-aligner-view').dispatchEvent(new WheelEvent('wheel',{deltaY:50,cancelable:true})));
    const keyboard=await snap('keyboard and wheel');
    await page.evaluate(()=>{for(const [key,value] of [['scale',.8],['aspect',1.1],['angle',45],['perspective',.08]]){const el=document.querySelector(`[data-photo="${key}"]`);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}});
    const sliders=await snap('sliders');
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+20,y+10);await page.mouse.up();const mouse=await snap('mouse drag');
    if(!characterize){near(keyboard.cx,.49,'keyboard cx');near(keyboard.scale,.93*Math.exp(.06),'wheel scale');assert.deepEqual([sliders.scale,sliders.aspect,sliders.angle,sliders.perspective],[.8,1.1,45,.08]);near(mouse.cx,.49-20*k*.8,'mouse cx');near(mouse.cy,.5-10*k*.8,'mouse cy');}
   }
   if(scenario==='reset'){
    await touch('touchStart',[point(1,0)]);await touch('touchMove',[point(1,20)]);await page.evaluate(()=>editor.reset(null));await touch('touchEnd',[]);
    await page.locator('.bag-photo-file').setInputFiles(fileURLToPath(new URL('./fixtures/stamped-disc.webp',import.meta.url)));await page.locator('.photo-aligner[open]').waitFor();await frameByHand(page);
    await touch('touchStart',[point(4,0)]);await touch('touchMove',[point(4,10)]);const reset=await snap('new draft drag after reset');await touch('touchEnd',[]);
    if(!characterize)near(reset.cx,.5-10*k*.94,'reset cx');
   }
   const turn=async(points,label)=>{await touch('touchMove',points);return snap(label);};
   if(scenario==='twist-seam'){
    // The fingers' line points straight left, so atan2 crosses ±180° mid-twist: a 1.9° turn, never a full one.
    const before=await state(),fixed=point(1,60);
    await touch('touchStart',[fixed]);await touch('touchStart',[fixed,point(2,-60,2)]);
    const above=await turn([fixed,point(2,-60,.5)],'above the seam'),below=await turn([fixed,point(2,-60,-2)],'across the seam');await touch('touchEnd',[]);
    const want=a=>Math.round((before.rotate+a*180/Math.PI)*10)/10;
    if(!characterize){
     near(above.rotate,want(Math.atan2(2,120)-Math.atan2(.5,120)),'turn before the seam');
     near(below.rotate,want(Math.atan2(2,120)+Math.atan2(2,120)),'turn across the seam');
     assert.deepEqual(below.H,before.H,'a twist never moves the dot');
    }
   }
   if(scenario==='twist-lift'){
    // Turn, then lift one finger and the other: the last finger up (it barely moved) is the turn ending, not a tap.
    const before=await state(),first=point(1,-50);
    await touch('touchStart',[first]);await touch('touchStart',[first,point(2,50)]);
    const turned=await turn([first,point(2,50,20)],'two-finger turn');
    await touch('touchEnd',[first]);await touch('touchMove',[point(1,-48,1)]);const lifted=await snap('second finger lifts, first jitters');
    await touch('touchEnd',[]);const done=await snap('last finger lifts');
    // A fresh tap afterwards still moves the dot: the turn's history ends with the last finger.
    await touch('touchStart',[point(3,30,-20)]);await touch('touchEnd',[]);const tapped=await snap('fresh tap');
    if(!characterize){
     assert.notEqual(turned.rotate,before.rotate,'two fingers turn it');assert.deepEqual(turned.H,before.H,'the turn keeps the dot');
     assert.deepEqual(lifted,turned,'the remaining finger neither drags nor turns');assert.deepEqual(done,turned,'lifting the last finger is not a tap');
     assert.notDeepEqual(tapped.H,done.H,'a later tap moves the dot');
    }
   }
   const events=await page.evaluate(()=>window.events),record={scenario,rect,snapshots,events};results.push(record);
   if(!characterize){assert.ok(events.filter(e=>e.event==='pointerdown').every(e=>e.captured),'each pointer has capture');const viewport=await page.evaluate(()=>({zoom:visualViewport.scale,scroll:scrollY}));assert.deepEqual(viewport,{zoom:1,scroll:0},'gesture never scrolls or zooms the page');}
   console.log(JSON.stringify(record));await page.close();
  }
  await context.close();
 }finally{await browser.close();}
 mkdirSync('outputs/photo-phone',{recursive:true});writeFileSync('outputs/photo-phone/gestures-'+(characterize?'before':'after')+'.json',JSON.stringify(results,null,2)+'\n');
 if(!characterize)console.log('PASS: CDP drag, anchored pinch in/out, mid-drag landing/lift, cancel/lostcapture recovery, corrected projection, desktop controls and reset, fitted twist across the seam and lifted finger by finger');
}finally{await harness.close();}
