// Clear plastics, the true colour (docs/clear-plastic-true-color.md), end to end on the local signed-in harness, through
// the pop-out viewer's screenshots at 2×:
//  1. the streak fix alone: a clear copy with its photo and no true colour shows no band of the rim's colour at the plate
//     edge (3/4 at 7° and 25° hyzer, Top; light and Midnight), and its plate is the opaque copy's;
//  2. the true colour: a clear copy with its photo's true colour stored renders its plate near the proposal's value and
//     far deeper than without it;
//  3. rim deeper than plate, and no stripe: from the Top the ring at the plate's edge is one colour round the disc; at
//     3/4 the shoulder is deeper than the plate;
//  4. both looks agree: the Game asset look (made in one click, which matches and stores the true colour) lands with the
//     Photo look;
//  5. the fences, against a baseline tree (--baseline <dir>, default work/clear-plastic-true-color/baseline when it
//     exists): the Opaque copy with the same photo and the clear Buzzz with no photo are pixel-identical;
//  6. storage through the sheet: Use photo stores the true colour and says so;
//  7. before/after sheets with the hex values printed, in work/clear-plastic-true-color/evidence/suite/.
// Photos are the player's and are never committed: the Raptor's own photo is used when it sits in the ignored
// work/clear-plastic-true-color/input/ (else the committed stamped-disc fixture, which has no rim band: the true-colour
// checks are then skipped and said so). SECOND_PHOTO=<webp> SECOND_MOLD=<id> adds another clear disc to the sheets.
//   node tests/clear-true-color-browser.mjs [--baseline <dir>]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)('sharp');
const SELF=fileURLToPath(import.meta.url);
const RAPTOR='work/clear-plastic-true-color/input/raptor-0cef6b2f.webp',RAPTOR_PNG='work/clear-plastic-true-color/input/raptor.png',FIXTURE='tests/fixtures/stamped-disc.webp';
const OUT='work/clear-plastic-true-color/evidence/suite';
const MOLD='35a861477cf9',RAPTOR_SEED={mold_id:MOLD,plastic:'Z',wear:10,weight_g:174,color:'#0984a8',in_bag:false};
const PROPOSAL={plate:'#2965b8',streak:'#2858a9'};

// ---- colour helpers (sRGB bytes, Lab) ----
const hex=rgb=>'#'+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const bytes=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toLin=v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const lab=h=>{const [r,g,b]=bytes(h);const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;const R=toLin(r),G=toLin(g),B=toLin(b);const fx=f((.4124*R+.3576*G+.1805*B)/.95047),fy=f(.2126*R+.7152*G+.0722*B),fz=f((.0193*R+.1192*G+.9505*B)/1.08883);return [116*fy-16,500*(fx-fy),200*(fy-fz)];};
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);};
const hsv=(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return [h,mx?d/mx:0,mx/255];};
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?s[s.length>>1]:NaN;};

