// Synthetic disc photos with known truth for the glare experiment (docs/photo-glare-experiment.md). Shared by
// tests/photo-albedo.mjs (numbers) and tests/photo-glare-ab-browser.mjs (the side-by-side renders), so the
// pairs Freddy judges are the inputs the assertions measure. Pure JS: runs in Node and in the browser.
// A photo is an albedo (plate colour, a navy stamp ring, optional white or yellow ink) lit from above under a
// warm bulb, plus optional glare: room light reflected off the gloss, added in linear light as a near-white
// Gaussian hotspot (or an elongated streak, a tube light), then sRGB-encoded and clipped like a camera would.
const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const enc=v=>Math.round(255*(v<=.0031308?v*12.92:1.055*Math.min(1,v)**(1/2.4)-.055));
export function glarePhoto({size=512,plate=[40,140,150],white=false,whiteBright=false,yellow=false,glare=[],light=y=>1.35-.45*(y+1),cast=[1.1,1,.82]}={}){
 const data=new Uint8ClampedArray(size*size*4),truth=new Uint8ClampedArray(size*size*4),added=new Float32Array(size*size);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,k=(j*size+i)*4,p=j*size+i;
  if(Math.hypot(x,y)>1)continue;
  let c=plate;
  if(Math.hypot(x,y+.05)<.22&&Math.abs(y+.05)>.06)c=[20,24,40];           // stamp: a navy ring
  if(white&&x>.25&&x<.45&&y>-.5&&y<-.32)c=[250,250,246];                  // white ink block
  if(yellow&&x>-.5&&x<-.3&&y>.3&&y<.42)c=[236,196,40];                     // yellow ink block
  truth.set([...c,255],k);
  // Glare: amplitude a (linear, relative to full scale), centre (gx,gy), widths (sx,sy) and turn.
  let g=0;for(const {a,x:gx,y:gy,sx,sy=sx,turn=0} of glare){
   const u=(x-gx)*Math.cos(turn)+(y-gy)*Math.sin(turn),v=-(x-gx)*Math.sin(turn)+(y-gy)*Math.cos(turn);
   g+=a*Math.exp(-(u*u/(2*sx*sx)+v*v/(2*sy*sy)));
  }
  added[p]=g;
  const l=light(y)*(whiteBright&&c[0]===250?1.25:1);
  for(let ch=0;ch<3;ch++)data[k+ch]=enc(lin(c[ch])*l*cast[ch]+g*cast[ch]);data[k+3]=255;
 }
 return {data,truth,added,size};
}
// The A/B set: one with no glare (the two renders must match), the glare cases, and the white-ink guard.
export const GLARE_CASES={
 'no-glare':{white:true},
 'hotspot':{glare:[{a:1.6,x:.22,y:-.42,sx:.07}]},
 'hotspot-on-stamp':{yellow:true,glare:[{a:1.4,x:-.2,y:.14,sx:.09}]},
 'tube-streak':{glare:[{a:1.2,x:-.05,y:.45,sx:.32,sy:.035,turn:.35}]},
 'dark-disc':{plate:[28,30,90],glare:[{a:1.5,x:.3,y:.3,sx:.06}]},
 'white-ink-clipped':{white:true,whiteBright:true}
};
