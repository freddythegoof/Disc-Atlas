// Stamp pipeline v2, step 4 (docs/stamp-pipeline-v2.md): stamp separation, not background removal. Pure JS on an RGBA
// crop (the disc filling the unit circle, as production's crop), at whatever resolution the crop is: the caller hands it
// the photo's own pixels, never a resized copy.
//
//  1. Plastic: the dominant colour inside the plate, in Lab, then a smooth local field of it (cells of bare plastic,
//     holes filled from their neighbours, bilinear), so shading and a slow white-balance drift belong to the plastic.
//  2. Distance: each pixel's ΔE (CIE76) from the plastic field under it. Noise is measured from the plate itself.
//  3. Marks: seeds at ΔE ≥ hi, grown through ΔE ≥ lo (hysteresis), 8-connected.
//  4. Local contrast and colour: a blotch of mottled plastic, a shading band or a pen mark seen through translucent
//     plastic is the plastic's own colour, faint, and fades in over many pixels (its edge width: its contrast over the mean
//     gradient of lightly smoothed ΔE in the band between its own 35% and 75% contours). Print is its own colour, or
//     strong, or sharp. No area floor beyond a few seed pixels: a thin "l"
//     or an "i" dot is kept whatever its size.
//  5. Alpha: coverage, the share of the way from the plastic to the ink beside it (ΔE over the local strongest ΔE).
import {rgbToLab} from '../../public/disc-stamp-extract.mjs';

// GRID: plastic-field cells across the crop. NEAR: ΔE from the global plastic a pixel may be and still count as plastic
// when the field is built (generous: shading moves it). SEED_PX: fewest seed pixels a mark needs (px at 1024).
export const TUNING={GRID:48,NEAR:14,LO_SIGMA:4,HI_SIGMA:8,LO_MIN:4,HI_MIN:8,PLATE_HUE:8,FAINT:20,SOFT:5,SHADE:12,GHOST_HUE:6,GHOST_SOFT:4,WHITE:40,SEED_PX:2,CHAIN:6,INK:.85,WEAK_AREA:400,MARGIN:3};