// ---- reading a viewer screenshot ----
// The disc: pixels with some saturation (the stage behind it is near grey in both themes). The plate: the most common
// colour inside 45% of the disc's extent (the stamp and glare lose the vote). The streak class: the rim band's rendered
// colour, hue 215–225°, saturation ≥ .5, value ≥ .3, which neither today's plate (196°) nor its shoulder (204°) has.
async function read(file){
 const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});const W=info.width,H=info.height;
 // (The pop-out's spin button at the top left is coloured too: left out of the disc's extent.)
 let sx=0,sy=0,n=0,minx=W,maxx=0,miny=H,maxy=0;
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){if(i<160&&j<160)continue;const k=(j*W+i)*3;const [,s,v]=hsv(data[k],data[k+1],data[k+2]);if(s>.22&&v>.12){sx+=i;sy+=j;n++;minx=Math.min(minx,i);maxx=Math.max(maxx,i);miny=Math.min(miny,j);maxy=Math.max(maxy,j);}}
 const cx=sx/n,cy=sy/n,rx=(maxx-minx)/2,ry=(maxy-miny)/2;
 const bins=new Map();
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const u=(i-cx)/rx,v=(j-cy)/ry;if(u*u+v*v>.45*.45)continue;const k=(j*W+i)*3;const key=(data[k]>>4)<<8|(data[k+1]>>4)<<4|data[k+2]>>4;let b=bins.get(key);if(!b)bins.set(key,b=[0,0,0,0]);b[0]++;b[1]+=data[k];b[2]+=data[k+1];b[3]+=data[k+2];}
 let best=null;for(const b of bins.values())if(!best||b[0]>best[0])best=b;
 const plate=hex([best[1]/best[0],best[2]/best[0],best[3]/best[0]]);
 let streak=0;const sectors=new Array(12).fill(0);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*3;const [h,s,v]=hsv(data[k],data[k+1],data[k+2]);if(h>=215&&h<=225&&s>=.5&&v>=.3){streak++;const a=(Math.atan2((j-cy)/ry,(i-cx)/rx)*180/Math.PI+90+360)%360;sectors[Math.floor(a/30)%12]++;}}
 // A ring's median colour per 30° sector, r in [lo,hi) of the extent.
 const ring=(lo,hi)=>{const px=Array.from({length:12},()=>[[],[],[]]);
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const u=(i-cx)/rx,v=(j-cy)/ry,r=Math.hypot(u,v);if(r<lo||r>=hi)continue;const a=(Math.atan2(v,u)*180/Math.PI+90+360)%360,s=Math.floor(a/30)%12,k=(j*W+i)*3;for(let c=0;c<3;c++)px[s][c].push(data[k+c]);}
  const medians=px.map(p=>p[0].length?hex(p.map(med)):null),all=[[],[],[]];for(const p of px)for(let c=0;c<3;c++)all[c].push(...p[c]);
  return {sectors:medians,median:hex(all.map(med))};};
 return {plate,streak,sectors,ring,extent:{cx,cy,rx,ry}};
}
// A Storage screenshot holds the rack too (black steel, orange rails): the pulled blue disc's plate is the most common
// blue (hue 185–240°) in the central 40% × 50% of the image, and the streak class is counted there.
async function readCentre(file){
 const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});const W=info.width,H=info.height;
 const bins=new Map();let streak=0;
 for(let j=Math.floor(H*.25);j<H*.75;j++)for(let i=Math.floor(W*.3);i<W*.7;i++){const k=(j*W+i)*3;const [h,s,v]=hsv(data[k],data[k+1],data[k+2]);if(s<.45||v<.3||h<185||h>240)continue;if(h>=215&&h<=225&&s>=.5)streak++;const key=(data[k]>>4)<<8|(data[k+1]>>4)<<4|data[k+2]>>4;let b=bins.get(key);if(!b)bins.set(key,b=[0,0,0,0]);b[0]++;b[1]+=data[k];b[2]+=data[k+1];b[3]+=data[k+2];}
 let best=null;for(const b of bins.values())if(!best||b[0]>best[0])best=b;
 return {plate:best?hex([best[1]/best[0],best[2]/best[0],best[3]/best[0]]):'#000000',streak};
}
const sheet=async(out,tile,items)=>{
 const tiles=await Promise.all(items.map(async it=>{const b=await sharp(it.file).extract({left:180,top:120,width:1640,height:980}).resize({width:tile}).png().toBuffer();const m=await sharp(b).metadata();return {b,h:m.height,caption:it.caption};}));
 const h=Math.max(...tiles.map(t=>t.h)),H=h+44,esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile*tiles.length}" height="${H}">${tiles.map((t,i)=>`<text x="${i*tile+tile/2}" y="${h+28}" font-family="Helvetica, Arial, sans-serif" font-size="17" text-anchor="middle" fill="#111">${esc(t.caption)}</text>`).join('')}</svg>`);
 await sharp({create:{width:tile*tiles.length,height:H,channels:3,background:'#f4f4f1'}}).composite([...tiles.map((t,i)=>({input:t.b,left:i*tile,top:0})),{input:svg,left:0,top:0}]).png().toFile(out);
};

