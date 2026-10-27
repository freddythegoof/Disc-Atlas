// The photo adder rework (docs/photo-adder-rework.md): one dot, one flow. In the real app on the local signed-in
// harness, with synthetic disc photos rendered at run time through a known phone camera (never a player's photo).
// Desktop Chromium by default; PHOTO_STAMP_ENGINE=webkit runs it at phone size in WebKit with touch.
//   the fit       · a disc shot close and tilted opens fitted: the cross, its middle on the disc's true centre (within
//                   2% R), its stamp levelled (within 1°), no sliders, the status saying what was done;
//   the dot       · a drag moves the middle and the rim stays on the ring; the arrow keys too; Auto restores the level;
//   the cap       · a drag past what the photo's angle allows stops there and says so in plain words;
//   by hand       · "Frame it by hand instead" is today's aligner, for that photo only;
//   one sitting   · Use photo → the game asset is made in the sheet with its progress named, the preview shows it,
//                   the Look row stands on Game asset · Full color; no file asked for, the sheet never left; Save keeps
//                   the photo and its asset (on the account, Full color) together;
//   refusals      · a disc shot too far off square, and a photo with no disc in it, go to the hand aligner saying why.
//   node tests/photo-adder-rework-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
const sharp=createRequire(import.meta.url)('sharp');

// A disc photographed through a phone camera (25 mm equivalent): radius 1 in its plane, at (0, 0, Z), tilted `tilt`°
// about the image axis at `axis`°, its print turned `spin`° in its plane. Print: a dark ring, a level bar and a word-like
// block of level strokes, all centred on the disc; plate teal, rim band deeper. Returns the JPEG path and where the
// disc's own centre lands, as shares of the photo.
const DIR='work/photo-adder-rework/synthetic';fs.mkdirSync(DIR,{recursive:true});
async function shoot(file,{w=1500,h=2000,Z=2.5,tilt=0,axis=0,spin=0,disc=true}={}){
 const f=25/43.27*Math.hypot(w,h),t=tilt*Math.PI/180,a=axis*Math.PI/180,s=spin*Math.PI/180,k=[Math.cos(a),Math.sin(a),0];
 const rot=v=>{const c=Math.cos(t),sn=Math.sin(t),d=k[0]*v[0]+k[1]*v[1],x=[k[1]*v[2],-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];return v.map((vi,i)=>vi*c+x[i]*sn+k[i]*d*(1-c));};
 const e1=rot([Math.cos(s),Math.sin(s),0]),e2=rot([-Math.sin(s),Math.cos(s),0]),n=rot([0,0,1]),nC=n[2]*Z,raw=Buffer.alloc(w*h*3);
 const colour=(u,v)=>{
  if(!disc)return u<w*.45?[60,64,70]:[200,196,188];
  const d=[(u-w/2)/f,(v-h/2)/f,1],q=nC/(n[0]*d[0]+n[1]*d[1]+n[2]),L=[d[0]*q,d[1]*q,d[2]*q-Z],x=L[0]*e1[0]+L[1]*e1[1]+L[2]*e1[2],y=L[0]*e2[0]+L[1]*e2[1]+L[2]*e2[2],r=Math.hypot(x,y);
  if(r>1)return [58,52,46];if(r>.9)return [30,96,108];
  if(Math.abs(r-.55)<.025)return [24,26,32];
  if(Math.abs(y-.18)<.03&&Math.abs(x)<.42)return [24,26,32];
  if(y>-.32&&y<-.08&&Math.abs(x)<.38){const col=Math.floor((x+.38)/.076);if(col%2===0||Math.abs(y+.2)>.1)return [24,26,32];}
  return [92,157,170];
 };
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){let r=0,g=0,b=0;for(const [dx,dy] of [[.25,.25],[.75,.75]]){const c=colour(i+dx,j+dy);r+=c[0];g+=c[1];b+=c[2];}const p=(j*w+i)*3;raw[p]=r/2;raw[p+1]=g/2;raw[p+2]=b/2;}
 await sharp(raw,{raw:{width:w,height:h,channels:3}}).jpeg({quality:92}).toFile(file);
 // A point of the print (its own units) in the photo, as shares of its width and height.
 const project=(x,y)=>{const P=[0,1,2].map(i=>x*e1[i]+y*e2[i]+(i===2?Z:0));return {x:(f*P[0]/P[2]+w/2)/w,y:(f*P[1]/P[2]+h/2)/h};};
 return {file,centre:{x:.5,y:.5},project};
}
const tilted=await shoot(DIR+'/tilted.jpg',{tilt:16,axis:-80,Z:2.5,spin:3});
const square=await shoot(DIR+'/square.jpg',{tilt:2,Z:2.3});
const oblique=await shoot(DIR+'/oblique.jpg',{tilt:48,axis:0,Z:2.4});
const nodisc=await shoot(DIR+'/nodisc.jpg',{disc:false});

