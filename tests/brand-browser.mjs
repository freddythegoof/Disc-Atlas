// Brand integration: actual page headers, persisted themes, live theme switches,
// favicon assets, mobile clearances, and the atlas's existing filter context.
// PLAYWRIGHT_MODULE may point to an existing installation; no backend is needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.png':'image/png'};
const pages={'/':'web/index.html','/signin':'public/account-page.html','/about':'public/about.html','/privacy':'public/privacy.html','/terms':'public/terms.html'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/account'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({user:null,csrfToken:null,authReady:false}));return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Brand QA: backend excluded"}');return;}
 const file=pages[url.pathname]||'public'+url.pathname;
 const absolute=path.resolve(file),root=path.resolve('public');
 if(!pages[url.pathname]&&!absolute.startsWith(root+path.sep)){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,dir='outputs/brand/site';
fs.mkdirSync(dir,{recursive:true});
let browser,checks=0;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark',reducedMotion:'reduce'});
 await context.addInitScript(()=>localStorage.setItem('disc-atlas-theme','light'));
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const route of Object.keys(pages)){
  await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
  const home=page.locator('header .logo');
  assert.equal(await home.locator('use[href="/brand/symbols.svg?v=tilted-disc#mark"]').count(),1,route+' uses the revised compact mark');
  assert.equal(await home.locator('use[href="/brand/symbols.svg?v=tilted-disc#wordmark"]').count(),1,route+' uses the outlined wordmark');
  assert.equal(await home.locator('ellipse').count(),0,route+' removes the generic ellipse');
  assert.match(await home.innerText(),/Disc Atlas/);
  assert.equal(await home.getAttribute('aria-label'),'Disc Atlas home');
  // The saved site choice takes precedence over an opposite system preference.
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  for(const width of [1440,360]){
   await page.setViewportSize({width,height:width===360?800:900});
   for(const theme of ['light','midnight','charcoal','black']){
    if(await page.locator('[data-theme-select]').count())await page.locator('[data-theme-select]').selectOption(theme);
    else {await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.locator(`[data-theme-choice="${theme}"]`).click();await page.keyboard.press('Escape');}
    await page.waitForFunction(t=>document.documentElement.dataset.theme===t&&!document.documentElement.classList.contains('theme-switching'),theme);   // the theme change is a cross-fade (batch 1)
    const result=await page.evaluate(()=>{
     const logo=document.querySelector('header .logo'),r=logo.getBoundingClientRect();
     const controls=document.querySelector('.header-actions,.theme-picker')?.getBoundingClientRect();
     return {theme:document.documentElement.dataset.theme,accent:getComputedStyle(logo).getPropertyValue('--da-accent').trim(),plate:getComputedStyle(logo).getPropertyValue('--da-plate').trim(),favicon:document.querySelector('link[rel="icon"]').getAttribute('href'),fits:document.documentElement.scrollWidth<=innerWidth&&r.left>=0&&r.right<=innerWidth&&(!controls||r.right<=controls.left)};
    });
    assert.equal(result.theme,theme);
    assert.equal(result.accent,theme==='light'?'#4d7c0f':'#b8ff00');
    assert.equal(result.plate,theme==='light'?'#eef0f3':'#13161c');
    assert.equal(result.favicon,`/brand/${theme}/submark.svg?v=tilted-disc`);
    assert.ok(result.fits,`${route}, ${width}px, ${theme}: logo clears controls and stays in viewport`);
    const response=await page.request.get(base+result.favicon);assert.equal(response.status(),200);assert.match(await response.text(),/viewBox="0 0 16 16"/);
    await page.screenshot({path:`${dir}/${route==='/'?'atlas':route.slice(1)}-${width}-${theme}.png`,clip:{x:0,y:0,width,height:180}});
    checks++;
   }
  }
 }
 // The compact logo remains available in the active manufacturer context.
 await page.goto(base);await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
 await page.evaluate(()=>{selectedBrands.add('Innova');filter();});
 assert.ok(await page.locator('#contextTitle').isVisible());
 assert.equal(await page.locator('#contextTitle use[href="/brand/symbols.svg?v=tilted-disc#mark"]').count(),1);
 await page.locator('#contextTitle').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('header .logo').evaluate(el=>el===document.activeElement),true,'Clearing filters returns focus to the branded home link');
 await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.locator('[data-theme-choice="charcoal"]').click();await page.keyboard.press('Escape');
 await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light','The initial fixture is restored on reload');
 // Independent context: persistence and legacy migration without the init fixture.
 const saved=await browser.newContext({colorScheme:'light'}),savedPage=await saved.newPage();
 await savedPage.goto(base+'/privacy');await savedPage.evaluate(()=>localStorage.setItem('disc-atlas-theme','dark'));await savedPage.reload();
 assert.equal(await savedPage.locator('html').getAttribute('data-theme'),'midnight');
 assert.equal(await savedPage.locator('link[rel="icon"]').getAttribute('href'),'/brand/midnight/submark.svg?v=tilted-disc');
 await savedPage.getByRole('button',{name:'Site menu',exact:true}).click();await savedPage.locator('[data-theme-choice="black"]').click();await savedPage.keyboard.press('Escape');
 await savedPage.waitForFunction(()=>!document.documentElement.classList.contains('theme-switching'));await savedPage.reload();
 assert.equal(await savedPage.locator('html').getAttribute('data-theme'),'black');
 assert.equal(await savedPage.locator('link[rel="icon"]').getAttribute('href'),'/brand/black/submark.svg?v=tilted-disc');
 await saved.close();
 for(const file of ['/icon.svg','/favicon.svg']){
  const response=await page.request.get(base+file);assert.equal(response.status(),200);assert.match(await response.text(),/viewBox="0 0 16 16"/);
 }
 assert.deepEqual(errors,[],'No page script errors from brand integration');
 console.log(`PASS: ${checks} page/width/theme combinations, native SVG icons, saved-theme precedence, legacy migration, outlined wordmarks, and filter-context keyboard focus.`);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
