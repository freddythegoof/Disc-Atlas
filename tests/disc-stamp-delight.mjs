// Photo stamps v3.1, no camera light in the asset (public/disc-stamp-delight.mjs, docs/photo-stamp-one-click.md), on
// drawn synthetic discs only: no photo of anyone's disc is ever a fixture. A flash is added the way a camera records
// one: in linear light, in the light's colour, clipped at the sensor's top.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {extract} from '../public/disc-stamp-worker.mjs';
import {delightPixels} from '../public/disc-albedo.mjs';
import {delightStamp} from '../public/disc-stamp-delight.mjs';
import {rgbToLab} from '../public/disc-stamp-extract.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const SIZE=1024,C=SIZE/2,PLATE=.8;
async function disc(plate,body,defs=''){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><clipPath id="c"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath>${defs}</defs><g clip-path="url(#c)"><rect width="${SIZE}" height="${SIZE}" fill="${plate}"/>${body}</g></svg>`;
 return new Uint8ClampedArray(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer());
}
const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};
const enc=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.min(1,v)**(1/2.4)-.055));
// A flash: a Gaussian lobe of `a` (linear, full scale 1; above 1 its core clips) at (x, y), σ px, plus a faint veil.
function flash(data,{x,y,sigma,a,veil=.08}){
 const out=data.slice();
 for(let j=0;j<SIZE;j++)for(let i=0;i<SIZE;i++){const k=4*(j*SIZE+i);if(!data[k+3])continue;const d2=(i-x)**2+(j-y)**2,g=a*Math.exp(-d2/(2*sigma*sigma))+veil*Math.exp(-d2/(2*(4*sigma)**2));
  for(let c=0;c<3;c++)out[k+c]=enc(lin(data[k+c])+g*(c===2?.97:1));}
 return out;
}
const dE=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const labAt=(rgba,p)=>rgbToLab(rgba[4*p],rgba[4*p+1],rgba[4*p+2]);
const within=(x,y,r)=>{const list=[];for(let j=Math.max(0,y-r);j<Math.min(SIZE,y+r);j++)for(let i=Math.max(0,x-r);i<Math.min(SIZE,x+r);i++)if((i-x)**2+(j-y)**2<r*r)list.push(j*SIZE+i);return list;};

// A one-ink print and a coloured panel, outlined, as on a real stamp: a navy word bar and ring, a yellow panel.
const NAVY='#1d2133',YELLOW='#e7c64a';
const PRINT=`<circle cx="${C}" cy="${C}" r="230" fill="none" stroke="${NAVY}" stroke-width="16"/><rect x="300" y="486" width="424" height="52" fill="${NAVY}"/>`+
 `<polygon points="340,300 520,280 540,420 360,440" fill="${YELLOW}" stroke="${NAVY}" stroke-width="10"/>`;
const SPOT={x:430,y:470,sigma:16,a:3};

test('a photo with no glare is left exactly as it was',async()=>{
 const data=await disc('#5c9daa',PRINT),raw=data.slice(),{color}=delightPixels(data,SIZE,{softenGlare:false}),before=data.slice();
 const r=delightStamp(data,raw,SIZE,{plate:PLATE,plateColor:color});
 assert.deepEqual(Buffer.from(data),Buffer.from(before),'bytes');
 assert.equal(r.unreliable.reduce((a,v)=>a+v,0),0);assert.equal(r.plateColor,color);assert.equal(r.stats.white,0);
});

test('a print that fades toward cream is print, not light',async()=>{
 const defs=`<linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#2a9d8f"/><stop offset="1" stop-color="#f1e7c8"/></linearGradient>`;
 const data=await disc('#c64533',`<rect x="260" y="440" width="500" height="120" fill="url(#f)"/>`+PRINT,defs),raw=data.slice(),{color}=delightPixels(data,SIZE,{softenGlare:false}),before=data.slice();
 const r=delightStamp(data,raw,SIZE,{plate:PLATE,plateColor:color});
 let moved=0;for(let p=0;p<SIZE*SIZE;p++)if(data[4*p]!==before[4*p]||data[4*p+1]!==before[4*p+1]||data[4*p+2]!==before[4*p+2])moved++;
 assert.ok(moved<.002*SIZE*SIZE,'the gradient is untouched: '+moved+' pixels moved, white '+r.stats.white);
});

test('clipped white ink with no light on it is ink, not glare',async()=>{
 const data=await disc('#5c9daa',PRINT+`<rect x="600" y="300" width="120" height="70" fill="#ffffff"/>`),raw=data.slice(),{color}=delightPixels(data,SIZE,{softenGlare:false});
 const r=delightStamp(data,raw,SIZE,{plate:PLATE,plateColor:color});
 assert.equal(within(660,335,30).filter(p=>r.unreliable[p]).length,0,'the white block is kept');
});

