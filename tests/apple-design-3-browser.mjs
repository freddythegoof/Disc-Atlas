// Apple design review, batch 3 (findings 8-11): the detail panel's content swap and expand, the context title's
// swap, the motion tokens, reduced motion that keeps fades, and About/Account/app header parity.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/apple-design-3-browser.mjs [--panel|--reduced|--branding]
// Screenshots: outputs/apple-design-3/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const only=['--panel','--reduced','--branding'].find(flag=>process.argv.includes(flag));
const wants=flag=>!only||only===flag;
const dir='outputs/apple-design-3';
fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const pages={'/':'web/index.html','/account-settings':'public/account-page.html','/profile':'public/account-page.html','/signin':'public/account-page.html','/about':'public/about.html','/privacy':'public/privacy.html','/terms':'public/terms.html'};
 const file=pages[url.pathname]||'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/auth/')){res.writeHead(url.pathname==='/api/account'?200:503,{'Content-Type':'application/json'});res.end(url.pathname==='/api/account'?JSON.stringify({user:null,csrfToken:'t',authReady:true}):'{}');return;}
 let data;try{data=fs.readFileSync(file);}catch{res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const errors=[],checks=[];
const check=label=>{checks.push(label);console.log('ok - '+label);};
async function open(route='/',{width=1440,height=900,reduced=false,theme='light',touch=false}={}){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference',hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?2:1});
 await context.addInitScript(t=>{try{localStorage.setItem('disc-atlas-theme',t);}catch{}},theme);
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/404|503|Failed to load resource/.test(m.text()))errors.push(m.text());});
 await page.goto(base+route);
 if(route==='/'){await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);if(width<=700)await page.locator('#mapTab').click();await page.waitForFunction(()=>mapClusters.length>0);}
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
const ratedBy=name=>`discs.find(d=>d.speed!=null&&(d.catalogName||d.name)===${JSON.stringify(name)})`;
const keysOf=a=>a.effect.getKeyframes().flatMap(k=>Object.keys(k)).filter((k,i,a)=>!['offset','easing','composite','computedOffset'].includes(k)&&a.indexOf(k)===i);