// ---- the probe: one tree, one browser, every shot ----
// Run in this checkout, and in the baseline checkout for the fences and the "before" tiles. Writes <out>/<tag>-<scheme>-<view>.png
// and <out>/probe.json.
async function probe({out,photo,port,trueColor,sheetPhoto,second}){
 const {startHarness}=await import('./display-harness.mjs');
 fs.mkdirSync(out,{recursive:true});
 const h=await startHarness({port,state:out+'/d1',deviceScaleFactor:2});
 const {page,base,errors}=h,wait=ms=>page.waitForTimeout(ms),result={shots:{},errors};
 try{
  await h.signIn();
  const seeds=[
   {...RAPTOR_SEED,finish:'clear',notes:'raptor-null'},
   {...RAPTOR_SEED,finish:'clear',notes:'raptor-true'},
   {...RAPTOR_SEED,finish:'opaque',notes:'raptor-opaque'},
   {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd',finish:'clear',notes:'buzzz'},
   {...RAPTOR_SEED,finish:'clear',notes:'raptor-sheet'},
   {...RAPTOR_SEED,finish:'clear',in_bag:true,notes:'raptor-bag'}
  ];
  if(second)seeds.push({mold_id:second.mold,plastic:'Champion',wear:9,weight_g:175,color:second.color,finish:'clear',in_bag:false,notes:'second-null'},{mold_id:second.mold,plastic:'Champion',wear:9,weight_g:175,color:second.color,finish:'clear',in_bag:false,notes:'second-true'});
  await h.seedBag(seeds);
  const all=await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
  const idOf=note=>all.find(d=>d.notes===note).id;
  const put=async(note,file,color)=>{await page.evaluate(async([id,bytes,color])=>{const r=await fetch('/api/bag/discs/'+id+'/photo',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'image/webp','X-Atlas-Photo-True-Color':color||'','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:new Uint8Array(bytes)});if(!r.ok)throw Error(await r.text());},[idOf(note),[...fs.readFileSync(file)],color]);};
  await put('raptor-null',photo,null);await put('raptor-true',photo,trueColor);await put('raptor-opaque',photo,trueColor);await put('raptor-bag',photo,trueColor);
  if(second){await put('second-null',second.file,null);await put('second-true',second.file,second.trueColor);}
  const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=5);};
  const theme=async scheme=>{await page.emulateMedia({colorScheme:scheme});await page.waitForFunction(t=>document.documentElement.dataset.theme===t,scheme==='dark'?'midnight':'light');await wait(400);};
  const tilt=async(root,deg)=>{await page.evaluate(([sel,deg])=>{const i=document.querySelector(sel+' [data-disc3d-tilt]');i.value=String(deg);i.dispatchEvent(new Event('input',{bubbles:true}));},[root,deg]);await wait(900);};
  const shots=async(note,tag,{schemes=['light','dark'],views=['angle7','top','angle25']}={})=>{
   const id=idOf(note);result.shots[tag]={};
   for(const scheme of schemes){
    await theme(scheme);await openBag();
    await page.locator(`[data-bag-inspect="${id}"]`).first().evaluate(n=>n.click());
    await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');
    await page.waitForFunction(()=>{const v=Disc3D.viewer.debug;return v.photo?v.photo.userData.photoReady||v.photo.userData.photoFailed:true;},null,{timeout:30000});await wait(1500);
    await page.locator('#detail [data-disc3d-expand]').click();await page.waitForSelector('dialog.disc3d-dialog[open]');await wait(1500);
    const pop='dialog.disc3d-dialog[open]';
    for(const view of views){
     if(view==='top'){await tilt(pop,0);await page.locator(pop+' button',{hasText:/^Top$/}).click();}
     else{await page.locator(pop+' button',{hasText:/^3\/4$/}).click();await wait(600);await tilt(pop,view==='angle7'?7:25);}
     await wait(1200);
     const file=`${out}/${tag}-${scheme}-${view}.png`;fs.writeFileSync(file,await page.locator(pop+' .disc3d-viewport').screenshot());result.shots[tag][scheme+'-'+view]=file;
    }
    await page.keyboard.press('Escape');await wait(500);
   }
   await theme('light');console.log('shot',tag);
  };
  await shots('raptor-null','null');
  await shots('raptor-true','true');
  await shots('raptor-opaque','opaque',{schemes:['light'],views:['angle7']});
  await shots('buzzz','buzzz',{schemes:['light'],views:['angle7']});
  if(second){await shots('second-null','second-null',{schemes:['light'],views:['angle7','top']});await shots('second-true','second-true',{schemes:['light'],views:['angle7','top']});}
  // Storage (collection3d): a clear copy with a true colour racks in its own batch and comes out of the rack in it; My
  // Map's adapter carries the bagged copy's true colour.
  await theme('light');await openBag();
  result.mapTrueColor=await page.evaluate(mold=>window.BagApp.mapTrueColors().get(mold)||null,MOLD);
  await page.locator('#myBagViews [data-bag-view="storage"]').click();
  await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});await wait(1200);
  result.storageBatches=await page.evaluate(()=>window.BagApp.scenes.storage.state.batches);
  result.shots.storage={};
  for(const note of ['raptor-null','raptor-true']){
   await page.evaluate(id=>window.BagApp.scenes.storage.pull(id),idOf(note));await wait(3000);
   const box=await page.locator('#storageScene').boundingBox();
   const file=`${out}/storage-${note}.png`;fs.writeFileSync(file,await page.screenshot({clip:{x:0,y:Math.max(0,box.y),width:1440,height:Math.min(1000-Math.max(0,box.y),box.height)}}));result.shots.storage[note]=file;
  }
  // The sheet: Use photo stores the true colour and says so (the sheet's own flow, the aligner's default framing).
  if(sheetPhoto){
   await openBag();await page.locator(`[data-bag-edit="${idOf('raptor-sheet')}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');
   await page.setInputFiles('#addDiscDialog .bag-photo-file',sheetPhoto);
   await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
   await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
   result.sheetHint=await page.evaluate(()=>document.querySelector('#bagDiscColor').closest('label').querySelector('small').textContent);
   await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
   result.sheetDisc=(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs)).find(d=>d.notes==='raptor-sheet');
  }
  // The one-click Game asset on the copy without a true colour: the make matches and stores it, and says so.
  await openBag();await page.locator(`[data-bag-edit="${idOf('raptor-null')}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');
  await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();
  await page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:240000});
  result.makeStatus=await page.locator('#addDiscDialog .bag-photo-status').textContent();
  await page.keyboard.press('Escape');await page.waitForSelector('#addDiscDialog:not([open])',{state:'attached'});
  result.madeDisc=(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs)).find(d=>d.notes==='raptor-null');
  await shots('raptor-null','asset',{views:['angle7']});
  // The row thumbnail and the bag's pulled disc draw too (no crash, the clear passes on): the list's thumbnail host carries the colour.
  await openBag();
  result.thumbnailTrueColor=await page.evaluate(id=>document.querySelector(`[data-disc-id="${id}"] [data-disc-thumbnail]`)?.dataset.trueColor||null,idOf('raptor-true'));
 }finally{await h.close();}
 fs.writeFileSync(out+'/probe.json',JSON.stringify(result,null,1));
 return result;
}

// ---- entry ----
if(process.argv[2]==='--probe'){
 const [,,,out,photo,port,trueColor,sheetPhoto]=process.argv;
 await probe({out,photo,port:+port,trueColor:trueColor&&trueColor!=='-'?trueColor:null,sheetPhoto:sheetPhoto&&sheetPhoto!=='-'?sheetPhoto:null});
 process.exit(0);
}

const haveRaptor=fs.existsSync(RAPTOR),photo=haveRaptor?RAPTOR:FIXTURE;
const {trueColor,plateColor}=await import('../public/disc-albedo.mjs');
const sampleOf=async file=>{const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});const d=new Uint8ClampedArray(data.buffer,data.byteOffset,data.length);return trueColor(d,info.width,plateColor(d,info.width));};
const TRUE=await sampleOf(photo);
console.log(haveRaptor?`the Raptor's photo; true colour ${TRUE}`:'no Raptor photo in work/: the fixture, which has no rim band (true-colour checks skipped)');
const second=process.env.SECOND_PHOTO?{file:process.env.SECOND_PHOTO,mold:process.env.SECOND_MOLD||'3d60892b6812',color:process.env.SECOND_COLOR||'#70b7cd',trueColor:await sampleOf(process.env.SECOND_PHOTO)}:null;
if(second)console.log('second disc',second.mold,'true colour',second.trueColor);
fs.mkdirSync(OUT,{recursive:true});
const check=label=>console.log('ok -',label);

