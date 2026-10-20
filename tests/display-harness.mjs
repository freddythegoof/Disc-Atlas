// Shared local harness for the display-customization suites: builds the public Worker, serves it
// with the auth fixture on a disposable local D1, signs in through the fixture's fake Google page
// and seeds a small bag that covers every class, stock and generated stamps, and an overmold.
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');

export const BAG=[
 {mold_id:'3d60892b6812',plastic:'Champion',wear:8,weight_g:172,color:'#70b7cd'},  // Destroyer · distance · generated stamp
 {mold_id:'6be51219c6db',plastic:'ESP',wear:9,weight_g:174,color:'#f2c14e'},       // Undertaker · fairway · Discraft stock stamp
 {mold_id:'ba675aed468a',plastic:'Champion',wear:7,weight_g:175,color:'#d9534f'},  // Firebird · fairway · generated stamp
 {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'},         // Buzzz · mid · Discraft stock stamp
 {mold_id:'5f22688f2ee3',plastic:'Neutron',wear:9,weight_g:174,color:'#8fd3c1'},   // Hex · mid · generated stamp
 {mold_id:'ff4bf9e7743c',plastic:'Putter Line Hard',wear:10,weight_g:174,color:'#e2d8c1'}, // Luna · putter · stock stamp
 {mold_id:'761c90d342f5',plastic:'Electron',wear:6,weight_g:175,color:'#e6c668'}   // Envy · putter · overmold
];

// The local site alone: the public Worker with the auth fixture on a fresh local D1.
export async function startServer({port=8811,state='work/display-customization/d1'}={}){
 const config='tests/auth.wrangler.jsonc',base=`https://localhost:${port}`,wrangler='node_modules/wrangler/wrangler-dist/cli.js';
 const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
 if(!process.env.DISPLAY_SKIP_BUILD)execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
 fs.rmSync(state,{recursive:true,force:true});
 command(['d1','migrations','apply','disc-atlas-accounts','--local']);
 const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port',String(port),'--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let logs='';for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
 const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
 const deadline=Date.now()+60000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null){server.kill();throw Error(logs);}await new Promise(r=>setTimeout(r,250));}
 return {base,stop:()=>server.kill(),logs:()=>logs};
}

export async function startHarness({port=8811,state='work/display-customization/d1',viewport={width:1440,height:1000},colorScheme='light'}={}){
 const site=await startServer({port,state}),{base}=site;
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11']:[]});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport,colorScheme});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const errors=[];
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const signIn=async()=>{
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
  await page.locator('#myBagSignIn').click();
  const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
  const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});
  await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
  await page.waitForFunction(()=>window.AtlasAccount?.current?.user);
 };
 const seedBag=async(discs=BAG)=>{
  await page.evaluate(async discs=>{
   const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
   const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
   for(const disc of discs){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());}
  },discs);
 };
 const stop=async()=>{await browser?.close().catch(()=>{});site.stop();};
 return {base,browser,context,page,errors,signIn,seedBag,stop,logs:site.logs};
}

// `node tests/display-harness.mjs` keeps the site up for suites that take ATLAS_URL (tests/palette.mjs).
if(import.meta.url===`file://${process.argv[1]}`){
 const site=await startServer();console.log(`Serving ${site.base} (Ctrl-C to stop)`);
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{site.stop();process.exit(0);});
}
