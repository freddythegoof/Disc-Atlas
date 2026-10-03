import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn, execFileSync} from 'node:child_process';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const wrangler='node_modules/wrangler/bin/wrangler.js',config='tests/auth.wrangler.jsonc',state='work/auth-qa/state';
execFileSync(process.execPath,['scripts/build-workers.mjs'],{stdio:'inherit',windowsHide:true});
execFileSync(process.execPath,[wrangler,'d1','migrations','apply','disc-atlas-accounts','--local','--config',config,'--persist-to',state],{stdio:'inherit',windowsHide:true});
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--ip','127.0.0.1','--port','8788','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',b=>logs+=b.toString());server.stderr.on('data',b=>logs+=b.toString());
const base='https://localhost:8788',dir='outputs/plan-08a';fs.mkdirSync(dir,{recursive:true});
let browser,page;
try{
 const ready=()=>new Promise(resolve=>{const request=https.get(base,{rejectUnauthorized:false,family:4},r=>{r.resume();resolve(true);});request.on('error',()=>resolve(false));request.setTimeout(1000,()=>request.destroy());});
 const deadline=Date.now()+60000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error('Dev Worker did not start: '+logs);await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[];page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 // Simulate the provider's consent screen. The actual Worker exchanges the code,
 // checks its RS256 signature/claims and PKCE, then persists a real D1 session.
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const url=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:url.searchParams.get('nonce'),challenge:url.searchParams.get('code_challenge')})).toString('base64');
  assert.match(url.pathname,/^\/o\/oauth2\/v2\/auth\/?$/,'Only the authorization request reaches the Google fixture');
  const callback=new URL(url.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:url.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<!doctype html><title>Google provider fixture</title><h1>Google test provider</h1><a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const menu=page.getByRole('menu',{name:'Site information'}),button=page.getByRole('button',{name:'Site menu',exact:true});
 const signIn=async()=>{
  const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
  assert.match(href,/^\/auth\/google\/start\?return_to=/);
  // Playwright does not route later requests in a redirect chain. Use the shared
  // cookie jar to obtain the real start redirect, then navigate to the fixture.
  const start=await page.request.get(base+href,{maxRedirects:0});assert.equal(start.status(),302);
  await page.goto(start.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 };
 const capture=async name=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);await page.screenshot({path:`${dir}/${name}.png`});};
 const setTheme=async theme=>{await button.click();await menu.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
 await button.click();assert.equal(await menu.getByRole('menuitem',{name:'Sign in',exact:true}).count(),1,'Signed-out menu contains Sign in');await page.keyboard.press('Escape');
 // Repeat after async account response so hidden items never enter arrow navigation.
 await page.waitForFunction(()=>window.AtlasAccount?.current);
 for(const theme of ['light','midnight','charcoal'])for(const width of [1440,360]){
  await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);await button.click();
  assert.ok(await menu.getByRole('menuitem',{name:'Sign in',exact:true}).isVisible());assert.equal(await menu.getByRole('menuitem',{name:'Profile',exact:true}).count(),0);
  const r=await menu.boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width&&r.y+r.height<=800);
  await capture(`menu-signed-out-${width}-${theme}`);await page.keyboard.press('End');assert.ok(await menu.getByRole('menuitemradio',{name:'Charcoal',exact:true}).evaluate(n=>n===document.activeElement));await page.keyboard.press('Escape');
 }
 await button.click();await menu.getByRole('menuitem',{name:'Sign in',exact:true}).click();await page.getByRole('heading',{name:'Sign in',exact:true}).waitFor({timeout:5000});assert.equal(new URL(page.url()).pathname,'/signin');
 await signIn();await page.waitForURL(base+'/');
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);
 const cookies=await context.cookies(),session=cookies.find(c=>c.name==='__Host-atlas-session');assert.ok(session?.secure&&session.httpOnly);assert.equal(session.sameSite,'Lax');assert.ok(!await page.evaluate(()=>document.cookie.includes('atlas-session')));
 for(const theme of ['light','midnight','charcoal'])for(const width of [1440,360]){
  await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);await button.click();
  for(const name of ['Profile','Account settings','Sign out'])assert.ok(await menu.getByRole('menuitem',{name,exact:true}).isVisible());assert.equal(await menu.getByRole('menuitem',{name:'Sign in',exact:true}).count(),0);
  const r=await menu.boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width&&r.y+r.height<=800);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await capture(`menu-signed-in-${width}-${theme}`);await page.keyboard.press('Home');await page.keyboard.press('ArrowUp');assert.ok(await menu.getByRole('menuitemradio',{name:'Charcoal',exact:true}).evaluate(n=>n===document.activeElement));await page.keyboard.press('Escape');assert.ok(await button.evaluate(n=>n===document.activeElement));
 }
 for(const route of ['profile','account-settings'])for(const theme of ['light','midnight','charcoal'])for(const width of [1440,360]){
  await page.goto(base+'/'+route);await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);
  await page.getByRole('heading',{name:route==='profile'?'Profile':'Account settings',exact:true}).waitFor();assert.match(await page.locator('main').innerText(),/player@example.com/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await capture(`${route}-${width}-${theme}`);
 }
 await page.getByLabel('Display name',{exact:true}).fill('Updated Player');await page.getByRole('button',{name:'Save name',exact:true}).click();await page.getByRole('status').filter({hasText:'Display name saved.'}).waitFor();await page.reload();await page.getByLabel('Display name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Display name',{exact:true}).inputValue(),'Updated Player');
 await page.getByRole('button',{name:'Delete account',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Delete your account?'});await dialog.waitFor();await page.keyboard.press('Escape');assert.ok(!await dialog.isVisible());assert.ok(await page.getByRole('button',{name:'Delete account',exact:true}).evaluate(n=>n===document.activeElement));
 await page.goto(base+'/profile');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL(base+'/');await page.waitForFunction(()=>window.AtlasAccount?.current&&!window.AtlasAccount.current.user);await button.click();assert.ok(await menu.getByRole('menuitem',{name:'Sign in',exact:true}).isVisible());await page.keyboard.press('Escape');
 await page.goto(base+'/signin?return_to=/account-settings');await signIn();await page.waitForURL(base+'/account-settings');await page.getByLabel('Display name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Display name',{exact:true}).inputValue(),'Updated Player');
 await page.getByRole('button',{name:'Delete account',exact:true}).click();await page.getByLabel('Type DELETE',{exact:true}).fill('DELETE');await page.getByRole('button',{name:'Permanently delete account',exact:true}).click();await page.waitForURL(base+'/');await page.waitForFunction(()=>window.AtlasAccount?.current&&!window.AtlasAccount.current.user);
 await page.goto(base+'/profile');await page.waitForURL('**/signin?return_to=%2Fprofile');
 assert.deepEqual(errors,[]);await context.close();
 console.log('PASS: dev Worker + D1 + signed OAuth fixture; all menu states, 3 themes, desktop/360px, profile, settings, persistence, sign-out and confirmed deletion. Screenshots: outputs/plan-08a.');
}catch(error){
 if(page){console.error('Failed route:',new URL(page.url()).pathname);console.error('Browser errors:',await page.evaluate(()=>({ready:document.readyState,status:document.querySelector('#accountStatus')?.textContent,views:[...document.querySelectorAll('[data-account-view]')].map(n=>({view:n.dataset.accountView,hidden:n.hidden})),account:!!window.AtlasAccount?.current})));await page.screenshot({path:`${dir}/failure.png`});}
 throw error;
}finally{
 if(browser)await browser.close();server.kill();
}