// TRUE_COLOR_REUSE=1 reads the last run's shots instead of taking them again (iterating on the checks).
const after=process.env.TRUE_COLOR_REUSE&&fs.existsSync(OUT+'/after/probe.json')?JSON.parse(fs.readFileSync(OUT+'/after/probe.json','utf8')):await probe({out:OUT+'/after',photo,port:Number(process.env.TRUE_COLOR_PORT||8884),trueColor:TRUE,sheetPhoto:haveRaptor&&fs.existsSync(RAPTOR_PNG)?RAPTOR_PNG:'tests/fixtures/disc-photo.png',second});
assert.deepEqual(after.errors,[],'no page errors');
const S=after.shots;
const nullShots={},trueShots={};
for(const key of Object.keys(S.null))nullShots[key]=await read(S.null[key]);
for(const key of Object.keys(S.true))trueShots[key]=await read(S.true[key]);
const opaque=await read(S.opaque['light-angle7']),asset={};
for(const key of Object.keys(S.asset))asset[key]=await read(S.asset[key]);

// 1. The streak fix alone.
for(const [key,r] of Object.entries(nullShots))assert.ok(r.streak<500,`no streak class at ${key}: ${r.streak} pixels (today 23,406 at 3/4 7°)`);
assert.ok(dE(nullShots['light-angle7'].plate,opaque.plate)<=6,`the plate without a true colour is the opaque copy's: ${nullShots['light-angle7'].plate} vs ${opaque.plate}`);
check(`streak fix: streak class ${Object.values(nullShots).map(r=>r.streak).join('/')} pixels; plate ${nullShots['light-angle7'].plate} (opaque ${opaque.plate})`);