const engine=process.env.PHOTO_STAMP_ENGINE||'chromium',phone=engine==='webkit';
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8893),state:'work/photo-adder-rework/d1-test',engine,
 ...phone&&{viewport:{width:390,height:844},deviceScaleFactor:2,context:{hasTouch:true,isMobile:true}}});
const {page,base,errors}=h;
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
const results={engine};
try{
 await h.signIn();
 await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'}]);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=1);
 const id=(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs))[0].id;
 const edit=async()=>{await page.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 let pickers=0;page.on('filechooser',()=>{pickers++;});
 const A='dialog.photo-aligner[open]';
 const open=async file=>{await page.setInputFiles('#addDiscDialog .bag-photo-file',file);await page.waitForSelector(A);const t=Date.now();await page.waitForFunction(()=>['fitted','manual'].includes(document.querySelector('dialog.photo-aligner').dataset.fit),null,{timeout:90000});return Date.now()-t;};
 // The editor's own view of the draft (its debug handle is on the sheet's photo control).
 const draft=()=>page.evaluate(()=>{const d=document.querySelector('dialog.photo-aligner').editorDebug?.draft;return d&&{fit:d.fit&&{centre:d.fit.centre,disc:d.fit.disc,w:d.fit.w,h:d.fit.h,auto:d.fit.auto},options:d.options,manual:d.manual};});
 const status=()=>page.locator(A+' .photo-aligner-status').textContent();

 log('fit');
 await edit();results.fitMs=await open(tilted.file);
 assert.equal(await page.locator(A).getAttribute('data-fit'),'fitted');
 let d=await draft();const r=Math.sqrt(d.fit.disc.a*d.fit.disc.b),truth={x:tilted.centre.x*d.fit.w-.5,y:tilted.centre.y*d.fit.h-.5};
 results.dotMiss=Math.hypot(d.fit.centre.x-truth.x,d.fit.centre.y-truth.y)/r;
 assert.ok(results.dotMiss<.02,'the dot within 2% R of the true centre: '+(results.dotMiss*100).toFixed(2));
 // The print's level line (its x axis) as the fitted crop shows it: the turn that levels it is the truth to meet.
 const crop=p=>{const H=d.options.H,u=p.x,v=p.y,i=[H[4]*H[8]-H[5]*H[7],H[2]*H[7]-H[1]*H[8],H[1]*H[5]-H[2]*H[4],H[5]*H[6]-H[3]*H[8],H[0]*H[8]-H[2]*H[6],H[2]*H[3]-H[0]*H[5],H[3]*H[7]-H[4]*H[6],H[1]*H[6]-H[0]*H[7],H[0]*H[4]-H[1]*H[3]],q=i[6]*u+i[7]*v+i[8];return [(i[0]*u+i[1]*v+i[2])/q,(i[3]*u+i[4]*v+i[5])/q];};
 const [ax,ay]=crop(tilted.project(-.4,.18)),[bx,by]=crop(tilted.project(.4,.18)),want=-Math.atan2(by-ay,bx-ax)*180/Math.PI;
 results.level={applied:d.options.rotate,truth:+want.toFixed(2),residual:+(d.options.rotate-want).toFixed(2)};
 assert.ok(Math.abs(d.options.rotate-want)<=1,'levelled within 1°: '+JSON.stringify(results.level));
 results.fitStatus=await status();assert.match(results.fitStatus,/^Fitted to the disc’s edge and centred\./);
 assert.equal(await page.locator(A+' .photo-aligner-adjust').isVisible(),false,'no sliders while fitted');
 assert.equal(await page.locator(A+' [data-level-lines]').isVisible(),false,'no level lines: the cross is the guide');
 assert.equal(await page.locator(A+' [data-rotate-auto]').isVisible(),true);
 await page.screenshot({path:'work/photo-adder-rework/out/browser-fitted-'+engine+'.png'});

 log('dot');
 const view=page.locator(A+' .photo-aligner-view'),box=await view.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
 const before=d.fit.centre;
 if(phone){await page.touchscreen.tap(cx+box.width*.06,cy);}
 else{await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+20,cy+10,{steps:4});await page.mouse.move(cx+40,cy+20,{steps:4});await page.mouse.up();}
 d=await draft();assert.ok(Math.hypot(d.fit.centre.x-before.x,d.fit.centre.y-before.y)>2,'the middle moved');
 // The rim is still the crop's edge: a crop-edge point maps onto the fitted ellipse.
 const onRim=await page.evaluate(({H,disc,w,h})=>{let worst=0;for(let k=0;k<16;k++){const a=k/16*2*Math.PI,x=Math.cos(a),y=Math.sin(a),q=H[6]*x+H[7]*y+H[8],px=(H[0]*x+H[1]*y+H[2])/q*w-disc.cx,py=(H[3]*x+H[4]*y+H[5])/q*h-disc.cy,c=Math.cos(disc.theta),s=Math.sin(disc.theta),u=px*c+py*s,v=-px*s+py*c;worst=Math.max(worst,Math.abs(Math.hypot(u/disc.a,v/disc.b)-1));}return worst;},{H:d.options.H,disc:d.fit.disc,w:d.fit.w,h:d.fit.h});
 assert.ok(onRim<.002,'the rim stays on the ring: '+onRim);
 const keyFrom=d.fit.centre;await view.focus();await page.keyboard.press('ArrowUp');d=await draft();assert.ok(Math.hypot(d.fit.centre.x-keyFrom.x,d.fit.centre.y-keyFrom.y)>0,'arrow keys move it');
 await page.locator(A+' [data-rotate="1"]').click();d=await draft();const turned=d.options.rotate;
 await page.locator(A+' [data-rotate-auto]').click();d=await draft();assert.equal(d.options.rotate,d.fit.auto,'Auto restores the automatic level (from '+turned+')');

 log('cap');
 if(!phone){await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+box.width*.45,cy+box.height*.45,{steps:12});await page.mouse.up();}
 else{await page.touchscreen.tap(box.x+box.width*.92,box.y+box.height*.92);}
 results.capStatus=await status();assert.match(results.capStatus,/^That’s as far as this photo’s angle allows/);
 d=await draft();const off=Math.hypot(d.fit.centre.x-d.fit.disc.cx,d.fit.centre.y-d.fit.disc.cy)/Math.sqrt(d.fit.disc.a*d.fit.disc.b);
 assert.ok(off<=.2+1e-6,'stopped at the cap: '+off);

 log('by hand');
 await page.locator(A+' .photo-aligner-manual').click();
 assert.equal(await page.locator(A).getAttribute('data-fit'),'manual');assert.equal(await page.locator(A+' .photo-aligner-adjust').isVisible(),true,'the sliders are back');
 assert.match(await status(),/^Framed by hand/);
 await page.locator(A+' [data-aligner-cancel]').first().click();await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'));

 log('one sitting');
 const pickersBefore=pickers;
 await open(square.file);assert.equal(await page.locator(A).getAttribute('data-fit'),'fitted');
 await page.evaluate(()=>{const seen=window.__steps=[],el=document.querySelector('#addDiscDialog .bag-photo-status');new MutationObserver(()=>{if(seen.at(-1)!==el.textContent)seen.push(el.textContent);}).observe(el,{childList:true,characterData:true,subtree:true});});
 const t0=Date.now();await page.locator(A+' [data-aligner-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
 assert.equal(await page.locator('#addDiscDialog[open]').count(),1,'still in the sheet');
 await page.waitForFunction(()=>/^Game asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:180000});
 results.makeMs=Date.now()-t0;results.steps=await page.evaluate(()=>window.__steps);
 assert.ok(results.steps.some(s=>/^Making the game asset: finding the stamp/.test(s)),'progress named in place');
 assert.equal(await page.locator('#addDiscDialog .bag-photo-preview').isVisible(),true,'the preview shows the result');
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look input[value="game"]').isChecked(),true);
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look input[value="color"]').isChecked(),true);
 await page.locator('#addDiscDialog').screenshot({path:'work/photo-adder-rework/out/browser-sheet-'+engine+'.png'});
 assert.equal(pickers-pickersBefore,0,'no second file asked for');
 await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:120000});
 const item=(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs)).find(i=>i.id===id);
 const stamp=await page.evaluate(id=>fetch('/api/bag/stamps',{credentials:'same-origin'}).then(r=>r.json()).then(d=>d.stamps.find(s=>s.disc_id===id)||null),id);
 assert.ok(item.texture_key,'photo saved');assert.ok(stamp,'asset on the account');
 assert.equal(stamp.texture_key,item.texture_key,'the asset belongs to the photo just saved');assert.equal(stamp.look,'color');
 results.bagStatus=await page.locator('#bagStatus, .bag-status, [role="status"]').first().textContent().catch(()=>null);

 log('refusals');
 await edit();await open(oblique.file);
 assert.equal(await page.locator(A).getAttribute('data-fit'),'manual');results.squashStatus=await status();
 assert.match(results.squashStatus,/^This photo was taken too far off square/);
 assert.equal(await page.locator(A+' .photo-aligner-adjust').isVisible(),true);
 await page.locator(A+' [data-aligner-cancel]').first().click();
 await open(nodisc.file);assert.equal(await page.locator(A).getAttribute('data-fit'),'manual');results.rimStatus=await status();
 assert.match(results.rimStatus,/^The disc’s edge didn’t show clearly enough/);
 await page.locator(A+' [data-aligner-cancel]').first().click();

 assert.deepEqual(errors.filter(e=>!/favicon|ERR_ABORTED/.test(e)),[],'no page errors');
 results.ok=true;
}finally{
 fs.writeFileSync('work/photo-adder-rework/out/browser-'+engine+'.json',JSON.stringify(results,null,1));console.log(JSON.stringify(results,null,1));
 await h.stop();
}