try{
 if(wants('--panel')){
  for(const reduced of [false,true]){
   const tag=reduced?'reduced motion':'full motion';
   const page=await open('/',{reduced});
   const show=async name=>{await page.evaluate(n=>select(eval(n)),ratedBy(name));await page.waitForFunction(n=>selected===eval(n),ratedBy(name));};
   // First open: no swap, so nothing fades (the panel's own reveal does the work).
   await show('Destroyer');
   assert.equal(await page.evaluate(()=>document.querySelectorAll('#detail .detail-ghosts').length),0,`${tag}: the first open has no cross-fade layer`);
   assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#detail > *')].reduce((n,c)=>n+c.getAnimations().length,0)),0,`${tag}: and no block animates`);
   await page.waitForFunction(()=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready';});await page.waitForTimeout(350);
   // Another disc while it is open: a 120 ms opacity-only cross-fade of the text blocks.
   const swap=await page.evaluate(async n=>{
    const panel=document.querySelector('#detail'),stage=panel.querySelector('.disc3d-stage'),head=panel.querySelector('.detail-actions'),h2=panel.querySelector('h2');
    const before=panel.querySelector('h2').textContent;select(eval(n));
    const layer=panel.querySelector('.detail-ghosts');
    const blocks=[...panel.children].filter(c=>!c.classList.contains('detail-ghosts'));
    const anim=el=>el.getAnimations().map(a=>({keys:a.effect.getKeyframes().flatMap(k=>Object.keys(k)).filter((k,i,a)=>!['offset','easing','composite','computedOffset'].includes(k)&&a.indexOf(k)===i),ms:a.effect.getTiming().duration}));
    const result={ghosts:layer?layer.children.length:0,layerInert:layer?.inert,layerAnim:layer?anim(layer):[],headAnim:anim(head),stageAnim:anim(stage.closest('[data-disc3d]')),
     textAnim:blocks.filter(c=>c!==head&&!c.querySelector('[data-sync-keep]')).map(anim),sameStage:stage===panel.querySelector('.disc3d-stage'),duplicateIds:[...panel.querySelectorAll('[id]')].filter((n,i,a)=>a.findIndex(m=>m.id===n.id)!==i).length,
     before,after:panel.querySelector('h2').textContent,oldInGhost:layer?layer.textContent.includes(before):false,clippedTo:layer?.style.height};
    await new Promise(r=>setTimeout(r,320));result.layerGone=!panel.querySelector('.detail-ghosts');return result;
   },ratedBy('Buzzz'));
   assert.ok(swap.ghosts>=4,`${tag}: the old text blocks stay as ghosts (${swap.ghosts})`);assert.equal(swap.layerInert,true);
   assert.ok(swap.oldInGhost&&swap.before!==swap.after,`${tag}: the ghosts hold the old disc while the new one shows`);
   assert.deepEqual(swap.layerAnim.map(a=>[a.keys.join(),a.ms]),[['opacity',120]],`${tag}: the ghosts fade out in 120 ms, opacity only`);
   assert.ok(swap.textAnim.length>=4&&swap.textAnim.every(list=>list.length===1&&list[0].keys.join()==='opacity'&&list[0].ms===120),`${tag}: each new text block fades in over 120 ms, opacity only (${JSON.stringify(swap.textAnim)})`);
   assert.deepEqual(swap.headAnim,[],`${tag}: the header row is not faded`);assert.deepEqual(swap.stageAnim,[],`${tag}: nor is the 3D stage`);assert.equal(swap.sameStage,true,`${tag}: it is the same node`);
   assert.equal(swap.duplicateIds,0,`${tag}: ghosts carry no duplicate ids`);assert.equal(swap.layerGone,true,`${tag}: the ghosts are removed when the fade ends`);
   // A re-render of the same disc (a different throwing hand) does not fade.
   const same=await page.evaluate(()=>{const panel=document.querySelector('#detail'),select=panel.querySelector('#hand');select.value='LHBH';select.dispatchEvent(new Event('change'));return {ghosts:panel.querySelectorAll('.detail-ghosts').length,animated:[...panel.children].reduce((n,c)=>n+c.getAnimations().length,0)};});
   assert.deepEqual(same,{ghosts:0,animated:0},`${tag}: the same disc does not cross-fade`);
   // Just revealed: choosing another disc inside the reveal skips the fade.
   await page.evaluate(()=>{closeDetail(false);});await page.waitForTimeout(250);
   const quick=await page.evaluate(async([a,b])=>{select(eval(a));select(eval(b));const panel=document.querySelector('#detail');return {ghosts:panel.querySelectorAll('.detail-ghosts').length,busy:AtlasMotion.busy(panel)};},[ratedBy('Destroyer'),ratedBy('Wraith')]);
   assert.equal(quick.ghosts,0,`${tag}: a second pick inside the reveal skips the fade`);
   check(`${tag}: choosing another disc cross-fades the text blocks over 120 ms, opacity only; not the stage, header row, same-disc re-renders or a fresh reveal`);
   await page.context().close();
  }
  // Expand (phone): ease-out, and the sheet's corners and height travel together.
  {
   const phone=await open('/',{width:390,height:844,touch:true,reduced:false});
   await phone.evaluate(n=>select(eval(n)),ratedBy('Destroyer'));await phone.waitForTimeout(500);
   const trace=await phone.evaluate(async()=>{
    const panel=document.querySelector('#detail'),rows=[],t0=performance.now();
    const read=()=>{const c=getComputedStyle(panel);return {t:performance.now()-t0,h:panel.getBoundingClientRect().height,r:parseFloat(c.borderTopLeftRadius)};};
    const start=read();document.querySelector('#expandDetail').click();
    await new Promise(done=>{const tick=()=>{rows.push(read());if(performance.now()-t0>600)done();else requestAnimationFrame(tick);};tick();});
    return {start,rows,expanded:panel.classList.contains('is-expanded'),vh:innerHeight};
   });
   const last=trace.rows.at(-1),growing=trace.rows.filter(r=>r.t<260);
   assert.equal(trace.expanded,true);assert.ok(Math.abs(last.h-trace.vh)<1&&last.r===0,'it lands at full height with square corners');
   assert.ok(growing.some(r=>r.h>trace.start.h+5&&r.h<last.h-5),'the height animates');
   assert.ok(growing.some(r=>r.r>0&&r.r<trace.start.r-.5),`and the corners animate with it (${growing.map(r=>Math.round(r.r)).join(',')})`);
   const span=last.h-trace.start.h,early=trace.rows.find(r=>r.t>=70);
   assert.ok((early.h-trace.start.h)/span>.55,`ease-out: over half the travel is done by 70 ms (${Math.round((early.h-trace.start.h)/span*100)}%)`);
   assert.ok(trace.rows.every((r,i)=>i===0||r.h>=trace.rows[i-1].h-.5),'and it never wobbles');
   const back=await phone.evaluate(async()=>{const panel=document.querySelector('#detail');document.querySelector('#expandDetail').click();await new Promise(r=>setTimeout(r,500));return {h:panel.getBoundingClientRect().height,r:parseFloat(getComputedStyle(panel).borderTopLeftRadius),inline:panel.getAttribute('style')||''};});
   assert.ok(back.r>20&&!/border-top|height/.test(back.inline),`collapsing restores the rounded sheet and leaves no inline styles (${back.r}, "${back.inline}")`);
   check('Expand eases out (expo) and brings the sheet\'s corner radius with its height; collapse restores both cleanly');
   await phone.context().close();
  }
  // Context title: the old title used to vanish in one frame while the new one rose in.
  {
   const page=await open('/',{});
   const swap=await page.evaluate(async()=>{
    const identity=document.querySelector('.header-identity'),logo=identity.querySelector('.logo'),button=document.querySelector('#contextTitle');
    const hiddenBefore=button.hidden;selectedBrands.add('Innova');filter();renderCompare();
    const ghost=identity.querySelector('.identity-ghost'),info=el=>el?el.getAnimations().map(a=>({keys:a.effect.getKeyframes().flatMap(k=>Object.keys(k)).filter((k,i,a)=>!['offset','easing','composite','computedOffset'].includes(k)&&a.indexOf(k)===i),ms:a.effect.getTiming().duration})):null;
    const result={hiddenBefore,hiddenAfter:button.hidden,logoHidden:logo.hidden,ghostIsLogo:!!ghost&&ghost.classList.contains('logo'),ghostAnim:info(ghost),newAnim:info(button),ghostInert:ghost?.inert,ghostIds:ghost?ghost.querySelectorAll('[id]').length:null};
    await new Promise(r=>setTimeout(r,300));result.ghostGone=!identity.querySelector('.identity-ghost');
    selectedBrands.clear();filter();const back=identity.querySelector('.identity-ghost');result.backGhost=!!back&&back.id==='';result.backAnim=info(identity.querySelector('.logo'));
    await new Promise(r=>setTimeout(r,300));result.backGone=!identity.querySelector('.identity-ghost');return result;
   });
   assert.equal(swap.hiddenBefore,true);assert.equal(swap.hiddenAfter,false);assert.equal(swap.ghostIsLogo,true,'the wordmark that leaves stays as a ghost');
   assert.deepEqual(swap.ghostAnim.map(a=>[a.keys.join(),a.ms]),[['opacity',120]],'and fades out over 120 ms, opacity only');
   assert.deepEqual(swap.newAnim.map(a=>[a.keys.join(),a.ms]),[['opacity',120]],'while the context title fades in over 120 ms, opacity only (no 4px rise)');
   assert.equal(swap.ghostInert,true);assert.equal(swap.ghostIds,0);assert.equal(swap.ghostGone,true);assert.equal(swap.backGhost,true,'clearing the filter fades the title out under the wordmark');assert.equal(swap.backGone,true);
   check('Context title: it did pop (old title hidden in one frame, new one rose in over 180 ms with 4 px of travel); now a 120 ms opacity-only cross-fade');
   await page.context().close();
  }
 }

 if(wants('--reduced')){
  const page=await open('/',{reduced:true});
  // Opacity and colour transitions survive; movement does not.
  const props=await page.evaluate(()=>{
   const read=sel=>{const n=document.querySelector(sel),c=getComputedStyle(n);return {property:c.transitionProperty,duration:c.transitionDuration};};
   return {filters:read('#filtersToggle'),zoom:read('#zoomIn'),menu:read('#siteMenu'),tray:read('#compareBar'),body:getComputedStyle(document.body).transitionProperty};
  });
  for(const [name,v] of Object.entries(props).filter(([n])=>n!=='body')){
   assert.ok(!/transform|scale|translate/.test(v.property),`reduced: ${name} has no movement transition (${v.property})`);
   assert.ok(/opacity|color|background/.test(v.property),`reduced: ${name} keeps its fades (${v.property})`);
  }
  assert.ok(/display/.test(props.menu.property)&&/display/.test(props.tray.property),'reduced: menus and the tray keep display so their exit can fade');
  const colour=await page.evaluate(async()=>{
   const target=document.querySelector('#filtersToggle');target.style.transition='';const from=getComputedStyle(target).backgroundColor;
   target.setAttribute('aria-expanded','true');                                      // a colour/background change on a transitioning control
   const mid=target.getAnimations().map(a=>a.transitionProperty);target.setAttribute('aria-expanded','false');return {from,mid};
  });
  assert.ok(colour.mid.some(p=>/background|border|color/.test(p)),`reduced: a colour change on a control still transitions (${colour.mid})`);
  // A press does not scale (instant dip is the old behaviour; scale is movement) but colour still moves.
  const press=await page.evaluate(()=>{const n=document.querySelector('#zoomIn');return getComputedStyle(n).transitionProperty;});
  assert.ok(!/scale|transform/.test(press));
  // The reveal of the detail panel is a fade, not a slide.
  const reveal=await page.evaluate(async n=>{
   select(eval(n));const panel=document.querySelector('#detail'),rows=[];const t0=performance.now();
   await new Promise(done=>{const tick=()=>{const c=getComputedStyle(panel);rows.push({t:performance.now()-t0,opacity:+c.opacity,transform:c.transform});if(performance.now()-t0>400)done();else requestAnimationFrame(tick);};tick();});
   return rows;
  },ratedBy('Destroyer'));
  assert.ok(reveal[0].opacity<.5&&reveal.at(-1).opacity===1,'reduced: the detail panel fades in');
  assert.ok(reveal.every(r=>r.transform==='none'||/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(r.transform)),`and never slides (${[...new Set(reveal.map(r=>r.transform))]})`);
  await page.evaluate(()=>closeDetail(false));
  check('Reduced motion keeps opacity and colour transitions, drops scale/transform ones, keeps display for menu exits, and fades (not slides) the detail panel');
  // The camera eases over 150 ms: no spring, no overshoot (also in tests/apple-design-browser.mjs); the theme cross-fade is 150 ms.
  const ease=await page.evaluate(()=>new Promise(done=>{
   stopCamera();zoom=1;pan={x:0,y:0};const target=2,rows=[];tweenCamera({zoom:target,x:0,y:0});const t0=performance.now();
   const tick=()=>{rows.push({t:performance.now()-t0,zoom});if(cameraTween&&performance.now()-t0<1000)requestAnimationFrame(tick);else done({rows,end:zoom,target});};tick();
  }));
  assert.ok(ease.rows.length>2,'reduced: the camera animates');assert.ok(ease.rows.every(r=>r.zoom<=ease.target+1e-9),'with no overshoot');assert.equal(ease.end,ease.target);
  assert.ok(ease.rows.at(-1).t>=100&&ease.rows.at(-1).t<=400,`in about 150 ms (${Math.round(ease.rows.at(-1).t)} ms)`);
  const themeMs=await page.evaluate(async()=>{
   const start=document.startViewTransition?document.startViewTransition.bind(document):null;let ready=null;
   if(start)document.startViewTransition=(...a)=>{const t=start(...a);ready=t.ready.then(()=>getComputedStyle(document.documentElement,'::view-transition-old(root)').animationDuration);return t;};
   document.querySelector('#siteMenuButton').click();document.querySelector('[data-theme-choice="black"]').click();
   return ready?await ready.catch(()=>null):null;
  });
  assert.equal(themeMs,'0.15s','reduced: the theme cross-fade runs 150 ms');
  check('Reduced motion: the camera eases over ~150 ms without overshoot; the theme change is a 150 ms cross-fade');
  await page.context().close();
  // Normal motion keeps its 240 ms theme fade.
  const full=await open('/',{});
  const full240=await full.evaluate(async()=>{const start=document.startViewTransition.bind(document);let ready=null;document.startViewTransition=(...a)=>{const t=start(...a);ready=t.ready.then(()=>getComputedStyle(document.documentElement,'::view-transition-old(root)').animationDuration);return t;};
   document.querySelector('#siteMenuButton').click();document.querySelector('[data-theme-choice="black"]').click();return ready.catch(()=>null);});
  assert.equal(full240,'0.24s','full motion keeps its 240 ms theme cross-fade');
  check('Full motion theme cross-fade is unchanged (240 ms)');
  await full.context().close();
  // Motion tokens.
  const tokens=await (await open('/',{})).evaluate(()=>{const c=getComputedStyle(document.documentElement);return ['--dur-press','--dur-ui','--dur-surface','--ease-out'].map(n=>c.getPropertyValue(n).trim());});
  assert.deepEqual(tokens,['100ms','180ms','280ms','cubic-bezier(.16,1,.3,1)']);
  check('The motion tokens exist on :root: 100 / 180 / 280 ms and the expo-out ease');
 }

 if(wants('--branding')){
  const header=page=>page.evaluate(()=>{
   const h=document.querySelector('header'),logo=h.querySelector('.logo'),mark=h.querySelector('.atlas-logo'),word=h.querySelector('.wordmark svg'),r=mark.getBoundingClientRect(),w=word.getBoundingClientRect(),hr=h.getBoundingClientRect();
   return {height:hr.height,token:parseFloat(getComputedStyle(h).height),markLeft:Math.round(r.left*10)/10,markCenterY:Math.round((r.top+r.height/2)*10)/10,markSize:Math.round(r.width),wordBottom:Math.round(w.bottom*10)/10,wordLeft:Math.round(w.left*10)/10,actions:(a=>a&&[Math.round(a.right*10)/10,Math.round((a.top+a.height/2)*10)/10])(h.querySelector('.header-actions')?.getBoundingClientRect()),bg:getComputedStyle(document.body).backgroundColor,line:getComputedStyle(h).borderBottomColor,fixed:getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim()};
  });
  for(const width of [1440,390]){
   for(const theme of ['light','midnight']){
    const rows={};
    for(const [name,route] of [['app','/'],['about','/about'],['account','/signin'],['privacy','/privacy'],['terms','/terms']]){
     const page=await open(route,{width,height:width>700?900:844,theme,touch:width<700});
     rows[name]=await header(page);
     await page.screenshot({path:`${dir}/${name}-${width}-${theme}.png`,clip:{x:0,y:0,width,height:name==='app'?Math.min(300,844):300}});
     if(['about','privacy','terms'].includes(name)){
      // The theme control is Account's: an icon toggle and a menu of four radios, no labelled select (Privacy and
      // Terms since Prompt 4).
      const title=name[0].toUpperCase()+name.slice(1);
      const control=await page.evaluate(()=>({select:document.querySelectorAll('[data-theme-select],.theme-picker').length,toggle:document.querySelectorAll('header [data-theme-toggle]').length,choices:[...document.querySelectorAll('#siteMenu [data-theme-choice]')].map(b=>b.dataset.themeChoice),menu:!!document.querySelector('#siteMenuButton[aria-haspopup="menu"]#siteMenuButton')}));
      assert.deepEqual(control,{select:0,toggle:1,choices:['light','midnight','charcoal','black'],menu:true},`${title} ${width} ${theme}: the Account theme control`);
      await page.locator('[data-theme-toggle]').click();await page.waitForFunction(t=>document.documentElement.dataset.theme!==t,theme);
      await page.locator('#siteMenuButton').click();
      await page.locator('[data-theme-choice="charcoal"]').click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='charcoal');
      assert.equal(await page.evaluate(()=>document.querySelector('[data-theme-choice="charcoal"]').getAttribute('aria-checked')),'true',`${title}: choosing a radio checks it`);
      await page.keyboard.press('Escape');
     }
     await page.context().close();
    }
    for(const name of ['about','account','privacy','terms'])assert.equal(rows[name].height,rows[name].token,`${width} ${theme}: ${name} header height is its --header-height token (${rows[name].fixed})`);
    // The lockup does not move between the information pages, and sits where the app's first row puts it.
    for(const name of ['about','privacy','terms'])assert.deepEqual([rows[name].markLeft,rows[name].markCenterY,rows[name].markSize,rows[name].height],[rows.account.markLeft,rows.account.markCenterY,rows.account.markSize,rows.account.height],`${width} ${theme}: ${name} header matches Account`);
    // And the theme controls sit where Account's do (right edge and vertical centre), on Privacy and Terms too.
    for(const name of ['about','privacy','terms'])assert.deepEqual(rows[name].actions,rows.account.actions,`${width} ${theme}: ${name} header controls sit where Account's do`);
    assert.equal(rows.about.markLeft,rows.app.markLeft,`${width} ${theme}: the lockup's left edge matches the app's`);
    assert.ok(Math.abs(rows.about.markCenterY-rows.app.markCenterY)<=1.5,`${width} ${theme}: its vertical centre is within 1.5 px of the app's (${rows.about.markCenterY} vs ${rows.app.markCenterY})`);
    if(width>700)assert.equal(rows.about.height,rows.app.height,`${width}: the header is as tall as the app's`);
    if(theme==='light'){
     assert.equal(rows.about.bg,'rgb(247, 248, 250)','About\'s light surface is the app\'s cool #f7f8fa');
     assert.equal(rows.about.bg,rows.app.bg);assert.equal(rows.about.bg,rows.account.bg);assert.equal(rows.about.line,rows.account.line,'and its hairline matches Account\'s');
     for(const name of ['privacy','terms'])assert.deepEqual([rows[name].bg,rows[name].line],[rows.account.bg,rows.account.line],`${name}: light surface and hairline match Account's`);
    }else{
     for(const name of ['about','privacy','terms'])assert.equal(rows[name].bg,rows.account.bg,`${width} midnight: ${name} surface matches Account's`);
    }
    check(`${width} ${theme}: About, Privacy and Terms carry Account's theme control; all four headers share the token, the lockup and control positions and the surface`);
   }
  }
  // Navigating About <-> Account in light: the background and the lockup hold still.
  {
   const page=await open('/about',{theme:'light'});
   const before=await header(page);await page.goto(base+'/signin');await page.waitForFunction(()=>document.querySelector('header .logo'));
   const after=await header(page);
   assert.deepEqual([before.bg,before.markLeft,before.markCenterY,before.height],[after.bg,after.markLeft,after.markCenterY,after.height],'About -> Account keeps background and lockup still');
   await page.screenshot({path:`${dir}/account-1440-light-after-about.png`,clip:{x:0,y:0,width:1440,height:300}});
   check('About <-> Account in light: same background, same lockup position');
   await page.context().close();
  }
 }
 assert.deepEqual(errors,[],'No page errors');
 console.log(`${checks.length} checks passed.`);
}finally{await browser.close();server.close();}
