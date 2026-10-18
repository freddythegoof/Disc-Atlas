// Halo v2 (docs/halo-band-v2.md): the band's wash and dye front, sampled at save. The asymmetric swirl fixture
// (tests/fixtures/halo-swirl.mjs) has a drawn front to measure against; its controls (fat dye, solid dye, clean
// two-tone bands) must store no model and so draw exactly as v1. The browser half is tests/halo-plastic-browser.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {delightPixels,bandColor,bandModel,rimColor,FRONT_RING} from '../public/disc-albedo.mjs';
import {HALO_RING,HALO_FEATHER,encodeHalo,parseHalo,haloModel,frontAt} from '../public/disc3d/halo.mjs';
import {swirlCrop,drawnFront,SEAM,ASYM_FEATHER} from './fixtures/halo-swirl.mjs';

const N=1024;
const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const enc=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.min(1,Math.max(0,v))**(1/2.4)-.055));
const parse=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lab=h=>{
 const [r,g,b]=parse(h).map(lin),f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
 const fx=f((.4124*r+.3576*g+.1805*b)/.95047),fy=f(.2126*r+.7152*g+.0722*b),fz=f((.0193*r+.1192*g+.9505*b)/1.08883);
 return [116*fy-16,500*(fx-fy),200*(fy-fz)];
};
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);};
const delit=options=>{const d=swirlCrop(N,options);delightPixels(d,N,{});return d;};
const model=options=>bandModel(delit(options),N,SEAM);
const disc=fn=>{
 const data=new Uint8ClampedArray(N*N*4);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i+.5)/N*2-1,y=(j+.5)/N*2-1,t=Math.hypot(x,y),k=(j*N+i)*4;if(t>1)continue;
  const c=fn(t,Math.atan2(y,x));for(let q=0;q<3;q++)data[k+q]=enc(c[q]);data[k+3]=Math.round(255*Math.min(1,(1-t)*N/2));
 }
 delightPixels(data,N,{});return data;
};
const L=h=>parse(h).map(lin),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const smooth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
// The swirl's wash as the pipeline de-lights it: its wash-only control.
const WASH=bandColor(delit({washOnly:true}),N,SEAM);
// The front tolerance, from the characterisation: RMS 0.015 R and worst 0.035 R, both under the drawn feather.
const FRONT_RMS=.015,FRONT_MAX=.035;

test('the ring is the stored ring: 16 radii, one byte each, 39 characters with the wash',()=>{
 assert.equal(FRONT_RING,HALO_RING);
 const m=model({asym:true}),stored=encodeHalo(m);
 assert.match(stored,/^#[0-9a-f]{38}$/);
 const back=parseHalo(stored);assert.equal(back.wash,m.wash);
 for(let i=0;i<HALO_RING;i++)assert.ok(Math.abs(back.front[i]-m.front[i])<=.001,'a byte is 0.002 R');
 assert.equal(parseHalo('#123456'),null);assert.equal(parseHalo(stored+'00'),null);assert.equal(encodeHalo(null),null);
});

test('the asymmetric swirl stores its wash and a front that tracks the drawn one',()=>{
 const m=model({asym:true}),front=parseHalo(encodeHalo(m)).front;
 assert.ok(dE(m.wash,WASH)<=4,`wash ${m.wash} vs ${WASH} (ΔE ${dE(m.wash,WASH).toFixed(1)})`);
 const errors=Array.from({length:360},(_,i)=>{const a=(i+.5)*Math.PI/180;return frontAt(front,a)-drawnFront(a,{asym:true});});
 const rms=Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/360),max=Math.max(...errors.map(Math.abs));
 assert.ok(rms<=FRONT_RMS&&max<=FRONT_MAX,`front rms ${rms.toFixed(4)} max ${max.toFixed(4)}`);
 // Lopsided as drawn: furthest out near 15°, furthest in on the opposite side.
 const far=front.indexOf(Math.max(...front)),near=front.indexOf(Math.min(...front));
 assert.ok(far<=2||far>=15,`outermost front at ring ${far}`);assert.ok(near>=6&&near<=11,`innermost front at ring ${near}`);
});

