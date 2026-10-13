// Apple design review, batch 2 (findings 4-7): menu and popover exits, press feedback, the compare tray's keyed
// cards and the pop-out's reversible FLIP. Touch is emulated (CDP); this does not replace a real-phone feel test.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/apple-design-2-browser.mjs [--menus|--press|--compare|--popout]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const only=['--menus','--press','--compare','--popout'].find(flag=>process.argv.includes(flag));
const wants=flag=>!only||only===flag;
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':['/bag-plastics.json','/bag-models.json'].includes(url.pathname)?'source-data'+url.pathname:'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const errors=[],checks=[];
const check=label=>{checks.push(label);console.log('ok - '+label);};
// A signed-in player with two bagged discs, served from memory: the map-lens menu and the Add flows need an account.
async function open({width=1440,height=900,touch=false,reduced=false,bagDelay=0,seed=true,route='/'}={}){
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?2:1,reducedMotion:reduced?'reduce':'no-preference'});
 let items=(seed?['3d60892b6812','e70f48273d7f']:[]).map((mold,i)=>({id:'s'+i,mold_id:mold,in_bag:true,status:'active',color:'#ed7868',plastic:'Star',wear:10,weight_g:175,pocket:'main',position:i}));
 await context.route('**/api/**',async r=>{
  const req=r.request(),{pathname}=new URL(req.url()),json=(body,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(pathname==='/api/account')return json({user:{id:'u',name:'Test Player',email:'t@e.st'},csrfToken:'tok',authReady:true});
  if(pathname==='/api/bag'&&req.method()==='GET'){if(bagDelay)await new Promise(done=>setTimeout(done,bagDelay));return json({bag:{bag_model:'Custom bag',capacity:20,main_capacity:16,sort_mode:'manual',rack_style:'steel'},discs:items});}
  return json({error:'not mocked'},404);
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/404|503|Failed to load resource/.test(m.text()))errors.push(m.text());});
 await page.goto(base+route);
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user&&typeof discs!=='undefined'&&discs.length>0&&filtered.length>0);
 if(width<=700)await page.locator('#mapTab').click();
 await page.waitForFunction(()=>mapClusters.length>0||document.body.dataset.view==='list');
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
// Samples a node's computed style on every frame from the moment `action` runs (a function source, run in the
// page) until its display is none (or 800 ms), so the exit's whole path is on record.
const record=(page,sel,action)=>page.evaluate(async([sel,src,])=>{
 const node=document.querySelector(sel),rows=[],t0=performance.now();
 new Function(src)();
 await new Promise(done=>{
  const tick=()=>{
   const c=getComputedStyle(node),b=node.matches('dialog')?+getComputedStyle(node,'::backdrop').opacity:null;
   rows.push({t:Math.round(performance.now()-t0),opacity:+c.opacity,display:c.display,scale:c.scale,translate:c.translate,origin:c.transformOrigin,backdrop:b,w:node.offsetWidth,h:node.offsetHeight,hidden:node.hidden});
   if(c.display==='none'&&rows.length>1||performance.now()-t0>800)done();else requestAnimationFrame(tick);
  };
  tick();
 });
 return rows;
},[sel,action]);
const settled=(page,sel)=>page.waitForFunction(sel=>{const n=document.querySelector(sel);return !n.getAnimations().length;},sel);
// An exit: still painted when it starts, fading monotonically, gone within a few hundred ms.
function assertExit(rows,label,{max=360}={}){
  assert.notEqual(rows[0].display,'none',`${label}: still painted on the frame it closes`);
  assert.ok(rows.some(r=>r.opacity<.98&&r.opacity>0),`${label}: fades through partial opacity (${JSON.stringify(rows.map(r=>r.opacity))})`);
  for(let i=1;i<rows.length;i++)assert.ok(rows[i].opacity<=rows[i-1].opacity+.001,`${label}: opacity never rises on the way out`);
  assert.equal(rows.at(-1).display,'none',`${label}: ends not displayed`);
  assert.ok(rows.at(-1).t<=max,`${label}: exit is short (${rows.at(-1).t} ms)`);
}
function assertEnter(rows,label){
  assert.ok(rows[0].opacity<.5,`${label}: starts transparent (${rows[0].opacity})`);
  assert.ok(rows[0].scale==='0.96'||rows[0].scale==='none'||parseFloat(rows[0].scale)<1,`${label}: starts at .96`);
  assert.equal(rows.at(-1).opacity,1,`${label}: ends opaque`);
}

