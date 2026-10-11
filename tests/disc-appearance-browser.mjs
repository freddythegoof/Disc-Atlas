// Real GPU/frontend integration. API responses are isolated fixtures; no account is touched.
import assert from 'node:assert/strict';
import {test,after} from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const output='outputs/disc-appearance';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=pathname==='/'?'web/index.html':['/bag-plastics.json','/bag-models.json'].includes(pathname)?'source-data'+pathname:'public'+pathname;
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
after(async()=>{await browser.close();await new Promise(r=>server.close(r));});
const catalog=JSON.parse(fs.readFileSync('public/data.json','utf8'));
const records=Array.isArray(catalog)?catalog:catalog.discs;
const by=name=>records.find(d=>d.name===name);
const examples=[['Pyro','#008080','#800080'],['Tempo','#ffffff','#0000ff']];
const items=examples.map(([name,color,rim_color],i)=>({id:'copy-'+i,mold_id:by(name).id,plastic:'Neutron',weight_g:175,wear:10,color,rim_color,in_bag:true,status:'active',pocket:'main',sort_order:i,added_at:'2026-01-01T00:00:00Z',notes:null,stability_bias:null}));
const settings={bag_model:'Custom bag',capacity:4,main_capacity:4,putter_capacity:0,sort_mode:'speed',bag_color:'#343c49'};
async function open({signedOut=false,defaultRims=false}={}){
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 let saved=structuredClone(items);
 if(defaultRims)saved[0].rim_color=null;
 await page.route('**/api/**',async route=>{
  const u=new URL(route.request().url()),method=route.request().method();
  if(u.pathname==='/api/account')return route.fulfill({json:{user:signedOut?null:{name:'Fixture',email:'fixture@example.test'},csrfToken:'fixture',authReady:true}});
  if(u.pathname.startsWith('/api/bag')){
   if(method==='PUT'||method==='PATCH'){
    const id=u.pathname.split('/').at(-1),value=route.request().postDataJSON();
    saved=saved.map(i=>i.id===id?{...i,...value,...(method==='PATCH'&&value.status?{in_bag:value.status!=='lost'}:{})}:i);
    return route.fulfill({json:{disc:saved.find(i=>i.id===id)}});
   }
   if(method==='POST'){const disc={id:'added-'+saved.length,added_at:'2026-01-02T00:00:00Z',status:'active',...route.request().postDataJSON()};saved.push(disc);return route.fulfill({json:{disc}});}
   if(method==='DELETE'){saved=saved.filter(i=>i.id!==u.pathname.split('/').at(-1));return route.fulfill({json:{ok:true}});}
   return route.fulfill({json:{bag:settings,discs:saved}});
  }
  return route.fulfill({json:{}});
 });
 await page.goto('http://127.0.0.1:'+server.address().port+(signedOut?'/':'/?bag=1'));
 await page.waitForFunction(signedOut=>signedOut?discs.length>0:window.BagApp?.mapColors().size===2,signedOut);
 return {page,errors};
}