if(haveRaptor&&TRUE){
 // 2. Close to the true colour.
 const plate=trueShots['light-angle7'].plate,nullPlate=nullShots['light-angle7'].plate;
 assert.ok(dE(plate,PROPOSAL.plate)<=12,`the plate near the proposal's ${PROPOSAL.plate}: ${plate} (ΔE ${dE(plate,PROPOSAL.plate).toFixed(1)})`);
 assert.ok(dE(plate,PROPOSAL.streak)<=12,`the plate near the streak's own colour ${PROPOSAL.streak}: ${plate}`);
 assert.ok(lab(nullPlate)[0]-lab(plate)[0]>=25,`far deeper than without it: L ${lab(plate)[0].toFixed(0)} against ${lab(nullPlate)[0].toFixed(0)}`);
 check(`true colour: plate ${plate} (ΔE ${dE(plate,PROPOSAL.plate).toFixed(1)} to ${PROPOSAL.plate}), without it ${nullPlate}`);
 // 3. Rim deeper than plate, no stripe. From the Top the ring just inside the shoulder (0.72–0.78 of the extent) is one
 // colour round the disc; at 3/4 7° the shoulder at 7:30 (the 7–9 o'clock sectors at 0.72–0.78) is deeper than the plate.
 // The photo's own content (its glare band, scuffs, the stamp's rings) moves a sector by ΔE 10–12 on its own; the band
 // was a hue of its own (218° against the plate's 196°) and ΔE 25–50. So: every sector within ΔE 16 of the ring's
 // median and within 12° of its hue.
 const hueOf=h=>hsv(...bytes(h))[0],turn=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
 for(const [tag,shots] of [['null',nullShots],['true',trueShots]]){
  const ring=shots['light-top'].ring(.72,.78),off=ring.sectors.map(s=>s?dE(s,ring.median):0),hues=ring.sectors.map(s=>s?turn(hueOf(s),hueOf(ring.median)):0);
  assert.ok(Math.max(...off)<=16&&Math.max(...hues)<=12,`${tag}, Top: every sector of the plate-edge ring within ΔE 16 and 12° of hue of its median (max ΔE ${Math.max(...off).toFixed(1)}, ${Math.max(...hues).toFixed(0)}°: ${ring.sectors.join(' ')})`);
 }
 const shoulder=trueShots['light-angle7'].ring(.72,.78),lowerLeft=hex([7,8].map(s=>bytes(shoulder.sectors[s])).reduce((a,b)=>a.map((v,i)=>(v+b[i])/2)));
 assert.ok(lab(plate)[0]-lab(lowerLeft)[0]>=10,`the shoulder deeper than the plate: ${lowerLeft} against ${plate}`);
 check(`rim deeper than plate: shoulder ${lowerLeft}, plate ${plate}; Top ring uniform`);
 // 4. Both looks agree, and the make stored the colour.
 assert.match(after.makeStatus,/true colour matched from your photo/,after.makeStatus);
 assert.ok(after.madeDisc.photo_true_color&&dE(after.madeDisc.photo_true_color,TRUE)<3,`the make stored ${after.madeDisc.photo_true_color} (node read ${TRUE})`);
 // On Midnight the walls filter a dark page while the photo is lit as a surface, so the looks sit a step apart there.
 for(const [scheme,within] of [['light',12],['dark',20]])assert.ok(dE(asset[scheme+'-angle7'].plate,trueShots[scheme+'-angle7'].plate)<=within,`${scheme}: Game asset ${asset[scheme+'-angle7'].plate} with Photo look ${trueShots[scheme+'-angle7'].plate} (ΔE ${dE(asset[scheme+'-angle7'].plate,trueShots[scheme+'-angle7'].plate).toFixed(1)})`);
 check(`both looks: Game asset ${asset['light-angle7'].plate} / ${asset['dark-angle7'].plate}, Photo look ${trueShots['light-angle7'].plate} / ${trueShots['dark-angle7'].plate}`);
 // 6. The sheet.
 assert.ok(after.sheetDisc.photo_true_color&&dE(after.sheetDisc.photo_true_color,TRUE)<10,`Use photo stored ${after.sheetDisc.photo_true_color}`);
 assert.match(after.sheetHint,/true colour from the rim/,after.sheetHint);
 assert.equal(after.thumbnailTrueColor,TRUE,'the row thumbnail carries it');
 check(`the sheet: Use photo stored ${after.sheetDisc.photo_true_color}, "${after.sheetHint}"`);
 // Storage and My Map (Codex's two findings on PR #46): the true colour reaches the rack batches, the pulled disc and the
 // map adapter. The pulled disc is read as the pop-out is (its plate the most common colour of the disc's middle).
 assert.equal(after.mapTrueColor,TRUE,'My Map gets the bagged copy\'s true colour');
 assert.equal(after.storageBatches,3,'a clear copy with a true colour racks in its own batch (opaque, clear, clear with a true colour)');
 const stNull=await readCentre(after.shots.storage['raptor-null']),stTrue=await readCentre(after.shots.storage['raptor-true']);
 // (The streak class is the band's hue against today's plate; a plate in the true colour sits in that hue itself, so the
 // class is read on the copy without a true colour only.)
 assert.ok(stNull.streak<500,`no streak on the pulled Storage disc (${stNull.streak})`);
 assert.ok(lab(stNull.plate)[0]-lab(stTrue.plate)[0]>=15,`the pulled Storage disc wears the true colour: ${stTrue.plate} against ${stNull.plate}`);
 check(`Storage: pulled ${stNull.plate} → ${stTrue.plate}, ${after.storageBatches} batches; My Map ${after.mapTrueColor}`);
}else console.log('skip - true-colour checks (no rim band in the fixture)');

