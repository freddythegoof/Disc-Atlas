// Focused Prompt 4 proof. Static frontend; no live account or catalog writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const pw=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='outputs/prompt-4';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost'),pages={'/':'web/index.html','/about':'public/about.html','/privacy':'public/privacy.html','/terms':'public/terms.html','/signin':'public/account-page.html'};
 if(u.pathname.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({user:null,csrfToken:'fixture',authReady:true}));return;}
 const file=pages[u.pathname]||'public'+u.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const report={clay:[],matrix:[],clicks:[],pageErrors:[]};
const mode=process.argv[2]||'all';
async function open(browser,route='/',{width=1440,reduced=false,flat=false}={}){
 const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:reduced?'reduce':'no-preference'});
 await context.addInitScript(flat=>{localStorage.setItem('disc-atlas-theme','midnight');if(flat)window.ATLAS_3D_OFF=true;},flat);
 const page=await context.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message));await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
 if(route==='/'){await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length);if(width===390)await page.locator('#mapTab').click();await page.waitForFunction(()=>mapClusters.length);}
 return page;
}
async function pause(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function selectDisc(page,generic=false){
 const mold=await page.evaluate(generic=>{const d=generic?{...discs.find(d=>d.speed!=null),specs:null,model3d:null,name:'Generic shape fixture',catalogName:'Generic shape fixture'}:discs.find(d=>(d.catalogName||d.name)==='Envy'&&d.speed!=null);if(!d)throw Error('Missing catalog fixture');select(d);return d.catalogName||d.name;},generic);
 await page.waitForFunction(mold=>Disc3D.viewer?.state.props?.mold===mold&&document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready',mold);await pause(page);return mold;
}
async function shot(page,name){await page.screenshot({path:`${out}/${name}.png`});}
async function look(page,which){return page.evaluate(which=>{const v=Disc3D[which],d=v.debug;return {clay:v.state.clay,colors:v.state.colors,plastic:v.state.props.plastic,materials:[].concat(d.body.material).map(m=>({type:m.type,color:m.color.getHexString(),roughness:m.roughness,metalness:m.metalness,clearcoat:m.clearcoat})),stamp:d.stamp.visible,backdrop:getComputedStyle(v.element.querySelector('.disc3d-viewport')).background,profile:!d.profileFigure.hidden,source:v.state.source};},which);}
async function pop(page){await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout&&document.querySelector('.disc3d-dialog').open&&!document.querySelector('.disc3d-dialog').getAnimations().length&&document.querySelector('.disc3d-dialog').style.opacity==='');}
async function closePop(page){await page.keyboard.press('Escape');await page.waitForFunction(()=>!Disc3D.popout);}
async function sample(page,sel,action){return page.evaluate(async({sel,action})=>{const n=document.querySelector(sel);const read=()=>{const s=getComputedStyle(n);return {opacity:+s.opacity,display:s.display,scale:s.scale,translate:s.translate,rect:[n.offsetWidth,n.offsetHeight]};};(0,eval)(action);const rows=[read()],start=performance.now();while(performance.now()-start<400){await new Promise(r=>requestAnimationFrame(r));rows.push(read());}return rows;},{sel,action});}
try{
 if(mode==='all'||mode==='clay'){
  const browser=await pw.chromium.launch({headless:true,args:['--use-angle=d3d11','--enable-gpu']});
  try{for(const width of [1440,390])for(const theme of ['light','midnight']){
   const page=await open(browser,'/',{width});await page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);await page.waitForFunction(t=>document.documentElement.dataset.theme===t&&!document.documentElement.classList.contains('theme-switching'),theme);await selectDisc(page);
   await page.evaluate(()=>Disc3D.sync(document.querySelector('#detail'),selected,{color:'#247baf',colors:{plate:'#247baf',rim:'#ff0077'},plastic:'base'}));
   await page.waitForFunction(()=>Disc3D.viewer.state.props.colors?.rim==='#ff0077');
   const original=await look(page,'viewer');await shot(page,`clay-${width}-${theme}-panel-off`);
   await page.evaluate(()=>{const v=Disc3D.viewer;window.__plasticRefs=[v.debug.bodyMaterial,v.debug.rimMaterial];});
   await page.locator('#detail [data-disc3d-clay]').click();const clay=await look(page,'viewer');
   assert.equal(clay.stamp,false);assert.equal(clay.profile,true);assert.deepEqual(clay.materials.map(m=>m.color),['b3b3af','6c6c6a']);
   const dims=await page.evaluate(()=>{const keys=['Rim width','Rim depth','Height','Diameter'],texts=[...document.querySelectorAll('#detail .disc3d-profile text')].map(n=>n.textContent);return keys.map(k=>{const row=[...document.querySelectorAll('#detail .specs div')].find(n=>n.querySelector('span')?.textContent===k);return {key:k,panel:row?.querySelector('b')?.textContent,profile:texts.find(t=>t.startsWith(k+' '))};});});
   for(const d of dims)assert.equal(d.profile,`${d.key} ${d.panel}`);await shot(page,`clay-${width}-${theme}-panel-on`);
   await pop(page);const popClay=await look(page,'popout');assert.deepEqual(popClay,clay);await shot(page,`clay-${width}-${theme}-popout-on`);
   await page.locator('.disc3d-dialog [data-disc3d-clay]').click();assert.deepEqual(await look(page,'viewer'),original);assert.deepEqual(await look(page,'popout'),original);
   assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.body.material[0]===__plasticRefs[0]&&Disc3D.viewer.debug.body.material[1]===__plasticRefs[1]),true);
   await shot(page,`clay-${width}-${theme}-popout-off`);
   await page.locator('.disc3d-dialog [data-disc3d-clay]').click();assert.equal((await look(page,'viewer')).clay,true);await closePop(page);
   const generic=await selectDisc(page,true);const gen=await page.evaluate(()=>({clay:Disc3D.viewer.state.clay,stamp:Disc3D.viewer.debug.stamp.visible,caption:document.querySelector('#detail .disc3d-profile-caption').textContent,panel:document.querySelector('#detail .illustration-caption').textContent,labels:document.querySelectorAll('#detail .disc3d-profile text').length}));
   assert.equal(gen.clay,true);assert.equal(gen.stamp,false);assert.match(gen.caption,/generic shape/);assert.match(gen.panel,/generic shape/);assert.equal(gen.labels,0);
   report.clay.push({width,theme,original,clay,dims,generic,gen});await page.context().close();
  }}finally{await browser.close();}
 }
 if(mode==='all'||mode==='matrix'){
  for(const name of ['chromium','webkit','firefox']){
   if(!fs.existsSync(pw[name].executablePath())){report.matrix.push({browser:name,status:'not run: matching browser executable is not installed',executable:pw[name].executablePath()});continue;}
   const browser=await pw[name].launch({headless:true});
   try{
    for(const reduced of [false,true]){
     const page=await open(browser,'/',{reduced,flat:true});await page.evaluate(()=>{selected=null;closeDetail(false);});
     const support=await page.evaluate(()=>({discrete:CSS.supports('transition-behavior','allow-discrete'),startingStyle:typeof CSSStartingStyleRule!=='undefined',viewTransition:!!document.startViewTransition}));
     const surfaces=[];
     for(const [label,sel,start,end] of [
      ['manufacturer','#brandPanel',"document.querySelector('#brandChip').click()","closeDropdown(false)"],
      ['map menu','#lensMenu',"document.querySelector('#lensButton').click()","closeDropdown(false)"],
      ['site menu','#siteMenu',"document.querySelector('#siteMenuButton').click()","document.querySelector('#siteMenuButton').click()"],
      ['dialog','#method',"document.querySelector('#method').showModal()","document.querySelector('#method').close()"],
      ['compare tray','#compareBar',"comparison=discs.filter(d=>d.speed!=null).slice(0,2);renderCompare()","comparison=[];renderCompare()"]]){
      const enter=await sample(page,sel,start),exit=await sample(page,sel,end);
      assert.equal(exit.at(-1).display,'none',`${name} ${label}: closes`);
      if(reduced)assert.ok([...enter,...exit].every(r=>['none','1'].includes(r.scale)&&['none','0px','0px 0px'].includes(r.translate)),`${name} ${label}: reduced motion has no scale/travel`);
      surfaces.push({label,enter,exit,verdict:exit.some(r=>r.display!=='none'&&r.opacity>0&&r.opacity<1)?'fade':'instant hide'});
     }
     await page.locator('#listTab').click();await pause(page);
     const enter=await sample(page,'#addDestinationMenu',"document.querySelector('#rows .directory-add').click()"),exit=await sample(page,'#addDestinationMenu','closeDropdown(false)');assert.equal(exit.at(-1).display,'none');surfaces.push({label:'Add popover',enter,exit,verdict:exit.some(r=>r.display!=='none'&&r.opacity>0&&r.opacity<1)?'fade':'instant hide'});
     await page.locator('#mapTab').click();await pause(page);
     const far=await page.evaluate(()=>{const a=document.createElement('button');a.style.cssText='position:fixed;left:-1500px;top:-1500px;width:30px;height:30px';document.body.append(a);const g=mapClusters.find(g=>g.members.length>3);if(!g)throw Error('No cluster fixture');openCluster(g,a,true);const p=document.querySelector('#clusterPopover'),s=getComputedStyle(p);return {origin:p.style.getPropertyValue('--menu-origin'),computed:s.transformOrigin,w:p.offsetWidth,h:p.offsetHeight};});assert.equal(far.origin,'50% 50%');
     await shot(page,`${name}-${reduced?'reduced':'full'}-far-origin`);await page.evaluate(()=>closeCluster());
     report.matrix.push({browser:name,reduced,support,surfaces,far});await page.context().close();
    }
    if(name==='chromium'){
     const page=await open(browser,'/',{flat:true});
     const target=await page.evaluate(async()=>{const b=document.querySelector('#siteMenuButton');window.__clicks=0;b.addEventListener('click',()=>__clicks++);const start=document.startViewTransition.bind(document);window.__transitionReady=null;document.startViewTransition=(...args)=>{const t=start(...args);__transitionReady=t.ready;return t;};document.querySelector('[data-theme-toggle]').click();await __transitionReady;const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,pointer:getComputedStyle(document.documentElement,'::view-transition').pointerEvents,switching:document.documentElement.classList.contains('theme-switching')};});
     await page.mouse.click(target.x,target.y);const during={...target,received:await page.evaluate(()=>__clicks),menuOpen:await page.locator('#siteMenu').evaluate(n=>!n.hidden)};await page.waitForFunction(()=>!document.documentElement.classList.contains('theme-switching'));await page.mouse.click(target.x,target.y);during.afterSettled=await page.evaluate(()=>({received:__clicks,menuOpen:!document.querySelector('#siteMenu').hidden}));assert.equal(during.afterSettled.received,1);report.clicks.push(during);await page.context().close();
    }
   }finally{await browser.close();}
  }
 }
 fs.writeFileSync(`${out}/${mode}.json`,JSON.stringify(report,null,2));assert.deepEqual(report.pageErrors,[]);console.log(`PASS Prompt 4 ${mode}: ${report.clay.length} clay viewports, ${report.matrix.length} browser rows`);
}finally{server.close();fs.writeFileSync(`${out}/${mode}.json`,JSON.stringify(report,null,2));}