test('atlas default rims follow the theme without reusing stale LODs or overriding custom colors',async()=>{
 const {page,errors}=await open();
 try{
  const result=await page.evaluate(async()=>{
   const {createAtlasArt}=await import('/disc3d/atlas-art.mjs'),art=await createAtlasArt({dpr:2});
   try{
    const d=discs.find(d=>d.name==='Pyro'),plain=discs.find(d=>d.name==='Pilot'),plate='#008080',rows=[];
    document.documentElement.dataset.theme='light';
    const black=art.render(d,plate,94),custom=art.render(d,plate,94,'#800080'),single=art.render(plain,plate,94);
    for(const theme of ['light','midnight','charcoal','black','light']){
     document.documentElement.dataset.theme=theme;
     const before=art.get(d,plate,12),hasBefore=art.has(d,plate,12),e=art.render(d,plate,12);
     const shape=art.debug.shapeOf(d).shape,f=1-shape.rimWidth/shape.diameter;
     const full=art.render(d,plate,94),px=full.px,pixels=full.canvas.getContext('2d').getImageData(Math.round(px/2-.5+f*full.fill*px/2),Math.round(px/2),1,1).data;
     rows.push({theme,resolvedHit:art.get(d,plate,94,theme==='light'?'#0a0a0a':'#ffffff')===full,pixels:[...pixels],cacheMiss:before===null,hasBefore,
      hit:art.get(d,plate,12)===e,fullHit:art.get(d,plate,94)===full,lightHit:theme==='light'?full===black:null,
      customHit:art.render(d,plate,94,'#800080')===custom,singleHit:art.render(plain,plate,94)===single});
    }
    return rows;
   }finally{art.dispose();}
  });
  for(const r of result){
   assert.equal(r.resolvedHit,true,r.theme+' default rim selects the correctly colored image');
   assert.equal(r.hit,true);assert.equal(r.fullHit,true);assert.equal(r.customHit,true,r.theme+' custom rim wins');
   assert.equal(r.singleHit,true,'single-mold cache is unaffected');
   if(r.theme==='light'){assert.equal(r.lightHit,true,'returning to light reuses its cached image');assert.ok(r.pixels.slice(0,3).every(c=>c<35),'light rim pixels stay black');}
   else assert.ok(r.pixels.slice(0,3).every(c=>c>100),r.theme+' rim pixels are white');
  }
  assert.equal(result[1].cacheMiss,true,'dark get must not reuse a light image at any LOD');
  assert.equal(result[1].hasBefore,false,'dark has must bypass the cached light low LOD');
  assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

for(const personal of [false,true])test((personal?'My Map':'signed-out Atlas')+' redraws default rims on theme-change while custom rims stay fixed',async()=>{
 const {page,errors}=await open({signedOut:!personal,defaultRims:true});
 try{
  if(personal)await page.locator('[data-bag-view="map"]').click();
  else await page.evaluate(()=>{document.querySelector('#search').value='Pyro';filter();});
  await page.waitForFunction(()=>mapArt.state==='ready'&&document.querySelectorAll('#mapMarkers .has-3d').length>0);
  for(const [theme,rim] of [['light','#0a0a0a'],['midnight','#ffffff'],['charcoal','#ffffff'],['black','#ffffff'],['light','#0a0a0a']]){
   await page.locator(`[data-theme-choice="${theme}"]`).evaluate(n=>n.click());
   await page.waitForFunction(([rim,personal])=>{
    const expected=new Map([['Pyro',rim],...(personal?[['Tempo','#0000ff']]:[])]);
    return [...expected].every(([name,rim])=>{
     const d=discs.find(d=>d.name===name),g=mapClusters.find(g=>g.lead?.id===d.id),node=g&&document.querySelector(`[data-cluster="${g.key}"]`);
     const e=atlasArt.get(d,discColor(d),94,rim);
     return e&&node?.art3d===e.canvas;
    });
   },[rim,personal]);
   if(theme==='light'||theme==='black')await page.locator('#map').screenshot({path:output+`/${personal?'my-map':'signed-out'}-${theme}-rims.png`});
  }
  assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test('atlas cache and pixels honor custom rims independently of the plate',async()=>{
 const {page}=await open();
 try{
  const result=await page.evaluate(async examples=>{
   const {createAtlasArt}=await import('/disc3d/atlas-art.mjs'),art=await createAtlasArt({dpr:2});
   const results=examples.map(([name,plate,rim])=>{
    const d=discs.find(d=>d.name===name),e=art.render(d,plate,94,rim),again=art.get(d,plate,94,rim),other=art.render(d,plate,94,'#ffff00');
    // Sample the plate and a ring halfway across the measured overmold rim.
    const shape=art.debug.shapeOf(d).shape,R=shape.diameter/2,f=1-shape.rimWidth/R/2;
    const sample=f=>{const out=[0,0,0],n=e.px,g=e.canvas.getContext('2d');for(let a=0;a<360;a+=10){const t=a*Math.PI/180,p=g.getImageData(Math.round(n/2-.5+Math.cos(t)*f*e.fill*n/2),Math.round(n/2-.5+Math.sin(t)*f*e.fill*n/2),1,1).data;out.forEach((_,i)=>out[i]+=p[i]/36);}return out;};
    return {name,hit:e===again,separate:e!==other,plate:sample(.25),rim:sample(f)};
   });art.dispose();return results;
  },examples);
  for(const r of result){assert.equal(r.hit,true);assert.equal(r.separate,true,r.name+' custom rims need separate cached images');}
  assert.ok(result[0].rim[0]>result[0].rim[1]*2&&result[0].rim[2]>result[0].rim[1]*2,'Pyro rim is purple');
  assert.ok(result[1].rim[2]>result[1].rim[0]*2,'Tempo rim is blue');
  assert.ok(result[0].plate[1]>result[0].plate[0]*2&&result[0].plate[2]>result[0].plate[0]*2,'Pyro plate is teal');
  assert.ok(result[1].plate.every(c=>c>200),'Tempo plate is white');
 }finally{await page.close();}
});

test('Bag viewer uses each mold and two materials with saved plate/rim colors',async()=>{
 const {page,errors}=await open();
 try{
  await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]')?.bagViewer);
  const state=await page.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.getBagLayoutState().filter(d=>!d.empty));
  for(const [index,[name,plate,rim]] of examples.entries()){
   const d=state.find(d=>d.id==='copy-'+index);assert.equal(d.color,plate,name+' plate');assert.equal(d.rimColor,rim,name+' rim');assert.equal(d.overmold,true);
  }
  await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
  await page.locator('.bag-dump').click();await page.waitForFunction(()=>{const v=document.querySelector('[data-bag-canvas]').bagViewer;return v.outDiscs.length===2&&!v.stage.moving&&v.getBagLayoutState().filter(d=>!d.empty).every(d=>d.slide===1);});
  await page.locator('#bagScene').screenshot({path:output+'/pyro-tempo-bag.png'});
  await page.locator('#bagLineup').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelectorAll('#bagLineup .has-3d').length===2);
  await page.locator('#bagLineup').screenshot({path:output+'/pyro-tempo-list.png'});
  const defaults=await page.locator('[data-bag-canvas]').evaluate(n=>{
   const envy=discs.find(d=>d.name==='Envy'),pilot=discs.find(d=>d.name==='Pilot');
   n.bagViewer.setBagLayout({main:[{id:'pilot',mold:pilot,color:'#123456',rimColor:'#ffffff'},{id:'envy',mold:envy,color:'#00ff00'},{id:'plain-envy',mold:{...envy,overmold:false},color:'#00ff00',rimColor:'#ffffff'}]});
   return n.bagViewer.getBagLayoutState();
  });
  assert.equal(defaults.find(d=>d.id==='envy').rimColor,'#0a0a0a','automatic Bag rim stays black');
  for(const id of ['pilot','plain-envy']){assert.equal(defaults.find(d=>d.id===id).overmold,false,id+' stays single-mold');assert.equal(defaults.find(d=>d.id===id).rimColor,null);}
  assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test('My Map refreshes colors and its disc set without reloading the page',async()=>{
 const {page,errors}=await open();
 try{
  await page.locator('[data-bag-view="map"]').click();
  await page.waitForFunction(()=>myMap&&filtered.length===2&&mapArt.state==='ready'&&mapArt.pending===0);
  await page.waitForFunction(()=>document.querySelectorAll('#mapMarkers .has-3d').length===2);
  await page.locator('#myMapPanel').screenshot({path:output+'/pyro-tempo-map.png'});
  await page.evaluate(()=>{window.previousPersonalMap=myMap;});
  const changed=await page.evaluate(async()=>{
   const before=myMap,d=discs.find(d=>d.name==='Pyro');await BagApp.add(d,{id:'copy-0',mold_id:d.id,plastic:'Neutron',weight_g:175,wear:10,color:'#008080',rim_color:'#800080',in_bag:true,pocket:'main'});return before===myMap;
  });assert.equal(changed,true);
  await page.locator('#bagRimColor').fill('#ff8000');await page.locator('#saveDisc').click();
  await page.locator('#addDiscDialog').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>myMap===window.previousPersonalMap),false,'color changes invalidate the personal map key');
  assert.equal(await page.evaluate(()=>BagApp.mapRimColors().get(discs.find(d=>d.name==='Pyro').id)),'#ff8000');
  await page.waitForFunction(()=>[...atlasArt.debug.images.keys()].some(k=>k.endsWith('|#008080|#ff8000')));
  // The existing picker can move a copy to Storage while My Map remains open.
  await page.evaluate(()=>BagApp.add(discs.find(d=>d.name==='Pyro'),{id:'copy-0',mold_id:discs.find(d=>d.name==='Pyro').id,plastic:'Neutron',weight_g:175,wear:10,color:'#008080',rim_color:'#ff8000',in_bag:true,pocket:'main'}));
  await page.locator('#bagDestination').selectOption('storage');await page.locator('#saveDisc').click();
  await page.waitForFunction(()=>myMap.ids.size===1&&filtered.length===1);
  assert.equal(await page.evaluate(()=>filtered[0].name),'Tempo');
  // Bring that stored copy back, then add, lose, find and remove a third mold without a reload.
  await page.locator('[data-bag-view="bag"]').click();await page.locator('[data-bag-list="storage"]').click();
  await page.locator('#bagStorage [data-bag-move="copy-0"]').click();
  await page.locator('[data-bag-view="map"]').click();await page.waitForFunction(()=>myMap.ids.size===2);
  await page.evaluate(()=>BagApp.add(discs.find(d=>d.name==='Destroyer')));await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
  await page.waitForFunction(()=>myMap.ids.size===3&&filtered.length===3);
  await page.locator('[data-bag-view="bag"]').click();await page.locator('[data-bag-lost="added-2"]').click();await page.locator('#confirmLostDisc').click();await page.locator('#lostDiscDialog').waitFor({state:'hidden'});
  await page.locator('[data-bag-view="map"]').click();await page.waitForFunction(()=>myMap.ids.size===2&&filtered.length===2);
  await page.locator('[data-bag-view="bag"]').click();await page.locator('[data-bag-list="lost"]').click();await page.locator('[data-bag-found="added-2"]').click();
  await page.locator('[data-bag-view="map"]').click();await page.waitForFunction(()=>myMap.ids.size===3);
  await page.locator('[data-bag-view="bag"]').click();await page.locator('[data-bag-remove="added-2"]').click();await page.locator('#confirmRemoveDisc').click();await page.locator('#removeDiscDialog').waitFor({state:'hidden'});
  await page.locator('[data-bag-view="map"]').click();await page.waitForFunction(()=>myMap.ids.size===2&&filtered.length===2);
  assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test('visible list thumbnails use shared 3D renders; offscreen rows wait',async()=>{
 const {page,errors}=await open();
 try{
  const first=page.locator('#bagLineup [data-disc-id="copy-0"] [data-disc-thumbnail]');await first.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('#bagLineup [data-disc-id="copy-0"] .disc-thumbnail canvas'));
  const pixels=await first.evaluate(n=>{const c=n.querySelector('canvas'),g=c.getContext('2d'),p=g.getImageData(Math.round(c.width*.94),Math.round(c.height/2),1,1).data;return [...p];});
  assert.ok(pixels[0]>pixels[1]*2&&pixels[2]>pixels[1]*2,'bag thumbnail actually paints the purple rim');
  await page.locator('#listTab').click();
  await page.waitForFunction(()=>document.querySelector('#rows .disc-thumbnail canvas'));
  const thumbnails=page.locator('#rows .disc-thumbnail'),total=await thumbnails.count();
  assert.ok(total>=50);assert.ok(await page.locator('#rows .disc-thumbnail canvas').count()<total,'offscreen rows are not rendered upfront');
  const last=thumbnails.last();await last.scrollIntoViewIfNeeded();await last.locator('canvas').waitFor();
  assert.equal(await last.getAttribute('data-rim-color'),'','Directory uses default rim colors');assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test('My Map dot tiers display their cached model at the existing dot size',async()=>{
 const {page}=await open();
 try{
  await page.locator('[data-bag-view="map"]').click();await page.waitForFunction(()=>document.querySelectorAll('#mapMarkers .has-3d').length===2);
  const visible=await page.evaluate(()=>{const g=mapClusters[0];g.large=false;renderMarkers();return document.querySelector(`[data-cluster="${g.key}"] canvas`).checkVisibility();});
  assert.equal(visible,true,'a dot tier must show the 3D disc instead of hiding the model behind its 2D dot');
 }finally{await page.close();}
});
