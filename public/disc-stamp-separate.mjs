// Stamp blotch veto (docs/stamp-pipeline-v2.md §9–10): where on a crop there is print, read a second way, so ink the
// extractor accepts with no print near it can be dropped. Today's extractor judges ink by thresholds on a de-lit crop;
// on near-neutral glow plastic (the Berg) a sub-1-level change in resampling tips large patches of mottled plastic over
// them (the blotch). This read is built on the plastic itself, so it holds where the thresholds tip.
//  1. Plastic: the plate's dominant colour (the densest cell of a Lab histogram, then the median near it: the plastic is
//     the largest single colour even where print covers most of the plate, the DD3), and a smooth local field of it.
//  2. Distance: each pixel's ΔE from the field under it; noise from the plastic's own pixels.
//  3. Marks: seeds at hi grown through lo; a weak pass keeps faint marks beside print already kept (a word's last H).
//  4. Plastic, not print (blotch, sheen, ghost): the plastic's own colour, faint and soft-edged; the rim's sheen; on
//     see-through plastic, a mark from the far side.
// Pure JS, no DOM, for the stamp worker. About 100 MB at 2048, all freed on return.
import {rgbToLab} from './disc-stamp-extract.mjs';

// GRID: plastic-field cells across the crop. NEAR: ΔE from the plastic a pixel may be and still be plastic when the field
// is built (shading moves it). LO_/HI_: the hysteresis thresholds, in noise σ above the plastic's median ΔE, with floors.
// PLATE_HUE, FAINT, SOFT, SHADE, GHOST_*, WHITE: the plastic tests (degrees off the plastic's colour, ΔE, edge width in px
// at 1024). SEED_PX, CHAIN, WEAK_AREA: px at 1024. MARGIN: px at 1024 inside the plate's edge. GROW: the support's reach
// past a kept mark, px at 1024. Fitted on seven photos (§1 there); the controls hold them byte-identical (§9).
export const SEPARATE={GRID:48,NEAR:14,LO_SIGMA:4,HI_SIGMA:8,LO_MIN:4,HI_MIN:8,PLATE_HUE:8,FAINT:20,SOFT:5,SHADE:12,GHOST_HUE:6,GHOST_SOFT:4,WHITE:40,SEED_PX:2,CHAIN:6,WEAK_AREA:400,MARGIN:3,GROW:2.5};
const lin=(l,a,b)=>{const fy=(l+16)/116,fx=fy+a/500,fz=fy-b/200,inv=t=>t>6/29?t**3:3*(6/29)**2*(t-4/29);
 const X=.95047*inv(fx),Y=inv(fy),Z=1.08883*inv(fz);return [3.2406*X-1.5372*Y-.4986*Z,-.9689*X+1.8758*Y+.0415*Z,.0557*X-.204*Y+1.057*Z];};