// 5. The fences, against the baseline tree.
let baseline=null;const flag=process.argv.indexOf('--baseline');
if(flag>0)baseline=path.resolve(process.argv[flag+1]);else if(fs.existsSync('work/clear-plastic-true-color/baseline/package.json'))baseline=path.resolve('work/clear-plastic-true-color/baseline');
let before=null;
if(baseline){
 const out=path.resolve(OUT+'/before');
 fs.mkdirSync(out,{recursive:true});
 const inputs=[photo].map(p=>path.resolve(p));
 if(!(process.env.TRUE_COLOR_REUSE&&fs.existsSync(out+'/probe.json')))execFileSync(process.execPath,[SELF,'--probe',out,inputs[0],String(Number(process.env.TRUE_COLOR_PORT||8884)+1),'-','-'],{cwd:baseline,stdio:'inherit'});
 before=JSON.parse(fs.readFileSync(out+'/probe.json','utf8'));
 const same=async(a,b)=>{const [x,y]=await Promise.all([a,b].map(f=>sharp(f).raw().toBuffer({resolveWithObject:true})));return x.info.width===y.info.width&&x.info.height===y.info.height&&Buffer.compare(x.data,y.data)===0;};
 assert.ok(await same(S.opaque['light-angle7'],before.shots.opaque['light-angle7']),'the Opaque copy with the same photo is pixel-identical to the baseline');
 assert.ok(await same(S.buzzz['light-angle7'],before.shots.buzzz['light-angle7']),'the clear Buzzz with no photo is pixel-identical to the baseline');
 const was=await read(before.shots.null['light-angle7']);
 assert.ok(was.streak>5000,`the baseline shows the streak (${was.streak} pixels)`);
 check(`fences: Opaque and Buzzz identical to the baseline; the baseline's streak class ${was.streak}`);
}else console.log('skip - fences (no baseline tree; pass --baseline <dir>)');

