// A swirled Halo disc (docs/halo-band-sampling.md), the stand-in for Freddy's "Title Town Tussle" Halo: a pale
// plate with a dark tournament stamp, a pale pink-lavender wash that bleeds across the inner part of the band,
// and a saturated purple dye that concentrates toward the outer edge, unevenly around the circle (a wavy dye
// front plus spiral wash streaks reaching outward). Lit like a phone photo: a soft top-to-bottom light falloff
// and the rim's curvature darkening the last few percent of the radius. Deterministic, pure JS (no DOM), so
// Node tests and the browser suite draw the same pixels.
//
// DYE is the ground truth: the colour a person names when they look at the band. WASH and PLATE are the other
// plastic colours. Everything is painted in linear light and encoded to sRGB.
export const DYE='#6b2d8f',WASH='#dcb6d8',PLATE='#efe7ec',INK='#22253a';
// The Wraith's rim seam (R − PDGA rim width), where the band begins on the model.
export const SEAM=.801;

const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const enc=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.max(0,v)**(1/2.4)-.055));
const rgb=hex=>[1,3,5].map(i=>lin(parseInt(hex.slice(i,i+2),16)));
const smooth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const [dye,wash,plate,ink]=[DYE,WASH,PLATE,INK].map(rgb);

// v2 (docs/halo-band-v2.md): the asymmetric swirl, closer to Freddy's zoomed photo. The plate and wash are
// marbled (white clouds through pale pink), the dye front is lopsided (it advances on one side of the disc and
// retreats on the other, wobbling as it goes), the purple feathers into the wash over a few hundredths of R,
// and faint white wisps run tangentially through the dye. ASYM_FEATHER is that drawn feather (the 10–90%
// width of the dye's take-over, as a share of R).
export const ASYM_FEATHER=.045;
const hash=(i,j)=>{const s=Math.sin(i*127.1+j*311.7)*43758.5453;return s-Math.floor(s);};
function noise(x,y){
 const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,s=q=>q*q*(3-2*q);
 const a=hash(i,j),b=hash(i+1,j),c=hash(i,j+1),d=hash(i+1,j+1);
 return a+(b-a)*s(u)+(c-a)*s(v)+(a-b-c+d)*s(u)*s(v);
}
const fbm=(x,y)=>.5*noise(x,y)+.3*noise(2.1*x+5.3,2.1*y+1.7)+.2*noise(4.3*x+9.1,4.3*y+3.3);
// Where the asymmetric dye front sits at angle a (share of R): lopsided (the first harmonic), wobbling.
export const asymFront=a=>.905+.035*Math.sin(a+1.3)+.018*Math.sin(2*a+.4)+.01*Math.sin(5*a+2.2);
// The drawn front: the radius where the dye takes over from the wash (its share crosses one half). For the
// asymmetric swirl this is the ground truth a sampled front is measured against.
export function drawnFront(a,options={}){
 for(let t=.80;t<=1;t+=.0005)if(dyeShare(t,a,options)>=.5)return t;
 return 1;
}
function dyeShare(t,a,{front:f0=.88,asym=false}={}){
 // smoothstep climbs from 10% to 90% over 0.608 of its span, so a span of ASYM_FEATHER/0.608 draws that width.
 if(asym){const f=asymFront(a),h=ASYM_FEATHER/.608/2;return smooth(f-h,f+h,t);}
 const front=f0+.025*Math.sin(3*a+.7)+.015*Math.sin(7*a+2.1);
 const streak=Math.max(0,Math.cos(5*(a+2.6*t)+.4))**6;
 return smooth(front-.03,front+.05,t)*(1-.75*streak*(1-smooth(.95,.99,t)));
}

