// Extraction fidelity (docs/stamp-look-extraction.md), on drawn synthetic discs only: small print whose letters are each
// under the speck size stays when it sits in a word, a lone speck of the same ink still goes; on see-through plastic, a
// mark seen through the plate (the plate's own colour darkened, soft, faint: pen on the back of a Champion) is left out,
// while the print and any mark of another colour stay. Run with `node --test tests/stamp-extraction-fidelity.mjs`.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {delightPixels} from '../public/disc-albedo.mjs';
import {extractPhotoStamp} from '../public/disc-stamp-extract.mjs';
import {seeThroughPlastic} from '../public/bag-values.js';
const sharp=createRequire(import.meta.url)('sharp');

const SIZE=1024,C=SIZE/2,PLATE=.8,INK='#1d2026';
async function extract(plate,body,options={}){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><clipPath id="c"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath><filter id="soft"><feGaussianBlur stdDeviation="3.5"/></filter></defs><g clip-path="url(#c)"><rect width="${SIZE}" height="${SIZE}" fill="${plate}"/>${body}</g></svg>`;
 const data=new Uint8ClampedArray(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer()),{color}=delightPixels(data,SIZE,{softenGlare:false});
 return extractPhotoStamp(data,SIZE,{plate:PLATE,plateColor:color,...options});
}
const at=(r,x,y)=>r.alpha[y*SIZE+x];
const peak=(r,x0,y0,x1,y1)=>{let m=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)m=Math.max(m,at(r,x,y));return m;};
// The stamp: a ring and a name bar, as a stock stamp is.
const STAMP=`<circle cx="${C}" cy="${C}" r="250" fill="none" stroke="${INK}" stroke-width="14"/><rect x="330" y="440" width="364" height="40" fill="${INK}"/>`;

// A line of small print under the name: ten thin letters, each 2 × 9 px (18 px, under the 24 px speck size at 1024), set
// 6 px apart, as small print's letters are.
const LETTERS=Array.from({length:10},(_,i)=>[420+i*8,500]);
const SMALL=LETTERS.map(([x,y])=>`<rect x="${x}" y="${y}" width="2" height="9" fill="${INK}"/>`).join('');
// A lone speck of the same ink and size, far from everything.
const SPECK=`<rect x="600" y="640" width="2" height="9" fill="${INK}"/>`;

test('small print: letters under the speck size stay in their word; a lone speck still goes',async()=>{
 const r=await extract('#5c9daa',STAMP+SMALL+SPECK);
 const kept=LETTERS.filter(([x,y])=>peak(r,x-1,y,x+3,y+9)>127).length;
 assert.equal(kept,LETTERS.length,`every small letter is in the asset (${kept} of ${LETTERS.length})`);
 assert.ok(peak(r,598,638,604,651)<40,'the lone speck is not');
 assert.ok(peak(r,400,450,620,470)>245,'the name is solid');
});

// See-through plastic: a pale green plate, navy print, and the penned weight on the back seen through it (the plate's
// green, darker, blurred by the plastic), as on Freddy's Proto Glow Wraith.
const GREEN='#adba96',PEN='#6c7a55',NAVY='#18257a';
const PRINT=`<circle cx="${C}" cy="${C}" r="250" fill="none" stroke="${NAVY}" stroke-width="12"/><rect x="330" y="380" width="364" height="44" fill="${NAVY}"/>`;
const GHOST=`<g filter="url(#soft)" fill="none" stroke="${PEN}" stroke-width="10"><path d="M470 474 l20 -24 l20 24 M520 450 v44 M545 450 h22 l-22 44"/></g>`;
// A soft mark of another colour (a navy smudge of print): not the plate's colour, so it is not behind the plate.
const SMUDGE=`<g filter="url(#soft)"><rect x="600" y="560" width="36" height="12" fill="#3a4a9a"/></g>`;

test('see-through plastic: the pen behind the plate is left out; the print, and a mark of another colour, stay',async()=>{
 const off=await extract(GREEN,PRINT+GHOST+SMUDGE),on=await extract(GREEN,PRINT+GHOST+SMUDGE,{seeThrough:true});
 assert.ok(peak(off,465,445,570,500)>200,'without see-through plastic the mark is kept, as today');
 assert.ok(peak(on,465,445,570,500)<40,'on see-through plastic the pen is gone');
 assert.ok(on.stats.ghosts.length>=1);
 assert.ok(peak(on,400,390,620,414)>245,'the name is solid');
 assert.ok(at(on,C+250,C)>200,'the ring survives');
 assert.ok(peak(on,600,560,636,572)>127,'a soft mark of another colour stays');
 // Opaque plastic runs today's path: nothing is taken as behind the plate.
 const plain=await extract(GREEN,PRINT);
 const same=await extract(GREEN,PRINT,{seeThrough:true});
 let diff=0;for(let p=0;p<SIZE*SIZE;p++)if(plain.alpha[p]!==same.alpha[p])diff++;
 assert.equal(diff,0,'print alone reads the same either way');
});

test('see-through plastic is a Clear copy or the Champion family',()=>{
 for(const plastic of ['Champion','Proto Glow Champion','Luster Champion','Metal Flake Champion','champion'])assert.ok(seeThroughPlastic(plastic,'opaque'),plastic);
 for(const plastic of ['Star','DX','Z','Neutron','K1 Glow','Eclipse','',null])assert.equal(seeThroughPlastic(plastic,'opaque'),false,String(plastic));
 assert.ok(seeThroughPlastic('Z','clear'));
});
