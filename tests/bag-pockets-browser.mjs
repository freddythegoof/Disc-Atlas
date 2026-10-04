import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-pockets/d1-qa',base='https://localhost:8800',dir='outputs/bag-pockets';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8800','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],shots=[];
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const phase=()=>page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
 const data=async()=>await (await page.request.get(base+'/api/bag')).json();
 const slot=(id,pocket)=>page.locator(`#bagScene [data-pocket="${pocket}"] > [data-physical-disc="${id}"]`);
 const centerY=locator=>locator.evaluate(n=>{const r=n.parentNode.getBoundingClientRect();return r.y+r.height/2;});
 const edit=async(id,pocket)=>{
  await page.locator(`[data-bag-edit="${id}"]`).click();
  await page.locator('#bagPocket').selectOption(pocket);await page.locator('#saveDisc').click();
  await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 };
 const shot=async(state,width,theme)=>{
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  const name=`${state}-${width}-${theme}.png`;await page.screenshot({path:`${dir}/${name}`});shots.push({state,width,theme,name});
 };
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 // Create the putter through the real add sheet: default pocket, move, reload.
 await page.locator('#emptyBagDirectory').click();await page.locator('#search').fill('Envy');
 await page.locator('#rows .directory-row').filter({has:page.locator('[data-add-menu="761c90d342f5"]')}).locator('[data-add-menu]').click();
 await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();
 assert.equal(await page.locator('#bagPocket').inputValue(),'putter');
 await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 const putter=(await data()).discs[0];assert.equal(putter.pocket,'putter');
 await page.locator('#bagTab').click();await phase();assert.equal(await slot(putter.id,'putter').count(),1);
 await edit(putter.id,'main');await page.reload();await phase();
 assert.equal((await data()).discs[0].pocket,'main');assert.equal(await slot(putter.id,'main').count(),1);
 if(process.argv.includes('--putter-only')){console.log('PASS: putter defaults once and remains in main after reload.');}
 else {
  // A driver in Go-to proves the upper pocket follows assignment, not type.
  const seeded=await page.evaluate(async()=>{
   const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
   const rows=[];
   for(const disc of [{mold_id:'3d60892b6812',color:'#ed7868',notes:'First disc for the round'},{mold_id:'ff4bf9e7743c',color:'#e2d8c1'},{mold_id:'7446eb39abe5',color:'#b99bdd'}]){
    const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());rows.push((await r.json()).disc);
   }return rows;
  });
  const goto=seeded[0];await page.reload();await phase();
  await page.locator(`[data-bag-edit="${goto.id}"]`).click();
  assert.deepEqual(await page.locator('#bagPocket option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,label:n.textContent}))),[{value:'main',label:'Main compartment'},{value:'putter',label:'Putter pocket'},{value:'goto',label:'Go-to'}]);
  await page.locator('#bagPocket').selectOption('goto');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
  await page.reload();await phase();assert.equal(await slot(goto.id,'goto').count(),1);
  assert.match(await page.locator(`[data-disc-id="${goto.id}"] .my-bag-disc-details`).innerText(),/Go-to/);
  for(const theme of themes)for(const width of widths){
   await page.setViewportSize({width,height:width===360?800:1000});
   await page.getByRole('button',{name:'Site menu',exact:true}).click();
   await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');
   await page.reload();await phase();
   const rows=(await data()).discs;assert.equal(rows.find(d=>d.id===putter.id).pocket,'main');assert.equal(rows.find(d=>d.id===goto.id).pocket,'goto');
   assert.equal(await slot(putter.id,'main').count(),1);assert.equal(await slot(putter.id,'putter').count(),0);
   assert.equal(await slot(goto.id,'goto').count(),1);assert.equal(await slot(goto.id,'main').count(),0);
   const mainY=await centerY(slot(putter.id,'main'));
   const topY=await centerY(slot(goto.id,'goto'));
   assert.ok(topY<mainY,'Go-to is in the upper pocket');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   await page.locator('#bagScene').scrollIntoViewIfNeeded();await slot(putter.id,'main').focus();
   assert.match(await page.locator('#bagLiftInfo').innerText(),/Main compartment/);await shot('putter-main-reloaded',width,theme);await page.keyboard.press('Escape');
   await slot(goto.id,'goto').focus();assert.match(await page.locator('#bagLiftInfo').innerText(),/Go-to/);
   await shot('goto-top-reloaded',width,theme);await page.keyboard.press('Escape');
   await page.locator(`[data-bag-edit="${goto.id}"]`).click();assert.equal(await page.locator('#bagPocket').inputValue(),'goto');
   await page.locator('#bagPocket').scrollIntoViewIfNeeded();await shot('three-pocket-selector',width,theme);await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,themes,widths,screenshots:shots,errors},null,2));
  fs.writeFileSync(dir+'/screenshots.html',`<!doctype html><meta charset="utf-8"><title>Bag pocket QA</title><style>body{margin:32px;background:#14191f;color:#e9edf0;font:16px system-ui}section{margin:40px 0}figure{display:inline-block;vertical-align:top;margin:16px}img{width:660px;max-width:100%}.mobile img{width:360px}a{color:inherit}figcaption{margin-top:8px}</style><h1>Bag pockets · local QA</h1>${themes.map(theme=>`<section><h2>${theme}</h2>${shots.filter(s=>s.theme===theme).map(s=>`<figure class="${s.width===360?'mobile':''}"><a href="${s.name}"><img src="${s.name}" loading="lazy"></a><figcaption>${s.state} · ${s.width}px</figcaption></figure>`).join('')}</section>`).join('')}`);
  console.log(`PASS: putter insert default, move to main and reload; Go-to selector, persistence and upper pocket. ${shots.length} screenshots; all three themes at 1440px and 360px; no page errors.`);
 }
 await context.close();
} finally {await browser?.close();server.kill();}
