// A brand with no current or recent disc (Wham-O's relaunch molds, Alfa Discs: production unknown) used to pick to
// "No discs match these filters" under the default Current + recent Collection, and the empty state's Clear filters
// wiped the brand. Picking such a brand now widens the Collection to Show everything; a brand with current discs
// keeps Current + recent; and when only the Collection hides matches, the empty states offer Show everything.
// PLAYWRIGHT_MODULE may point to an existing installation; no backend is needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/account'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({user:null,csrfToken:null,authReady:false}));return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"backend excluded"}');return;}
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 const absolute=path.resolve(file),root=path.resolve('public');
 if(url.pathname!=='/'&&!absolute.startsWith(root+path.sep)){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,dir='outputs/brand-collection';
fs.mkdirSync(dir,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>discs.length&&filtered.length);
 const state=()=>page.evaluate(()=>({collection:$('#collection').value,brands:[...selectedBrands],count:filtered.length,rated:filtered.filter(d=>d.speed!=null).length,mapEmpty:!$('#empty').hidden,button:$('#emptyReset').textContent}));
 const pick=brand=>page.evaluate(b=>toggleBrand(b),brand);
 // The Collection select lives in the Filters drawer; set it as its change handler sees it.
 const setCollection=value=>page.evaluate(v=>{$('#collection').value=v;$('#collection').dispatchEvent(new Event('change'));},value);

 // Wham-O: every record is production unknown, three are rated. Picking it shows them on the map.
 assert.equal(await page.locator('#collection').inputValue(),'current');
 await pick('Wham-O, Inc.');
 let s=await state();
 assert.equal(s.collection,'all','Wham-O widens to Show everything '+JSON.stringify(s));
 assert.equal(s.count,38,'every Wham-O record is listed '+JSON.stringify(s));
 assert.ok(s.rated>=3&&!s.mapEmpty,'the rated Wham-O discs are on the map '+JSON.stringify(s));
 await page.screenshot({path:`${dir}/wham-o-map.png`});
 await pick('Wham-O, Inc.');

 // Alfa Discs: the same trap.
 await setCollection('current');
 await pick('Alfa Discs');
 s=await state();
 assert.equal(s.collection,'all','Alfa widens too '+JSON.stringify(s));
 assert.ok(s.rated>0&&!s.mapEmpty,'Alfa shows its rated discs '+JSON.stringify(s));
 await pick('Alfa Discs');

 // A brand with current discs keeps Current + recent.
 await setCollection('current');
 await pick('Innova');
 s=await state();
 assert.equal(s.collection,'current','Innova keeps Current + recent '+JSON.stringify(s));
 assert.ok(s.rated>0);
 await pick('Innova');

 // Going back to Current + recent with Wham-O still picked: the map's empty state offers Show everything and keeps the brand.
 await pick('Wham-O, Inc.');
 await setCollection('current');
 await page.waitForFunction(()=>!$('#empty').hidden&&$('#emptyReset').textContent==='Show everything');
 s=await state();
 assert.deepEqual(s.brands,['Wham-O, Inc.']);
 await page.screenshot({path:`${dir}/wham-o-empty-show-everything.png`});
 await page.locator('#emptyReset').click();
 s=await state();
 assert.equal(s.collection,'all','Show everything widens the Collection '+JSON.stringify(s));
 assert.deepEqual(s.brands,['Wham-O, Inc.'],'and keeps the brand');
 assert.ok(!s.mapEmpty);

 // The list's empty state offers the same button.
 await setCollection('current');
 await page.locator('#listTab').click();
 const listButton=page.locator('#rows [data-show-everything]');
 await listButton.waitFor();
 await page.screenshot({path:`${dir}/wham-o-list-show-everything.png`});
 await listButton.click();
 s=await state();
 assert.equal(s.collection,'all');assert.equal(s.count,38,'the list shows every Wham-O record '+JSON.stringify(s));
 assert.deepEqual(s.brands,['Wham-O, Inc.']);

 // An empty view that Show everything can't fix keeps Clear filters.
 await page.locator('#mapTab').click();
 await page.evaluate(()=>{$('#search').value='zzzz-no-such-disc';filter();});
 await page.waitForFunction(()=>!$('#empty').hidden);
 assert.equal(await page.locator('#emptyReset').textContent(),'Clear filters');
 assert.equal(await page.evaluate(()=>collectionHides(true)),false);

 assert.deepEqual(errors,[],'no page script errors');
 console.log('PASS: Wham-O and Alfa widen to Show everything, Innova keeps Current + recent, both empty states offer Show everything and keep the brand, a search miss keeps Clear filters.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