test('a flash across the print: its light is taken out, the clipped core is decided from around it: no blob, no bleach',async()=>{
 const clean=await disc('#5c9daa',PRINT),lit=flash(clean,SPOT);
 const a=extract(clean.slice(),SIZE,PLATE,{color:true}),b=extract(lit.slice(),SIZE,PLATE,{color:true});
 assert.ok(b.light.white>.3,'the hotspot was found: '+JSON.stringify(b.light));assert.ok(b.light.unreliable>0,'its clipped core is unreliable');
 // Around the hotspot (3σ): the mask matches the clean one, with no glare-shaped blob and the bar's edge kept.
 const zone=within(SPOT.x,SPOT.y,3*SPOT.sigma),design=r=>p=>r.color.rgba[4*p+3]>127;
 const blob=zone.filter(p=>design(b)(p)&&!design(a)(p)).length/zone.length,lost=zone.filter(p=>design(a)(p)&&!design(b)(p)).length/zone.length;
 // (v3's extraction, measured once on this disc: a blob of 0.464 and a bleached halo; docs/photo-stamp-one-click.md.)
 assert.ok(blob<.03,'no blob: '+blob.toFixed(3));assert.ok(lost<.12,'the print kept but for the clipped core: '+lost.toFixed(3));
 // The colour layer over the halo (outside the core) is the print's own colour, not bleached toward white.
 const halo=within(SPOT.x,SPOT.y,3*SPOT.sigma).filter(p=>{const i=p%SIZE,j=(p-i)/SIZE,d=Math.hypot(i-SPOT.x,j-SPOT.y);return d>1.6*SPOT.sigma&&design(a)(p)&&design(b)(p);});
 const mean=(r,list)=>{const s=[0,0,0];for(const p of list){const L=labAt(r.color.rgba,p);for(let q=0;q<3;q++)s[q]+=L[q];}return s.map(v=>v/list.length);};
 assert.ok(halo.length>50,'halo pixels: '+halo.length);
 assert.ok(dE(mean(a,halo),mean(b,halo))<8,'no bleach: ΔE '+dE(mean(a,halo),mean(b,halo)).toFixed(1));
});

test('from a stored texture: the upload already softened the core; it is found and decided from around it',async()=>{
 // The upload path: the flash photo de-lit WITH glare softening, as the site stores it; then the one-click read.
 const clean=await disc('#5c9daa',PRINT),stored=flash(clean,SPOT),storedClean=clean.slice();
 delightPixels(stored,SIZE,{});delightPixels(storedClean,SIZE,{});
 const a=extract(storedClean,SIZE,PLATE,{color:true,stored:true}),b=extract(stored,SIZE,PLATE,{color:true,stored:true});
 const zone=within(SPOT.x,SPOT.y,3*SPOT.sigma),design=r=>p=>r.color.rgba[4*p+3]>127;
 const blob=zone.filter(p=>design(b)(p)&&!design(a)(p)).length/zone.length,lost=zone.filter(p=>design(a)(p)&&!design(b)(p)).length/zone.length;
 assert.ok(blob<.06,'no blob: '+blob.toFixed(3)+' '+JSON.stringify(b.light));assert.ok(lost<.12,'the print kept: '+lost.toFixed(3));
});

test('a core inside printed area is filled with that print, not one flat colour or a blend of the inks',async()=>{
 // As on the DD3's face: periwinkle print hatched with dark red line work, on red plastic, a hard flash in its middle.
 // The core comes back as the print (its spread of lightness, its share of print, its colours), where v3 drew a smudge
 // of the inks mixed (docs/photo-stamp-one-click.md).
 const lines=Array.from({length:30},(_,i)=>`<rect x="${300+14*i}" y="360" width="7" height="300" fill="#6b1f24"/>`).join('');
 const clean=await disc('#c64533',`<rect x="300" y="360" width="420" height="300" fill="#8e9fd8"/>`+lines),lit=flash(clean,{x:510,y:510,sigma:14,a:3});
 const r=extract(lit.slice(),SIZE,PLATE,{color:true});
 assert.ok(r.light.cloned>=1,'the core was filled from the print: '+JSON.stringify(r.light));
 const core=within(510,510,16),ring=within(510,510,90).filter(p=>{const i=p%SIZE,j=(p-i)/SIZE;return Math.hypot(i-510,j-510)>60;});
 const L=list=>list.map(p=>labAt(r.color.rgba,p)[0]),sd=v=>{const m=v.reduce((a,b)=>a+b,0)/v.length;return Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length);};
 const print=list=>list.filter(p=>r.color.rgba[4*p+3]>200).length/list.length;
 const mean=list=>{const m=[0,0,0];for(const p of list){const c=labAt(r.color.rgba,p);for(let q=0;q<3;q++)m[q]+=c[q];}return m.map(v=>v/list.length);};
 assert.ok(sd(L(core))>.5*sd(L(ring)),'hatched like the print: spread '+sd(L(core)).toFixed(1)+' vs '+sd(L(ring)).toFixed(1));
 assert.ok(Math.abs(print(core)-print(ring))<.15,'as much print as around it: '+print(core).toFixed(2)+' vs '+print(ring).toFixed(2));
 assert.ok(dE(mean(core),mean(ring))<8,'in the print\'s colours: ΔE '+dE(mean(core),mean(ring)).toFixed(1));
});