// `rgba`: the crop as the extractor gets it, before any pass changes it (on a clear disc, with its stamp's shadow taken
// out). Returns the print support: 1 where print is, or within GROW of it.
export function printSupport(rgba,size,{plate=.8,seeThrough=false}={}){
 const T=SEPARATE,N=size*size,k=size/1024,c=size/2,reach=plate*c-T.MARGIN*k;
 let lab=new Float32Array(3*N);const inside=new Uint8Array(N);
 for(let p=0;p<N;p++){
  const i=p%size,j=(p-i)/size;if(Math.hypot(i+.5-c,j+.5-c)>reach||rgba[p*4+3]<250)continue;
  inside[p]=1;const v=rgbToLab(rgba[p*4],rgba[p*4+1],rgba[p*4+2]);lab[3*p]=v[0];lab[3*p+1]=v[1];lab[3*p+2]=v[2];
 }
 // 1. The plastic.
 const med=(o,keep)=>{const s=[];for(let p=0;p<N;p+=3)if(inside[p]&&keep(p))s.push(lab[3*p+o]);s.sort((x,y)=>x-y);return s[s.length>>1];};
 const HB=4,nl=26,na=51,hist=new Float32Array(nl*na*na);
 for(let p=0;p<N;p+=3)if(inside[p]){const l=Math.min(nl-1,Math.max(0,lab[3*p]/HB|0)),a=Math.min(na-1,Math.max(0,(lab[3*p+1]+102)/HB|0)),b=Math.min(na-1,Math.max(0,(lab[3*p+2]+102)/HB|0));hist[(l*na+a)*na+b]++;}
 let best=0,most=-1;
 for(let l=0;l<nl;l++)for(let a=1;a<na-1;a++)for(let b=1;b<na-1;b++){let s=0;for(let dl=-1;dl<=1;dl++){const ll=l+dl;if(ll<0||ll>=nl)continue;for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++)s+=hist[(ll*na+a+da)*na+b+db];}
  if(s>most){most=s;best=(l*na+a)*na+b;}}
 const bb=best%na,ba=((best-bb)/na)%na,bl=(best-bb-ba*na)/(na*na);
 let g=[(bl+.5)*HB,(ba+.5)*HB-102,(bb+.5)*HB-102];
 const dist=(p,l,a,b)=>Math.hypot(lab[3*p]-l,lab[3*p+1]-a,lab[3*p+2]-b);
 for(let r=0;r<2;r++){const near=p=>dist(p,g[0],g[1],g[2])<T.NEAR;g=[med(0,near),med(1,near),med(2,near)];}
 // The local field: per cell, the mean of near-plastic pixels, refined once against the cell's own mean; holes take
 // their filled neighbours' mean; one 3×3 smoothing; sampled bilinearly at cell centres.
 const G=T.GRID,cell=size/G,FL=new Float32Array(G*G),FA=new Float32Array(G*G),FB=new Float32Array(G*G),ok=new Uint8Array(G*G);
 const cellOf=p=>{const i=p%size,j=(p-i)/size;return Math.min(G-1,j/cell|0)*G+Math.min(G-1,i/cell|0);};
 const pass=(ref,limit)=>{const sL=new Float64Array(G*G),sA=new Float64Array(G*G),sB=new Float64Array(G*G),n=new Float64Array(G*G),all=new Float64Array(G*G);
  for(let p=0;p<N;p++){if(!inside[p])continue;const q=cellOf(p),[rl,ra,rb]=ref(q);all[q]++;
   if(dist(p,rl,ra,rb)<limit){sL[q]+=lab[3*p];sA[q]+=lab[3*p+1];sB[q]+=lab[3*p+2];n[q]++;}}
  for(let q=0;q<G*G;q++){ok[q]=all[q]>8&&n[q]>=.2*all[q];if(ok[q]){FL[q]=sL[q]/n[q];FA[q]=sA[q]/n[q];FB[q]=sB[q]/n[q];}}};
 pass(()=>g,T.NEAR);pass(q=>ok[q]?[FL[q],FA[q],FB[q]]:g,T.NEAR/2);
 for(let guard=0;guard<4*G;guard++){const add=[];
  for(let q=0;q<G*G;q++){if(ok[q])continue;const x=q%G,y=(q-x)/G;let n=0,l=0,a=0,b=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=G||Y>=G)continue;const r=Y*G+X;if(ok[r]){n++;l+=FL[r];a+=FA[r];b+=FB[r];}}
   if(n)add.push([q,l/n,a/n,b/n]);}
  for(const [q,l,a,b] of add){FL[q]=l;FA[q]=a;FB[q]=b;ok[q]=1;}if(!add.length)break;}
 const blur=F=>{const out=new Float32Array(G*G);for(let q=0;q<G*G;q++){const x=q%G,y=(q-x)/G;let n=0,s=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=G||Y>=G)continue;n++;s+=F[Y*G+X];}out[q]=s/n;}return out;};
 const fL=blur(FL),fA=blur(FA),fB=blur(FB);
 // Every Lab value is single precision (Math.fround), as the lab measured it: the marks at the thresholds' edge follow.
 const field=p=>{const i=p%size,j=(p-i)/size,u=Math.min(G-1.001,Math.max(0,(i+.5)/cell-.5)),v=Math.min(G-1.001,Math.max(0,(j+.5)/cell-.5)),x=u|0,y=v|0,fx=u-x,fy=v-y;
  const at=F=>Math.fround((F[y*G+x]*(1-fx)+F[y*G+x+1]*fx)*(1-fy)+(F[(y+1)*G+x]*(1-fx)+F[(y+1)*G+x+1]*fx)*fy);return [at(fL),at(fA),at(fB)];};
 // 2. Distance. The Lab copy is let go here; a mark's core reads its colour from the crop again.
 const dE=new Float32Array(N);
 for(let p=0;p<N;p++)if(inside[p]){const f=field(p);dE[p]=dist(p,f[0],f[1],f[2]);}
 lab=null;
 const sample=[];for(let p=0;p<N;p+=5)if(inside[p]&&dE[p]<T.NEAR)sample.push(dE[p]);sample.sort((x,y)=>x-y);
 const m=sample[sample.length>>1],mad=sample.map(v=>Math.abs(v-m)).sort((x,y)=>x-y)[sample.length>>1],sigma=1.4826*mad;
 const lo=Math.max(T.LO_MIN,m+T.LO_SIGMA*sigma),hi=Math.max(T.HI_MIN,m+T.HI_SIGMA*sigma,1.6*lo);
 // 3. Marks.
 const label=new Int32Array(N).fill(-1),stack=new Int32Array(N),order=new Int32Array(N),marks=[];let filled=0;
 const grow=seed=>{const from=marks.length;
  for(let p0=0;p0<N;p0++){
   if(label[p0]>=0||!inside[p0]||dE[p0]<seed)continue;
   const id=marks.length,mk={id,area:0,seeds:0,sum:0,start:filled,rim:false,x0:size,y0:size,x1:0,y1:0};marks.push(mk);
   let top=0;stack[top++]=p0;label[p0]=id;
   while(top){const p=stack[--top],i=p%size,j=(p-i)/size;order[filled++]=p;mk.area++;mk.sum+=dE[p];if(dE[p]>=seed)mk.seeds++;
    if(i<mk.x0)mk.x0=i;if(i>mk.x1)mk.x1=i;if(j<mk.y0)mk.y0=j;if(j>mk.y1)mk.y1=j;if(!mk.rim&&Math.hypot(i+.5-c,j+.5-c)>reach-2*k)mk.rim=true;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=i+dx,Y=j+dy;if(X<0||Y<0||X>=size||Y>=size)continue;
     const q=Y*size+X;if(inside[q]&&dE[q]>=lo&&label[q]<0){label[q]=id;stack[top++]=q;}}}
  }
  return marks.slice(from);};
 // 4. Plastic, not print. Edge width: a mark's contrast over the mean gradient in the band between its own 35% and 75%
 // contours, on ΔE box-smoothed over about 1 px at 1024, in px at 1024. Colour: the core's direction in linear RGB
 // against the plastic's (hue), its level (lighter or darker), and its difference's direction against white.
 const r=Math.max(1,Math.round(k)),sm=new Float32Array(N);
 {const tmp=new Float32Array(N);
  for(let j=0;j<size;j++){let acc=0;for(let i=-r;i<size+r;i++){const add=i+r<size?dE[j*size+i+r]:0,sub=i-r-1>=0?dE[j*size+i-r-1]:0;acc+=add-sub;if(i>=0&&i<size)tmp[j*size+i]=acc/(2*r+1);}}
  for(let i=0;i<size;i++){let acc=0;for(let j=-r;j<size+r;j++){const add=j+r<size?tmp[(j+r)*size+i]:0,sub=j-r-1>=0?tmp[(j-r-1)*size+i]:0;acc+=add-sub;if(j>=0&&j<size)sm[j*size+i]=acc/(2*r+1);}}}
 const gradAt=p=>{const i=p%size,j=(p-i)/size;if(i<1||j<1||i>=size-1||j>=size-1)return 0;return Math.hypot(sm[p+1]-sm[p-1],sm[p+size]-sm[p-size])/2;};
 const judge=mk=>{
  const px=order.subarray(mk.start,mk.start+mk.area),vals=Float32Array.from(px,p=>dE[p]).sort(),top=vals[Math.floor(.95*(vals.length-1))];
  const t1=Math.max(lo,m+.35*(top-m)),t2=Math.max(t1+1e-3,m+.75*(top-m)),M=[0,0,0],P=[0,0,0];let core=0,gsum=0,gn=0;
  for(const p of px){if(dE[p]<t1)continue;if(dE[p]<t2){gsum+=gradAt(p);gn++;continue;}core++;
   const x=lin(...rgbToLab(rgba[p*4],rgba[p*4+1],rgba[p*4+2]).map(Math.fround)),y=lin(...field(p));for(let q=0;q<3;q++){M[q]+=x[q];P[q]+=y[q];}}
  const D=[M[0]-P[0],M[1]-P[1],M[2]-P[2]],whiteOff=core?Math.acos(Math.min(1,(D[0]+D[1]+D[2])/Math.max(1e-9,Math.sqrt(3)*Math.hypot(...D))))*180/Math.PI:90;
  const width=gn?(top-m)/Math.max(1e-3,gsum/gn)/k:99,nm=Math.hypot(...M),np=Math.hypot(...P),contrast=top-m;
  const hueOff=core?Math.acos(Math.min(1,(M[0]*P[0]+M[1]*P[1]+M[2]*P[2])/Math.max(1e-9,nm*np)))*180/Math.PI:0,level=core?nm/Math.max(1e-9,np):1;
  // Broad: wider, both ways, than twice its own edge. A small letter's measured width means little; it is never broad.
  const broad=Math.min(mk.x1-mk.x0+1,mk.y1-mk.y0+1)/k>=2*width;
  // A blotch: the plastic's own colour, faint, soft. Lighter than the plastic (a sheen, a pale patch of glow, a
  // Champion's injection gate) needs only a soft edge; darker, a very soft and broad one (shading): faint print in the
  // plastic's own hue is darker and tighter (the Destroyer's GOLF, the Berg's small T).
  const blotch=hueOff<=T.PLATE_HUE&&contrast<=T.FAINT&&(level>1?width>=T.SOFT:broad&&width>=T.SHADE);
  // A sheen: soft, reaching the plate's edge, the plastic plus white light. Foil printed to the edge is its own colour.
  const sheen=broad&&mk.rim&&level>1&&whiteOff<=T.WHITE&&width>=T.SOFT;
  // A ghost (see-through plastic): the plastic darkened, faint, soft: a mark on its far side.
  const ghost=seeThrough&&hueOff<=T.GHOST_HUE&&level<1&&contrast<=T.FAINT&&width>=T.GHOST_SOFT;
  mk.plastic=blotch||sheen||ghost;
 };
 const minSeeds=Math.max(2,T.SEED_PX*k*k);
 for(const mk of grow(hi)){judge(mk);mk.keep=mk.seeds>=minSeeds&&!mk.plastic;}
 for(const mk of grow((lo+hi)/2))judge(mk);
 const near=(a,b)=>{const d=T.CHAIN*k;return a.x0-d<=b.x1&&b.x0-d<=a.x1&&a.y0-d<=b.y1&&b.y0-d<=a.y1;};
 for(let round=0;round<3;round++){const kept=marks.filter(x=>x.keep);let added=0;
  for(const mk of marks)if(!mk.keep&&!mk.plastic&&mk.seeds>=2&&mk.area<=T.WEAK_AREA*k*k&&kept.some(x=>near(mk,x))){mk.keep=true;added++;}
  if(!added)break;}
 // The support: kept marks, grown by GROW (a square reach, rows then columns).
 const reachPx=Math.max(1,Math.round(T.GROW*k)),row=new Uint8Array(N),out=new Uint8Array(N);
 for(let j=0;j<size;j++){let last=-1e9;for(let i=0;i<size;i++){const p=j*size+i;if(label[p]>=0&&marks[label[p]].keep)last=i;row[p]=i-last<=reachPx;}
  last=1e9;for(let i=size-1;i>=0;i--){const p=j*size+i;if(label[p]>=0&&marks[label[p]].keep)last=i;if(last-i<=reachPx)row[p]=1;}}
 for(let i=0;i<size;i++){let last=-1e9;for(let j=0;j<size;j++){if(row[j*size+i])last=j;out[j*size+i]=j-last<=reachPx;}
  last=1e9;for(let j=size-1;j>=0;j--){if(row[j*size+i])last=j;if(last-j<=reachPx)out[j*size+i]=1;}}
 return out;
}
