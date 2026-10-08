import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Directory rows (Oct 8). Each row's Add control is a labelled tonal button (plus and indicator only on
// phones) inside the row surface, and the Bag / Storage menu it opens sits wholly inside the visible
// viewport, on the first row, on a row at the bottom of the screen (it flips above) and after scrolling.
// Above 700 px the flight numbers sit in four columns under their own headings, and they and the disc
// names grow with the viewport; phones keep their row type. "Brand" reads "Manufacturer" everywhere.
// Chromium runs with classic scrollbars, as Windows shows them, so the page and #rows scrollbars count.
const dir='outputs/directory-layout';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,ignoreDefaultArgs:['--hide-scrollbars']});
const checks=[],shots=[],errors=[],metrics={};
const check=label=>{checks.push(label);console.log('ok -',label);};
const desktop=[1280,1440,1920],phone=[390,360,320];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 const open=async width=>{
  await page.setViewportSize({width,height:width>700?900:844});
  await page.goto(base);await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);
  if(width>700)await page.locator('#listTab').click();
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
 };
 const shoot=async name=>{await page.waitForTimeout(220);await page.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 // The open menu: inside the visible viewport with 8 px to spare, nothing inside it cut off, and on top.
 const menuInView=()=>page.evaluate(()=>{
  const menu=document.querySelector('#addDestinationMenu'),m=menu.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=document.documentElement.clientHeight;
  const parts=[...menu.querySelectorAll('*')].map(n=>n.getBoundingClientRect()).filter(r=>r.width);
  const inside=parts.every(r=>r.left>=m.left-.5&&r.right<=m.right+.5&&r.top>=m.top-.5&&r.bottom<=m.bottom+.5);
  const unclipped=[menu,...menu.querySelectorAll('button,span,small')].every(n=>n.scrollWidth<=n.clientWidth+1||getComputedStyle(n).display==='inline');
  const corners=[[m.left+4,m.top+4],[m.right-4,m.top+4],[m.left+4,m.bottom-4],[m.right-4,m.bottom-4]].every(([x,y])=>menu.contains(document.elementFromPoint(x,y)));
  return {open:menu.matches(':popover-open'),fits:m.left>=7.5&&m.right<=vw-7.5&&m.top>=7.5&&m.bottom<=vh-7.5,inside,unclipped,corners,placement:menu.dataset.placement,rect:[m.left,m.top,m.right,m.bottom].map(Math.round),vw,vh};
 });
 const assertMenu=async(label,trigger)=>{
  const state=await menuInView();
  assert.ok(state.open,`${label}: menu opens`);
  assert.ok(state.fits,`${label}: menu inside the visible viewport ${JSON.stringify(state)}`);
  assert.ok(state.inside&&state.unclipped,`${label}: every choice and hint shows in full ${JSON.stringify(state)}`);
  assert.ok(state.corners,`${label}: nothing covers the menu`);
  if(trigger){
   const t=await trigger.boundingBox(),m=state.rect;
   assert.ok(Math.abs(m[2]-(t.x+t.width))<=1||m[2]>=state.vw-9,`${label}: menu aligns to the Add button's right edge or the viewport's inner edge`);
  }
  return state;
 };

 // Dropdown visibility at desktop and phone widths: first row, a row at the bottom, after scrolling #rows and the page.
 for(const width of [...desktop,...phone]){
  await open(width);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),`${width}: no sideways page scroll`);
  const first=page.locator('#rows .directory-add').first();
  await first.click();await assertMenu(`${width} first row`,first);
  assert.equal(await first.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await first.getAttribute('aria-expanded'),'false');
  assert.ok(await first.evaluate(n=>document.activeElement===n),`${width}: Escape returns focus to Add`);
  // A row whose button sits near the bottom of the screen: the menu turns above it.
  const low=await page.evaluate(()=>{const vh=document.documentElement.clientHeight;const buttons=[...document.querySelectorAll('#rows .directory-add')];const i=buttons.findIndex(b=>{const r=b.getBoundingClientRect();return r.bottom<vh-4&&r.bottom>vh-110&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('.directory-add')===b;});return i;});
  if(low>=0){
   const button=page.locator('#rows .directory-add').nth(low);await button.click();
   const state=await assertMenu(`${width} bottom row`,button);assert.equal(state.placement,'above',`${width}: a bottom-row menu opens above`);
   await page.keyboard.press('Escape');
  }
  await page.evaluate(()=>{document.querySelector('#rows').scrollTop=600;scrollTo(0,250);});await page.waitForTimeout(120);
  const visible=await page.evaluate(()=>{const vh=document.documentElement.clientHeight;return [...document.querySelectorAll('#rows .directory-add')].findIndex(b=>{const r=b.getBoundingClientRect();return r.top>140&&r.bottom<vh-240&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('.directory-add')===b;});});
  assert.ok(visible>=0,`${width}: a row is reachable after scrolling`);
  const scrolled=page.locator('#rows .directory-add').nth(visible);
  await scrolled.click();await assertMenu(`${width} scrolled`,scrolled);
  // The menu follows its row while the list scrolls under it.
  await page.evaluate(()=>{document.querySelector('#rows').scrollTop+=30;});await page.waitForTimeout(120);
  await assertMenu(`${width} scrolled further`,scrolled);
  await page.keyboard.press('Escape');
 }
 check('Bag / Storage menu fully visible, unclipped and on top at 1280, 1440, 1920, 390, 360 and 320 px (first row, bottom row flips above, scrolled list), classic scrollbars on');

 // The Add button: one design at every width, inside the row surface.
 for(const width of [...desktop,...phone]){
  await open(width);
  const info=await page.evaluate(()=>{
   const rows=[...document.querySelectorAll('#rows .directory-row')].slice(0,6),box=n=>n.getBoundingClientRect(),list=document.querySelector('#rows'),edge=box(list).left+list.clientWidth;
   return rows.map(row=>{const add=row.querySelector('.directory-add'),a=box(add),r=box(row),s=box(row.querySelector('.score')),label=add.querySelector('.directory-add-label');
    return {left:a.left,right:a.right,width:a.width,height:a.height,inset:edge-a.right,scoreGap:a.left-s.right,
     centred:Math.abs((a.top+a.bottom)/2-(r.top+r.bottom)/2),icon:!!add.querySelector('svg.directory-add-icon'),indicator:!!add.querySelector('.dd-indicator'),
     label:label&&getComputedStyle(label).display!=='none'?label.textContent:'',name:add.getAttribute('aria-label'),radius:parseFloat(getComputedStyle(add).borderTopLeftRadius)};});
  });
  for(const b of info){
   assert.ok(b.icon&&b.indicator,`${width}: Add shows its plus icon and the dropdown indicator`);
   assert.match(b.name,/^Add .+ to Bag or Storage$/,`${width}: Add keeps its accessible name`);
   assert.ok(b.centred<=1,`${width}: Add sits centred in its row`);
   assert.ok(b.inset>=(width>700?16:8)-.5,`${width}: Add keeps clear of the list edge (${b.inset}px)`);
   assert.ok(b.scoreGap>=(width>700?12:4)-.5,`${width}: Add keeps clear of the index (${b.scoreGap}px)`);
   assert.ok(b.radius>=8&&b.radius<=12,`${width}: Add uses the rounded-rectangle button shape`);
   if(width>700){assert.equal(b.label,'Add');assert.ok(b.width===88&&b.height===38,`${width}: desktop Add is 88 × 38`);}
   else{assert.equal(b.label,'',`${width}: phone Add shows only its icons`);assert.ok(b.width>=44&&b.height>=40,`${width}: phone Add is a 44 × 40 touch target`);}
  }
  assert.ok(info.every(b=>Math.abs(b.left-info[0].left)<.5),`${width}: Add buttons line up in one column`);
  // Hover and selection paint the whole row, Add included; the disc button itself stays clear.
  const surface=await page.evaluate(()=>{
   const row=document.querySelector('#rows .directory-row'),cs=getComputedStyle(row);
   return {line:cs.borderTopStyle,inner:getComputedStyle(row.querySelector('.disc-row')).borderTopStyle};
  });
  assert.deepEqual(surface,{line:'solid',inner:'none'},`${width}: the divider belongs to the whole row`);
  await page.locator('#rows .directory-row').nth(2).locator('.directory-add').hover();await page.waitForTimeout(220);
  assert.ok(await page.evaluate(()=>{const row=document.querySelectorAll('#rows .directory-row')[2];return getComputedStyle(row).backgroundColor===getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim()||getComputedStyle(row).backgroundColor!=='rgba(0, 0, 0, 0)';}),`${width}: hovering Add lights its row`);
 }
 check('Row Add: plus icon + "Add" + indicator on desktop (88 × 38), plus + indicator on phones (≥ 44 × 40), centred, one aligned column, clear of the index and list edge, row-wide hover and divider');

 // Keyboard and choosing a destination.
 await open(1440);
 const add=page.locator('#rows .directory-add').first();
 await add.focus();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.addDestination),'bag','Enter opens the menu on Bag');
 await page.keyboard.press('ArrowDown');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.addDestination),'storage','ArrowDown reaches Storage');
 await page.keyboard.press('Escape');
 assert.ok(await add.evaluate(n=>document.activeElement===n));
 // Clicking Add again closes its menu (the press would otherwise light-dismiss and the click reopen it).
 const menuOpen=()=>page.evaluate(()=>document.querySelector('#addDestinationMenu').matches(':popover-open'));
 for(const expected of [true,false,true,false]){
  await add.click();await page.waitForTimeout(120);
  assert.equal(await menuOpen(),expected,`Repeated clicks toggle the menu (${expected?'open':'closed'})`);
  assert.equal(await add.getAttribute('aria-expanded'),String(expected));
 }
 const second=page.locator('#rows .directory-add').nth(1);
 await add.click();await second.click();await page.waitForTimeout(120);
 assert.ok(await menuOpen(),'Another row\'s Add moves the menu to that row');
 assert.deepEqual([await add.getAttribute('aria-expanded'),await second.getAttribute('aria-expanded')],['false','true']);
 await second.click();await page.waitForTimeout(120);
 assert.ok(!(await menuOpen()),'Clicking that Add again closes it');
 for(const [name,id] of [['Bag','addHintBag'],['Storage','addHintStorage']])assert.equal(await page.locator('#addDestinationMenu').getByRole('menuitem',{name,exact:true}).getAttribute('aria-describedby'),id);
 await add.click();await shoot('menu-1440-light');
 await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Storage',exact:true}).click();
 await page.waitForTimeout(200);
 assert.ok(!(await page.evaluate(()=>document.querySelector('#addDestinationMenu').matches(':popover-open'))),'Choosing closes the menu');
 assert.ok(await page.locator('#myBagView').isVisible(),'Signed out, a choice shows the bag page and its sign-in prompt');
 // The details' wide Add to keeps a menu as wide as itself.
 await open(1440);await page.locator('#rows .disc-row').first().click();await page.locator('#addToBag').waitFor();
 await page.locator('#addToBag').click();
 const wide=await page.evaluate(()=>{const t=document.querySelector('#addToBag').getBoundingClientRect(),m=document.querySelector('#addDestinationMenu').getBoundingClientRect();return Math.abs(t.width-m.width)<1&&Math.abs(t.left-m.left)<1;});
 assert.ok(wide,'Add to in the details opens a menu as wide as itself');await assertMenu('details Add to');
 await page.locator('#addToBag').click();await page.waitForTimeout(120);
 assert.ok(!(await page.evaluate(()=>document.querySelector('#addDestinationMenu').matches(':popover-open'))),'Clicking Add to again closes its menu');
 check('Reclicking Add (or details Add to) closes its menu, another row’s Add takes it over; keyboard: Enter opens on Bag, arrows move, Escape returns focus; a choice closes the menu and continues; details Add to menu still matches its width');

 // Type and flight numbers: larger and columned on desktop, the phone row as before.
 for(const width of [...desktop,...phone]){
  await open(width);
  const m=await page.evaluate(()=>{
   const row=document.querySelector('#rows .directory-row'),nums=row.querySelector('.nums'),px=n=>parseFloat(getComputedStyle(n).fontSize),box=n=>n.getBoundingClientRect();
   const cells=[...nums.children].filter(n=>!n.classList.contains('nums-sep')),heads=[...document.querySelectorAll('.nums-head-cells>span')];
   return {name:px(row.querySelector('.row-identity strong')),nums:px(nums),score:px(row.querySelector('.score')),numsWidth:box(nums).width,numsLeft:box(nums).left,
    text:nums.textContent,cells:cells.length,art:getComputedStyle(row.querySelector('.row-identity>.disc-art')).display,
    aligned:heads.length===4&&getComputedStyle(heads[0].parentElement).display!=='none'?cells.map((c,i)=>Math.abs((box(c).left+box(c).right)/2-(box(heads[i]).left+box(heads[i]).right)/2)):null,
    index:Math.abs((box(row.querySelector('.score')).left+box(row.querySelector('.score')).right)/2-(box(document.querySelector('.list-head>:last-child')).left+box(document.querySelector('.list-head>:last-child')).right)/2)};
  });
  metrics[width]=m;
  assert.match(m.text,/^-?[\d.]+ \/ -?[\d.]+ \/ -?[\d.]+ \/ -?[\d.]+$/,`${width}: flight numbers keep their "S / G / T / F" text`);
  if(width>700){
   assert.ok(m.name>=16&&m.nums>=15,`${width}: names and flight numbers are larger than before (15 px, 13 px)`);
   assert.ok(m.nums<m.score&&m.nums<=m.name,`${width}: flight numbers read clearly without outranking the index or name`);
   assert.ok(m.numsWidth>=200&&m.numsWidth<=310,`${width}: flight numbers get room (${m.numsWidth}px, was 105)`);
   assert.ok(m.aligned&&m.aligned.every(d=>d<=1.5)&&m.index<=1.5,`${width}: SPEED / GLIDE / TURN / FADE and INDEX sit over their cells ${JSON.stringify(m.aligned)}`);
  }else{
   assert.deepEqual([m.name,m.nums,m.art],[14,10,'none'],`${width}: phone row type unchanged`);
   assert.equal(m.aligned,null,`${width}: phone keeps the "S / G / T / F" heading`);
  }
 }
 assert.ok(metrics[1920].name>metrics[1280].name&&metrics[1920].nums>metrics[1280].nums&&metrics[1920].numsWidth>metrics[1280].numsWidth,'Names and flight numbers scale up with the viewport');
 assert.ok(metrics[1920].numsLeft<1920-500,'Flight numbers expand leftward');
 check(`Desktop names ${desktop.map(w=>metrics[w].name+'px').join(' / ')} and flight numbers ${desktop.map(w=>metrics[w].nums+'px').join(' / ')} at ${desktop.join(' / ')}, four aligned columns; phones 14 px / 10 px as before`);

 // Wording: no "brand" left in the page's text or labels; the sort tab, sort option and multi-maker legend say Manufacturer.
 await open(1440);
 assert.equal((await page.locator('#sortBar [data-sort="brand"]').innerText()).trim(),'Manufacturer');
 assert.equal(await page.locator('#sort option[value="brand"]').textContent(),'Manufacturer');
 await page.locator('#sortBar [data-sort="brand"]').click();
 assert.ok(await page.evaluate(()=>filtered.every((d,i)=>!i||filtered[i-1].brand.localeCompare(d.brand)<=0)),'Manufacturer sort still orders by manufacturer');
 await page.evaluate(()=>{toggleBrand('Innova');toggleBrand('Discraft');});
 assert.equal(await page.locator('#legend .legend-label').textContent(),'MANUFACTURERS');
 const brandWords=await page.evaluate(()=>{
  const found=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('script,style')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  while(walker.nextNode())if(/\bbrands?\b/i.test(walker.currentNode.nodeValue))found.push(walker.currentNode.nodeValue.trim().slice(0,80));
  for(const n of document.querySelectorAll('[placeholder],[aria-label],[title],[alt]'))for(const a of ['placeholder','aria-label','title','alt'])if(/\bbrands?\b/i.test(n.getAttribute(a)||''))found.push(`${a}: ${n.getAttribute(a)}`);
  return found;
 });
 assert.deepEqual(brandWords,[],'No "brand" wording left in the page');
 assert.match(await page.locator('#contextTitle').getAttribute('aria-label'),/Clear manufacturer and type filters/);
 check('"Manufacturer" replaces "Brand": sort tab, sort option, search placeholder, multi-maker legend, header clear label and the method notes');

 // Screenshots: desktop wide and phone, every theme, menu closed and open.
 for(const theme of ['light','midnight','charcoal'])for(const width of [1920,1440,390]){
  await open(width);await page.evaluate(t=>applyTheme(t),theme);await page.evaluate(()=>scrollTo(0,0));
  await shoot(`directory-${width}-${theme}`);
  await page.locator('#rows .directory-add').first().click();await assertMenu(`${width} ${theme}`);
  await shoot(`directory-${width}-${theme}-menu`);
  await page.keyboard.press('Escape');
  const rowFor=await page.evaluate(()=>getComputedStyle(document.querySelector('#rows .directory-add')).color!==getComputedStyle(document.querySelector('#rows .directory-add')).backgroundColor);
  assert.ok(rowFor,`${width} ${theme}: Add text stands apart from its fill`);
 }
 check('Screenshots: 1920, 1440 and 390 px in light, midnight and charcoal, menu closed and open');
 assert.deepEqual(errors,[],'No page errors');
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Directory layout</title><style>body{font:14px system-ui;margin:24px;background:#f4f5f7}figure{margin:0 0 28px}img{max-width:100%;border:1px solid #ccd}</style>${shots.map(s=>`<figure><figcaption>${s}</figcaption><img src="${s}.png" loading="lazy"></figure>`).join('')}`);
 console.log(`PASS directory layout: ${checks.length} checks, ${shots.length} screenshots in ${dir}`);
}finally{await browser.close();server.close();}
