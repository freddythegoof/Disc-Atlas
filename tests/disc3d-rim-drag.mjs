import assert from 'node:assert/strict';

// Real mesh/camera projection, independent of the gesture's hit test. Removing the
// gesture, reversing its sign, allowing orbit, or dropping slider sync fails here.
async function reset(page,which,view='angle',hand='RHBH',clay=false){
 await page.evaluate(({which,view,hand,clay})=>{
  const v=Disc3D[which];v.setHand(hand);v.setClay(clay);v.setTilt(0);
  v.setView(view,{instant:true});v.debug.renderNow();
 },{which,view,hand,clay});
 await page.waitForTimeout(150);
}
async function point(page,which,side=1,interior=false){
 return page.evaluate(async({which,side,interior})=>{
  const THREE=await import('three'),v=Disc3D[which],{body,camera,renderer}=v.debug;
  v.debug.renderNow();body.updateWorldMatrix(true,false);camera.updateMatrixWorld();
  const rect=renderer.domElement.getBoundingClientRect(),box=body.geometry.boundingBox;
  const local=new THREE.Vector3(interior?0:side*v.state.radius*.86,(box.min.y+box.max.y)/2,0);
  const projected=body.localToWorld(local.clone()).project(camera);
  const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(projected.x,projected.y),camera);
  const hit=ray.intersectObject(body)[0];if(!hit)throw Error('test point must hit the disc');
  const p=body.worldToLocal(hit.point.clone());
  return {x:rect.x+(projected.x+1)*rect.width/2,y:rect.y+(1-projected.y)*rect.height/2,
   height:rect.height,local:p.toArray(),radial:Math.hypot(p.x,p.z)/v.state.radius};
 },{which,side,interior});
}
async function snapshot(page,which,local){
 return page.evaluate(({which,local})=>{
  const v=Disc3D[which],{camera,body,controls,renderer}=v.debug;
  body.updateWorldMatrix(true,false);camera.updateMatrixWorld();
  const p=new camera.position.constructor(...local);body.localToWorld(p).project(camera);
  const canvas=renderer.domElement;
  return {tilt:v.state.tilt,slider:+v.element.querySelector('[data-disc3d-tilt]').value,
   text:v.element.querySelector('[data-disc3d-tilt-value]').textContent,
   rotation:v.debug.tiltGroup.rotation.z,camera:camera.position.toArray(),edgeY:p.y,
   enabled:controls.enabled,cursor:getComputedStyle(canvas).cursor,flipped:v.state.flipped};
 },{which,local});
}
function synced(s){
 assert.equal(s.slider,s.tilt,'slider agrees live');
 assert.equal(s.text,s.tilt===0?'Flat':`${Math.abs(s.tilt)}° ${s.tilt>0?'hyzer':'anhyzer'}`,'readout agrees live');
}

