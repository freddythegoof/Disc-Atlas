// Photo stamps v2, the full-colour asset (public/disc-stamp-color.mjs, docs/photo-stamp-color-assets.md), on drawn
// synthetic discs only: no photo of anyone's disc is ever a fixture. Each disc is an SVG rasterized by sharp and goes
// through the editor's worker function, de-lighting included.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {extract} from '../public/disc-stamp-worker.mjs';
import {delightPixels} from '../public/disc-albedo.mjs';
import {extractPhotoStamp,rgbToLab} from '../public/disc-stamp-extract.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const SIZE=1024,C=SIZE/2,PLATE=.8;
async function disc(plate,body,defs=''){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><clipPath id="c"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath>${defs}</defs><g clip-path="url(#c)"><rect width="${SIZE}" height="${SIZE}" fill="${plate}"/>${body}</g></svg>`;
 return new Uint8ClampedArray(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer());
}
const hexLab=h=>rgbToLab(...[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
const labAt=(rgba,x,y)=>{const p=4*(y*SIZE+x);return rgbToLab(rgba[p],rgba[p+1],rgba[p+2]);};
const dE=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
// The mean colour (Lab) and alpha over a box.
function region(rgba,x0,y0,x1,y1){const s=[0,0,0];let a=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const L=labAt(rgba,x,y);for(let q=0;q<3;q++)s[q]+=L[q];a+=rgba[4*(y*SIZE+x)+3];n++;}return {lab:s.map(v=>v/n),alpha:a/n};}

// A multicolour print, as on the DD3: a periwinkle face and a pale foil crystal, both outlined in near-black, a yellow
// word with no outline, and a near-black name.
const BLUE='#8e9fd8',PALE='#d9dde3',YELLOW='#e7c64a',INK='#1a1416';
const PRINT=`<polygon points="330,300 520,280 560,470 360,500" fill="${BLUE}" stroke="${INK}" stroke-width="10"/>`+
 `<polygon points="600,300 700,320 690,470 590,450" fill="${PALE}" stroke="${INK}" stroke-width="10"/>`+
 `<rect x="340" y="560" width="340" height="60" fill="${YELLOW}"/><rect x="400" y="660" width="220" height="26" fill="${INK}"/>`;

test('every ink keeps its own colour, and the plastic carries nothing',async()=>{
 const r=extract(await disc('#c64533',PRINT),SIZE,PLATE,{color:true}),rgba=r.color.rgba;
 for(const [hex,box] of [[BLUE,[400,340,480,420]],[PALE,[620,340,670,420]],[YELLOW,[380,575,640,605]],[INK,[430,666,590,680]]]){
  const m=region(rgba,...box);
  assert.ok(m.alpha>250,hex+' is printed opaque: '+m.alpha);
  assert.ok(dE(m.lab,hexLab(hex))<6,hex+' keeps its colour: ΔE '+dE(m.lab,hexLab(hex)).toFixed(1));
 }
 assert.ok(region(rgba,700,600,780,680).alpha<2,'bare plate is empty');
 assert.ok(r.color.stats.inks>=4,'four inks found: '+r.color.stats.inks);
});

test('the same print reads the same on another plastic',async()=>{
 const a=extract(await disc('#c64533',PRINT),SIZE,PLATE,{color:true}).color.rgba,b=extract(await disc('#5c9daa',PRINT),SIZE,PLATE,{color:true}).color.rgba;
 for(const box of [[400,340,480,420],[620,340,670,420],[380,575,640,605]])assert.ok(dE(region(a,...box).lab,region(b,...box).lab)<5,'box '+box);
});

test('an edge is the ink, not ink blended with the plastic',async()=>{
 // A thick near-black bar on red: its anti-aliased edge must stay near-black in colour (only alpha fades).
 const r=extract(await disc('#c64533',`<rect x="300" y="400.5" width="420" height="40" fill="${INK}"/>`),SIZE,PLATE,{color:true}),rgba=r.color.rgba;
 let worst=0;
 for(let x=320;x<700;x+=7)for(const y of [399,400,401,440,441,442]){const p=4*(y*SIZE+x);if(rgba[p+3]>30)worst=Math.max(worst,dE(labAt(rgba,x,y),hexLab(INK)));}
 assert.ok(worst<12,'no red-brown fringe: worst ΔE '+worst.toFixed(1));
});

test('the plastic shows through a halftone, as on print',async()=>{
 // Fine hatching: blue lines 4 px wide with 4 px gaps of plastic, inside an outline.
 let hatch='';for(let x=360;x<640;x+=8)hatch+=`<rect x="${x}" y="360" width="4" height="260" fill="${BLUE}"/>`;
 const r=extract(await disc('#c64533',hatch+`<rect x="350" y="350" width="300" height="280" fill="none" stroke="${INK}" stroke-width="10"/>`),SIZE,PLATE,{color:true}),rgba=r.color.rgba;
 let ink=0,gap=0;for(let y=400;y<580;y+=5){ink+=rgba[4*(y*SIZE+401)+3];gap+=rgba[4*(y*SIZE+405)+3];}
 assert.ok(ink/36>200,'a hatch line is printed: '+ink/36);
 assert.ok(gap/36<90,'a gap shows the plastic: '+gap/36);
});

test('illumination is flattened: a highlight across one ink and a clipped glare spot are gone',async()=>{
 // A broad white sheen over the big yellow word (room light on foil, not part of the print) and a small clipped glare
 // spot inside the blue face.
 const defs=`<radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
 const body=PRINT.replace(`<rect x="340" y="560" width="340" height="60" fill="${YELLOW}"/>`,`<rect x="200" y="540" width="620" height="90" fill="${YELLOW}"/>`)+
  `<ellipse cx="660" cy="585" rx="220" ry="160" fill="url(#g)"/><circle cx="440" cy="400" r="14" fill="#ffffff"/>`;
 const data=await disc('#c64533',body,defs),before=data.slice(),r=extract(data,SIZE,PLATE,{color:true}),rgba=r.color.rgba;
 const spread=img=>{const Ls=[];for(let x=230;x<790;x+=20)Ls.push(region(img,x,560,x+10,610).lab[0]);return Math.max(...Ls)-Math.min(...Ls);};
 const raw=spread(before),flat=spread(rgba);
 assert.ok(flat<.5*raw,'at least half the sheen across the word is gone: '+raw.toFixed(1)+' → '+flat.toFixed(1));
 assert.ok(r.color.stats.glare>0,'the glare spot was found');
 assert.ok(dE(region(rgba,434,394,446,406).lab,hexLab(BLUE))<10,'the glare spot is the face colour again: ΔE '+dE(region(rgba,434,394,446,406).lab,hexLab(BLUE)).toFixed(1));
});

test('the one-ink asset is exactly what v1 makes, with or without the colour asset',async()=>{
 const data=await disc('#c64533',PRINT),v1=data.slice(),{color}=delightPixels(v1,SIZE,{softenGlare:false});
 const old=extractPhotoStamp(v1,SIZE,{plate:PLATE,plateColor:color});
 for(const opts of [{},{color:true}]){
  const r=extract(data.slice(),SIZE,PLATE,opts);
  assert.equal(r.plateColor,color);assert.equal(r.layered,old.layered);
  assert.deepEqual(Buffer.from(r.alpha),Buffer.from(old.alpha),'alpha bytes');
  if(old.layers)for(const k of ['line','fill','solid'])assert.deepEqual(Buffer.from(r.layers[k].buffer),Buffer.from(old.layers[k].buffer),k);
  assert.equal('mask' in r,false);assert.equal('color' in r,!!opts.color);
 }
});