test('the dye is still PR #24\'s dye: bandModel and bandColor agree, and overmold rims are untouched',()=>{
 for(const o of [{asym:true},{}]){const d=delit(o),m=bandModel(d,N,SEAM);assert.equal(m.dye,bandColor(d,N,SEAM));}
 const d=delit({asym:true}),a=d.slice(),b=d.slice();
 assert.equal(delightPixels(a,N,{rimInner:SEAM}).rim,rimColor(d,N,SEAM));
 const r=delightPixels(b,N,{bandInner:SEAM});assert.equal(r.band,r.halo.dye);
});

test('the swirl\'s own feather, read from its photo, is the blend the renderer draws',()=>{
 // Per angle, the 10–90% width of the dye's take-over, sampled on fine rings in the de-lit photo.
 const data=delit({asym:true}),m=bandModel(data,N,SEAM),w=L(m.wash),d=L(m.dye),axis=d.map((v,i)=>v-w[i]),len2=axis.reduce((s,v)=>s+v*v,0);
 const widths=[];
 for(let a=0;a<64;a++){
  const angle=(a+.5)*Math.PI/32,share=[];
  for(let t=.82;t<=.985;t+=.0025){const x=Math.floor((1+t*Math.cos(angle))*N/2),y=Math.floor((1+t*Math.sin(angle))*N/2),k=(y*N+x)*4;
   share.push([t,Math.min(1,Math.max(0,[0,1,2].reduce((s,c)=>s+(lin(data[k+c])-w[c])*axis[c],0)/len2))]);}
  const cross=level=>{for(let i=1;i<share.length;i++)if(share[i-1][1]<level&&share[i][1]>=level)return share[i][0];return null;};
  const a10=cross(.1),a90=cross(.9);if(a10&&a90&&a90>a10)widths.push(a90-a10);
 }
 widths.sort((a,b)=>a-b);const median=widths[widths.length>>1];
 assert.ok(Math.abs(median-ASYM_FEATHER)<=.012,`the photo's feather ${median.toFixed(3)} R`);
 assert.ok(Math.abs(HALO_FEATHER-median)<=.012,`HALO_FEATHER ${HALO_FEATHER} against the measured ${median.toFixed(3)} R`);
});

test('two colours is a model, not a default: one-colour bands store none',()=>{
 assert.equal(model({pure:true}),null,'solid dye: v1');
 assert.equal(model({front:.80}),null,'dye from the seam (fat): v1');
 assert.equal(model({front:.93}),null,'dye under the 15% floor: v1, as PR #24');
 // PR #23's clean two-tone bands.
 assert.equal(bandModel(disc(t=>{const P=parse('#5b2a86'),B=parse('#e9c8f7'),u=Math.min(1,Math.max(0,(t-.78)/.06));return P.map((p,c)=>lin(Math.round(p+(B[c]-p)*u)));}),N,.801),null);
 assert.equal(bandModel(disc(t=>mix(L('#de5852'),L('#2f5fb8'),smooth(.75,.77,t))),N,.791),null);
 assert.equal(bandModel(disc((t,a)=>{const f=.86+.03*Math.sin(4*a);return mix(L('#d23a33'),L('#f4f1ee'),smooth(f-.04,f+.04,t));}),N,.862),null);
});

test('a barely-dyed band keeps its front near the edge; a heavily dyed one near the seam',()=>{
 const lip=model({front:.91}),wide=model({front:.85});
 const mean=m=>m.front.reduce((s,v)=>s+v,0)/m.front.length;
 assert.ok(lip&&mean(lip)>.9,`dye only at the lip: front ${lip&&mean(lip).toFixed(3)} R`);
 assert.ok(!wide||mean(wide)<.88,`dye over most of the band: front ${wide&&mean(wide).toFixed(3)} R, or no wash at all`);
});

test('a copy shows two colours only with a stored model, a band and a photo',()=>{
 const stored=encodeHalo(model({asym:true})),copy={plastic:'Halo Star',texture_key:'k.webp',photo_rim_color:'#5b267b',photo_halo:stored};
 assert.equal(haloModel(copy),stored);
 assert.equal(haloModel({...copy,photo_halo:null}),null,'saved under v1: one colour');
 assert.equal(haloModel({...copy,texture_key:null}),null);
 assert.equal(haloModel({...copy,plastic:'Star'}),null);
 assert.equal(haloModel({...copy,photo_rim_color:null}),null);
 assert.equal(haloModel({...copy,photo_halo:'#bad'}),null);
});
