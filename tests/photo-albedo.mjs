import {test} from 'node:test';
import assert from 'node:assert/strict';
import {delightPixels,plateColor} from '../public/disc-albedo.mjs';

// A synthetic photo with known truth: an albedo (plate colour, a dark stamp, white ink, a 2px scratch),
// lit from above (bright top, dark bottom) under a warm bulb, then sRGB-encoded like a camera would.
const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const enc=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.min(1,v)**(1/2.4)-.055));
const luma=(r,g,b)=>.2126*lin(r)+.7152*lin(g)+.0722*lin(b);
function photo({size=256,plate=[40,140,150],white=true,light=y=>1.35-.45*(y+1),cast=[1.1,1,.82]}={}){
 const data=new Uint8ClampedArray(size*size*4),truth=new Uint8ClampedArray(size*size*4);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,k=(j*size+i)*4,r=Math.hypot(x,y);
  if(r>1)continue;
  let c=plate;
  if(Math.hypot(x,y+.05)<.22&&Math.abs(y+.05)>.06)c=[20,24,40];        // stamp: a ring
  if(white&&x>.25&&x<.4&&y>-.5&&y<-.35)c=[242,242,238];                 // white ink block
  if(Math.abs(x+.35)<.008&&y>.1&&y<.5)c=[90,170,180];                   // a fine scratch
  truth.set([...c,255],k);
  const l=light(y);for(let ch=0;ch<3;ch++)data[k+ch]=enc(lin(c[ch])*l*cast[ch]);data[k+3]=255;
 }
 return {data,truth,size};
}
const at=(d,size,x,y)=>{const i=Math.floor((x+1)/2*size),j=Math.floor((y+1)/2*size),k=(j*size+i)*4;return [d[k],d[k+1],d[k+2],d[k+3]];};

test('delighting flattens a top-to-bottom light gradient without touching the mask',()=>{
 const {data,size}=photo(),alpha=data.filter((_,k)=>k%4===3);
 const before=luma(...at(data,size,0,-.6))/luma(...at(data,size,0,.6));
 const result=delightPixels(data,size);
 const after=luma(...at(data,size,0,-.6))/luma(...at(data,size,0,.6));
 assert.ok(before>1.5,'the fixture is visibly lit from above: '+before);
 assert.ok(Math.abs(after-1)<.06,'top and bottom of the plate now match: '+after);
 assert.ok(result.gradient>1.4);
 assert.deepEqual(data.filter((_,k)=>k%4===3),alpha);
});

test('delighting keeps fine detail and the stamp at full contrast',()=>{
 const {data,truth,size}=photo();delightPixels(data,size);
 const ratio=(d,a,b)=>luma(...at(d,size,...a))/luma(...at(d,size,...b));
 // Stamp ring vs nearby plate, and a 2px scratch vs the plate beside it.
 const stamp=ratio(data,[.2,-.05],[.35,-.05]),stampTruth=ratio(truth,[.2,-.05],[.35,-.05]);
 const scratch=ratio(data,[-.35,.3],[-.3,.3]),scratchTruth=ratio(truth,[-.35,.3],[-.3,.3]);
 assert.ok(Math.abs(stamp/stampTruth-1)<.12,`stamp contrast ${stamp} vs ${stampTruth}`);
 assert.ok(Math.abs(scratch/scratchTruth-1)<.12,`scratch contrast ${scratch} vs ${scratchTruth}`);
});

test('white ink lets the warm cast be removed; the plate colour is measured from the plate only',()=>{
 const {data,size}=photo();const {color}=delightPixels(data,size);
 const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 // The true plate is teal (40,140,150). Warm light pushed red up and blue down; most of that is undone,
 // and the stamp's navy or the white ink never wins the vote.
 assert.ok(b>=g*.95&&r<70,'teal again, not warm grey: '+color);
 const warm=photo();const raw=plateColor(warm.data,size);
 const blueOverGreen=hex=>parseInt(hex.slice(5,7),16)/parseInt(hex.slice(3,5),16),truth=150/140;
 assert.ok(Math.abs(blueOverGreen(color)-truth)<Math.abs(blueOverGreen(raw)-truth)/2,`cast reduced: raw ${raw}, corrected ${color}`);
});

test('a saturated disc with no white keeps its colour instead of being greyed',()=>{
 const {data,size}=photo({plate:[230,110,30],white:false});const {color}=delightPixels(data,size);
 const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 assert.ok(r>g*1.6&&g>b*1.8,'still orange: '+color);
});

test('too little plate to measure leaves the pixels alone',()=>{
 const data=new Uint8ClampedArray(16*16*4).fill(200),copy=data.slice();
 assert.deepEqual(delightPixels(data,16),{color:null,gradient:1,corrected:false});
 assert.deepEqual(data,copy);
});
