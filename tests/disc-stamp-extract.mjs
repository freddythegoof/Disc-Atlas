// Photo stamps extractor (public/disc-stamp-extract.mjs, docs/photo-stamp-assets.md), on drawn synthetic discs only:
// no photo of anyone's disc is ever a fixture. Each disc is an SVG rasterized by sharp, de-lit the way the editor does it.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {delightPixels} from '../public/disc-albedo.mjs';
import {extractPhotoStamp} from '../public/disc-stamp-extract.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const SIZE=1024,C=SIZE/2,PLATE=.8;
// A disc filling the crop, as the aligner leaves it: transparent outside the circle.
async function disc(plate,body){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><clipPath id="c"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath></defs><g clip-path="url(#c)"><rect width="${SIZE}" height="${SIZE}" fill="${plate}"/>${body}</g></svg>`;
 const data=new Uint8ClampedArray(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer());
 return data;
}
async function extract(plate,body){
 const data=await disc(plate,body),{color}=delightPixels(data,SIZE,{softenGlare:false});
 return extractPhotoStamp(data,SIZE,{plate:PLATE,plateColor:color});
}
const at=(r,x,y)=>r.alpha[y*SIZE+x];
const mean=(r,x0,y0,x1,y1)=>{let s=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){s+=at(r,x,y);n++;}return s/n;};

// A single-ink stamp: a ring, a bar and a block of "text", the kind of design a stock stamp is.
const SINGLE=`<circle cx="${C}" cy="${C}" r="250" fill="none" stroke="#1d2026" stroke-width="14"/><rect x="330" y="470" width="364" height="34" fill="#1d2026"/><rect x="380" y="540" width="40" height="70" fill="#1d2026"/><rect x="440" y="540" width="40" height="70" fill="#1d2026"/>`;

test('a single-ink stamp comes out solid, in alpha only, with the plate empty',async()=>{
 const r=await extract('#5c9daa',SINGLE);
 assert.equal(r.layered,false);
 assert.ok(mean(r,400,476,620,498)>245,'the bar is solid ink');
 assert.ok(mean(r,560,560,640,640)<3,'bare plate carries nothing');
 assert.ok(at(r,C+250,C)>200,'the ring survives');
 // The counter between the two blocks stays open.
 assert.ok(mean(r,424,550,436,600)<40);
});

test('only the design transfers: the same stamp on different plastics gives the same alpha',async()=>{
 const a=await extract('#5c9daa',SINGLE),b=await extract('#c64533',SINGLE),c=await extract('#e6c668',SINGLE);
 const iou=(x,y)=>{let i=0,u=0;for(let p=0;p<SIZE*SIZE;p++){const s=x.alpha[p]>127,t=y.alpha[p]>127;if(s&&t)i++;if(s||t)u++;}return i/u;};
 assert.ok(iou(a,b)>.95,'teal and red agree: '+iou(a,b));
 assert.ok(iou(a,c)>.95,'teal and yellow agree: '+iou(a,c));
});

test('faint foil letters beside the stamp are kept; a faint mark far from it is not',async()=>{
 // A letter only a few ΔE from the plastic (foil mirroring a colour close to it), right beside strong ink, and the
 // same faint mark alone near the shoulder.
 // Thin strokes, as letters are: about 10 ΔE from the plastic, where the real hologram letters sat.
 const L=(x,y)=>`<path d="M${x} ${y}v70h40" fill="none" stroke="#80a3a8" stroke-width="12"/>`;
 const r=await extract('#5c9daa',SINGLE+L(712,468)+`<path d="M600 840v40h30" fill="none" stroke="#80a3a8" stroke-width="12"/>`);
 assert.ok(mean(r,708,475,716,530)>180,'the faint letter beside the stamp');
 assert.ok(mean(r,596,845,604,875)<20,'the lone faint mark');
});

// Like the real one on the DD3: room light from a window, broad and dim, with no hard core. (A bright reflection with a
// hard core is not recognised by this rule; see the write-up.)
test('a soft reflection away from the stamp is plastic, not ink',async()=>{
 const glare=`<defs><filter id="b" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="12"/></filter></defs><ellipse cx="872" cy="${C}" rx="18" ry="110" fill="#ffffff" fill-opacity=".45" filter="url(#b)"/>`;
 const r=await extract('#c64533',SINGLE+glare);
 assert.ok(mean(r,862,C-60,882,C+60)<10,'no reflection in the asset');
 assert.ok(r.stats.reflections.length>=1);
 assert.ok(mean(r,400,476,620,498)>245,'the stamp itself is untouched');
});

test('a band hugging the plate edge (a Halo ring, a seam) is not ink',async()=>{
 const r=await extract('#663f89',SINGLE+`<circle cx="${C}" cy="${C}" r="420" fill="none" stroke="#e9c8f7" stroke-width="60"/>`);
 assert.ok(r.stats.bands.length>=1);
 assert.ok(at(r,C+398,C)<10);
});

test('an illustrated stamp keeps its line work at full ink and its fills as a tint',async()=>{
 // Dark outlines around lighter fills (a crystal, a face), with a solid dark name below and a free light badge.
 const cell=(x,y)=>`<polygon points="${x},${y} ${x+90},${y+20} ${x+70},${y+120} ${x-10},${y+100}" fill="#9aa4c8" stroke="#1a1416" stroke-width="9"/>`;
 let body='';for(let j=0;j<3;j++)for(let i=0;i<4;i++)body+=cell(300+i*110,300+j*130);
 body+=`<rect x="380" y="720" width="260" height="36" fill="#1a1416"/><circle cx="${C}" cy="230" r="34" fill="#c8ccd8"/>`;
 const r=await extract('#c64533',body);
 assert.equal(r.layered,true);
 assert.ok(r.stats.enclosed>.55);
 const fill=mean(r,330,340,360,370),line=at(r,300+45,300+10);
 assert.ok(fill>80&&fill<140,'a fill is a tint: '+fill);
 assert.ok(line>220,'a line is full ink: '+line);
 assert.ok(mean(r,400,726,620,750)>240,'a solid dark element no fill touches is full ink');
 assert.ok(mean(r,C-15,215,C+15,245)>240,'a fill no line touches is full ink');
 // The layers the stamp path inks either way round: a fill is fill, a line is line, the name is solid.
 const L=r.layers,px=(x,y)=>y*SIZE+x;
 assert.ok(L.fill[px(345,355)]>.9&&L.line[px(345,355)]<.1);
 assert.ok(L.line[px(345,310)]>.9);
 assert.ok(L.solid[px(500,738)]>.9&&L.line[px(500,738)]<.1);
});