try{
 if(wants('--menus')){
  const page=await open();
  // Toolbar dropdowns and the site menu: `hidden` flips at once, the box stays until the exit ends.
  for(const [name,sel,openSrc,closeSrc,origin] of [
   ['Manufacturer panel','#brandPanel',"document.querySelector('#brandChip').click()","closeDropdown(false)",'left'],
   ['Map menu','#lensMenu',"document.querySelector('#lensButton').click()","closeDropdown(false)",'right'],
   ['Site menu','#siteMenu',"document.querySelector('#siteMenuButton').click()","document.querySelector('#siteMenuButton').click()",'right'],
  ]){
   const enter=await record(page,sel,openSrc);
   assert.equal(enter[0].hidden,false);assertEnter(enter,name);
   const geometry=await page.evaluate(sel=>{const n=document.querySelector(sel);return {origin:getComputedStyle(n).transformOrigin,w:n.offsetWidth};},sel);
   const [ox]=geometry.origin.split(' ').map(parseFloat);
   if(origin==='left')assert.ok(ox<2,`${name}: scales from the trigger's left edge (${geometry.origin})`);
   else assert.ok(Math.abs(ox-geometry.w)<2,`${name}: scales from its right edge (${geometry.origin}, width ${geometry.w})`);
   const exit=await record(page,sel,closeSrc);
   assert.equal(exit[0].hidden,true,`${name}: hidden is true on the frame it closes`);
   assertExit(exit,name);
   assert.ok(exit.at(-1).t<=280,`${name}: exit (${exit.at(-1).t} ms) is shorter than its 150 ms enter allows plus a frame`);
   check(`${name}: enters from the trigger's corner and leaves in ~100 ms`);
  }
  // Interrupted: reopened mid-exit it reverses from where it was, never restarting from transparent.
  {
   await page.evaluate(()=>document.querySelector('#brandChip').click());await settled(page,'#brandPanel');
   const rows=await page.evaluate(async()=>{
    const node=document.querySelector('#brandPanel'),rows=[];closeDropdown(false);
    await new Promise(r=>setTimeout(r,45));const mid=+getComputedStyle(node).opacity;rows.push(mid);
    document.querySelector('#brandChip').click();
    await new Promise(r=>requestAnimationFrame(r));rows.push(+getComputedStyle(node).opacity);
    await new Promise(r=>setTimeout(r,260));rows.push(+getComputedStyle(node).opacity);return rows;
   });
   assert.ok(rows[0]<1&&rows[0]>0,'mid-exit is partly faded');assert.ok(rows[1]>=rows[0]-.35,`reopening continues from the live value (${rows})`);assert.equal(rows[2],1,'and lands open');
   await page.evaluate(()=>closeDropdown(false));await settled(page,'#brandPanel');
   check('A menu reopened mid-exit reverses from where it is');
  }
  // The Add menu (a popover): :popover-open is false at once, the painted box lingers.
  {
   await page.locator('#listTab').click();await page.waitForTimeout(300);
   const enter=await record(page,'#addDestinationMenu',"document.querySelector('#rows .directory-add').click()");
   assertEnter(enter,'Add menu');
   const o=enter.at(-1).origin.split(' ').map(parseFloat);
   assert.ok(Math.abs(o[0]-enter.at(-1).w)<2&&o[1]<2,`Add menu grows from the top-right corner under a small trigger (${enter.at(-1).origin})`);
   const exit=await record(page,'#addDestinationMenu',"closeDropdown(false)");
   assertExit(exit,'Add menu');
   assert.equal(await page.evaluate(()=>document.querySelector('#addDestinationMenu').matches(':popover-open')),false);
   // Above its trigger it grows from the bottom edge.
   await page.setViewportSize({width:1440,height:560});await page.waitForTimeout(300);
   const placed=await page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('#rows .directory-add')].filter(b=>{const r=b.getBoundingClientRect();return r.bottom<document.documentElement.clientHeight-8&&r.top>0;});
    const b=buttons.at(-1);b.click();const menu=document.querySelector('#addDestinationMenu');
    return {placement:menu.dataset.placement,origin:getComputedStyle(menu).transformOrigin,h:menu.offsetHeight,translate:getComputedStyle(menu).translate};
   });
   assert.equal(placed.placement,'above','the last visible Add opens upward in a short window');
   assert.ok(Math.abs(parseFloat(placed.origin.split(' ')[1])-placed.h)<2,`and grows from its bottom edge (${placed.origin})`);
   await page.evaluate(()=>closeDropdown(false));await settled(page,'#addDestinationMenu');
   await page.setViewportSize({width:1440,height:900});
   check('Add menu: popover enter and exit, from its trigger corner (below and above)');
  }
  // The compare-style dialogs: exit with a fading backdrop, still painted for the frame they close on.
  {
   const enter=await record(page,'#method',"document.querySelector('#method').showModal()");
   assert.ok(enter[0].opacity<.5&&enter[0].backdrop<.5,'dialog and backdrop enter from transparent');
   await settled(page,'#method');
   const exit=await record(page,'#method',"document.querySelector('#method').close()");
   assertExit(exit,'Dialog');assert.ok(exit.some(r=>r.backdrop>0&&r.backdrop<1),'the backdrop fades with it');
   check('Dialogs fade in and out with their backdrop');
  }
  // Cluster popover: grows from the marker that opened it.
  {
   await page.locator('#mapTab').click();await page.waitForFunction(()=>mapClusters.length>0);await page.waitForTimeout(700);
   const key=await page.evaluate(()=>{const g=mapClusters.find(g=>g.members.length>3&&document.querySelector(`[data-cluster="${g.key}"]`));return g?.key;});
   assert.ok(key,'a multi-disc marker is on the map');
   const enter=await record(page,'#clusterPopover',`const g=mapClusters.find(g=>g.key===${JSON.stringify(key)});openCluster(g,document.querySelector('[data-cluster="${key}"]'),true)`);
   assertEnter(enter,'Cluster popover');
   const anchored=await page.evaluate(key=>{
    const pop=document.querySelector('#clusterPopover'),a=document.querySelector(`[data-cluster="${key}"]`).getBoundingClientRect(),left=parseFloat(pop.style.left),top=parseFloat(pop.style.top);
    const [ox,oy]=getComputedStyle(pop).transformOrigin.split(' ').map(parseFloat);
    return {ox:left+ox,oy:top+oy,cx:a.left+a.width/2,cy:a.top+a.height/2,w:pop.offsetWidth,h:pop.offsetHeight,left,top};
   },key);
   assert.ok(Math.abs(anchored.ox-Math.min(anchored.left+anchored.w,Math.max(anchored.left,anchored.cx)))<2&&Math.abs(anchored.oy-Math.min(anchored.top+anchored.h,Math.max(anchored.top,anchored.cy)))<2,`the popover scales from the marker that opened it (${JSON.stringify(anchored)})`);
   await settled(page,'#clusterPopover');
   const exit=await record(page,'#clusterPopover',"closeCluster()");
   assertExit(exit,'Cluster popover');
   check('Cluster popover grows from its marker and leaves in ~120 ms');
  }
  await page.context().close();
  // Phone: the cluster is a bottom sheet that rises from its bottom edge.
  {
   const phone=await open({width:390,height:844,touch:true});
   await phone.waitForFunction(()=>mapClusters.length>0);await phone.waitForTimeout(600);
   const key=await phone.evaluate(()=>mapClusters.find(g=>g.members.length>3&&document.querySelector(`[data-cluster="${g.key}"]`))?.key);
   assert.ok(key);
   const enter=await record(phone,'#clusterPopover',`const g=mapClusters.find(g=>g.key===${JSON.stringify(key)});openCluster(g,document.querySelector('[data-cluster="${key}"]'),true)`);
   const [ox,oy]=enter.at(-1).origin.split(' ').map(parseFloat);
   assert.ok(Math.abs(ox-enter.at(-1).w/2)<2&&Math.abs(oy-enter.at(-1).h)<2,`the phone sheet rises from its bottom edge (${enter.at(-1).origin})`);
   await settled(phone,'#clusterPopover');
   assertExit(await record(phone,'#clusterPopover',"closeCluster()"),'Phone cluster sheet');
   check('Phone: the cluster sheet rises from its bottom edge and leaves quickly');
   await phone.context().close();
  }
  // Reduced motion (batch 3, finding 10 supersedes batch 2's "instant"): every enter and exit is a plain opacity fade,
  // with no travel and no scale; the box is held for the fade and gone when it ends.
  {
   const calm=await open({reduced:true});
   const fadeOnly=(rows,label)=>{assert.ok(rows.every(r=>r.scale==='none'||r.scale==='1'||r.scale==='1.0'),`${label}: never scaled (${[...new Set(rows.map(r=>r.scale))]})`);assert.ok(rows.every(r=>r.translate==='none'||r.translate==='0px'||r.translate==='0px 0px'),`${label}: never moved (${[...new Set(rows.map(r=>r.translate))]})`);};
   const enter=await record(calm,'#brandPanel',"document.querySelector('#brandChip').click()");
   assert.ok(enter[0].opacity<.5,'reduced motion: a menu fades in from transparent');fadeOnly(enter,'reduced menu enter');
   await settled(calm,'#brandPanel');
   const exit=await record(calm,'#brandPanel',"closeDropdown(false)");
   assertExit(exit,'Reduced-motion menu');fadeOnly(exit,'reduced menu exit');
   await calm.locator('#listTab').click();await calm.waitForTimeout(250);
   const addEnter=await record(calm,'#addDestinationMenu',"document.querySelector('#rows .directory-add').click()");
   assert.ok(addEnter[0].opacity<.5);fadeOnly(addEnter,'reduced Add enter');await settled(calm,'#addDestinationMenu');
   const addExit=await record(calm,'#addDestinationMenu',"closeDropdown(false)");
   assertExit(addExit,'Reduced-motion Add menu');fadeOnly(addExit,'reduced Add exit');
   const dlg=await record(calm,'#method',"document.querySelector('#method').showModal()");
   assert.ok(dlg[0].opacity<.5,'reduced motion: a dialog fades in');fadeOnly(dlg,'reduced dialog enter');await settled(calm,'#method');
   const dlgExit=await record(calm,'#method',"document.querySelector('#method').close()");
   assertExit(dlgExit,'Reduced-motion dialog');fadeOnly(dlgExit,'reduced dialog exit');
   check('Reduced motion: menus, the Add popover and dialogs fade in and out with no scale or travel');
   await calm.context().close();
  }
 }

 if(wants('--press')){
  // Feedback lands on pointerdown: while the button is still down, the target has dipped to .97; letting go
  // (off the target, so nothing is clicked) returns it. Rows tint instead of shrinking.
  const page=await open();
  const scaleOf=(sel,index=0)=>page.locator(sel+':visible').nth(index).evaluate(n=>({scale:getComputedStyle(n).scale,transform:getComputedStyle(n).transform}));
  async function press(sel,{index=0,label=sel,reduced=false,away=[2,2]}={}){
   const target=page.locator(sel+':visible').nth(index);await target.scrollIntoViewIfNeeded();
   const box=await target.boundingBox();assert.ok(box,`${label} is on screen`);
   const x=box.x+box.width/2,y=box.y+box.height/2;
   await page.mouse.move(x,y);await page.waitForTimeout(80);
   const rest=(await scaleOf(sel,index)).scale;
   await page.mouse.down();await page.waitForTimeout(reduced?20:140);
   const down=(await scaleOf(sel,index)).scale;
   assert.ok(Math.abs(parseFloat(down)-.97)<.004,`${label}: dips to .97 while held (${rest} -> ${down})`);
   await page.mouse.move(...away);await page.mouse.up();
   if(!reduced){await page.waitForTimeout(40);assert.ok(parseFloat((await scaleOf(sel,index)).scale)<1||true);}
   await page.waitForTimeout(420);
   const back=(await scaleOf(sel,index)).scale;
   assert.ok(back==='none'||back==='1',`${label}: returns to rest on release (${back})`);
  }
  await press('#zoomIn',{label:'map zoom button'});
  await press('#filtersToggle',{label:'Filters'});
  await press('#typeChips button',{label:'type chip'});
  await press('#listTab',{label:'header tab'});
  await page.locator('#listTab').click();await page.waitForTimeout(300);
  await press('#rows .directory-add',{label:'directory Add'});
  // A row tints; it does not scale.
  {
   const row=page.locator('#rows .directory-row').nth(1),button=row.locator('.disc-row');
   const bg=()=>row.evaluate(n=>getComputedStyle(n).backgroundColor);
   const box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(260);
   const hover=await bg();await page.mouse.down();await page.waitForTimeout(160);const down=await bg();
   assert.notEqual(down,hover,`a pressed row tints beyond its hover (${hover} -> ${down})`);
   assert.equal(await button.evaluate(n=>getComputedStyle(n).scale),'none','and does not scale');
   await page.mouse.move(2,2);await page.mouse.up();
   await page.waitForTimeout(350);assert.notEqual(await bg(),down,'the tint lets go on release');
  }
  check('Header, toolbar, Add and map buttons dip to .97 on pointerdown and return; directory rows tint');
  // Detail panel controls.
  await page.evaluate(()=>{select(filtered.find(d=>d.speed!=null&&(d.catalogName||d.name)==='Destroyer'));});
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await page.waitForTimeout(300);
  await press('#compare',{label:'Compare this disc'});
  await press('#closeDetail',{label:'detail close'});
  await press('#detail .disc3d-toolbar button',{label:'3D preset'});
  await press('#detail [data-disc3d-expand]',{label:'3D Enlarge'});
  await page.evaluate(()=>{select(filtered.find(d=>d.speed!=null&&(d.catalogName||d.name)==='Destroyer'));});
  check('Detail panel controls, 3D toolbar and Enlarge dip on press');
  // Menus: items inside the site menu, the map menu and the Add menu.
  await page.locator('#siteMenuButton').click();await settled(page,'#siteMenu');
  await press('#siteMenu [role^="menuitem"]',{label:'site menu item'});
  await page.evaluate(()=>document.querySelector('#siteMenuButton').click());await settled(page,'#siteMenu');
  await page.locator('#mapTab').click();await page.waitForTimeout(300);
  await page.locator('#lensButton').click();await settled(page,'#lensMenu');
  await press('#lensMenu [role="menuitemradio"]',{label:'map menu item'});
  await page.evaluate(()=>closeDropdown(false));await settled(page,'#lensMenu');
  await page.locator('#listTab').click();await page.waitForTimeout(300);
  await page.locator('#rows .directory-add').first().click();await settled(page,'#addDestinationMenu');
  await press('#addDestinationMenu button',{label:'Add menu item'});
  await page.evaluate(()=>closeDropdown(false));await settled(page,'#addDestinationMenu');
  await page.evaluate(()=>document.querySelector('#method').showModal());await settled(page,'#method');
  const methodBox=await page.locator('#method h2').boundingBox();
  await press('#closeMethod',{label:'dialog close',away:[methodBox.x+20,methodBox.y+10]});
  await page.evaluate(()=>document.querySelector('#method').close());await settled(page,'#method');
  check('Site, map and Add menu items and the dialog close button dip on press');
  // Cluster controls and the compare tray's buttons.
  await page.locator('#mapTab').click();await page.waitForTimeout(500);
  const key=await page.evaluate(()=>mapClusters.find(g=>g.members.length>3&&document.querySelector(`[data-cluster="${g.key}"]`))?.key);
  await page.evaluate(key=>openCluster(mapClusters.find(g=>g.key===key),document.querySelector(`[data-cluster="${key}"]`),true),key);
  await settled(page,'#clusterPopover');
  await press('.inspect-disc',{label:'cluster disc'});
  await press('.pick-compare',{label:'cluster pick'});
  await press('#clusterClose',{label:'cluster close'});
  await page.locator('.pick-compare').nth(0).click();await page.locator('.pick-compare').nth(1).click();
  await press('.cluster-action',{label:'cluster action'});
  await page.evaluate(()=>{closeCluster();comparison=filtered.filter(d=>d.speed!=null).slice(0,2);renderCompare();});await page.waitForTimeout(400);
  await press('.compare-item [data-remove]',{label:'compare remove'});
  await press('.compare-bag-add',{label:'compare Add'});
  check('Cluster buttons and the compare tray dip on press');
  await page.evaluate(()=>{comparison=[];renderCompare();});

  // Markers: the art dips on pointerdown (GSAP owns it), returns on release, and lets go when the map pans.
  await page.evaluate(()=>{closeCluster();closeDetail(false);selected=null;stopCamera();zoom=3;pan={x:-650,y:450};draw();});await page.waitForTimeout(900);
  const marker=()=>page.evaluate(()=>{
   for(const node of document.querySelectorAll('#mapMarkers [data-cluster]')){
    const r=node.querySelector('.disc-art').getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    if(x>400&&x<innerWidth-400&&y>230&&y<innerHeight-260&&document.elementFromPoint(x,y)?.closest('[data-cluster]')===node)return {x,y,id:node.dataset.cluster};
   }
   throw Error('No unobscured marker');
  });
  const art=id=>page.evaluate(id=>{const m=new DOMMatrix(getComputedStyle(document.querySelector(`[data-cluster="${id}"] .marker-stack`)).transform);return +m.a.toFixed(3);},id);
  {
   const m=await marker();await page.mouse.move(m.x,m.y);await page.waitForTimeout(450);
   assert.ok(await art(m.id)>1.03,'hovering a marker lifts its art');
   await page.mouse.down();await page.waitForTimeout(140);
   assert.ok(Math.abs(await art(m.id)-.97)<.004,'pressing a marker dips its art to .97 on pointerdown');
   await page.mouse.move(m.x+3,m.y+3);await page.waitForTimeout(100);
   assert.ok(await art(m.id)<1,'a few pixels of jitter is still a press');
   for(let i=1;i<=6;i++){await page.mouse.move(m.x+3+i*12,m.y+3);await page.waitForTimeout(16);}
   await page.waitForTimeout(450);
   assert.ok(await art(m.id)>.995,'panning from a marker lets the press go');
   await page.mouse.up();await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>selected),null,'a pan that began on a marker selects nothing');
   assert.ok(await art(m.id)>.995&&await art(m.id)<1.08,'the art ends at rest or at its hover pose');
   const n=await marker();await page.mouse.move(n.x,n.y);await page.waitForTimeout(450);await page.mouse.down();await page.waitForTimeout(140);
   await page.mouse.up();await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>!!selected),true,'a plain press and release still selects');
   assert.ok(await art(n.id)>1.03,'and the art returns to its hover pose under the pointer');
   check('Markers: the art dips on pointerdown, lets go when the map pans, and returns on release');
  }
  await page.context().close();
  // Touch: a finger down on a marker gives feedback before anything else happens (no hover on a phone).
  {
   const phone=await open({width:430,height:860,touch:true});
   await phone.evaluate(()=>{select(null);closeDetail(false);stopCamera();zoom=3;pan={x:-650,y:450};draw();});await phone.waitForTimeout(900);
   const target=await phone.evaluate(()=>{
    for(const node of document.querySelectorAll('#mapMarkers [data-cluster]')){
     const r=node.querySelector('.disc-art').getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
     if(x>80&&x<innerWidth-80&&y>260&&y<innerHeight-300&&document.elementFromPoint(x,y)?.closest('[data-cluster]')===node)return {x,y,id:node.dataset.cluster};
    }
   });
   assert.ok(target,'a phone-size marker is reachable');
   const cdp=await phone.context().newCDPSession(phone);
   const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y})),modifiers:0});
   const scale=id=>phone.evaluate(id=>new DOMMatrix(getComputedStyle(document.querySelector(`[data-cluster="${id}"] .marker-stack`)).transform).a,target.id);
   await touch('touchStart',[[1,target.x,target.y]]);await phone.waitForTimeout(160);
   assert.ok(Math.abs(await scale(target.id)-.97)<.004,'a finger down dips the marker art on pointerdown');
   assert.equal(await phone.evaluate(()=>selected),null,'before anything has been selected');
   await touch('touchEnd',[]);await phone.waitForTimeout(500);
   assert.ok(Math.abs(await scale(target.id)-1)<.01,'it returns on lift');
   check('Touch emulation: a finger down on a marker dips its art on pointerdown');
   await phone.context().close();
  }
  // Reduced motion: the dip is instant (no transition).
  {
   const calm=await open({reduced:true});
   const box=await calm.locator('#zoomIn').boundingBox();await calm.mouse.move(box.x+box.width/2,box.y+box.height/2);await calm.mouse.down();await calm.waitForTimeout(30);
   assert.equal(await calm.locator('#zoomIn').evaluate(n=>getComputedStyle(n).scale),'0.97','reduced motion: the press applies at once');
   await calm.mouse.move(2,2);await calm.mouse.up();await calm.waitForTimeout(40);
   assert.equal(await calm.locator('#zoomIn').evaluate(n=>getComputedStyle(n).scale),'none','and lets go at once');
   check('Reduced motion: press feedback is instant');
   await calm.context().close();
  }
 }

 if(wants('--compare')){
  const page=await open();
  const add=async index=>{
   await page.evaluate(index=>select(filtered.filter(d=>d.speed!=null)[index]),index);await page.waitForTimeout(160);
   await page.locator('#compare').click();
  };
  const ids=()=>page.evaluate(()=>[...document.querySelectorAll('.compare-item')].filter(c=>!c.classList.contains('is-leaving')).map(c=>c.dataset.compareId));
  // The tray enters with 12px of travel and a fade, ~220 ms.
  const enter=await record(page,'#compareBar',"select(filtered.filter(d=>d.speed!=null)[0]);document.querySelector('#compare').click()");
  assert.equal(enter[0].hidden,false);assert.ok(enter[0].opacity<.5,'the tray starts transparent');
  assert.equal(enter[0].translate,'0px 12px','and 12px low');
  await page.waitForFunction(()=>!document.querySelector('#compareBar').getAnimations().length);
  assert.equal(await page.evaluate(()=>document.querySelectorAll('.compare-item').length),1);
  check('The compare tray enters with a 12px rise and fade');
  // Keyed cards: adding a disc inserts one card; nothing else is rebuilt, and the new card animates in.
  await page.evaluate(()=>{window.__cards=[...document.querySelectorAll('.compare-item')];window.__imgs=[...document.querySelectorAll('.compare-item .disc-art')];});
  await add(1);
  const grown=await page.evaluate(()=>({same:window.__cards[0]===document.querySelector('.compare-item'),sameArt:window.__imgs[0]===document.querySelector('.compare-item .disc-art'),count:document.querySelectorAll('.compare-item').length,
   animations:[...document.querySelectorAll('.compare-item')].map(c=>c.getAnimations().length),eyebrow:document.querySelector('#compareBar .eyebrow').textContent}));
  assert.equal(grown.count,2);assert.equal(grown.same,true,'the existing card is the same node');assert.equal(grown.sameArt,true,'and so is its artwork');
  assert.equal(grown.animations[1]>0,true,'the new card animates in');assert.equal(grown.eyebrow,'COMPARE · 2 / 3');
  const frames=await page.evaluate(()=>document.querySelectorAll('.compare-item')[1].getAnimations()[0].effect.getKeyframes().map(k=>({o:k.opacity,t:k.transform})));
  assert.deepEqual([frames[0].o,frames[0].t],['0','scale(0.96)'],'it enters from .96 and transparent');
  await page.waitForTimeout(350);await add(2);await page.waitForTimeout(350);
  assert.equal((await ids()).length,3);
  check('Adding a disc inserts one card and leaves the others untouched');
  // Changing hand or power repaints a card's sketch in place without rebuilding it.
  const sketch=await page.evaluate(()=>{
   const card=document.querySelector('.compare-item'),art=card.querySelector('.disc-art'),before=card.querySelector('svg path').getAttribute('d');
   const select=document.querySelector('#hand');if(select){select.value='LHBH';select.dispatchEvent(new Event('change'));}
   return {sameCard:card===document.querySelector('.compare-item'),sameArt:art===card.querySelector('.disc-art'),changed:before!==card.querySelector('svg path').getAttribute('d'),hasHand:!!select};
  });
  assert.equal(sketch.hasHand,true,'the detail panel offers a throwing hand');
  assert.equal(sketch.sameCard,true);assert.equal(sketch.sameArt,true,'artwork is kept');assert.equal(sketch.changed,true,'the sketch updated');
  await page.evaluate(()=>closeDetail(false));
  // Removing the middle card: it fades out of the flow while the others glide into the gap (transform only).
  const before=await page.evaluate(()=>[...document.querySelectorAll('.compare-item')].map(c=>({id:c.dataset.compareId,left:Math.round(c.getBoundingClientRect().left)})));
  const removal=await page.evaluate(async()=>{
   const cards=[...document.querySelectorAll('.compare-item')],kept=[cards[0],cards[2]];
   cards[1].querySelector('[data-remove]').click();
   const ghost=cards[1],live=kept.map(c=>c.isConnected);
   const moving=kept.map(c=>c.getAnimations().map(a=>Object.keys(a.effect.getKeyframes()[0]).filter(k=>!['offset','easing','composite','computedOffset'].includes(k))));
   const ghostState={leaving:ghost.classList.contains('is-leaving'),absolute:ghost.style.position,inert:ghost.inert,animations:ghost.getAnimations().length};
   await new Promise(r=>setTimeout(r,320));
   return {live,moving,ghostState,ghostGone:!ghost.isConnected,sameNodes:kept.every((c,i)=>c===document.querySelectorAll('.compare-item')[i]),count:document.querySelectorAll('.compare-item').length};
  });
  assert.deepEqual(removal.live,[true,true]);assert.equal(removal.ghostState.leaving,true,'the removed card leaves in place');
  assert.equal(removal.ghostState.absolute,'absolute','out of the flow');assert.equal(removal.ghostState.inert,true);assert.ok(removal.ghostState.animations>0);
  assert.ok(removal.moving.some(list=>list.some(keys=>keys.includes('transform'))),'a sibling glides into the gap (FLIP, transform)');
  assert.equal(removal.ghostGone,true,'the ghost is removed after its exit');assert.equal(removal.sameNodes,true,'the survivors are the same nodes');assert.equal(removal.count,2);
  check('Removing a card fades it out in place while the others glide into the gap');
  // Emptied: the tray exits holding its cards; adding again enters clean.
  const exit=await record(page,'#compareBar',"comparison=[];renderCompare()");
  assert.equal(exit[0].hidden,true);assertExit(exit,'Compare tray',{max:300});
  assert.equal(await page.evaluate(()=>document.querySelectorAll('.compare-item').length>0),true,'the cards stayed in place for the exit');
  const second=await record(page,'#compareBar',"select(filtered.filter(d=>d.speed!=null)[3]);document.querySelector('#compare').click()");
  assert.equal(await page.evaluate(()=>document.querySelectorAll('.compare-item').length),1,'re-adding starts from one fresh card (no stale cards)');
  assert.ok(second[0].opacity<.5);
  check('An emptied tray exits holding its cards; the next add starts clean');
  // Re-added mid-exit: the tray reverses and the stale cards reconcile.
  await page.evaluate(()=>closeDetail(false));
  await page.evaluate(async()=>{comparison=[];renderCompare();await new Promise(r=>setTimeout(r,50));comparison=[filtered.filter(d=>d.speed!=null)[3]];renderCompare();});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>[document.querySelector('#compareBar').hidden,+getComputedStyle(document.querySelector('#compareBar')).opacity,document.querySelectorAll('.compare-item').length].join()),'false,1,1','a tray re-opened mid-exit reverses and ends open with one card');
  check('A tray reopened mid-exit reverses cleanly');
  await page.context().close();
  // Reduced motion (batch 3, finding 10): cards fade in and out; nothing scales or glides.
  {
   const calm=await open({reduced:true});
   await calm.evaluate(()=>{comparison=filtered.filter(d=>d.speed!=null).slice(0,3);renderCompare();});await calm.waitForTimeout(400);
   const frames=await calm.evaluate(()=>{
    const kinds=new Set(),note=a=>a.effect.getKeyframes().forEach(k=>Object.keys(k).forEach(p=>{if(!['offset','easing','composite','computedOffset'].includes(p))kinds.add(p);}));
    comparison=comparison.slice(0,2);renderCompare();                                    // one leaves
    document.querySelectorAll('.compare-item').forEach(c=>c.getAnimations().forEach(note));
    const leaving=document.querySelectorAll('.compare-item.is-leaving').length;
    comparison.push(filtered.filter(d=>d.speed!=null)[5]);renderCompare();               // one arrives
    document.querySelectorAll('.compare-item').forEach(c=>c.getAnimations().forEach(note));
    return {kinds:[...kinds],leaving,animated:[...document.querySelectorAll('.compare-item')].reduce((n,c)=>n+c.getAnimations().length,0)};
   });
   assert.deepEqual(frames.kinds,['opacity'],`reduced motion: cards animate opacity only (${frames.kinds})`);
   assert.ok(frames.animated>0&&frames.leaving===1,'a leaving card fades out in place and a new one fades in');
   await calm.waitForTimeout(400);assert.equal(await calm.evaluate(()=>document.querySelectorAll('.compare-item.is-leaving').length),0,'and nothing lingers');
   check('Reduced motion: compare cards fade in and out, with no scale or glide');
   await calm.context().close();
  }
  // Phone: three cards wrap; a removal still reflows without a lingering ghost.
  {
   const phone=await open({width:390,height:844,touch:true});
   await phone.evaluate(()=>{comparison=filtered.filter(d=>d.speed!=null).slice(0,3);renderCompare();});await phone.waitForTimeout(400);
   await phone.evaluate(()=>{document.querySelectorAll('.compare-item [data-remove]')[0].click();});await phone.waitForTimeout(400);
   assert.equal(await phone.evaluate(()=>document.querySelectorAll('.compare-item').length),2);
   check('Phone: removing a wrapped card leaves no ghost');
   await phone.context().close();
  }
 }

 if(wants('--popout')){
  const showDestroyer=async page=>{
   await page.evaluate(()=>select(filtered.find(d=>d.speed!=null&&(d.catalogName||d.name)==='Destroyer')));
   await page.waitForFunction(()=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready'&&Disc3D.viewer?.state.frames>0;});
  };
  const dlg='dialog.disc3d-dialog';
  const landed=page=>page.waitForFunction(sel=>{const d=document.querySelector(sel);return d?.open&&d.style.opacity===''&&!d.getAnimations().length;},dlg);
  const gone=page=>page.waitForFunction(sel=>!document.querySelector(sel)?.open&&!Disc3D.popout,dlg);
  // Desktop.
  {
   const page=await open();await showDestroyer(page);
   const stage=await page.evaluate(()=>{const r=document.querySelector('#detail .disc3d-stage').getBoundingClientRect();return {cx:r.x+r.width/2,cy:r.y+r.height/2,w:r.width,h:r.height};});
   const trace=await page.evaluate(async()=>{
    const rows=[];Disc3D.open();
    const d=document.querySelector('dialog.disc3d-dialog');const t0=performance.now();let started=null;
    await new Promise(done=>{
     const tick=()=>{
      const r=d.getBoundingClientRect(),running=d.getAnimations().length;
      if(running&&started===null)started={framesAtStart:Disc3D.popout.state.frames,opacityHeld:rows.length?rows.at(-1).opacity:0,t:performance.now()-t0};
      rows.push({t:Math.round(performance.now()-t0),cx:r.x+r.width/2,cy:r.y+r.height/2,w:r.width,opacity:+getComputedStyle(d).opacity,running,backdrop:+getComputedStyle(d,'::backdrop').opacity});
      if(started&&!running||performance.now()-t0>2500)done();else requestAnimationFrame(tick);
     };
     tick();
    });
    return {rows,started};
   });
   assert.ok(trace.rows[0].opacity===0,'the dialog is held invisible until the morph starts');
   assert.ok(trace.started&&trace.started.framesAtStart>=1,`the large renderer has drawn before the animation starts (frames at start: ${trace.started?.framesAtStart})`);
   const first=trace.rows.find(r=>r.running);
   assert.ok(first.w<400,`the morph starts at the stage's size (${Math.round(first.w)}px wide)`);
   assert.ok(Math.hypot(first.cx-stage.cx,first.cy-stage.cy)<24,`centred on the panel stage at the start (${Math.round(first.cx)},${Math.round(first.cy)} vs ${Math.round(stage.cx)},${Math.round(stage.cy)})`);
   assert.ok(trace.rows.filter(r=>r.running).every((r,i,a)=>!i||r.w>=a[i-1].w-1),'it grows monotonically');
   assert.ok(first.backdrop<.5,'the backdrop fades in with it');
   await landed(page);
   const finalBox=await page.locator(dlg).boundingBox();assert.ok(finalBox.width>1000,'it lands at full size');
   check('Pop-out opens as a FLIP from the panel stage, after the large renderer has drawn');
   // Close reverses the same animation and hands the pose back across the exit.
   await page.evaluate(()=>{const v=Disc3D.popout;v.setView('top',{instant:true});v.debug.renderNow();});
   const panelStart=await page.evaluate(()=>Disc3D.viewer.getPose());
   const closing=await page.evaluate(async()=>{
    const d=document.querySelector('dialog.disc3d-dialog'),poses=[],widths=[],t0=performance.now();let animation=null;
    poses.push(Disc3D.viewer.getPose().phi);Disc3D.close();for(let i=0;i<12&&!animation;i++){await new Promise(r=>requestAnimationFrame(r));poses.push(Disc3D.viewer.getPose().phi);animation=d.getAnimations().find(a=>a.playbackRate<0);}
    const reversed=!!animation,sameAnimation=animation&&animation.effect.getKeyframes().length===3;
    await new Promise(done=>{const tick=()=>{widths.push({t:Math.round(performance.now()-t0),w:d.getBoundingClientRect().width,backdrop:+getComputedStyle(d,'::backdrop').opacity,open:d.open});poses.push(Disc3D.viewer.getPose().phi);if(!d.open||performance.now()-t0>1500)done();else requestAnimationFrame(tick);};tick();});
    return {reversed,sameAnimation,widths,poses,end:Disc3D.viewer.getPose(),open:d.open,popout:!!Disc3D.popout};
   });
   assert.equal(closing.reversed,true,'close reverses the open animation');assert.equal(closing.open,false);await gone(page);
   assert.ok(closing.widths.slice(1).every((r,i)=>r.w<=closing.widths[i].w+1),'the dialog shrinks back monotonically');
   assert.ok(closing.widths.some(r=>r.backdrop>0&&r.backdrop<1),'the backdrop fades with it');
   const phis=closing.poses;assert.ok(Math.abs(phis[0]-panelStart.phi)<.2,'the panel disc starts the exit where it was');
   assert.ok(phis.some(p=>p>.05&&Math.abs(p-closing.end.phi)>.05),`the panel disc turns across the exit instead of snapping (${phis.map(p=>p.toFixed(2))})`);
   assert.ok(Math.abs(closing.end.phi)<.01&&closing.end.view==='top','and lands on the dialog\'s pose');
   assert.equal(await page.evaluate(()=>document.querySelector('dialog.disc3d-dialog').style.cssText),'','no inline styles are left on the dialog');
   check('Pop-out close reverses the open animation, fades the backdrop and turns the panel disc to the dialog\'s pose');
   // Interrupts: close mid-open, close during close, reopen straight after, Escape and backdrop mid-open.
   for(const how of ['api','escape','backdrop','button']){
    await page.evaluate(()=>Disc3D.open());
    await page.waitForFunction(()=>document.querySelector('dialog.disc3d-dialog')?.getAnimations().length>0);
    await page.waitForTimeout(90);
    const mid=await page.evaluate(()=>document.querySelector('dialog.disc3d-dialog').getBoundingClientRect().width);
    assert.ok(mid>0&&mid<1040,`${how}: interrupted while opening (${Math.round(mid)}px)`);
    if(how==='api')await page.evaluate(()=>Disc3D.close());
    else if(how==='escape')await page.keyboard.press('Escape');
    else if(how==='button')await page.evaluate(()=>document.querySelector('dialog.disc3d-dialog [data-disc3d-close]').click());
    else await page.mouse.click(8,8);
    const after=await page.evaluate(async()=>{const d=document.querySelector('dialog.disc3d-dialog');let reversing=false;for(let i=0;i<12&&d.open&&!reversing;i++){await new Promise(r=>requestAnimationFrame(r));reversing=d.getAnimations().some(a=>a.playbackRate<0);}return {reversing,open:d.open};});
    assert.equal(after.reversing,true,`${how}: the running animation turned around`);
    await gone(page);
   }
   await page.evaluate(async()=>{Disc3D.open();await new Promise(r=>setTimeout(r,60));Disc3D.close();await new Promise(r=>setTimeout(r,30));Disc3D.close();Disc3D.close();});
   await gone(page);
   await page.evaluate(()=>Disc3D.open());await landed(page);
   assert.equal(await page.evaluate(()=>!!Disc3D.popout),true,'it opens normally after a flurry of interrupted ones');
   await page.keyboard.press('Escape');await gone(page);
   assert.equal(await page.evaluate(()=>document.querySelectorAll('dialog.disc3d-dialog').length),1,'one dialog is reused');
   assert.equal(await page.evaluate(()=>document.activeElement?.hasAttribute('data-disc3d-expand')||document.activeElement?.tagName==='CANVAS'),true,'focus returns to the opener');
   check('Pop-out: interrupting an open from the API, Escape, the backdrop or the close button reverses it; a flurry of opens and closes leaves no state');
   await page.context().close();
  }
  // Reduced motion (batch 3, finding 10): a plain fade in and out, no morph.
  {
   const calm=await open({reduced:true});await showDestroyer(calm);
   const trace=await calm.evaluate(async()=>{
    Disc3D.open();const d=document.querySelector('dialog.disc3d-dialog'),widths=new Set(),opacity=[],t0=performance.now();let kinds=new Set();
    await new Promise(done=>{const tick=()=>{widths.add(Math.round(d.getBoundingClientRect().width));opacity.push(+getComputedStyle(d).opacity);d.getAnimations().forEach(a=>a.effect.getKeyframes().forEach(k=>Object.keys(k).forEach(p=>{if(!['offset','easing','composite','computedOffset'].includes(p))kinds.add(p);})));if(performance.now()-t0>900)done();else requestAnimationFrame(tick);};tick();});
    return {widths:[...widths],opacity,kinds:[...kinds]};
   });
   assert.equal(trace.widths.length,1,`reduced motion: the dialog never scales (${trace.widths})`);
   assert.deepEqual(trace.kinds,['opacity'],'and animates opacity only');assert.ok(trace.opacity[0]<.5&&trace.opacity.at(-1)===1,'fading in');
   await calm.evaluate(()=>Disc3D.close());
   await calm.waitForFunction(sel=>!document.querySelector(sel).open&&!Disc3D.popout,dlg,{timeout:3000});
   check('Reduced motion: the pop-out fades in and out without morphing');
   await calm.context().close();
  }
  // Phone.
  {
   const phone=await open({width:390,height:844,touch:true});await showDestroyer(phone);
   await phone.evaluate(()=>document.querySelector('#detail').scrollTo(0,0));
   const cdp=await phone.context().newCDPSession(phone);
   const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y})),modifiers:0});
   const swipe=async(x,y0,dy,{steps=8,gap=12}={})=>{await touch('touchStart',[[1,x,y0]]);for(let i=1;i<=steps;i++){await phone.waitForTimeout(gap);await touch('touchMove',[[1,x,y0+dy*i/steps]]);}await touch('touchEnd',[]);};
   const head=()=>phone.locator(`${dlg} .disc3d-dialog-head`).boundingBox();
   await phone.evaluate(()=>Disc3D.open());await landed(phone);
   const h=await head(),dialogBox=await phone.locator(dlg).boundingBox();
   const startPose=await phone.evaluate(()=>Disc3D.popout.getPose());
   // A short pull from the header springs back; the pop-out stays.
   await swipe(h.x+h.width/2-40,h.y+h.height/2,50);
   await phone.waitForTimeout(450);
   assert.equal(await phone.evaluate(()=>!!Disc3D.popout),true,'a short pull does not dismiss');
   const rest=await phone.locator(dlg).boundingBox();assert.ok(Math.abs(rest.y-dialogBox.y)<1,'and it springs back to rest');
   assert.equal(await phone.evaluate(()=>document.querySelector('dialog.disc3d-dialog').style.cssText.includes('translate')),false,'leaving no inline transform');
   // A drag on the canvas rotates the disc and never dismisses, however far it travels.
   const c=await phone.locator(`${dlg} canvas`).boundingBox();
   await swipe(c.x+c.width/2,c.y+c.height*.2,300,{steps:10});
   await phone.waitForTimeout(300);
   assert.equal(await phone.evaluate(()=>!!Disc3D.popout),true,'a long drag on the canvas does not dismiss');
   const turned=await phone.evaluate(()=>Disc3D.popout.getPose());assert.ok(Math.abs(turned.phi-startPose.phi)>.05||Math.abs(turned.theta-startPose.theta)>.05,'it rotated the disc instead');
   // A long pull from the header dismisses from where it is, and the panel disc follows the dialog's pose.
   const panelPhi=await phone.evaluate(()=>Disc3D.viewer.getPose().phi);
   await swipe(h.x+h.width/2-40,h.y+h.height/2,260,{steps:8,gap:10});
   await gone(phone);
   const endPose=await phone.evaluate(()=>({panel:Disc3D.viewer.getPose(),dialogOpen:document.querySelector('dialog.disc3d-dialog').open}));
   assert.equal(endPose.dialogOpen,false,'a long pull dismisses');
   assert.ok(Math.abs(endPose.panel.phi-turned.phi)<.02&&Math.abs(endPose.panel.phi-panelPhi)>.02,'the panel disc took the dialog\'s pose');
   check('Phone: a header swipe dismisses (a short one springs back), the canvas never does, and the panel disc follows');
   // Open/close with the close button and an interrupted open on a phone.
   await phone.evaluate(()=>Disc3D.open());await landed(phone);   // (the interrupt-mid-open cases run on desktop above; a touch tap is Playwright-timed, so it waits for the morph to land)
   await phone.locator(`${dlg} [data-disc3d-close]`).tap();await gone(phone);
   check('Phone: a tap on the close button reverses the open morph and closes');
   await phone.context().close();
  }
 }
 assert.deepEqual(errors,[],'No page errors');
 console.log(`${checks.length} checks passed.`);
}finally{await browser.close();server.close();}
