// Real rendered comparison outlines and viewer materials. No external services are used.
import assert from 'node:assert/strict';
import {test,after} from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.POLISH_OUTPUT||'outputs/compare-viewer-polish';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end('{}');return;}
 const file=pathname==='/'?'web/index.html':'public'+pathname;
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
after(async()=>{await browser.close();await new Promise(r=>server.close(r));});
async function open(width=1440){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);
 if(width<700)await page.locator('#mapTab').click();
 await page.waitForFunction(()=>discs.length&&mapClusters.length&&mapArt.state!=='loading');
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
async function settle(page){
 await page.waitForFunction(()=>!cameraTween&&!regrouping&&groupCache?.items===filtered&&mapArt.pending===0);
 await page.waitForTimeout(500);
 await page.evaluate(()=>draw());
}
// Count actual accent pixels, catching missing paint even if membership/state is correct.
const ink=({x,y,r})=>{
 const token=getComputedStyle(document.documentElement).getPropertyValue('--palette-vermillion').trim();
 const color=token.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16));
 const dpr=canvas.width/mapViewport.width,box={x:Math.max(0,Math.floor((x-r-12)*dpr)),y:Math.max(0,Math.floor((y-r-12)*dpr))};
 const w=Math.min(canvas.width-box.x,Math.ceil((r+12)*2*dpr)),h=Math.min(canvas.height-box.y,Math.ceil((r+12)*2*dpr));
 const data=ctx.getImageData(box.x,box.y,w,h).data;let count=0;
 for(let i=0;i<data.length;i+=4)if(data[i+3]>220&&color.every((c,k)=>Math.abs(c-data[i+k])<8))count++;
 return count;
};

test('comparison outlines paint and clear for DOM markers and canvas discs at every zoom and theme',async()=>{
 const page=await open();
 try{
  for(const theme of ['light','midnight','charcoal','black'])for(const z of [1,3,5,7,9]){
   await page.evaluate(([theme,z])=>{
    document.querySelector(`[data-theme-choice="${theme}"]`).click();
    comparison=[];selected=null;zoom=1;pan={x:0,y:0};
    // Aim at the center of the atlas at each zoom without changing disc positions.
    const p=boundedCamera(zoomDestination(z,{x:mapViewport.width/2,y:mapViewport.height/2}));
    zoom=p.zoom;pan={x:p.x,y:p.y};draw();
   },[theme,z]);
   await settle(page);
   const targets=await page.evaluate(()=>{
    const inside=g=>g.x>90&&g.x<mapViewport.width-90&&g.y>100&&g.y<mapViewport.height-160;
    const g=mapClusters.find(g=>g.large&&inside(g))||mapClusters.find(inside);
    const gap=mapGaps.find(g=>g.on&&g.drawn&&inside(g));
    return [g&&{id:g.members.at(-1).id,x:g.x,y:g.y,r:60},gap&&{id:gap.id,x:gap.x,y:gap.y,r:gap.size/2}].filter(Boolean);
   });
   assert.ok(targets.length,`${theme} ${z}x has visible discs`);
   if(z===1)assert.equal(targets.length,2,'overview exercises both DOM and canvas');
   for(const target of targets){
    const before=await page.evaluate(ink,target);
    const layout=await page.evaluate(()=>mapClusters.map(g=>[g.key,g.x,g.y]));
    await page.evaluate(id=>{comparison=[discs.find(d=>d.id===id)];renderCompare();},target.id);
    await page.waitForTimeout(80);
    const highlighted=await page.evaluate(ink,target);
    assert.ok(highlighted>before+12,`${theme} ${z}x ${target.id}: comparison adds visible outline (${before} -> ${highlighted})`);
    assert.deepEqual(await page.evaluate(()=>mapClusters.map(g=>[g.key,g.x,g.y])),layout,'comparison does not move discs');
    await page.evaluate(()=>{comparison=[];renderCompare();});
    await page.waitForTimeout(80);
    assert.ok(await page.evaluate(ink,target)<=before+2,'removal clears the outline immediately');
   }
   if(z===1){
    await page.evaluate(ids=>{comparison=ids.map(id=>discs.find(d=>d.id===id));renderCompare();},targets.map(t=>t.id));
    await page.waitForTimeout(80);
    await page.locator('#map').screenshot({path:`${output}/${theme}-compared.png`});
   }
  }
  assert.deepEqual(page.errors,[]);
 }finally{await page.close();}
});

