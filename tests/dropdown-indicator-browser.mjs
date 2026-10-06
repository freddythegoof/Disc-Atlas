import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// The unified dropdown indicator (Stitch "Unified Dropdown Indicator", Oct 6): one chevron
// component in three sizes and four states replaces every dropdown arrow, from the toolbar chips
// to the bag sheets. This suite photographs every affected surface in light, midnight and charcoal
// at 1440 and 360 px, and (unless DD_PHASE=before) checks that no old arrow survives and that the
// component's sizes and states match the spec. DD_PHASE=before only photographs, into before/.
const phase=process.env.DD_PHASE==='before'?'before':'after';
const config='tests/auth.wrangler.jsonc',state='work/dropdown-indicator/d1-qa',port=8811,base=`https://localhost:${port}`,dir=`outputs/dropdown-indicator/${phase}`;
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port',String(port),'--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const THEMES=['light','midnight','charcoal'],WIDTHS=[1440,360];
const errors=[],shots=[],checks=[],controls={};
const check=label=>{checks.push(label);console.log('ok -',label);};
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error' && !/Failed to load resource/.test(m.text()))errors.push(m.text());});
 const setTheme=theme=>page.evaluate(t=>{const b=document.querySelector(`[data-theme-choice="${t}"]`);if(b)b.click();else{const s=document.querySelector('[data-theme-select]');s.value=t;s.dispatchEvent(new Event('change',{bubbles:true}));}},theme);
 const settle=async()=>{await page.evaluate(()=>{document.activeElement?.blur?.();return document.fonts.ready;});await page.mouse.move(1,1);await page.waitForTimeout(300);};
 // One picture of a surface: the union of the given elements' boxes, padded, clipped to the page.
 const shoot=async(name,selectors,pad=12)=>{
  await page.evaluate(list=>{for(const s of list){const n=[...document.querySelectorAll(s)].find(n=>n.getBoundingClientRect().height);if(n){if(!n.closest('dialog,[popover],.chip-popover'))n.scrollIntoView({block:'center'});return;}}},selectors);
  await settle();
  const box=await page.evaluate(([list,pad])=>{let l=Infinity,t=Infinity,r=-Infinity,b=-Infinity;for(const s of list)for(const n of document.querySelectorAll(s)){const x=n.getBoundingClientRect();if(!x.width||!x.height)continue;l=Math.min(l,x.left);t=Math.min(t,x.top);r=Math.max(r,x.right);b=Math.max(b,x.bottom);}if(l===Infinity)return null;return {x:Math.max(0,l-pad),y:Math.max(0,t-pad),width:Math.min(innerWidth,r+pad)-Math.max(0,l-pad),height:Math.min(innerHeight,b+pad)-Math.max(0,t-pad)};},[selectors,pad]);
  if(!box)throw Error(`${name}: nothing visible for ${selectors}`);
  await page.screenshot({path:`${dir}/${name}.png`,clip:box});shots.push(name);
  // Every visible dropdown control's rendered size, to compare with the before set.
  Object.assign(controls,Object.fromEntries((await page.evaluate(()=>[...document.querySelectorAll('select,#brandChip,#lensButton,#sortBar [data-sort],[data-add-menu],details>summary')].filter(n=>n.getBoundingClientRect().width && !n.closest('[hidden]')).map((n,i)=>{const r=n.getBoundingClientRect(),key=n.id||n.name||(n.dataset.bagPocket?'pocket':'')||n.dataset.sort||(n.dataset.addMenu?'add-'+n.className:'')||n.parentElement.className||n.tagName;return [key+'#'+i,[Math.round(r.width),Math.round(r.height)]];}))).map(([k,v])=>[`${name}|${k}`,v])));
 };
 const everyTheme=async(fn)=>{for(const width of WIDTHS){await page.setViewportSize({width,height:width===360?800:1000});for(const theme of THEMES){await setTheme(theme);await page.waitForTimeout(250);await fn(width,theme);}}};
 const escape=async()=>{await page.keyboard.press('Escape');await page.waitForTimeout(150);};
 const view=async name=>{await page.evaluate(n=>document.querySelector('#'+n+'Tab').click(),name);await page.waitForTimeout(300);};

 // Signed in with a few discs, so My Bag shows its sort and pocket selects.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);
 await page.evaluate(async()=>{for(const [mold_id,plastic,wear,weight_g] of [['35dae588c670','Neutron',7,175],['7446eb39abe5','Z',8,180],['761c90d342f5','Electron',6,175]]){const r=await fetch('/api/bag/discs',{method:'POST',headers:{'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:JSON.stringify({mold_id,plastic,wear,weight_g})});if(!r.ok)throw Error(await r.text());}});

 // 1. The atlas toolbar: Manufacturer chip, type chips, map-view dropdown; then each one open.
 await page.goto(base+'/');await page.waitForFunction(()=>typeof discs!=='undefined' && discs.length && filtered.length);
 await everyTheme(async(width,theme)=>{
  await view('map');await page.evaluate(()=>{const t=document.querySelector('#typeChips');if(t)t.scrollLeft=0;});
  await shoot(`toolbar-${width}-${theme}`,['.explore-tools']);
  await page.locator('#brandChip').click();await page.locator('#brandPanel').waitFor();
  await shoot(`manufacturer-open-${width}-${theme}`,['#brandChip','#brandPanel']);await escape();
  await page.evaluate(()=>document.querySelector('#typeChips')?.scrollTo({left:1e4}));
  await page.locator('#lensButton').click();await page.locator('#lensMenu').waitFor();
  await shoot(`lens-open-${width}-${theme}`,['#lensButton','#lensMenu']);await escape();
 });
 check('Toolbar: Manufacturer chip and map view, closed and open, every theme and width');

 // 2. Directory: the sort toggles (Speed both ways) and each row's add button.
 await everyTheme(async(width,theme)=>{
  await view('list');
  await page.locator('#sortBar [data-sort="speed"]').click();await page.locator('#sortBar [data-sort="speed"]').click();
  await shoot(`directory-sort-${width}-${theme}`,['#sortBar','#rows .directory-row:nth-child(-n+3)']);
  await page.locator('#sortBar [data-sort="featured"]').click();
 });
 check('Directory: sort toggles and add buttons, every theme and width');

 // 3. A disc's details: Add to, and the Specs / Sources / shop disclosures.
 await everyTheme(async(width,theme)=>{
  await view('list');await page.locator('#rows .disc-row').first().click();await page.locator('#detail').waitFor();
  await page.evaluate(()=>document.querySelector('#detail details.specs')?.setAttribute('open',''));
  await shoot(`detail-${width}-${theme}`,['#addToBag','#detail details']);
  await page.evaluate(()=>document.querySelector('#closeDetail')?.click());await page.waitForTimeout(200);
 });
 check('Details: Add to and the disclosures, every theme and width');

 // 4. The Filters drawer: collection and stability selects, the manufacturer picker.
 await everyTheme(async(width,theme)=>{
  await view('map');await page.locator('#filtersToggle').click();await page.locator('#filters').waitFor();
  await shoot(`filters-${width}-${theme}`,['#collection','#stability','#brandPicker > summary']);
  await page.locator('#closeFilters').click();await page.waitForTimeout(300);
 });
 check('Filters drawer: collection, stability and manufacturer picker, every theme and width');

 // 5. My Bag: the sort select and each disc's pocket select; the bag and disc sheets.
 await everyTheme(async(width,theme)=>{
  await view('bag');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-pocket]').length===3);
  await shoot(`bag-sort-${width}-${theme}`,['.bag-sort-bar']);
  await shoot(`bag-pockets-${width}-${theme}`,['#myBagContents .bag-pocket-inline']);
  await page.locator('[data-bag-edit]').first().click();await page.locator('#addDiscDialog').waitFor();
  await shoot(`disc-sheet-${width}-${theme}`,['#addDiscDialog .profile-field:has(select)']);
  await page.locator('#addDiscDialog button.close[data-bag-close]').click();await page.waitForTimeout(200);
  await page.locator('#editBagModel').click();await page.locator('#bagModelDialog').waitFor();
  await shoot(`bag-model-sheet-${width}-${theme}`,['#bagModelDialog .profile-field:has(select)']);
  await page.locator('#bagModelDialog button.close[data-bag-close]').click();await page.waitForTimeout(200);
 });
 check('My Bag: sort select, pocket selects, disc and bag sheets, every theme and width');

 // 6. The info pages' theme picker.
 await page.goto(base+'/about.html');
 await everyTheme(async(width,theme)=>{await shoot(`info-theme-${width}-${theme}`,['.theme-picker']);});
 check('Info pages: theme picker, every theme and width');

 if(phase==='after'){
  // 7. No old arrow survives, and every dropdown carries the one component.
  await page.setViewportSize({width:1440,height:1000});
  const audit=async label=>{
   const found=await page.evaluate(()=>{
    const old=[],missing=[];
    // Text arrows and native disclosure triangles.
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    for(let n;n=walker.nextNode();)if(/[⌄▾▼▿˅]/.test(n.textContent) && n.parentElement.closest('button,summary,label,select,a'))old.push('glyph: '+n.parentElement.outerHTML.slice(0,100));
    for(const s of document.querySelectorAll('summary'))if(getComputedStyle(s).display==='list-item' && getComputedStyle(s).listStyleType!=='none')old.push('marker: '+s.outerHTML.slice(0,80));
    // CSS-drawn chevrons on dropdown buttons.
    for(const b of document.querySelectorAll('[aria-haspopup="menu"],[aria-haspopup="dialog"],[aria-haspopup="listbox"]')){const a=getComputedStyle(b,'::after');if(a.content!=='none' && a.content!=='normal' && parseFloat(a.borderRightWidth)>0)old.push('css chevron: #'+b.id);}
    // Native select arrows: every select shows the component instead.
    for(const s of document.querySelectorAll('select')){if(s.hidden || s.closest('[hidden]'))continue;if(getComputedStyle(s).appearance!=='none')old.push('native select: '+(s.id||s.name||s.dataset.bagPocket));if(!s.parentElement.matches('.dd-select') || !s.parentElement.querySelector(':scope>.dd-indicator'))missing.push('select '+(s.id||s.name||s.dataset.bagPocket));}
    for(const b of document.querySelectorAll('#brandChip,#lensButton,[data-add-menu],#sortBar [data-sort="speed"],#sortBar [data-sort="stability"],#sortBar [data-sort="new"],details>summary'))if(!b.querySelector('.dd-indicator'))missing.push(b.id||b.dataset.sort||b.className||b.tagName);
    return {old,missing};
   });
   assert.deepEqual(found.old,[],`${label}: no old arrow survives`);assert.deepEqual(found.missing,[],`${label}: every dropdown carries the indicator`);
  };
  await page.goto(base+'/');await page.waitForFunction(()=>typeof discs!=='undefined' && discs.length && filtered.length);
  await audit('atlas');
  await view('list');await page.locator('#rows .disc-row').first().click();await page.locator('#detail').waitFor();await audit('details');
  await page.evaluate(()=>document.querySelector('#closeDetail')?.click());
  await page.locator('#filtersToggle').click();await audit('filters');await page.locator('#closeFilters').click();
  await view('bag');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-pocket]').length===3);await audit('my bag');
  await page.locator('[data-bag-edit]').first().click();await audit('disc sheet');await page.locator('#addDiscDialog button.close[data-bag-close]').click();
  await page.locator('#editBagModel').click();await audit('bag sheet');await page.locator('#bagModelDialog button.close[data-bag-close]').click();
  await page.goto(base+'/about.html');await audit('about');
  check('Audit: no text, triangle, CSS or native arrow left; every select, menu button, sort toggle and disclosure carries .dd-indicator');

  // 8. Sizes and states, as the Stitch spec measures them.
  await page.goto(base+'/');await page.waitForFunction(()=>typeof discs!=='undefined' && discs.length && filtered.length);
  for(const theme of THEMES){
   await setTheme(theme);await page.waitForTimeout(250);
   const measure=sel=>page.locator(sel).first().evaluate(n=>{const i=n.matches('.dd-indicator')?n:n.querySelector('.dd-indicator'),c=getComputedStyle(i),svg=i.querySelector('svg').getBoundingClientRect(),p=getComputedStyle(i.querySelector('path'));return {box:[i.offsetWidth,i.offsetHeight],glyph:[Math.round(svg.width*100)/100,Math.round(svg.height*100)/100],stroke:parseFloat(p.strokeWidth),color:c.color,transform:c.transform,opacity:+c.opacity,background:c.backgroundColor,shadow:c.boxShadow,transition:c.transitionTimingFunction,duration:c.transitionDuration};});
   const tokens=await page.evaluate(()=>{const probe=document.createElement('i');document.body.append(probe);const read=v=>{probe.style.color=`var(${v})`;return getComputedStyle(probe).color;};const out={rest:read('--dd-rest'),accent:read('--dd-accent')};probe.remove();return out;});
   const rest=await measure('#lensButton');
   assert.deepEqual([rest.box,rest.glyph,rest.stroke],[[12,12],[8,5],1.5],`${theme}: small = 12 px box, 8 × 5 glyph, 1.5 stroke`);
   assert.equal(rest.color,tokens.rest,`${theme}: resting chevron in the muted tint`);
   assert.ok(rest.transform==='none' || rest.transform==='matrix(1, 0, 0, 1, 0, 0)',`${theme}: resting chevron points down`);
   assert.match(rest.transition,/cubic-bezier\(0\.16, 1, 0\.3, 1\)/);assert.match(rest.duration,/0\.15s/);
   await page.locator('#lensButton').hover();await page.waitForTimeout(250);
   const hover=await measure('#lensButton');
   assert.equal(hover.color,tokens.accent,`${theme}: hover turns lime`);assert.match(hover.transform,/matrix\(1\.1, 0, 0, 1\.1/,`${theme}: hover scales 1.1`);assert.match(hover.shadow,/8px/,`${theme}: hover glows`);
   await page.locator('#lensButton').click();await page.locator('#lensMenu').waitFor();await page.waitForTimeout(250);
   const open=await measure('#lensButton');
   assert.match(open.transform,/matrix\(-1, .*0, -1/,`${theme}: open rotates 180° ${open.transform}`);assert.equal(open.color,tokens.accent,`${theme}: open is lime`);
   assert.notEqual(open.background,'rgba(0, 0, 0, 0)',`${theme}: open caret sits on a lime tint`);
   await escape();
   await view('list');await page.locator('#rows .disc-row').first().click();await page.locator('#detail').waitFor();
   const md=await measure('#addToBag');assert.deepEqual([md.box,md.glyph,md.stroke],[[16,16],[10,6],1.75],`${theme}: medium = 16 px box, 10 × 6 glyph, 1.75 stroke`);
   const lg=await measure('#detail details>summary');assert.deepEqual([lg.box,lg.glyph,lg.stroke],[[20,20],[12,7],2],`${theme}: large = 20 px box, 12 × 7 glyph, 2 stroke`);
   await page.evaluate(()=>document.querySelector('#closeDetail')?.click());
   // Disabled: a pocket select mid-save.
   await view('bag');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-pocket]').length===3);
   await page.locator('#bagSort').evaluate(n=>{n.disabled=true;});await page.waitForTimeout(200);
   const off=await measure('.dd-select:has(#bagSort)');assert.equal(off.opacity,.35,`${theme}: disabled at 35%`);
   await page.locator('#bagSort').evaluate(n=>{n.disabled=false;});
   // Ascending sort shows the turned chevron.
   await view('list');await page.locator('#sortBar [data-sort="speed"]').click();await page.mouse.move(1,1);await page.waitForTimeout(250);
   assert.match((await measure('#sortBar [data-sort="speed"]')).transform,/^none$|matrix\(1, 0, 0, 1/,`${theme}: fastest first points down`);
   await page.locator('#sortBar [data-sort="speed"]').click();await page.mouse.move(1,1);await page.waitForTimeout(250);
   assert.equal(await page.locator('#sortBar [data-sort="speed"]').getAttribute('data-direction'),'ascending');
   assert.match((await measure('#sortBar [data-sort="speed"]')).transform,/matrix\(-1, .*0, -1/,`${theme}: slowest first turns the chevron up`);
   await page.locator('#sortBar [data-sort="featured"]').click();await view('map');
  }
  check('States: small/medium/large boxes, glyphs and strokes match the spec; rest muted, hover lime + 1.1 + glow, open turned 180° on a lime tint, disabled 35%; 150 ms cubic-bezier(0.16, 1, 0.3, 1); sort direction turns the chevron — in all three themes');
 }

 // 9. Same layout: each picture is clipped to its controls, so a control that grew, shrank or
 // moved shows as a picture of another size than before the change (when a before/ set exists).
 const before=`outputs/dropdown-indicator/before`;
 fs.writeFileSync(`${dir}/controls.json`,JSON.stringify(controls,null,1));
 if(phase==='after' && fs.existsSync(before)){
  const size=file=>{const b=fs.readFileSync(file);return [b.readUInt32BE(16),b.readUInt32BE(20)];};
  const moved=shots.filter(name=>fs.existsSync(`${before}/${name}.png`)).map(name=>[name,size(`${before}/${name}.png`),size(`${dir}/${name}.png`)])
   .filter(([,[w0,h0],[w1,h1]])=>Math.abs(w0-w1)>2 || Math.abs(h0-h1)>2);
  assert.deepEqual(moved,[],'Every surface keeps its layout (picture sizes match the before set)');
  const was=fs.existsSync(`${before}/controls.json`)?JSON.parse(fs.readFileSync(`${before}/controls.json`,'utf8')):{};
  const resized=Object.entries(controls).filter(([k,[w,h]])=>was[k] && (Math.abs(was[k][0]-w)>1 || Math.abs(was[k][1]-h)>1)).map(([k,v])=>[k,was[k],v]);
  assert.ok(Object.keys(was).length,'The before set recorded its controls');
  assert.deepEqual(resized,[],'Every dropdown control keeps its size');
  check(`Layout: all ${shots.length} surfaces keep their size and place (pictures match the before set within 2 px), and all ${Object.keys(controls).length} dropdown controls measured keep their size within 1 px`);
 }

 assert.deepEqual(errors,[],'No page errors');
 const groups=[...new Set(shots.map(s=>s.replace(/-\d+-\w+$/,'')))];
 const gallery=groups.map(g=>`<h2>${g}</h2>`+shots.filter(s=>s.startsWith(g+'-') && s.replace(/-\d+-\w+$/,'')===g).map(name=>`<figure><img src="${name}.png" alt="${name}"><figcaption>${name}</figcaption></figure>`).join('')).join('\n');
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Dropdown indicator — ${phase}</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:720px;border:1px solid #333}</style>\n${gallery}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({phase,checks,shots},null,1));
 console.log(`PASS dropdown indicator (${phase}): ${checks.length} checks, ${shots.length} screenshots in ${dir}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