export async function rimDragChecks(page,which){
 for(const [view,side,hand,clay] of [['angle',1,'RHBH',false],['profile',-1,'RHBH',false],['profile',1,'RHFH',true],['bottom',1,'LHBH',false]]){
  await reset(page,which,view,hand,clay);const p=await point(page,which,side);
  assert.ok(p.radial>=.7,'test press is on the rim band');
  const before=await snapshot(page,which,p.local);
  await page.mouse.move(p.x,p.y);await page.waitForTimeout(80);
  const hover=(await snapshot(page,which,p.local)).cursor;
  await page.mouse.down();const enabledOnDown=(await snapshot(page,which,p.local)).enabled;
  const sign=(hand==='RHFH'||hand==='LHBH')?-1:1;
  const trail=[];
  for(let i=1;i<=6;i++){
   await page.mouse.move(p.x,p.y-i*p.height/80*3);const s=await snapshot(page,which,p.local);
   synced(s);assert.equal(s.tilt,i*3*side*sign,'each vertical move directly changes tilt in the correct direction');
   trail.push(s.tilt);assert.deepEqual(s.camera,before.camera,'rim drag leaves camera alone');
   assert.equal(s.flipped,false,'rim drag never flips');
  }
  await page.mouse.up();const after=await snapshot(page,which,p.local);
  assert.equal(hover,'ns-resize','hover discovers the rim');
  assert.equal(enabledOnDown,false,'rim owns the gesture');
  assert.ok(after.edgeY>before.edgeY+.03,`${which} ${view}: grabbed edge rises when pulled up`);
  assert.equal(Math.abs(after.tilt),18,'full-height sensitivity is 80 degrees');
  assert.ok(new Set(trail).size>=5,'direct manipulation updates throughout the drag');
  assert.equal(after.enabled,true,'orbit restored after release');
  assert.ok(Math.abs(after.rotation-after.tilt*Math.PI/180*sign)<1e-8,'existing hand convention');
 }
 await reset(page,which);let p=await point(page,which,1,true),before=await snapshot(page,which,p.local);
 await page.mouse.move(p.x,p.y);await page.mouse.down();
 await page.mouse.move(p.x+45,p.y+25,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
 let after=await snapshot(page,which,p.local);
 assert.equal(after.tilt,0,'interior orbit does not tilt');
 assert.ok(Math.hypot(...after.camera.map((n,i)=>n-before.camera[i]))>1,'interior drag still orbits');
 for(const direction of [-1,1]){
  await reset(page,which);p=await point(page,which);
  await page.mouse.move(p.x,p.y);await page.mouse.down();
  await page.mouse.move(p.x,p.y+direction*p.height*1.2,{steps:12});
  after=await snapshot(page,which,p.local);synced(after);
  assert.equal(after.tilt,-direction*40,'rim drag clamps to +/-40');
  await page.mouse.up();assert.equal((await snapshot(page,which,p.local)).enabled,true,'outside release restores orbit');
 }
 await reset(page,which,'top');p=await point(page,which);before=await snapshot(page,which,p.local);
 await page.mouse.move(p.x,p.y);await page.waitForTimeout(80);
 assert.equal((await snapshot(page,which,p.local)).cursor,'grab','Top retains orbit cursor');
 await page.mouse.down();await page.mouse.move(p.x,p.y-35,{steps:5});await page.mouse.up();
 assert.equal((await snapshot(page,which,p.local)).tilt,0,'Top rim orbits because tilt axis is edge-on to the eye');
 await reset(page,which);
 console.log(`ok - ${which}: rim direction, hands, clay, live slider, orbit, clamps, outside release and Top`);
}

export async function rimTouchChecks(page,which){
 await reset(page,which);const p=await point(page,which),cdp=await page.context().newCDPSession(page);
 const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 const a={id:11,x:p.x,y:p.y},b={id:12,x:p.x-90,y:p.y};
 try{
  await touch('touchStart',[a]);
  assert.equal((await snapshot(page,which,p.local)).enabled,false,'touch grabs rim');
  await touch('touchMove',[{...a,y:p.y-30}]);
  const tilted=await snapshot(page,which,p.local);assert.ok(tilted.tilt>0,'one finger tilts');synced(tilted);
  a.y-=30;await touch('touchStart',[a,b]);
  assert.equal((await snapshot(page,which,p.local)).enabled,true,'second finger restores orbit');
  for(let i=1;i<=6;i++)await touch('touchMove',[{...a,x:a.x+i*6},{...b,x:b.x-i*6}]);
  await touch('touchEnd',[]);await page.waitForTimeout(250);
  const pinched=await snapshot(page,which,p.local);
  assert.equal(pinched.tilt,tilted.tilt,'pinch cancels further tilt');
  assert.ok(Math.hypot(...pinched.camera)<Math.hypot(...tilted.camera)-.5,'pinch actually zooms');
  assert.equal(!!await page.evaluate(()=>Disc3D.popout),which==='popout','pinch never expands the panel');
  await reset(page,which);const q=await point(page,which);
  await touch('touchStart',[{id:13,x:q.x,y:q.y}]);await touch('touchCancel',[]);
  assert.equal((await snapshot(page,which,q.local)).enabled,true,'cancellation restores orbit');
  await reset(page,which);
 }finally{await cdp.detach();}
 console.log(`ok - ${which}: touch rim tilt, second-finger pinch handoff and cancellation`);
}

export async function rimTapPoint(page,which){await reset(page,which);return point(page,which);}
