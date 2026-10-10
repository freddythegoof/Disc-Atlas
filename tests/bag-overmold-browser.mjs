// Real local D1 + the existing signed Google fixture; no live account is touched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-overmold/d1-qa',base='https://localhost:8820',dir='outputs/bag-overmold';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8820','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser,page;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
try {
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline || server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[];
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 await page.goto(base+'/?bag=1');await page.locator('#myBagDemo').waitFor();await page.locator('#myBagSignIn').click();
 const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
 const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 const open=async(name,destination='bag')=>{
  await page.evaluate(async({name,destination})=>{const d=discs.find(d=>d.name===name);if(!d)throw Error('Missing mold '+name);await BagApp.add(d,null,destination);},{name,destination});
  await page.locator('#addDiscDialog').waitFor();
 };
 // My Bag shows one list at a time (Bag, Storage or Lost).
 const showList=name=>page.locator(`#bagListPicker [data-bag-list="${name}"]`).click();
 const save=async()=>{await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});};
 await open('Envy');
 assert.equal(await page.locator('#addDiscDialog input[type=color]:visible').count(),2);
 assert.equal(await page.locator('#bagDiscColorLabel').innerText(),'Flight plate');
 const initialPlate=await page.locator('#bagDiscColor').inputValue();
 assert.equal(await page.locator('#bagRimColor').inputValue(),await page.evaluate(async color=>(await import('/disc3d/overmold.mjs')).overmoldColors(color).rim,initialPlate));
 // An automatic rim follows a changed plate until the player picks their own rim.
 await page.locator('#bagDiscColor').fill('#0000ff');
 assert.equal(await page.locator('#bagRimColor').inputValue(),'#000080');
 await page.locator('#bagRimColor').fill('#000000');await save();
 let data=await (await page.request.get(base+'/api/bag')).json();const envy=data.discs.find(d=>d.mold_id==='761c90d342f5');
 assert.ok(envy);assert.equal(envy.color,'#0000ff');assert.equal(envy.rim_color,'#000000');
 await page.reload();await page.locator(`[data-bag-edit="${envy.id}"]`).waitFor();
 await page.locator(`[data-bag-edit="${envy.id}"]`).click();
 assert.equal(await page.locator('#bagDiscColor').inputValue(),'#0000ff');assert.equal(await page.locator('#bagRimColor').inputValue(),'#000000');
 await page.keyboard.press('Escape');
 await page.locator(`[data-disc-id="${envy.id}"] [data-bag-inspect]`).click();
 await page.waitForFunction(()=>Disc3D.viewer?.state.colors?.plate==='#0000ff' && Disc3D.viewer?.state.colors?.rim==='#000000');
 assert.deepEqual(await page.evaluate(()=>({plate:Disc3D.viewer.debug.bodyMaterial.color.getHexString(),rim:Disc3D.viewer.debug.rimMaterial.color.getHexString()})),{plate:'0000ff',rim:'000000'});
 await page.locator('#detail').screenshot({path:dir+'/envy-preview.png'});
 await page.locator('#closeDetail').click();
 await page.locator(`[data-bag-move="${envy.id}"]`).click();await showList('storage');await page.locator(`#bagStorage [data-bag-edit="${envy.id}"]`).waitFor();
 await page.locator(`#bagStorage [data-bag-edit="${envy.id}"]`).click();
 assert.equal(await page.locator('#bagRimColor').inputValue(),'#000000');
 await page.locator('#bagDiscColor').fill('#00ff00');assert.equal(await page.locator('#bagRimColor').inputValue(),'#000000');await save();
 await page.reload();await page.locator('#bagListPicker').waitFor();await showList('storage');await page.locator(`#bagStorage [data-bag-edit="${envy.id}"]`).waitFor();
 data=await (await page.request.get(base+'/api/bag')).json();assert.equal(data.discs[0].color,'#00ff00');assert.equal(data.discs[0].rim_color,'#000000');assert.equal(data.discs[0].in_bag,false);
 // Both single-mold cases retain the existing label, picker and save behavior.
 for(const name of ['Destroyer','Pilot']){
  await open(name);assert.equal(await page.locator('#addDiscDialog input[type=color]:visible').count(),1);
  assert.equal(await page.locator('#bagDiscColorLabel').innerText(),'Disc color');
  await page.locator('#bagDiscColor').fill('#123456');await save();
  data=await (await page.request.get(base+'/api/bag')).json();const item=data.discs.at(-1);
  await showList('bag');await page.locator(`[data-bag-edit="${item.id}"]`).click();assert.equal(await page.locator('#addDiscDialog input[type=color]:visible').count(),1);
  assert.equal(await page.locator('#bagDiscColor').inputValue(),'#123456');await page.keyboard.press('Escape');
 }
 await showList('storage');
 for(const theme of ['light','midnight','charcoal','black'])for(const width of [1440,360]){
  await page.setViewportSize({width,height:width===360?800:1000});
  await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);
  await page.locator(`#bagStorage [data-bag-edit="${envy.id}"]`).click();
  assert.equal(await page.locator('#addDiscDialog input[type=color]:visible').count(),2);
  const bounds=await page.locator('#addDiscDialog').boundingBox();assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#bagRimColor').focus();await page.keyboard.press('Tab');assert.ok(await page.locator('#addDiscDialog').evaluate(n=>n.contains(document.activeElement)));
  await page.locator('#addDiscDialog').evaluate(n=>{n.scrollTop=0;});
  await page.locator('#addDiscDialog').screenshot({path:`${dir}/editor-${width}-${theme}.png`});await page.keyboard.press('Escape');
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: overmold and single-mold editors, local D1 persistence, storage edits, real 3D materials, desktop/360px in four themes. Screenshots: '+dir);
}catch(error){if(page)await page.screenshot({path:dir+'/failure.png',fullPage:true});throw error;}
finally{await browser?.close();server.kill();}