export function separate(rgba,size,{plate=.8,seeThrough=false,tuning={}}={}){
 const T={...TUNING,...tuning},N=size*size,k=size/1024,c=size/2,reach=plate*c-T.MARGIN*k;
 const L=new Float32Array(N),A=new Float32Array(N),B=new Float32Array(N),inside=new Uint8Array(N);
 for(let p=0;p<N;p++){
  const i=p%size,j=(p-i)/size;if(Math.hypot(i+.5-c,j+.5-c)>reach||rgba[p*4+3]<250)continue;
  inside[p]=1;const [l,a,b]=rgbToLab(rgba[p*4],rgba[p*4+1],rgba[p*4+2]);L[p]=l;A[p]=a;B[p]=b;
 }
 // 1. The dominant plastic colour: the densest cell of a Lab histogram over the plate (box-smoothed), then the median of
 // what lies near it. The plastic is the largest single colour on a plate even where print covers most of it (the DD3).
 const med=(arr,keep)=>{const s=[];for(let p=0;p<N;p+=3)if(inside[p]&&keep(p))s.push(arr[p]);s.sort((x,y)=>x-y);return s[s.length>>1];};
 const HB=4,nl=26,na=51,hist=new Float32Array(nl*na*na),bin=p=>{const l=Math.min(nl-1,Math.max(0,L[p]/HB|0)),a=Math.min(na-1,Math.max(0,(A[p]+102)/HB|0)),b=Math.min(na-1,Math.max(0,(B[p]+102)/HB|0));return (l*na+a)*na+b;};
 for(let p=0;p<N;p+=3)if(inside[p])hist[bin(p)]++;
 let bestBin=0,bestCount=-1;
 for(let l=0;l<nl;l++)for(let a=1;a<na-1;a++)for(let b=1;b<na-1;b++){let s=0;for(let dl=-1;dl<=1;dl++){const ll=l+dl;if(ll<0||ll>=nl)continue;for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++)s+=hist[(ll*na+a+da)*na+b+db];}
  if(s>bestCount){bestCount=s;bestBin=(l*na+a)*na+b;}}
 const bb=bestBin%na,ba=((bestBin-bb)/na)%na,bl=(bestBin-bb-ba*na)/(na*na);
 let g=[(bl+.5)*HB,(ba+.5)*HB-102,(bb+.5)*HB-102];
 for(let r=0;r<2;r++){const near=p=>Math.hypot(L[p]-g[0],A[p]-g[1],B[p]-g[2])<T.NEAR;g=[med(L,near),med(A,near),med(B,near)];}
 // The local field: per cell, the mean of near-plastic pixels, refined once against the cell's own mean.
 const G=T.GRID,cell=size/G,FL=new Float32Array(G*G),FA=new Float32Array(G*G),FB=new Float32Array(G*G),ok=new Uint8Array(G*G);
 const cellOf=p=>{const i=p%size,j=(p-i)/size;return Math.min(G-1,j/cell|0)*G+Math.min(G-1,i/cell|0);};
 const pass=(ref,limit)=>{const sL=new Float64Array(G*G),sA=new Float64Array(G*G),sB=new Float64Array(G*G),n=new Float64Array(G*G),all=new Float64Array(G*G);
  for(let p=0;p<N;p++){if(!inside[p])continue;const q=cellOf(p),[rl,ra,rb]=ref(q);all[q]++;
   if(Math.hypot(L[p]-rl,A[p]-ra,B[p]-rb)<limit){sL[q]+=L[p];sA[q]+=A[p];sB[q]+=B[p];n[q]++;}}
  for(let q=0;q<G*G;q++){ok[q]=all[q]>8&&n[q]>=.2*all[q];if(ok[q]){FL[q]=sL[q]/n[q];FA[q]=sA[q]/n[q];FB[q]=sB[q]/n[q];}}};
 pass(()=>g,T.NEAR);pass(q=>ok[q]?[FL[q],FA[q],FB[q]]:g,T.NEAR/2);
 // Holes (cells under dense print, or outside the plate) take their filled neighbours' mean until none is left.
 for(let left=1,guard=0;left&&guard<4*G;guard++){left=0;const add=[];
  for(let q=0;q<G*G;q++){if(ok[q])continue;const x=q%G,y=(q-x)/G;let n=0,l=0,a=0,b=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=G||Y>=G)continue;const r=Y*G+X;if(ok[r]){n++;l+=FL[r];a+=FA[r];b+=FB[r];}}
   if(n)add.push([q,l/n,a/n,b/n]);else left++;}
  for(const [q,l,a,b] of add){FL[q]=l;FA[q]=a;FB[q]=b;ok[q]=1;}if(!add.length)break;}
 const blur=F=>{const out=new Float32Array(G*G);for(let q=0;q<G*G;q++){const x=q%G,y=(q-x)/G;let n=0,s=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=G||Y>=G)continue;n++;s+=F[Y*G+X];}out[q]=s/n;}return out;};
 const fL=blur(FL),fA=blur(FA),fB=blur(FB);
 // 2. ΔE from the field, sampled bilinearly at cell centres.
 const dE=new Float32Array(N),pL=new Float32Array(N),pA=new Float32Array(N),pB=new Float32Array(N);
 for(let p=0;p<N;p++){if(!inside[p])continue;const i=p%size,j=(p-i)/size;
  const u=Math.min(G-1.001,Math.max(0,(i+.5)/cell-.5)),v=Math.min(G-1.001,Math.max(0,(j+.5)/cell-.5)),x=u|0,y=v|0,fx=u-x,fy=v-y;
  const at=(F)=>(F[y*G+x]*(1-fx)+F[y*G+x+1]*fx)*(1-fy)+(F[(y+1)*G+x]*(1-fx)+F[(y+1)*G+x+1]*fx)*fy;
  pL[p]=at(fL);pA[p]=at(fA);pB[p]=at(fB);dE[p]=Math.hypot(L[p]-pL[p],A[p]-pA[p],B[p]-pB[p]);}
 // Noise from the plastic alone (pixels near it), not the plate: print may cover most of a plate.
 const sample=[];for(let p=0;p<N;p+=5)if(inside[p]&&dE[p]<T.NEAR)sample.push(dE[p]);sample.sort((x,y)=>x-y);
 const m=sample[sample.length>>1],mad=[...sample.map(v=>Math.abs(v-m))].sort((x,y)=>x-y)[sample.length>>1],sigma=1.4826*mad;
 const lo=Math.max(T.LO_MIN,m+T.LO_SIGMA*sigma),hi=Math.max(T.HI_MIN,m+T.HI_SIGMA*sigma,1.6*lo);
 // 3. Hysteresis marks: seeds at `seed` and above, grown through lo, 8-connected; pixels already in a mark are left.
 const label=new Int32Array(N).fill(-1),stack=new Int32Array(N),order=new Int32Array(N),marks=[];let filled=0;
 const grow=(seed,weak)=>{const from=marks.length;
  for(let p0=0;p0<N;p0++){
   if(label[p0]>=0||!inside[p0]||dE[p0]<seed)continue;
   const id=marks.length,mk={id,area:0,seeds:0,sum:0,start:filled,rim:false,weak,x0:size,y0:size,x1:0,y1:0};marks.push(mk);
   let top=0;stack[top++]=p0;label[p0]=id;
   while(top){const p=stack[--top],i=p%size,j=(p-i)/size;order[filled++]=p;mk.area++;mk.sum+=dE[p];if(dE[p]>=seed)mk.seeds++;
    if(i<mk.x0)mk.x0=i;if(i>mk.x1)mk.x1=i;if(j<mk.y0)mk.y0=j;if(j>mk.y1)mk.y1=j;if(!mk.rim&&Math.hypot(i+.5-c,j+.5-c)>reach-2*k)mk.rim=true;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=i+dx,Y=j+dy;if(X<0||Y<0||X>=size||Y>=size)continue;
     const q=Y*size+X;if(inside[q]&&dE[q]>=lo&&label[q]<0){label[q]=id;stack[top++]=q;}}}
  }
  return marks.slice(from);};
 // 4. Local contrast and colour. Seen-through (`seeThrough`): a mark on the plastic's far side is the plastic darkened,
 // the same colour at a lower level (linear RGB along the plastic's own direction), faint and soft. Print, even black,
 // is its own colour.
 const lin=(l,a,b)=>{const fy=(l+16)/116,fx=fy+a/500,fz=fy-b/200,inv=t=>t>6/29?t**3:3*(6/29)**2*(t-4/29);
  const X=.95047*inv(fx),Y=inv(fy),Z=1.08883*inv(fz);return [3.2406*X-1.5372*Y-.4986*Z,-.9689*X+1.8758*Y+.0415*Z,.0557*X-.204*Y+1.057*Z];};
 // Edge width: the mark's contrast over the mean gradient in the band between its own 35% and 75% contours, on ΔE
 // box-smoothed over about 1 px at 1024 (noise out, an edge only slightly softened), in px at 1024.
 const r=Math.max(1,Math.round(k)),sm=new Float32Array(N),tmp=new Float32Array(N);
 for(let j=0;j<size;j++){let acc=0;for(let i=-r;i<size+r;i++){const add=i+r<size?dE[j*size+i+r]:0,sub=i-r-1>=0?dE[j*size+i-r-1]:0;acc+=add-sub;if(i>=0&&i<size)tmp[j*size+i]=acc/(2*r+1);}}
 for(let i=0;i<size;i++){let acc=0;for(let j=-r;j<size+r;j++){const add=j+r<size?tmp[(j+r)*size+i]:0,sub=j-r-1>=0?tmp[(j-r-1)*size+i]:0;acc+=add-sub;if(j>=0&&j<size)sm[j*size+i]=acc/(2*r+1);}}
 const gradAt=p=>{const i=p%size,j=(p-i)/size;if(i<1||j<1||i>=size-1||j>=size-1)return 0;return Math.hypot(sm[p+1]-sm[p-1],sm[p+size]-sm[p-size])/2;};
 const judge=mk=>{
  const px=order.subarray(mk.start,mk.start+mk.area),vals=Float32Array.from(px,p=>dE[p]).sort(),c=vals[Math.floor(.95*(vals.length-1))];
  const t1=Math.max(lo,m+.35*(c-m)),t2=Math.max(t1+1e-3,m+.75*(c-m)),M=[0,0,0],P=[0,0,0];let core=0,gsum=0,gn=0;
  for(const p of px){if(dE[p]<t1)continue;if(dE[p]<t2){gsum+=gradAt(p);gn++;continue;}core++;
   const x=lin(L[p],A[p],B[p]),y=lin(pL[p],pA[p],pB[p]);for(let q=0;q<3;q++){M[q]+=x[q];P[q]+=y[q];}}
  const D=[M[0]-P[0],M[1]-P[1],M[2]-P[2]];mk.whiteOff=core?Math.acos(Math.min(1,(D[0]+D[1]+D[2])/Math.max(1e-9,Math.sqrt(3)*Math.hypot(...D))))*180/Math.PI:90;
  const width=gn?(c-m)/Math.max(1e-3,gsum/gn)/k:99,dot=M[0]*P[0]+M[1]*P[1]+M[2]*P[2],nm=Math.hypot(...M),np=Math.hypot(...P);
  mk.contrast=c-m;mk.width=width;mk.hueOff=core?Math.acos(Math.min(1,dot/Math.max(1e-9,nm*np)))*180/Math.PI:0;mk.level=core?nm/Math.max(1e-9,np):1;
  // Broad: wider, both ways, than twice its own edge. A small letter's measured width means little; it is never broad.
  const broad=Math.min(mk.x1-mk.x0+1,mk.y1-mk.y0+1)/k>=2*width;
  // Plastic, not print: the plastic's own colour (its direction in linear RGB), faint and soft-edged. Lighter than the
  // plastic (a sheen, a rim highlight, a pale patch of glow, a Champion's injection gate) needs only a soft edge, at any
  // size; darker, a very soft and broad one (shading): faint print in the plastic's own hue is darker and tighter (the
  // Destroyer's GOLF, the Berg's small T).
  mk.blotch=mk.hueOff<=T.PLATE_HUE&&mk.contrast<=T.FAINT&&(mk.level>1?width>=T.SOFT:broad&&width>=T.SHADE);
  // Light on the rim: a soft mark that reaches the plate's edge and is the plastic plus white light (its difference from
  // the plastic points toward white) is the shoulder catching the light: a sheen, the rim wall's highlight. Foil printed
  // to the edge is its own colour (the Raptor's red ring).
  mk.sheen=broad&&mk.rim&&mk.level>1&&mk.whiteOff<=T.WHITE&&width>=T.SOFT;
  mk.ghost=seeThrough&&mk.hueOff<=T.GHOST_HUE&&mk.level<1&&mk.contrast<=T.FAINT&&width>=T.GHOST_SOFT;
  mk.plastic=mk.blotch||mk.sheen||mk.ghost;
 };
 const minSeeds=Math.max(2,T.SEED_PX*k*k);
 for(const mk of grow(hi,false)){judge(mk);mk.keep=mk.seeds>=minSeeds&&!mk.plastic;}
 // The weak pass (a word's faintest letters, like the Berg's last H): seeds halfway between lo and hi. A faint mark, or a
 // strong one too small to stand alone, is kept only beside print already kept (within CHAIN px at 1024 of its box),
 // in up to three rounds, and never when it reads as plastic.
 for(const mk of grow((lo+hi)/2,true))judge(mk);
 const near=(a,b)=>{const g=T.CHAIN*k;return a.x0-g<=b.x1&&b.x0-g<=a.x1&&a.y0-g<=b.y1&&b.y0-g<=a.y1;};
 for(let round=0;round<3;round++){const kept=marks.filter(x=>x.keep);let added=0;
  for(const mk of marks)if(!mk.keep&&!mk.plastic&&mk.seeds>=2&&mk.area<=T.WEAK_AREA*k*k&&kept.some(x=>near(mk,x))){mk.keep=mk.chained=true;added++;}
  if(!added)break;}
 const keep=Uint8Array.from(marks,x=>x.keep?1:0);
 // 5. Alpha is coverage: how much of the way from the plastic to the ink beside it a pixel is (its ΔE over the strongest
 // ΔE within about 2 px at 1024, a separable max filter), so a strong print's blur tail is not drawn as ink and a
 // stroke keeps its weight, while one mark of mixed inks (black line work round silver foil, the Destroyer) gives each
 // ink its own full level. A pixel at hi or over is ink, full: coverage only shapes the edge's tail (a dark line between
 // brighter foil is not part-ink). The colour pass reads the pixels at half coverage or more; a ring round each kept mark
 // takes its coverage too (the anti-aliased edge the hysteresis stopped short of).
 const R=Math.max(1,Math.round(2*k)),lmx=new Float32Array(N),lm=new Float32Array(N);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let v=0;for(let d=-R;d<=R;d++){const X=i+d;if(X>=0&&X<size&&dE[j*size+X]>v)v=dE[j*size+X];}lmx[j*size+i]=v;}
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let v=0;for(let d=-R;d<=R;d++){const Y=j+d;if(Y>=0&&Y<size&&lmx[Y*size+i]>v)v=lmx[Y*size+i];}lm[j*size+i]=v;}
 const alpha=new Uint8ClampedArray(N),mask=new Uint8Array(N),cover=p=>dE[p]>=hi?1:Math.min(1,Math.max(0,(dE[p]-m)/Math.max(1e-3,T.INK*(lm[p]-m))));
 for(let p=0;p<N;p++){const id=label[p];if(id<0||!keep[id])continue;const a=cover(p);alpha[p]=Math.round(255*a);if(a>=.5)mask[p]=1;}
 const ring=Math.max(1,Math.round(k));
 for(let p=0;p<N;p++){const id=label[p];if(id<0||!keep[id])continue;const i=p%size,j=(p-i)/size;
  for(let dy=-ring;dy<=ring;dy++)for(let dx=-ring;dx<=ring;dx++){const X=i+dx,Y=j+dy;if(X<0||Y<0||X>=size||Y>=size)continue;const q=Y*size+X;
   if(inside[q]&&(label[q]<0||!keep[label[q]]))alpha[q]=Math.max(alpha[q],Math.round(255*cover(q)));}}
 const kept=marks.filter(mk=>keep[mk.id]),dropped=marks.filter(mk=>!keep[mk.id]);
 return {alpha,mask,plastic:g.map(v=>+v.toFixed(2)),thresholds:{median:+m.toFixed(2),sigma:+sigma.toFixed(2),lo:+lo.toFixed(2),hi:+hi.toFixed(2),minSeeds:+minSeeds.toFixed(1)},
  marks:{kept:kept.length,chained:kept.filter(mk=>mk.chained).length,dropped:dropped.length,droppedArea:dropped.reduce((s,mk)=>s+mk.area,0)},all:marks,label,dE,field:{pL,pA,pB}};
}
