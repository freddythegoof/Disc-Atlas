// The blotch veto (docs/stamp-pipeline-v2.md §9–10), on drawn discs only: near-neutral glow plastic with a patch of
// lighter, textured mottling (fractal noise, the Berg's failure in small: the extractor reads part of it as ink) and a
// gold print. With the veto, the mottling's stray ink falls to under half, and the print is untouched byte for byte; a
// clean disc of the same print comes out byte-identical with the veto on or off. The registration read leaves it off.
// Run with `node --test tests/stamp-blotch-veto.mjs`.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {extract} from '../public/disc-stamp-worker.mjs';
import {printSupport} from '../public/disc-stamp-separate.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const SIZE=2048,C=SIZE/2,PLATE=.936,PLASTIC='#b1b0b2',INK='#6b4a1c';
// The print: a name bar and a line of small print (twelve 6 × 22 px letters, under today's speck size on their own).
const PRINT=`<rect x="760" y="900" width="528" height="70" fill="${INK}"/>`+Array.from({length:12},(_,i)=>`<rect x="${840+i*30}" y="1010" width="6" height="22" fill="${INK}"/>`).join('');
const inPrint=p=>{const x=p%SIZE,y=p/SIZE|0;return x>=740&&x<=1310&&y>=880&&y<=1050;};
// Lighter mottling: fractal noise, steeply thresholded into pale flecks, shown through a soft ellipse up and right.
const MOTTLE_DEFS=`<filter id="t" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .86 0 0 0 0 .86 0 0 0 0 .87 6 0 0 0 -1.2"/></filter><mask id="m"><ellipse cx="1450" cy="560" rx="380" ry="240" fill="#fff" filter="url(#b)"/></mask><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>`;
const MOTTLE=`<g mask="url(#m)"><rect width="${SIZE}" height="${SIZE}" filter="url(#t)"/></g>`;
async function disc(mottled){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><clipPath id="c"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath>${mottled?MOTTLE_DEFS:''}</defs><g clip-path="url(#c)"><rect width="${SIZE}" height="${SIZE}" fill="${PLASTIC}"/>${mottled?MOTTLE:''}${PRINT}</g></svg>`;
 return new Uint8ClampedArray(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer());
}
const count=(alpha,where)=>{let n=0;for(let p=0;p<alpha.length;p++)if(alpha[p]>127&&where(p))n++;return n;};
const same=(a,b,where=()=>true)=>{for(let p=0;p<a.length;p++)if(where(p)&&a[p]!==b[p])return false;return true;};

test('mottled glow plastic: the veto takes most of the stray ink and none of the print',async()=>{
 const data=await disc(true),off=extract(data.slice(),SIZE,PLATE,{veto:false}),on=extract(data.slice(),SIZE,PLATE);
 const strayOff=count(off.alpha,p=>!inPrint(p)),strayOn=count(on.alpha,p=>!inPrint(p));
 // The failure, reproduced: without the veto the mottling reads as ink.
 assert.ok(strayOff>5000,`mottling should read as ink without the veto (${strayOff} px)`);
 assert.ok(strayOn<strayOff/2,`the veto should take most of it (${strayOn} of ${strayOff} px left)`);
 assert.ok(count(on.alpha,inPrint)>30000,'the print is read');
 assert.ok(same(on.alpha,off.alpha,inPrint),'the print is untouched');
});

test('a clean disc is byte-identical with the veto on or off',async()=>{
 const data=await disc(false),off=extract(data.slice(),SIZE,PLATE,{veto:false,color:true}),on=extract(data.slice(),SIZE,PLATE,{color:true});
 assert.ok(same(on.alpha,off.alpha),'alpha');
 assert.ok(same(on.color.rgba,off.color.rgba),'colour asset');
});

test('the support covers the print and not the mottling',async()=>{
 const data=await disc(true),support=printSupport(data,SIZE,{plate:PLATE});
 // Every pixel of the name bar is supported; the mottling's centre is not.
 for(const [x,y] of [[770,910],[1024,935],[1280,960],[843,1020]])assert.equal(support[y*SIZE+x],1,`print at ${x},${y}`);
 let held=0,n=0;for(let y=480;y<640;y+=4)for(let x=1300;x<1600;x+=4){n++;held+=support[y*SIZE+x];}
 assert.ok(held<n*.2,`mottling supported at ${held} of ${n} samples`);
});

test('nothing to read, no veto: a plain disc and a crop with no plate give no support',async()=>{
 const plain=new Uint8ClampedArray(512*512*4);for(let p=0;p<plain.length;p+=4)plain.set([177,176,178,255],p);
 assert.equal(printSupport(plain,512,{plate:.8}),null,'no print');
 assert.equal(printSupport(new Uint8ClampedArray(512*512*4),512,{plate:.8}),null,'no plate');
});
