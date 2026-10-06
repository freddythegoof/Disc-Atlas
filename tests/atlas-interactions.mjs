import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkAtlasInteractions(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
  const map=page.locator('#map');
  const startDrag=async()=>{const point=await map.evaluate(n=>{const r=n.getBoundingClientRect();for(const x of [.2,.4,.6,.8])for(const y of [.2,.4,.6,.8]){const p={x:r.x+r.width*x,y:r.y+r.height*y};if(!document.elementFromPoint(p.x,p.y)?.closest('button'))return p;}throw Error('No blank map drag point');});await page.mouse.move(point.x,point.y);await page.mouse.down();};
  await page.mouse.move(600,300);
  const initialZoom=await page.evaluate(()=>zoom);
  const scroll=await page.evaluate(()=>scrollY);
  await page.mouse.wheel(0,-10);await page.waitForFunction(z=>zoom>z,initialZoom);await page.waitForFunction(()=>!cameraTween);
  assert.equal(await page.evaluate(()=>scrollY),scroll,'Fine wheel is captured for zoom');
  const start=await page.evaluate(()=>zoom);
  await startDrag();await page.mouse.move(-10000,-10000,{steps:4});
  await page.waitForFunction(()=>edgeFeedback.x<0&&edgeFeedback.y<0);
  const edge=await page.evaluate(()=>({...pan}));
  await page.mouse.move(-12000,-12000);await page.waitForTimeout(40);
  assert.deepEqual(await page.evaluate(()=>({...pan})),edge,'Pushing farther cannot move the camera past the data');
  assert.equal(await page.evaluate(()=>zoom),start,'Drag pans without changing zoom');
  assert.equal(await page.locator('#empty').isVisible(),false);
  assert.ok(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('.map-edge-feedback .right')).opacity)>0),'The pushed edge glows');
  await page.mouse.up();await page.waitForFunction(()=>!edgeTween&&Math.abs(edgeFeedback.x)<.001&&Math.abs(edgeFeedback.y)<.001);
  assert.deepEqual(await page.evaluate(()=>({...pan})),edge,'Bounce settles without moving the bounded camera');
  await startDrag();await page.mouse.move(10000,10000,{steps:4});await page.mouse.up();await page.waitForTimeout(750);
  const opposite=await page.evaluate(()=>({...pan}));
  assert.ok(opposite.x>edge.x&&opposite.y>edge.y,'Both axes reach their opposite bounds');
  await startDrag();await page.mouse.move(1100,650,{steps:8});
  assert.ok(await page.evaluate(()=>edgeFeedback.x>0&&edgeFeedback.y>0),'Dragging into a corner provides feedback on both edges');
  await page.mouse.up();await page.waitForFunction(()=>!edgeTween&&!cameraTween);
  assert.deepEqual(await page.evaluate(()=>({...pan})),opposite,'Release cannot carry inertia through the edge');
  await page.keyboard.down('Control');await page.mouse.wheel(0,-100);await page.keyboard.up('Control');
  await page.waitForFunction(level=>zoom>level,initialZoom);
  await page.waitForFunction(()=>!cameraTween);
  await page.locator('#zoomReset').click();await page.waitForFunction(()=>!cameraTween);
  assert.ok(await page.evaluate(()=>mapClusters.some(g=>g.members.length>1)),'The dense catalog still groups');
  await page.evaluate(()=>{selectedBrands.clear();selectedBrands.add('Axiom');filter();});
  await page.waitForFunction(()=>groupCache.items===filtered&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  assert.ok(await page.evaluate(()=>{
   const {width:w,height:h}=mapViewport,shown=AtlasLayout.adapt(filtered,atlasPositions,w,h,true);
   return shown!==atlasPositions&&groupCache.groups.reduce((n,g)=>n+g.members.length,0)===filtered.filter(d=>d.speed!=null).length&&groupCache.groups.every(g=>{const p=shown.get(g.key);return g.pos.x===p.x&&g.pos.y===p.y;});
  }),'A sparse brand keeps every disc, spread into the room the filter frees');
  const positions=await page.evaluate(()=>groupCache.groups.map(g=>[g.key,g.pos.x,g.pos.y]));
  await page.mouse.move(600,300);await page.mouse.wheel(50,50);await page.waitForTimeout(750);
  assert.deepEqual(await page.evaluate(()=>groupCache.groups.map(g=>[g.key,g.pos.x,g.pos.y])),positions,'Panning does not reshuffle discs');
  fs.mkdirSync('outputs/motion',{recursive:true});await page.screenshot({path:'outputs/motion/sparse-brand.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await startDrag();await page.mouse.move(-10000,-10000,{steps:4});await page.mouse.up();await page.waitForTimeout(40);
  assert.ok(await page.evaluate(()=>canvas.style.translate.split(' ').every(value=>parseFloat(value)===0)),'Reduced motion keeps the map still at the edge');
  await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>!!edgeTween),false);
  await page.locator('#search').fill('no-such-disc-123456');assert.equal(await page.locator('#empty').isVisible(),true,'Genuine empty filters retain their empty state');
  await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#mapTab').click();await page.waitForFunction(()=>filtered.length>0);await page.evaluate(()=>focusFeatured());await page.locator('.atlas-marker.is-selected').waitFor();
  await page.locator('#zoomReset').click();await page.waitForFunction(()=>!cameraTween);
  assert.ok(await page.evaluate(()=>mapClusters.reduce((n,g)=>n+g.members.length,0)===filtered.filter(d=>d.speed!=null).length),'Mobile overview retains every rated disc');
  await page.evaluate(()=>{selectedBrands.add('Axiom');filter();});
  assert.ok(await page.locator('.atlas-marker').count()>0);
  await map.focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#empty').isVisible(),false);
  assert.deepEqual(errors,[]);
  console.log('PASS: bounded drag/wheel, corner feedback and release, zoom, sparse brand, stable positions, dense groups, reduced motion, empty filters, mobile.');
 }finally{await context.close();}
}