test('sidebar compare controls update the outline without a refresh on desktop and phone',async()=>{
 for(const width of [1440,390]){
  const page=await open(width);
  try{
   await page.evaluate(()=>{document.querySelector('#search').value='Envy';filter();});await settle(page);
   await page.evaluate(()=>select(filtered.find(d=>d.name==='Envy')));
   await page.waitForFunction(()=>Disc3D.viewer?.state.frames>0);
   const target=await page.evaluate(()=>({x:mapClusters[0].x,y:mapClusters[0].y,r:70})),before=await page.evaluate(ink,target);
   await page.locator('#compare').click();await page.waitForTimeout(100);
   assert.ok(await page.evaluate(ink,target)>before+12,'add control paints comparison outline');
   await page.locator('#closeDetail').click();
   await page.locator('#compareBar [data-remove]').click();await page.waitForTimeout(100);
   assert.ok(await page.evaluate(ink,target)<=before+2,'tray remove control clears comparison outline');
   assert.deepEqual(page.errors,[]);
  }finally{await page.close();}
 }
});

test('shared viewer follows theme defaults, keeps custom rim colors and camera, and removes its theme listener',async()=>{
 const page=await open();
 try{
  const result=await page.evaluate(async()=>{
   const {createDiscViewer}=await import('/disc3d/viewer.mjs');
   const host=document.createElement('div');host.style.cssText='position:fixed;inset:100px;width:320px;height:400px;z-index:100';document.body.append(host);
   const v=createDiscViewer();v.attach(host);
   const d=discs.find(d=>d.name==='Envy'),props={specs:d.specs,mold:d.name,overmold:true,color:'#0072b2',hand:'RHBH'};
   const choose=async theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new CustomEvent('atlas-theme-change',{detail:theme}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));};
   const rows=[];
   for(const custom of [undefined,{plate:'#56b4e9'},{rim:'#bc719b',plate:'#56b4e9'}]){
    // Initial creation/update must already use the document's current theme.
    document.documentElement.dataset.theme='black';v.update({...props,colors:custom});
    const plate=custom?.plate||'#0072b2';
    rows.push({theme:'black',custom:!!custom?.rim,rim:'#'+v.debug.rimMaterial.color.getHexString(),plate:'#'+v.debug.bodyMaterial.color.getHexString(),expectedPlate:plate});
    v.setView('bottom',{instant:true});v.setHand('RHFH');v.setTilt(20);
    for(const theme of ['light','midnight','charcoal','black','light']){
     const frames=v.state.frames;await choose(theme);
     rows.push({theme,custom:!!custom?.rim,rim:'#'+v.debug.rimMaterial.color.getHexString(),plate:'#'+v.debug.bodyMaterial.color.getHexString(),expectedPlate:plate,view:v.state.view,hand:v.state.hand,tilt:v.state.tilt,rendered:v.state.frames>frames});
    }
   }
   await choose('black');v.update(props);v.update({...props,colors:{rim:'#ffffff'}});
   await choose('light');const matchingDefault='#'+v.debug.rimMaterial.color.getHexString();
   v.update(props); // Leave a default rim to verify disposal suppresses a real theme change.
   v.dispose();const key=v.state.key;await choose('black');const unchanged=v.state.key===key;host.remove();
   return {rows,unchanged,matchingDefault};
  });
  for(const row of result.rows){
   assert.equal(row.rim,row.custom?'#bc719b':row.theme==='light'?'#0a0a0a':'#ffffff',`${row.theme}, custom=${row.custom}`);
   assert.equal(row.plate,row.expectedPlate,'theme changes preserve the plate color');
   if(row.view){assert.equal(row.view,'bottom');assert.equal(row.hand,'RHFH');assert.equal(row.tilt,20);if(!row.custom)assert.equal(row.rendered,true,'theme default repaint requests a frame');}
  }
  assert.equal(result.unchanged,true,'disposed viewer no longer handles theme events');
  assert.equal(result.matchingDefault,'#ffffff','custom rim equal to previous default still wins');
  assert.deepEqual(page.errors,[]);
 }finally{await page.close();}
});

