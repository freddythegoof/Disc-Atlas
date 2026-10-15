import {test} from 'node:test';
import assert from 'node:assert/strict';
import {delightPixels,plateColor,SOFTEN_GLARE} from '../public/disc-albedo.mjs';
import {glarePhoto,GLARE_CASES} from './photo-glare-cases.mjs';

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

// The glare experiment (docs/photo-glare-experiment.md): baseline = softenGlare:false, the exact pre-experiment
// output. Every assertion compares the two on the same input.
const ab=name=>{
 const photo=glarePhoto(GLARE_CASES[name]),baseline=photo.data.slice(),experiment=photo.data.slice();
 const a=delightPixels(baseline,photo.size,{softenGlare:false}),b=delightPixels(experiment,photo.size,{softenGlare:true});
 const changed=[];for(let p=0;p<photo.size*photo.size;p++){const k=4*p;if(baseline[k]!==experiment[k]||baseline[k+1]!==experiment[k+1]||baseline[k+2]!==experiment[k+2]||baseline[k+3]!==experiment[k+3])changed.push(p);}
 return {photo,baseline,experiment,a,b,changed};
};
const lumAt=(d,p)=>luma(d[4*p],d[4*p+1],d[4*p+2]);

test('glare experiment: the kill switch restores the baseline byte for byte',()=>{
 assert.equal(SOFTEN_GLARE,true,'the experiment is on in this branch; false turns it off');
 const photo=glarePhoto(GLARE_CASES.hotspot),off=photo.data.slice(),defaults=photo.data.slice(),on=photo.data.slice();
 const result=delightPixels(off,photo.size,{softenGlare:false});delightPixels(defaults,photo.size);delightPixels(on,photo.size,{softenGlare:true});
 assert.equal('glare' in result,false,'off: the pass never runs');
 assert.deepEqual(defaults,on,'the default follows SOFTEN_GLARE');
 assert.notDeepEqual(off,on);
});

test('glare experiment: no glare, or crisp white ink, renders identical to the baseline',()=>{
 for(const name of ['no-glare','white-ink-clipped']){
  const {baseline,experiment,a,b,changed}=ab(name);
  assert.equal(changed.length,0,name+': no pixel changed');assert.deepEqual(experiment,baseline);assert.equal(a.color,b.color);
  assert.equal(b.glare.hotspots,0,name);
 }
 // The clipped white ink block is seen and refused (its halo is a pixel or two wide), not missed.
 assert.equal(ab('white-ink-clipped').b.glare.rejected,1);
});

test('glare experiment: only glare pixels change, each one darker, and the hotspot loses most of its excess',()=>{
 for(const name of ['hotspot','hotspot-on-stamp','tube-streak','dark-disc']){
  const {photo,baseline,experiment,a,b,changed}=ab(name),n=photo.size*photo.size;
  // Bounded: a pixel changes only where the fixture added glare; everywhere else the bytes are the baseline's.
  assert.ok(changed.length>500,name+': the hotspot was softened ('+changed.length+' px)');
  for(const p of changed){
   assert.ok(photo.added[p]>=.005,`${name}: pixel ${p} changed without glare`);
   assert.ok(lumAt(experiment,p)<lumAt(baseline,p),`${name}: pixel ${p} brightened`);
  }
  assert.equal(b.color,a.color,name+': the matched plate colour is the baseline\'s');
  // Measured: mean luminance over the glare (added light ≥ 0.3) and its distance from the same photo shot
  // without glare (the truth the softening aims for), baseline vs experiment.
  const reference=glarePhoto({...GLARE_CASES[name],glare:[]}).data;delightPixels(reference,photo.size,{softenGlare:false});
  let count=0,before=0,after=0,errBefore=0,errAfter=0;
  for(let p=0;p<n;p++){if(photo.added[p]<.3||photo.data[4*p+3]<255)continue;count++;const r=lumAt(reference,p);before+=lumAt(baseline,p);after+=lumAt(experiment,p);errBefore+=Math.abs(lumAt(baseline,p)-r);errAfter+=Math.abs(lumAt(experiment,p)-r);}
  assert.ok(count>1000,name);
  assert.ok(after<before*.65,`${name}: highlight luminance ${(before/count).toFixed(3)} → ${(after/count).toFixed(3)}`);
  assert.ok(errAfter<errBefore*.45,`${name}: error vs no-glare ${(errBefore/count).toFixed(3)} → ${(errAfter/count).toFixed(3)}`);
 }
});

test('glare experiment: coloured ink beside a hotspot keeps its colour',()=>{
 const {photo,baseline,experiment}=ab('hotspot-on-stamp');let count=0;
 for(let j=0;j<photo.size;j++)for(let i=0;i<photo.size;i++){
  const x=(i+.5)/photo.size*2-1,y=(j+.5)/photo.size*2-1,k=4*(j*photo.size+i);
  if(x>-.5&&x<-.3&&y>.3&&y<.42){count++;for(let c=0;c<3;c++)assert.equal(experiment[k+c],baseline[k+c],'yellow ink pixel changed');}
 }
 assert.ok(count>500);
});
