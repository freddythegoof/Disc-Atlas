// Characterization of Freddy's intermittent slider report at 9fc7923. No product fix:
// all five surfaces already track. Keep native stepped drags, live feedback and context coverage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {dragRange,assertRangeDrag,checkRangeDefaults} from './range-drag.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='outputs/slider-drag';fs.mkdirSync(dir,{recursive:true});
const wearLabels=['','Beat · different stability class','Beat · different stability class','Well-worn','Well-worn','Seasoned','Seasoned','Seasoned','Like new','Like new','Factory new'];
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const p=new URL(req.url,'http://localhost').pathname;
 const file=p==='/'?'web/index.html':['/bag-plastics.json','/bag-models.json'].includes(p)?'source-data'+p:'public'+p;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?.split(' ').filter(Boolean)||(process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']);
let browser;const results=[],errors=[];
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 // Mouse first. Touch uses CDP's browser input pipeline, both desktop and phone layouts.
 for(const mode of ['mouse','touch','phone']){
  const touch=mode!=='mouse';
  const context=await browser.newContext({viewport:{width:mode==='phone'?390:1440,height:900},deviceScaleFactor:mode==='phone'?2:1,hasTouch:touch,isMobile:mode==='phone'});
  const item={id:'slider-copy',mold_id:'3d60892b6812',in_bag:true,status:'active',color:'#ed7868',plastic:'Star',wear:10,weight_g:175,pocket:'main',position:0,notes:''};
  await context.route('**/api/**',r=>{
   const p=new URL(r.request().url()).pathname;
   const body=p==='/api/account'?{user:{id:'u',name:'Test Player',email:'t@e.st'},csrfToken:'tok',authReady:true}:p==='/api/bag'?{bag:{bag_model:'Custom bag',capacity:20,main_capacity:16,sort_mode:'manual',rack_style:'steel'},discs:[item]}:{error:'not mocked'};
   return r.fulfill({status:['/api/account','/api/bag'].includes(p)?200:404,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.waitForFunction(()=>window.AtlasAccount?.current?.user&&typeof filtered!=='undefined'&&filtered.length);
  await page.evaluate(()=>document.fonts.ready);
  async function probe(surface,selector,target,observe){
   const r=await dragRange(page,selector,target,{touch,observe});
   results.push({mode,surface,...r});console.log(`${mode} ${surface}: ${r.values.join(' → ')}`);
   assertRangeDrag(r,`${mode} ${surface}`);
   assert.ok(r.states.every(s=>s.live),`${surface}: live feedback at EVERY move: ${JSON.stringify(r.states)}`);
  }
  const speedLive=()=>page.evaluate(()=>{
   const value=+document.querySelector('#speed').value;
   return {live:document.querySelector('#speedValue').textContent===(value?`Speed ${value}`:'Any speed')&&filtered.length>0&&(!value||filtered.every(d=>d.speed===value)),count:filtered.length};
  });
  for(const view of ['map','list']){
   await page.locator(view==='map'?'#mapTab':'#listTab').click();
   await page.locator('#filtersToggle').click();
   await page.locator('#speed').focus();await page.keyboard.press('Home');
   await probe(`speed ${view}`,'#speed',12,speedLive);
   await probe(`speed ${view} reverse`,'#speed',0,speedLive);
   await checkRangeDefaults(page,'#speed',{touch,min:0,max:15});
   await page.locator('#speed').focus();await page.keyboard.press('Home');
   await page.locator('#closeFilters').click();
  }
  await page.locator('#mapTab').click();
  await page.evaluate(()=>select(discs.find(d=>(d.catalogName||d.name)==='Destroyer')));
  await page.waitForFunction(()=>Disc3D.viewer?.state.frames>0);
  const tiltLive=which=>()=>page.evaluate(which=>{
   const v=Disc3D[which],value=+v.element.querySelector('[data-disc3d-tilt]').value;
   const text=value===0?'Flat':`${Math.abs(value)}° ${value>0?'hyzer':'anhyzer'}`;
   return {live:v.state.tilt===value&&Math.abs(v.debug.tiltGroup.rotation.z-value*Math.PI/180)<1e-9&&v.element.querySelector('[data-disc3d-tilt-value]').textContent===text,rotation:v.debug.tiltGroup.rotation.z};
  },which);
  const powerLive=()=>page.evaluate(()=>{
   const path=document.querySelector('#flight path.route').getAttribute('d');
   const comparisonPath=document.querySelector('#compareBar .compare-item svg path')?.getAttribute('d');
   return {live:document.querySelector('#powerValue').textContent===document.querySelector('#power').value+'%'&&(!comparison.length||comparisonPath===path),path,comparisonPath};
  });
  for(const state of ['normal',mode==='phone'?'expanded with comparison':'with comparison']){
   if(state!=='normal'){await page.locator('#compare').click();if(mode==='phone')await page.locator('#expandDetail').click();}
   const tilt='#detail [data-disc3d-tilt]';
   await page.locator(tilt).focus();await page.keyboard.press('Home');
   await probe(`detail tilt ${state}`,tilt,32,tiltLive('viewer'));
   await probe(`detail tilt ${state} reverse`,tilt,-32,tiltLive('viewer'));
   await checkRangeDefaults(page,tilt,{touch,min:-40,max:40});
   await page.locator('#power').focus();await page.keyboard.press('Home');
   await probe(`power ${state}`,'#power',120,powerLive);
   assert.ok(new Set(results.at(-1).states.map(s=>s.path)).size>=4,'power redraws the actual flight route throughout drag');
   await probe(`power ${state} reverse`,'#power',60,powerLive);
   assert.ok(new Set(results.at(-1).states.map(s=>s.path)).size>=4,'power redraws the actual flight route throughout reverse drag');
   await checkRangeDefaults(page,'#power',{touch,min:60,max:120,step:5});
  }
  for(const state of ['first open','reopened clay']){
   await page.locator('#detail [data-disc3d-expand]').click();
   await page.waitForFunction(()=>Disc3D.popout&&document.querySelector('.disc3d-dialog').style.opacity===''&&!document.querySelector('.disc3d-dialog').getAnimations().length);
   if(state!=='first open')await page.locator('.disc3d-dialog [data-disc3d-clay]').click();
   const tilt='.disc3d-dialog [data-disc3d-tilt]';
   await page.locator(tilt).focus();await page.keyboard.press('Home');
   await probe(`popout tilt ${state}`,tilt,32,tiltLive('popout'));
   await probe(`popout tilt ${state} reverse`,tilt,-32,tiltLive('popout'));
   await checkRangeDefaults(page,tilt,{touch,min:-40,max:40});
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!Disc3D.popout);
  }
  for(const edit of [false,true]){
   await page.evaluate(({item,edit})=>BagApp.add(discs.find(d=>(d.catalogName||d.name)==='Destroyer'),edit?item:null),{item,edit});
   await page.locator('#addDiscDialog').waitFor({state:'visible'});
   const wearLive=()=>page.evaluate(labels=>{
    const value=+document.querySelector('#bagWear').value;
    return {live:document.querySelector('#bagWearValue').textContent===`${value}/10 · ${labels[value]}`&&document.querySelector('#bagWearWarning').hidden===(value>2),label:document.querySelector('#bagWearValue').textContent};
   },wearLabels);
   await probe(`wear ${edit?'edit':'add'}`,'#bagWear',1,wearLive);
   await probe(`wear ${edit?'edit':'add'} reverse`,'#bagWear',10,wearLive);
   assert.equal(await page.locator('#bagWearValue').textContent(),'10/10 · Factory new');
   await checkRangeDefaults(page,'#bagWear',{touch,min:1,max:10});
   await page.locator('#addDiscDialog [data-bag-close]').first().click();
  }
  await context.close();
 }
 assert.deepEqual(errors,[],'No page errors');
 console.log(`PASS slider drag: ${results.length} stepped drags; live feedback, track jumps, keyboard and snapping`);
}finally{fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));await browser?.close();server.close();}