// The paint at radius t (share of R) and angle a, before lighting. Returns linear RGB.
// Variants: `front` moves the dye front (0.93: the dye only in the outermost tenth), `pure` paints the band
// solid dye from the seam (the control: what the pipeline makes of the dye itself, with no wash), `asym` is
// the v2 asymmetric marbled swirl above, and `washOnly` paints that swirl's wash with no dye (its control).
export function paint(t,a,{front:f0=.88,pure=false,asym=false,washOnly=false}={}){
 if(asym||washOnly){
  const x=t*Math.cos(a),y=t*Math.sin(a),cloud=smooth(.5,.8,fbm(6*x+11,6*y+7));
  let c=mix(mix(plate,wash,smooth(.70,.80,t)),[1,1,1],(washOnly?0:.35)*cloud);
  if(washOnly)return stamp(t,a,c);
  // Tangential wisps: thin, broken streaks that run around the ring.
  const wisp=Math.max(0,Math.sin(140*t+5*Math.sin(2*a+1)))**10*(.5+.5*Math.sin(3*a+2));
  c=mix(c,mix(dye,[1,1,1],.3*wisp),dyeShare(t,a,{asym:true}));
  return stamp(t,a,c);
 }
 // Pale centre → wash ring (from 0.72 R, so the wash is already there at the seam, as on the real disc).
 let c=mix(plate,wash,smooth(.70,.80,t));
 if(pure)return stamp(t,a,mix(c,dye,smooth(.78,.80,t)));
 // The dye front wanders around the circle (0.84–0.92 R), and spiral wash streaks cut back into the dye.
 const front=f0+.025*Math.sin(3*a+.7)+.015*Math.sin(7*a+2.1);
 let p=smooth(front-.03,front+.05,t);
 const streak=Math.max(0,Math.cos(5*(a+2.6*t)+.4))**6;
 p*=1-.75*streak*(1-smooth(.95,.99,t));
 return stamp(t,a,mix(c,dye,p));
}
// The stamp: a ring and a few bars of dark ink inside the plate.
function stamp(t,a,c){
 const x=t*Math.cos(a),y=t*Math.sin(a);
 return Math.abs(t-.52)<.018||(Math.abs(y)<.05&&Math.abs(x)<.38&&Math.abs(Math.sin(x*40))>.3)||(Math.abs(y+.14)<.02&&Math.abs(x)<.25)?ink:c;
}

// Light: brighter at the top of the photo (y < 0), and the rim's curve falling away at the very edge
// (`shadeFrom`/`shade`: from 0.95 R, 28% darker at the edge; 0.88/0.45 is a harder-lit rim). `glare`: a clipped
// white reflection across the band and plate (a wedge, as in the glare suite).
const light=(x,y,t,{shadeFrom=.95,shade=.28}={})=>(1-.12*y)*(1-shade*smooth(shadeFrom,1,t));
const glared=(t,a,{glare=false}={})=>glare&&t>.6&&a>-1.1&&a<-.8;

// The aligner's crop: size × size RGBA, the disc filling the circle (as photoCanvas returns at the default
// framing for a disc drawn at 0.47 of the image), with the same one-pixel alpha feather at the edge.
export function swirlCrop(size=1024,options={}){
 const data=new Uint8ClampedArray(size*size*4);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,t=Math.hypot(x,y),k=(j*size+i)*4;if(t>1)continue;
  const a=Math.atan2(y,x),c=paint(t,a,options),l=light(x,y,t,options);
  for(let ch=0;ch<3;ch++)data[k+ch]=glared(t,a,options)?255:enc(c[ch]*l);
  data[k+3]=Math.round(255*Math.min(1,(1-t)*size/2));
 }
 return data;
}

// A whole "photo": the disc at 0.47 of the image on a dark table, for the real editor upload.
export function swirlPhoto(n=1024,options={}){
 const data=new Uint8ClampedArray(n*n*4),r=n*.47,c=n/2;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const k=(j*n+i)*4,x=(i+.5-c)/r,y=(j+.5-c)/r,t=Math.hypot(x,y);data[k+3]=255;
  if(t>1){data[k]=0x2a;data[k+1]=0x2d;data[k+2]=0x33;continue;}
  const a=Math.atan2(y,x),col=paint(t,a,options),l=light(x,y,t,options);for(let ch=0;ch<3;ch++)data[k+ch]=glared(t,a,options)?255:enc(col[ch]*l);
 }
 return data;
}