test('three compared discs retain independent rings through hover and tray removal',async()=>{
 const page=await open();
 try{
  const targets=await page.evaluate(()=>{
   comparison=[];selected=null;draw();
   return mapClusters.filter(g=>g.large&&g.x>mapViewport.width*.58&&g.x<mapViewport.width-100&&g.y>150&&g.y<mapViewport.height-250)
    .slice(0,3).map(g=>({id:g.members.at(-1).id,x:g.x,y:g.y,r:70,key:g.key}));
  });
  assert.equal(targets.length,3,'three visible groups are available');
  const before=await Promise.all(targets.map(t=>page.evaluate(ink,t)));
  await page.evaluate(ids=>{comparison=ids.map(id=>discs.find(d=>d.id===id));renderCompare();},targets.map(t=>t.id));
  await settle(page);
  for(let i=0;i<targets.length;i++)assert.ok(await page.evaluate(ink,targets[i])>before[i]+12,'each compared group has a ring');
  const point=await page.evaluate(key=>{const n=[...document.querySelectorAll('.atlas-marker')].find(n=>n.dataset.cluster===key);const r=n.getBoundingClientRect();n.focus({preventScroll:true});return {x:r.x+r.width/2,y:r.y+r.height/2};},targets[0].key);
  await page.mouse.move(point.x,point.y);
  assert.equal(await page.evaluate(key=>[...document.querySelectorAll('.atlas-marker')].find(n=>n.dataset.cluster===key)?.matches(':hover'),targets[0].key),true,'the compared marker is actually hovered');
  await page.waitForTimeout(350);
  assert.ok(await page.evaluate(ink,targets[0])>before[0]+12,'focus and hover do not erase membership');
  const fourth=await page.evaluate(ids=>discs.find(d=>d.speed!=null&&!ids.includes(d.id)).id,targets.map(t=>t.id));
  await page.evaluate(id=>select(discs.find(d=>d.id===id)),fourth);
  await page.locator('#compare').click();
  assert.equal(await page.evaluate(()=>comparison.length),3,'a fourth compare click keeps the tray capped at three');
  await page.locator('#closeDetail').click();
  await page.mouse.move(10,10);
  await page.locator('#compareBar [data-remove]').first().click();await settle(page);
  assert.deepEqual(await page.evaluate(()=>comparison.map(d=>d.id)),targets.slice(1).map(t=>t.id));
  assert.ok(await page.evaluate(ink,targets[0])<=before[0]+2,'only the removed disc loses its ring');
  for(let i=1;i<3;i++)assert.ok(await page.evaluate(ink,targets[i])>before[i]+12,'other compared discs stay highlighted');
  assert.deepEqual(page.errors,[]);
 }finally{await page.close();}
});

test('real sidebar and pop-out repaint default rims together, and the pop-out keeps transferred custom intent',async()=>{
 const page=await open();
 try{
  await page.evaluate(()=>select(discs.find(d=>d.name==='Envy')));
  await page.waitForFunction(()=>Disc3D.viewer?.state.overmold&&Disc3D.viewer.state.frames>0);
  for(const theme of ['light','midnight']){
   await page.evaluate(theme=>document.querySelector(`[data-theme-choice="${theme}"]`).click(),theme);
   await page.waitForFunction(t=>document.documentElement.dataset.theme===t&&!document.documentElement.classList.contains('theme-switching'),theme);
   await page.waitForFunction(()=>Disc3D.viewer.state.frames>0);
   await page.locator('#detail [data-disc3d]').screenshot({path:`${output}/sidebar-${theme}.png`});
  }
  await page.locator('#detail [data-disc3d-expand]').click();
  await page.waitForFunction(()=>Disc3D.popout?.state.frames>0&&!document.querySelector('dialog.disc3d-dialog').getAnimations().length);
  for(const theme of ['light','midnight','charcoal','black']){
   // The theme menu behind a native modal is inert; invoke the same theme control's handler.
   const frames=await page.evaluate(()=>[Disc3D.viewer.state.frames,Disc3D.popout.state.frames]);
   await page.evaluate(theme=>document.querySelector(`[data-theme-choice="${theme}"]`).click(),theme);
   await page.waitForFunction(t=>document.documentElement.dataset.theme===t&&!document.documentElement.classList.contains('theme-switching'),theme);
   await page.waitForFunction(frames=>[Disc3D.viewer,Disc3D.popout].every((v,i)=>v.state.frames>frames[i]),frames,{timeout:5000});
   const colors=await page.evaluate(()=>[Disc3D.viewer,Disc3D.popout].map(v=>'#'+v.debug.rimMaterial.color.getHexString()));
   assert.deepEqual(colors,[theme==='light'?'#0a0a0a':'#ffffff',theme==='light'?'#0a0a0a':'#ffffff'],theme+' updates both live viewers');
   if(['light','midnight'].includes(theme))await page.locator('dialog.disc3d-dialog').screenshot({path:`${output}/viewer-${theme}.png`});
  }
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!Disc3D.popout);
  // Supply a custom rim through normal viewer props, then open the real dialog.
  await page.evaluate(()=>Disc3D.viewer.update({...Disc3D.viewer.state.props,colors:{rim:'#ffffff'}}));
  await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.state.frames>0);
  await page.evaluate(()=>document.querySelector('[data-theme-choice="light"]').click());
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='light'&&!document.documentElement.classList.contains('theme-switching'));
  assert.equal(await page.evaluate(()=> '#'+Disc3D.popout.debug.rimMaterial.color.getHexString()),'#ffffff','a transferred custom rim equal to the old default stays white in light theme');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!Disc3D.popout);
  await page.evaluate(()=>document.querySelector('[data-theme-choice="midnight"]').click());
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='midnight'&&!document.documentElement.classList.contains('theme-switching'));
  assert.deepEqual(page.errors,[],'theme changes after modal disposal stay error-free');
 }finally{await page.close();}
});