// 7. Sheets.
const cap=(label,r)=>`${label}: plate ${r.plate}`;
const tiles=[];
if(before)tiles.push({file:before.shots.null['light-angle7'],caption:cap('Before (baseline), 3/4 7°',await read(before.shots.null['light-angle7']))+` · streak`});
tiles.push({file:S.null['light-angle7'],caption:cap('Cut alone (no true colour)',nullShots['light-angle7'])},{file:S.true['light-angle7'],caption:cap('True colour, Photo look',trueShots['light-angle7'])},{file:S.asset['light-angle7'],caption:cap('True colour, Game asset',asset['light-angle7'])});
await sheet(OUT+'/sheet-before-after.png',660,tiles);
await sheet(OUT+'/sheet-views.png',560,[{file:S.null['light-top'],caption:cap('Cut alone, Top',nullShots['light-top'])},{file:S.true['light-top'],caption:cap('True colour, Top',trueShots['light-top'])},{file:S.true['light-angle25'],caption:cap('True colour, 25° hyzer',trueShots['light-angle25'])},{file:S.true['dark-angle7'],caption:cap('True colour, Midnight',trueShots['dark-angle7'])},{file:S.asset['dark-angle7'],caption:cap('Game asset, Midnight',asset['dark-angle7'])}]);
if(second){
 const sn=await read(S['second-null']['light-angle7']),st=await read(S['second-true']['light-angle7']);
 await sheet(OUT+'/sheet-second-disc.png',660,[{file:S['second-null']['light-angle7'],caption:cap('Second disc, cut alone',sn)},{file:S['second-true']['light-angle7'],caption:cap(`Second disc, true colour ${second.trueColor}`,st)},{file:S['second-null']['light-top'],caption:cap('Second disc, Top, cut alone',await read(S['second-null']['light-top']))},{file:S['second-true']['light-top'],caption:cap('Second disc, Top, true colour',await read(S['second-true']['light-top']))}]);
 assert.ok(sn.streak<500&&st.streak<500,'the second disc shows no streak');
 check(`second disc: plate ${sn.plate} → ${st.plate}`);
}
console.log('sheets in',OUT);
