// Capture the actual atlas seam in all themes; --before records the unmodified baseline.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const phase=process.argv.includes('--before')?'before':'after';
const dir='docs/images/atlas-backdrop-removal';fs.mkdirSync(dir,{recursive:true});
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--enable-gpu']});
const report=[],errors=[];
try{
 for(const device of ['desktop','phone'])for(const theme of ['light','midnight','charcoal','black','paper','dusk']){
  const phone=device==='phone';
  const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1440,height:900},isMobile:phone,hasTouch:phone,deviceScaleFactor:1});
  await context.addInitScript(t=>{localStorage.setItem('disc-atlas-theme',t);sessionStorage.setItem('atlas-intro-seen','1');},theme);
  const page=await context.newPage();
  if(phase==='before')for(const css of ['cosmic.css','stitch.css'])await page.route('**/'+css,route=>route.fulfill({body:execFileSync('git',['show','8e91dc7:public/'+css]),contentType:'text/css'}));
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length);
  if(phone)await page.locator('#mapTab').click();
  await page.waitForFunction(()=>mapClusters.length>0&&!cameraTween&&!atlasSettling&&mapArt.pending===0);
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(900);
  const metrics=await page.evaluate(()=>{
   const read=s=>{const c=getComputedStyle(document.querySelector(s));return {background:c.background,backgroundImage:c.backgroundImage,backgroundColor:c.backgroundColor,border:c.border,boxShadow:c.boxShadow,borderRadius:c.borderRadius};};
   const map=read('#map'),header=read('header'),body=read('body');
   const grid=getComputedStyle(document.querySelector('#map'),'::before').backgroundImage;
   const furniture=Object.fromEntries(['.type-chips','.map-controls','.legend'].map(s=>[s,read(s)]));
   const geometry={map:document.querySelector('#map').getBoundingClientRect().toJSON(),header:document.querySelector('header').getBoundingClientRect().toJSON()};
   const points=mapClusters.map(g=>({key:g.key,x:g.x,y:g.y}));
   document.body.dataset.view='list';const directory={map:read('#map'),header:read('header'),body:read('body')};
   document.body.dataset.view='map';document.body.classList.add('my-bag-mode');const bag={map:read('#map'),header:read('header'),body:read('body')};
   document.body.classList.remove('my-bag-mode');
   return {map,header,body,grid,furniture,geometry,points,directory,bag};
  });
  report.push({device,theme,...metrics});
  await page.screenshot({path:`${dir}/${device}-${theme}-${phase}.png`,clip:{x:0,y:0,width:phone?390:1440,height:phone?420:340}});
  console.log(`${phase}: ${device} ${theme}: map ${metrics.map.backgroundImage==='none'?'flat':'gradients'}, shadow ${metrics.map.boxShadow}`);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(`${dir}/${phase}.json`,JSON.stringify(report,null,2)+'\n');
 if(phase==='after'){
  const before=JSON.parse(fs.readFileSync(`${dir}/before.json`));
  for(const [i,r] of report.entries()){
   const label=`${r.device} ${r.theme}`;
   assert.equal(r.map.backgroundImage,'none',label+': no container wash');
   assert.equal(r.body.backgroundImage,'none',label+': no page wash in the header gap');
   assert.equal(r.body.backgroundColor,r.map.backgroundColor,label+': page gap shares map color');
   assert.equal(r.map.backgroundColor,r.header.backgroundColor,label+': one background');
   assert.equal(r.map.boxShadow,'none',label+': no panel shadow');
   assert.match(r.map.border,/^0px/,label+': no map border');
   for(const key of ['grid','furniture','geometry','points','directory','bag'])assert.deepEqual(r[key],before[i][key],label+': unchanged '+key);
  }
  console.log('PASS: all 12 seams have no container wash; grid, furniture, geometry, marker positions, Directory and My Bag styles unchanged');
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
