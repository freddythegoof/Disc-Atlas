// The Halo band's colour (docs/halo-band-sampling.md): the band's dye, not the wash that bleeds into it.
// Fixtures are the swirl stand-in for Freddy's disc (tests/fixtures/halo-swirl.mjs) and PR #23's clean two-tone
// bands. Overmold rims keep rimColor, so their stored colours cannot move.
import test from 'node:test';
import assert from 'node:assert/strict';
import {delightPixels,rimColor,bandColor} from '../public/disc-albedo.mjs';
import {swirlCrop,DYE,SEAM} from './fixtures/halo-swirl.mjs';

const N=1024;
const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const enc=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.min(1,Math.max(0,v))**(1/2.4)-.055));
const parse=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lab=h=>{
 const [r,g,b]=parse(h).map(lin),f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
 const fx=f((.4124*r+.3576*g+.1805*b)/.95047),fy=f(.2126*r+.7152*g+.0722*b),fz=f((.0193*r+.1192*g+.9505*b)/1.08883);
 return [116*fy-16,500*(fx-fy),200*(fy-fz)];
};
const lch=h=>{const [L,a,b]=lab(h);return {L,C:Math.hypot(a,b),h:(Math.atan2(b,a)*180/Math.PI+360)%360};};
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);};
// Both samplers as the save path runs them: on the de-lit pixels, before the glare pass.
const sampled=(data,inner)=>{
 const copy=data.slice(),{band}=delightPixels(copy,N,{bandInner:inner});
 const rimCopy=data.slice(),{rim}=delightPixels(rimCopy,N,{rimInner:inner});
 return {band,rim};
};
// A disc painted from a radius/angle function in linear light, cropped as the aligner crops it.
const disc=fn=>{
 const data=new Uint8ClampedArray(N*N*4);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i+.5)/N*2-1,y=(j+.5)/N*2-1,t=Math.hypot(x,y),k=(j*N+i)*4;if(t>1)continue;
  const c=fn(t,Math.atan2(y,x));for(let q=0;q<3;q++)data[k+q]=enc(c[q]);data[k+3]=Math.round(255*Math.min(1,(1-t)*N/2));
 }
 return data;
};
const L=h=>parse(h).map(lin),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const smooth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};

// The target: what the pipeline itself makes of the dye (the same plate, light and de-lighting, the band solid
// dye). De-lighting a pale plate darkens and neutralises a little, so this, not the raw paint, is reachable.
const control=sampled(swirlCrop(N,{pure:true}),SEAM).band;
// The tolerance, from the characterization: ΔE76 ≤ 6 from the control, hue within 8°, at least 85% of its
// chroma (today's median: ΔE 32, 48% of the chroma).
const isDye=(got,label)=>{
 const a=lch(got),b=lch(control);
 assert.ok(dE(got,control)<=6,`${label}: ${got} is ΔE ${dE(got,control).toFixed(1)} from the dye control ${control}`);
 assert.ok(Math.abs(a.h-b.h)<=8,`${label}: hue ${a.h.toFixed(0)}° vs ${b.h.toFixed(0)}°`);
 assert.ok(a.C>=.85*b.C,`${label}: chroma ${a.C.toFixed(0)} vs ${b.C.toFixed(0)} (not pastel)`);
};

test('the control is the dye, de-lit: purple, saturated, close to the painted dye',()=>{
 const c=lch(control),d=lch(DYE);
 assert.ok(Math.abs(c.h-d.h)<=4&&c.C>=.8*d.C&&dE(control,DYE)<=10,`${control} vs ${DYE}`);
});

test('a swirled band stores its dye, not the wash: today\'s median is pastel, the band statistic is not',()=>{
 const {band,rim}=sampled(swirlCrop(N),SEAM);
 assert.ok(lch(rim).C<.6*lch(control).C,`the old median was pastel (${rim})`);
 isDye(band,'swirl');
});

test('the band statistic holds across the swirl\'s hard variants',()=>{
 isDye(sampled(swirlCrop(N,{glare:true}),SEAM).band,'a clipped glare wedge across the band');
 isDye(sampled(swirlCrop(N,{front:.91}),SEAM).band,'the dye front pushed out to 0.91 R (23% of samples)');
 // A harder-lit rim darkens the outer dye itself: the hue and saturation hold; lightness follows the light.
 const hard=sampled(swirlCrop(N,{shadeFrom:.88,shade:.45}),SEAM).band,h=lch(hard),c=lch(control);
 assert.ok(Math.abs(h.h-c.h)<=8&&h.C>=.8*c.C&&h.L<c.L,`hard-lit rim: ${hard} vs ${control}`);
});

// The documented limit: a band group must hold 15% of the samples, so a full ring of table past a loose aligner
// circle (12.5%) can never be read as the band. Dye on less than that (front at 0.93 R: 13%) reads as the wash,
// as it did before this change; it is never worse than the old median.
test('dye on under 15% of the band reads as the wash, no worse than before',()=>{
 const {band,rim}=sampled(swirlCrop(N,{front:.93}),SEAM);
 assert.ok(dE(band,control)>30,`below the floor: ${band}`);
 assert.ok(dE(band,control)<=dE(rim,control)+3,`no worse than the old median (${band} vs ${rim})`);
});

test('a clean two-tone band reads exactly as before',()=>{
 const cases=[
  // PR #23's drawn Wraith: purple plate, band #e9c8f7 from 0.78–0.84 R (sRGB gradient, as canvas draws it).
  [disc(t=>{const P=parse('#5b2a86'),B=parse('#e9c8f7'),u=Math.min(1,Math.max(0,(t-.78)/.06));return P.map((p,c)=>lin(Math.round(p+(B[c]-p)*u)));}),.801],
  [disc(t=>mix(L('#de5852'),L('#2f5fb8'),smooth(.75,.77,t))),.791],
  [disc((t,a)=>{const f=.86+.03*Math.sin(4*a);return mix(L('#d23a33'),L('#f4f1ee'),smooth(f-.04,f+.04,t));}),.862],
 ];
 const stored=cases.map(([data,inner])=>{const {band,rim}=sampled(data,inner);assert.equal(band,rim);return band;});
 assert.deepEqual(stored,['#ffeaff','#2f5fb8','#f4f1ee']);
});

test('the band is sampled where the rim is: before the glare pass, from the same de-lit pixels',()=>{
 const data=swirlCrop(N,{glare:true}),a=data.slice(),b=data.slice();
 const on=delightPixels(a,N,{bandInner:SEAM,softenGlare:true}),off=delightPixels(b,N,{bandInner:SEAM,softenGlare:false});
 assert.equal(on.band,off.band);assert.equal(on.color,off.color);
});

test('sampling the band never changes the pixels, the plate colour or the overmold rim',()=>{
 const data=swirlCrop(N),plain=data.slice(),banded=data.slice(),rimmed=data.slice();
 const p=delightPixels(plain,N),b=delightPixels(banded,N,{bandInner:SEAM}),r=delightPixels(rimmed,N,{rimInner:SEAM});
 assert.deepEqual(banded,plain);assert.deepEqual(rimmed,plain);
 assert.equal(b.color,p.color);assert.equal(r.color,p.color);
 assert.equal(r.rim,rimColor(plain,N,SEAM));assert.equal(b.band,bandColor(plain,N,SEAM));
 assert.equal('band' in r,false);assert.equal('rim' in b,false);
});
