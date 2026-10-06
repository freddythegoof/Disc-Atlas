import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-interactions/d1-qa',base='https://localhost:8803',dir='outputs/bag-3d/slide-out';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8803','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],shots=[],checks=[],metrics={};
const check=label=>checks.push(label);
const inside=(rect,box,label)=>assert.ok(rect.left>=-1 && rect.top>=-1 && rect.left+rect.width<=box.width+1 && rect.top+rect.height<=box.height+1,`${label} stays inside the canvas: ${JSON.stringify({rect,box})}`);
const overlap=(a,b)=>a.left<b.left+b.width && b.left<a.left+a.width && a.top<b.top+b.height && b.top<a.top+a.height;
const hex=value=>[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
// Grip BX3 as carried: Järn go-to in the front pocket, four putters on top, eighteen in the main compartment.
const GOTO={mold_id:'ad2bfd8d9d50',plastic:'K1',wear:8,weight_g:174,color:'#4fa3d9',pocket:'goto',notes:'Upshots and the drive on 7'};
const PUTTERS=[['ff4bf9e7743c','Luna','#e2d8c1'],['761c90d342f5','Envy','#e6c668'],['3200f16f97df','Pure','#f29b6b'],['3ea9734a60f7','Aviar','#a7c6e8']];
const MAIN=[['3d60892b6812','#ed7868'],['3d60892b6812','#f0a35e'],['e70f48273d7f','#70b7cd'],['da3c28085382','#a7c68c'],['0fcd1f2937b1','#b99bdd'],['e9a88cc4f3b1','#e6c668'],['ba675aed468a','#d9a3c3'],['df3915bf7676','#79b3a8'],['35dae588c670','#f2d7a0'],['6be51219c6db','#8fb3e8'],['f6267498c9d2','#c99070'],['7446eb39abe5','#e8e3d3'],['7446eb39abe5','#9fd6c4'],['5f22688f2ee3','#f08fa8'],['850e9dc7104d','#c5b3f0'],['f5fb00eb9fa5','#b9d27e'],['8769ec70b5ad','#7fc4e0'],['b0b50b6a4551','#e9b44c']];
const putterName=mold=>PUTTERS.find(p=>p[0]===mold)[1];
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const navigations=[];page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations.push(frame.url());});
 const phase=want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.phase===w,want);
 const camera=want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.camera===w,want);
 // Waits until every staged disc (and the camera) has settled with at least one disc out.
 const slideOut=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.staging==='still' && Number(s.dataset.out)>0;});
 const slidHome=()=>page.waitForFunction(()=>{const v=document.querySelector('[data-bag-canvas]').bagViewer;return !v.outDiscs.length && !v.stage.moving && v.getBagLayoutState().every(d=>d.slide===0);});
 const viewer=(fn,arg)=>page.locator('[data-bag-canvas]').evaluate((n,[source,value])=>new Function('v','arg',`return (${source})(v,arg)`)(n.bagViewer,value),[fn.toString(),arg]);
 const canvasBox=()=>page.locator('[data-bag-canvas]').evaluate(n=>({width:n.clientWidth,height:n.clientHeight}));
 const local=locator=>locator.evaluate(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};});
 const setTheme=async theme=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const settle=()=>page.waitForTimeout(450);
 const shot=async(state,width,theme,target)=>{
  await page.evaluate(()=>document.fonts.ready);await settle();
  const name=`${state}-${width}-${theme}.png`;await target.screenshot({path:`${dir}/${name}`});shots.push({state,width,theme,name});
 };
 // Samples the rendered face of a disc: its center and four points at 30 % of its box from the
 // center must all show the disc's own color, so nothing (pocket, other discs, the canvas edge) covers it.
 const fullyVisible=async(id,color,label)=>{
  const rect=await viewer((v,id)=>v.discScreenRect(id),id),stage=await page.locator('[data-bag-canvas]').boundingBox();
  // Sample a viewport screenshot at viewport coordinates: the canvas may start above the viewport
  // (on phones the page scrolls the slid-out disc above the details sheet), where a clip would be cut.
  const cx=stage.x+rect.left+rect.width/2,cy=stage.y+rect.top+rect.height/2,points=[[0,0],[-.3,0],[.3,0],[0,-.3],[0,.3]].map(([dx,dy])=>[cx+dx*rect.width,cy+dy*rect.height]);
  const png=await page.screenshot();
  const samples=await page.evaluate(async([b64,points])=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);return points.map(([px,py])=>[...x.getImageData(Math.round(px),Math.round(py),1,1).data.slice(0,3)]);},[png.toString('base64'),points]);
  const want=hex(color),drift=Math.max(...samples.flatMap(rgb=>rgb.map((v,i)=>Math.abs(v-want[i]))));
  metrics[label]={rect:{top:Math.round(rect.top),left:Math.round(rect.left),size:Math.round(rect.width)},colorDrift:drift};
  inside(rect,await canvasBox(),label);assert.ok(drift<=48,`${label}: the whole face shows (max channel drift ${drift} from ${color}) ${JSON.stringify(samples)}`);
 };
 const scene=page.locator('#bagScene'),detail=page.locator('#detail'),pill=page.locator('.bag-hover-name'),nameOf=id=>page.locator(`[data-out-name="${id}"]`);
 const onBagPage=async name=>{
  assert.equal(await page.evaluate(()=>location.pathname+location.search),'/?bag=1',`${name}: URL stays on My Bag`);
  assert.ok(await page.locator('#myBagView').isVisible(),`${name}: My Bag stays visible`);
  assert.equal(await page.evaluate(()=>document.body.dataset.view),'bag',`${name}: never the Directory`);
 };

 // 1. Sign in and seed the Grip BX3, plus one unrated mold in Storage.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 await page.waitForFunction(()=>discs.length>0);
 const unrated=await page.evaluate(()=>discs.find(d=>d.speed==null && isCurrentOrRecent(d))?.id || discs.find(d=>d.speed==null).id);
 const rows=[{...GOTO},...PUTTERS.map(([mold_id,,color],i)=>({mold_id,plastic:'Base',wear:7,weight_g:173,color,pocket:'putter',...(i===1?{notes:'Circle 1 only'}:{})})),
  ...MAIN.map(([mold_id,color],i)=>({mold_id,plastic:i===0?'Star':'Champion',wear:i===0?4:7,weight_g:171,color,pocket:'main',...(i===0?{notes:'Flips up to flat on a hyzer. Keep for tailwind holes.',stability_bias:'less_stable'}:{})})),
  {mold_id:unrated,plastic:'Other',wear:10,weight_g:170,color:'#d9a3c3',in_bag:false}];
 const seeded=await page.evaluate(async rows=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},out=[];
  const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
  for(const disc of rows){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());out.push((await r.json()).disc);}
  return out;
 },rows);
 const goto=seeded[0],putters=seeded.slice(1,5),mains=seeded.slice(5,23),odd=seeded[23],driver=mains[0];
 assert.ok(putters.every(d=>d.pocket==='putter') && mains.every(d=>d.pocket==='main') && goto.pocket==='goto','Saved in the intended pockets');
 await page.reload();await phase('open');await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 navigations.length=0;
 const layout=await viewer(v=>v.getBagLayoutState().filter(d=>!d.empty));
 const pocketCount=pocket=>layout.filter(d=>d.pocket===pocket).length;
 assert.deepEqual([pocketCount('main'),pocketCount('putter'),pocketCount('goTo')],[18,4,1],'18 main, 4 putters, 1 go-to');
 assert.equal(layout.find(d=>d.pocket==='goTo').id,goto.id,'Järn rides in the front pocket');

 // 2. Putters stand in one neat row; the go-to renders clean.
 const row=layout.filter(d=>d.pocket==='putter').sort((a,b)=>a.order-b.order);
 assert.ok(row.every(d=>d.position[0]===0),'Putters share one x: no left/right jumble');
 const gaps=row.slice(1).map((d,i)=>[+(d.position[1]-row[i].position[1]).toFixed(6),+(row[i].position[2]-d.position[2]).toFixed(6)]);
 assert.ok(gaps.every(g=>g[0]>0 && g[0]===gaps[0][0] && g[1]===gaps[0][1]),'Even spacing: '+JSON.stringify(gaps));
 assert.equal(await viewer(v=>v.goToAccentVisible),false,'No go-to outline/rim');
 assert.ok(layout.every(d=>d.glow===0),'No disc glows (go-to included)');
 check('Grip BX3: 18 main, 4 putters in one aligned, evenly spaced row, Järn in the front pocket with no outline or glow');

 // 3. Hover shows only a name pill; the disc does not move.
 const box=await canvasBox(),driverSlot=page.locator(`[data-physical-disc="${driver.id}"]`);
 const restRect=await viewer((v,id)=>v.discScreenRect(id),driver.id);
 await driverSlot.hover();await settle();
 assert.ok(await pill.isVisible(),'Hover shows a name pill');assert.equal((await pill.innerText()).trim(),'Destroyer');
 assert.deepEqual(await viewer((v,id)=>v.discScreenRect(id),driver.id),restRect,'The hovered disc does not move');
 assert.equal(await viewer(v=>v.liftedDisc),null);assert.deepEqual(await viewer(v=>v.outDiscs),[]);
 assert.equal(await page.locator('#bagLiftInfo').evaluate(n=>getComputedStyle(n).clipPath),'inset(50%)','No details card on hover (description is for screen readers)');
 inside(await local(pill),box,'Hover pill');
 const pillStyle=await pill.evaluate(n=>{const s=getComputedStyle(n);return {bg:s.backgroundColor,color:s.color,radius:parseFloat(s.borderTopLeftRadius),height:n.offsetHeight};});
 assert.equal(pillStyle.color,'rgb(255, 255, 255)','White text');assert.ok(pillStyle.radius>=pillStyle.height/2-1,'Fully rounded');
 const [r,g,b]=pillStyle.bg.match(/[\d.]+/g).map(Number);assert.ok(.2126*r+.7152*g+.0722*b<40,'Dark pill: '+pillStyle.bg);
 const putterSlot=page.locator(`[data-physical-disc="${row[0].id}"]`);
 await putterSlot.hover({force:true});await settle();assert.equal((await pill.innerText()).trim(),putterName(putters.find(d=>d.id===row[0].id).mold_id),'Putters show their name too');
 await page.mouse.move(0,0);await settle();assert.ok(!await pill.isVisible(),'The pill goes with the pointer');
 // Keyboard focus shows the same pill; the description stays available to screen readers.
 await driverSlot.focus();assert.ok(await pill.isVisible());assert.match(await page.locator('#bagLiftInfo').innerText(),/Star[\s\S]*Main compartment/);
 await page.locator('[data-bag-toggle]').focus();
 check('Hover/focus: a dark rounded pill with the name in white, inside the canvas; the disc stays exactly in place; no details card');

 // 4. Click slides out along the pocket's axis, then on to a spot beside the bag, and stays out.
 // A back putter shows only its rim above the ones in front: click there, as a person would.
 const clickRim=async slot=>{const r=await slot.boundingBox();await page.mouse.click(r.x+r.width/2,r.y+3);};
 const putter=row.at(-1),putterColor=seeded.find(d=>d.id===putter.id).color,putterLabel=putterName(seeded.find(d=>d.id===putter.id).mold_id),backSlot=page.locator(`[data-physical-disc="${putter.id}"]`);
 // Records a disc's pose every frame; `rising` is the part before it leaves its pocket's axis (x changes).
 const recordPath=id=>page.locator('[data-bag-canvas]').evaluate((n,id)=>{const s=n.pathSamples=[];const tick=()=>{s.push(n.bagViewer.getBagLayoutState().find(d=>d.id===id).pose);if(s.length<120)requestAnimationFrame(tick);};requestAnimationFrame(tick);},id);
 const readPath=async start=>{const path=await page.locator('[data-bag-canvas]').evaluate(n=>n.pathSamples),moving=path.filter(p=>Math.hypot(p[0]-start[0],p[1]-start[1],p[2]-start[2])>1e-4),leave=moving.findIndex(p=>Math.abs(p[0]-start[0])>1e-6);return {moving,rising:leave<0?moving:moving.slice(0,leave),end:path.at(-1)};};
 await recordPath(putter.id);
 await clickRim(backSlot);await slideOut();await settle();
 const putterPath=await readPath(putter.position),rise=putterPath.rising,halfway=rise.find(p=>p[1]-putter.position[1]>(rise.at(-1)[1]-putter.position[1])*.5);
 assert.ok(rise.length>=8,'Animated rise: '+rise.length+' frames');
 assert.ok(rise.every((p,i)=>i===0 || p[1]>=rise[i-1][1]-1e-9),'Putter only rises while it leaves the pocket');
 // The top pocket's mouth is at y .252; a putter's face is .101 × .92 in radius.
 assert.ok(rise.at(-1)[1]-.101*.92>=.252-.002,'Its whole face clears the pocket mouth before it moves aside: '+rise.at(-1)[1]);
 assert.ok(Math.abs(halfway[2]-putter.position[2])<.004,'It rises before it steps forward');
 assert.ok(putterPath.end[2]>row[0].position[2],'It ends in front of the stack');
 assert.ok(Math.abs(putterPath.end[0])>.3,'It rests beside the bag: '+putterPath.end[0]);
 await onBagPage('Slide-out');
 assert.deepEqual(await viewer(v=>v.outDiscs),[putter.id]);assert.equal((await nameOf(putter.id).innerText()).trim(),putterLabel,'Name label');
 assert.equal(await backSlot.getAttribute('aria-pressed'),'true','The disc reads as pressed (out)');
 await detail.waitFor({state:'visible'});assert.equal(await detail.locator('h2').first().innerText(),putterLabel,'Details open with the first click (Oct 5 tweaks)');
 await fullyVisible(putter.id,putterColor,'Slid-out putter');inside(await local(nameOf(putter.id)),box,'Putter label');
 metrics.putterPathFrames=rise.length;
 // Another disc comes out too: each disc is independent and the first stays out.
 const driverStart=await viewer((v,id)=>v.getBagLayoutState().find(d=>d.id===id).pose,driver.id);
 await recordPath(driver.id);
 await driverSlot.click();await slideOut();await settle();
 const driverPath=await readPath(driverStart);
 assert.deepEqual(await viewer(v=>v.outDiscs),[putter.id,driver.id],'Both discs are out');
 // Main disc: forward out of the compartment first, then on to its spot face-on.
 assert.ok(driverPath.rising.length>=4 && driverPath.rising.at(-1)[2]>driverStart[2]+.05,'Main disc comes forward first');
 const mainEnd=await viewer((v,id)=>v.getBagLayoutState().find(d=>d.id===id),driver.id);
 assert.ok(mainEnd.out && Math.abs(mainEnd.pose[0])>.3,'Main disc rests beside the bag');
 await fullyVisible(driver.id,'#ed7868','Slid-out main disc');inside(await local(nameOf(driver.id)),box,'Main label');
 assert.equal((await nameOf(driver.id).innerText()).trim(),'Destroyer');
 check(`Click: a putter rises straight up (${metrics.putterPathFrames} frames) clear of its pocket, a main disc comes forward, then each rests face-on beside the bag, fully visible (color drift ${metrics['Slid-out putter'].colorDrift}/${metrics['Slid-out main disc'].colorDrift}) with its name; a second disc comes out without sending the first home`);

 // 5. Details: Escape or an empty-space click closes them; out discs stay out. A name reopens them.
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
 assert.ok(await driverSlot.evaluate(n=>n===document.activeElement),'Focus returns to the disc');
 assert.deepEqual(await viewer(v=>v.outDiscs),[putter.id,driver.id],'Escape leaves both discs out');
 await nameOf(driver.id).click();await detail.waitFor({state:'visible'});await onBagPage('Details');
 assert.equal(await detail.evaluate(n=>n.parentNode.id),'myBagView','The details panel is docked on My Bag');
 assert.equal(await detail.locator('h2').first().innerText(),'Destroyer');
 const personal=detail.locator('.bag-detail-personal');
 assert.match(await personal.innerText(),/Star[\s\S]*171 g[\s\S]*4\/10[\s\S]*Less stable[\s\S]*Flips up to flat on a hyzer/,'Personal notes');
 assert.ok(await page.locator('[data-show-on-atlas]').isEnabled(),'Show on Atlas');
 const body=await page.locator('.bag-3d-stage canvas').boundingBox();await page.mouse.click(body.x+body.width*.5,body.y+body.height*.97);
 await detail.waitFor({state:'hidden'});assert.equal(await scene.getAttribute('data-phase'),'open','Empty-space click does not toggle the flap');
 assert.deepEqual(await viewer(v=>v.outDiscs),[putter.id,driver.id],'An empty-space click leaves the discs out');
 // The go-to comes up and forward, then aside.
 const gotoSlot=page.locator(`[data-physical-disc="${goto.id}"]`),gotoRest=layout.find(d=>d.id===goto.id);
 await recordPath(goto.id);
 await gotoSlot.click({force:true});await slideOut();await settle();
 const gotoPath=await readPath(gotoRest.position);
 assert.ok(gotoPath.rising.length>=4 && gotoPath.rising.at(-1)[1]>gotoRest.position[1]+.05,'Go-to comes up out of its pocket first');
 await fullyVisible(goto.id,GOTO.color,'Slid-out go-to');
 assert.match(await personal.innerText(),/Go-to[\s\S]*K1[\s\S]*Upshots and the drive on 7/);
 // Clicking an out disc puts just that disc back, and closes its details.
 await gotoSlot.click();await page.waitForFunction(id=>!document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.includes(id),goto.id);await detail.waitFor({state:'hidden'});
 assert.deepEqual(await viewer(v=>v.outDiscs),[putter.id,driver.id],'Only the clicked disc goes back');
 await driverSlot.click();await backSlot.click();await slidHome();
 assert.equal(await backSlot.getAttribute('aria-pressed'),'false');
 // Keyboard: one Enter slides the disc out and opens its details; Escape closes them; Enter puts it back.
 await driverSlot.focus();await page.keyboard.press('Enter');await slideOut();await detail.waitFor({state:'visible'});
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});assert.deepEqual(await viewer(v=>v.outDiscs),[driver.id]);
 await driverSlot.focus();await page.keyboard.press('Enter');await slidHome();
 // The list's names open the same panel; an unrated mold's Show on Atlas is disabled with a reason.
 await page.locator(`#bagStorage [data-bag-inspect="${odd.id}"]`).click();await detail.waitFor({state:'visible'});
 assert.ok(await page.locator('[data-show-on-atlas]').isDisabled());assert.match(await detail.locator('#bagDetailUnmapped').innerText(),/no flight ratings/);
 await page.locator('#closeDetail').click();await detail.waitFor({state:'hidden'});
 assert.deepEqual(navigations,[],'No navigation or reload on My Bag');
 check('Details: open with the slide-out, reopen from the disc\'s name, docked with personal notes and Show on Atlas; Escape or an empty-space click closes them and leaves the discs out (flap untouched); a click on an out disc puts back only that disc; keyboard Enter → Escape → Enter; go-to comes up first');

 // 6. Show on Atlas jumps to the disc on the map.
 await driverSlot.click();await slideOut();await detail.waitFor({state:'visible'});
 await page.locator('[data-show-on-atlas]').click();
 await page.waitForFunction(()=>document.body.dataset.view==='map' && !cameraTween);await page.waitForTimeout(500);
 const atlas=await page.evaluate(()=>({url:location.pathname+location.search,selected:selected?.id,zoom,docked:document.querySelector('#detail').parentNode.id,visible:!document.querySelector('#detail').hidden}));
 assert.deepEqual({...atlas,zoom:undefined},{url:'/',selected:'3d60892b6812',zoom:undefined,docked:'atlasMain',visible:true});assert.ok(atlas.zoom>=4);
 const marker=await page.evaluate(()=>{const r=document.querySelector('#mapMarkers .atlas-marker.is-selected[data-cluster="3d60892b6812"] .marker-stack')?.getBoundingClientRect(),panel=document.querySelector('#detail').getBoundingClientRect();return r&&{x:r.left+r.width/2,y:r.top+r.height/2,panelLeft:panel.left,height:innerHeight};});
 assert.ok(marker && marker.x>0 && marker.x<marker.panelLeft && marker.y>0 && marker.y<marker.height,'Its own marker is selected and visible');
 await page.locator('#bagTab').click();await phase('open');await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 // Back on My Bag the disc is still out, until it is clicked again.
 assert.deepEqual(await viewer(v=>v.outDiscs),[driver.id],'The disc stays out across pages');await driverSlot.click();await slidHome();
 check(`Show on Atlas: map at zoom ${atlas.zoom}, the disc's own marker selected beside its details`);

 // 7. Camera persistence: a turned bag stays exactly where the user left it.
 const stage=await page.locator('.bag-3d-stage canvas').boundingBox(),sx=stage.x+stage.width*.1,sy=stage.y+stage.height*.8;
 const frontRects=await viewer(v=>v.discRects());
 await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+50,sy+2,{steps:8});await page.mouse.up();
 const turned=await viewer(v=>v.turn);assert.ok(Math.abs(turned)>.3,'The drag turns the bag');
 await page.waitForTimeout(2500);assert.equal(await viewer(v=>v.turn),turned,'No snap-back after 2.5 s');
 assert.equal(await scene.getAttribute('data-phase'),'open','A drag never toggles the flap');
 // Hit targets follow the turned bag, and everything still works without moving the camera.
 const turnedRects=await viewer(v=>v.discRects());assert.notDeepEqual(turnedRects.map(r=>Math.round(r.left)),frontRects.map(r=>Math.round(r.left)),'Targets re-measured for the turn');
 const slotRect=await local(driverSlot),discRect=turnedRects.find(r=>r.id===driver.id);assert.ok(Math.abs(slotRect.left-discRect.left)<1.5,'The slot sits on the turned disc');
 await driverSlot.hover();await settle();assert.ok(await pill.isVisible());
 await driverSlot.click();await slideOut();await settle();await fullyVisible(driver.id,'#ed7868','Slid-out main disc on the turned bag');
 // An out disc holds still in the room while the bag turns under it.
 const heldSpot=await local(driverSlot);await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
 await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+30,sy+2,{steps:6});await page.mouse.up();await settle();
 const afterTurn=await local(driverSlot);assert.ok(Math.abs(afterTurn.left-heldSpot.left)<2 && Math.abs(afterTurn.top-heldSpot.top)<2,'The out disc stays put while the bag turns: '+JSON.stringify({heldSpot,afterTurn}));
 const turnedMore=await viewer(v=>v.turn);
 await driverSlot.click();await slidHome();assert.equal(await viewer(v=>v.turn),turnedMore,'Hover, slide-out, Escape and putting it back keep the turn');
 // Turned far enough that the front faces away, only the top pocket stays in reach.
 await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+120,sy+2,{steps:8});await page.mouse.up();await settle();
 assert.equal(await viewer(v=>v.frontFacing),false);assert.equal(await driverSlot.getAttribute('aria-hidden'),'true');assert.equal(await putterSlot.getAttribute('aria-hidden'),'false');
 await page.mouse.move(sx+120,sy);await page.mouse.down();await page.mouse.move(sx,sy+2,{steps:8});await page.mouse.up();await settle();
 const kept=await viewer(v=>v.turn);await page.waitForTimeout(1500);assert.equal(await viewer(v=>v.turn),kept);
 // Top view keeps the turn, and leaving it returns to the same camera.
 const cam=await viewer(v=>v.cameraState);await page.locator('[data-bag-top-view]').click();await camera('top');
 assert.equal(await viewer(v=>v.turn),kept);await page.locator('[data-bag-top-view]').click();await camera('front');
 const back=await viewer(v=>v.cameraState);
 assert.ok(Math.abs(back.polar-cam.polar)<1e-3 && Math.abs(back.radius-cam.radius)<1e-3 && await viewer(v=>v.turn)===kept,'Same camera and turn after the top view');
 metrics.turn={first:turned,kept};
 check(`Camera persistence: a drag turn (${turned.toFixed(2)} rad) holds with no snap-back, through hover, slide-out, Escape and the top view; hit targets follow the turn; facing away leaves only the top pocket in reach`);

 // 8. Touch: a real touch drag turn holds; a tap is a click (slide out), tapping the label opens details.
 const touch=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:360,height:800},isMobile:true,hasTouch:true,storageState:await context.storageState()});
 const mobile=await touch.newPage();mobile.on('pageerror',e=>errors.push(e.stack));await mobile.goto(base+'/?bag=1');await mobile.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open',null,{timeout:60000});
 await mobile.locator('#bagScene').scrollIntoViewIfNeeded();await mobile.waitForTimeout(300);
 const cdp=await touch.newCDPSession(mobile),mstage=await mobile.locator('.bag-3d-stage canvas').boundingBox(),tx=mstage.x+mstage.width*.12,ty=mstage.y+mstage.height*.8;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});
 for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx+i*5,y:ty+i*.2}]});await mobile.waitForTimeout(16);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const touchTurn=await mobile.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.turn);await mobile.waitForTimeout(2000);
 assert.ok(Math.abs(touchTurn)>.3 && await mobile.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.turn)===touchTurn,'Touch turn holds: '+touchTurn);
 const tapSlot=mobile.locator(`[data-physical-disc="${driver.id}"]`);await tapSlot.tap();
 await mobile.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.staging==='still' && s.dataset.out==='1';});assert.ok(!await mobile.locator('.bag-hover-name').isVisible(),'No hover pill on touch');
 await mobile.locator('#detail').waitFor();assert.ok(await mobile.locator('#myBagView').isVisible(),'The same tap opens its details on My Bag');
 await touch.close();
 check(`Touch: a finger drag turn (${touchTurn.toFixed(2)} rad) holds; one tap slides a disc out and opens its details on My Bag`);

 // 9. Top view still animates straight above, now into the putter pocket only (Oct 5 tweaks).
 await page.reload();await phase('open');await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 await page.locator('[data-bag-canvas]').evaluate(n=>{const samples=n.cameraSamples=[];const tick=()=>{samples.push([performance.now(),n.bagViewer.cameraState.polar]);if(samples.length<240)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 const frontCam=await viewer(v=>v.cameraState);await page.locator('[data-bag-top-view]').click();await camera('top');
 const top=await viewer(v=>v.cameraState),samples=await page.locator('[data-bag-canvas]').evaluate(n=>n.cameraSamples);
 const firstMove=samples.find(([,p])=>p<frontCam.polar-1e-4),arrived=samples.find(([,p])=>p<=top.polar+1e-4),ms=arrived[0]-firstMove[0];
 assert.ok(top.polar<.01 && ms>=520 && ms<=760,'Top view: about 0.6 s to straight above: '+ms);
 const labels=await page.locator('.bag-pocket-label').evaluateAll(nodes=>nodes.map(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {pocket:n.dataset.pocket,text:n.innerText,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};}));
 assert.deepEqual(labels.map(l=>l.pocket),['putter'],'Only the putter pocket is labeled');for(const l of labels)inside(l,box,l.pocket+' label');
 assert.ok(PUTTERS.every(([,name])=>labels[0].text.includes(name)),'It names the putters: '+labels[0].text);
 assert.equal(await viewer(v=>v.fabricOpaque),true,'The fabric stays opaque');
 await putterSlot.click({force:true});await slideOut();await settle();assert.deepEqual(await viewer(v=>v.outDiscs),[row[0].id],'Slide-out works from above');
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await putterSlot.evaluate(n=>n.click());await slidHome();await page.keyboard.press('Escape');await camera('front');
 check(`Top view: ${Math.round(ms)} ms to straight above, into the putter pocket with one label naming its putters, opaque fabric, slide-out works from above, Escape returns`);

 // 10. Screenshots in every theme, desktop and 360 px: hover label, slid-out putter, slid-out main disc,
 // details from a clicked label, a held rotation, and the settled top view.
 for(const theme of themes)for(const width of widths){
  await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);await page.reload();await phase('open');
  await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
  const canvas=page.locator('[data-bag-canvas]'),wbox=await canvasBox();
  const hoverSlot=page.locator(`[data-physical-disc="${mains[3].id}"]`);
  if(width===360)await hoverSlot.focus();else await hoverSlot.hover();
  inside(await local(pill),wbox,`Hover pill (${theme} ${width})`);await shot('hover-label',width,theme,canvas);
  await page.locator('[data-bag-toggle]').focus();await page.mouse.move(0,0);
  await clickRim(backSlot);await slideOut();await detail.waitFor({state:'visible'});
  await fullyVisible(putter.id,putterColor,`Putter (${theme} ${width})`);inside(await local(nameOf(putter.id)),wbox,`Putter label (${theme} ${width})`);
  await shot('slid-out-putter',width,theme,canvas);
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await backSlot.click();await slidHome();
  await driverSlot.click();await slideOut();await detail.waitFor({state:'visible'});
  await fullyVisible(driver.id,'#ed7868',`Main (${theme} ${width})`);inside(await local(nameOf(driver.id)),wbox,`Main label (${theme} ${width})`);
  await shot('slid-out-main',width,theme,canvas);
  if(width===360)await detail.evaluate(n=>{n.scrollTop=n.querySelector('h2').offsetTop-90;});
  await shot('details-from-label',width,theme,page);
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await driverSlot.click();await slidHome();
  await page.locator('[data-bag-top-view]').click();await camera('top');await page.mouse.move(0,0);await shot('top-view',width,theme,canvas);
  await page.keyboard.press('Escape');await camera('front');
  const st=await page.locator('.bag-3d-stage canvas').boundingBox(),x=st.x+st.width*.1,y=st.y+st.height*.8;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+45,y+2,{steps:8});await page.mouse.up();
  const held=await viewer(v=>v.turn);await page.mouse.move(0,0);await page.waitForTimeout(2000);
  assert.ok(Math.abs(held)>.3 && await viewer(v=>v.turn)===held,`Rotation holds (${theme} ${width})`);
  await shot('rotated-held',width,theme,canvas);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 }
 check(`Screenshots: ${shots.length} (hover label, slid-out putter, slid-out main disc, details from a clicked label, held rotation, top view) in ${themes.join(', ')} at ${widths.join(' and ')} px`);

 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,checks,metrics,gpuArgs,themes,widths,screenshots:shots,errors},null,2));
 const order=['hover-label','slid-out-putter','slid-out-main','details-from-label','rotated-held','top-view'];
 fs.writeFileSync(dir+'/screenshots.html',`<!doctype html><meta charset="utf-8"><title>Bag slide-out QA</title><style>body{margin:32px;background:#14191f;color:#e9edf0;font:16px system-ui}section{margin:40px 0}figure{display:inline-block;vertical-align:top;margin:12px}img{width:360px;max-width:100%}.mobile img{width:260px}.wide img{width:620px}a{color:inherit}figcaption{margin-top:6px;font-size:13px}li{margin:4px 0}</style><h1>Bag slide-out · local QA</h1><ul>${checks.map(c=>`<li>✓ ${c}</li>`).join('')}</ul>${themes.map(theme=>`<section><h2>${theme}</h2>${order.flatMap(state=>shots.filter(s=>s.theme===theme && s.state===state)).map(s=>`<figure class="${s.width===360?'mobile':s.state==='details-from-label'?'wide':''}"><a href="${s.name}"><img src="${s.name}" loading="lazy"></a><figcaption>${s.state} · ${s.width}px</figcaption></figure>`).join('')}</section>`).join('')}`);
 console.log(checks.map(c=>'✓ '+c).join('\n'));
 console.log(`PASS: ${checks.length} checks, ${shots.length} screenshots; no page errors.`);
 await context.close();
} finally {await browser?.close();server.kill();}
