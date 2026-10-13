// Native Chromium input, including touch default actions (dispatchEvent is not a drag).
import assert from 'node:assert/strict';

export async function dragRange(page, selector, target, {touch=false, steps=10, observe}={}) {
 const input=page.locator(selector);
 await input.scrollIntoViewIfNeeded();
 await page.waitForTimeout(150);
 const geometry=await input.evaluate(n=>{
  const b=n.getBoundingClientRect(),min=+n.min,max=+n.max;
  return {x:b.x,y:b.y,w:b.width,h:b.height,min,max,value:+n.value};
 });
 // Chromium's native range thumb is 16 CSS px; its centre travels inside that inset.
 const xFor=v=>geometry.x+8+(geometry.w-16)*(v-geometry.min)/(geometry.max-geometry.min);
 const x0=xFor(geometry.value),x1=xFor(target),y=geometry.y+geometry.h/2;
 const original=await input.elementHandle();
 await input.evaluate(n=>{
  window.rangeDragEvents=[];
  window.rangeDragListener=e=>window.rangeDragEvents.push({type:e.type,pointerType:e.pointerType,value:+n.value,prevented:e.defaultPrevented});
  for(const type of ['pointerdown','pointerup','pointercancel','gotpointercapture','lostpointercapture','input','change'])n.addEventListener(type,window.rangeDragListener);
 });
 const values=[geometry.value],states=[];
 const cdp=touch?await page.context().newCDPSession(page):null;
 const sample=async()=>{
  values.push(+await input.inputValue());
  states.push({sameNode:await input.evaluate((n,old)=>n===old&&old.isConnected,original),...(observe?await observe():{})});
 };
 try {
  if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y,id:1}]});
  else {await page.mouse.move(x0,y);await page.mouse.down();}
  await sample();
  for(let i=1;i<=steps;i++){
   const x=x0+(x1-x0)*i/steps;
   if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1}]});
   else await page.mouse.move(x,y);
   await page.waitForTimeout(60);await sample();
  }
 } finally {
  if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  else await page.mouse.up();
 }
 await page.waitForTimeout(60);await sample();await original.dispose();
 const events=await input.evaluate(n=>{
  for(const type of ['pointerdown','pointerup','pointercancel','gotpointercapture','lostpointercapture','input','change'])n.removeEventListener(type,window.rangeDragListener);
  return window.rangeDragEvents;
 });
 return {values,states,target,touch,events};
}

export function assertRangeDrag(result,label) {
 const {values,states,target}=result,start=values[0],direction=Math.sign(target-start);
 assert.equal(values[1],start,`${label}: press starts on the thumb without a track jump`);
 assert.ok(new Set(values.slice(1,-1)).size>=4,`${label}: intermediate values ${values}`);
 assert.ok(values.every((v,i)=>!i||(v-values[i-1])*direction>=0),`${label}: tracks monotonically ${values}`);
 assert.equal(values.at(-1),target,`${label}: reaches ${target}: ${values}`);
 assert.ok(states.every(s=>s.sameNode),`${label}: original slider survives input`);
 assert.ok(result.events.some(e=>e.type==='pointerdown'&&e.pointerType===(result.touch?'touch':'mouse')),`${label}: real pointer path`);
 assert.ok(!result.events.some(e=>e.type==='pointercancel'),`${label}: drag is not cancelled`);
 assert.ok(result.events.filter(e=>e.type==='input').length>=4,`${label}: live input events`);
 assert.ok(result.events.some(e=>e.type==='pointerup'),`${label}: pointer release reaches the slider`);
 assert.ok(result.events.some(e=>e.type==='change'),`${label}: release commits the value`);
}

// Track jumps and keyboard commands must still reach the native input's own defaults.
export async function checkRangeDefaults(page,selector,{touch=false,min,max,step=1}={}) {
 const input=page.locator(selector);
 await input.focus();await page.keyboard.press('Home');assert.equal(+await input.inputValue(),min);
 await page.keyboard.press('ArrowRight');assert.equal(+await input.inputValue(),min+step);
 await page.keyboard.press('End');assert.equal(+await input.inputValue(),max);
 await page.keyboard.press('ArrowLeft');assert.equal(+await input.inputValue(),max-step);
 await input.scrollIntoViewIfNeeded();const b=await input.boundingBox();
 if(touch)await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
 else await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
 assert.ok(Math.abs(+await input.inputValue()-(min+max)/2)<=step,`${selector}: track click jumps to midpoint`);
}
