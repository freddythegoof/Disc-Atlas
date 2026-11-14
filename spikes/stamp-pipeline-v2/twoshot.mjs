// Step 6, two-shot capture: the handling, ready for the real pairs. Both shots go through the same rim fit and the same
// full-resolution warp, so their pixels line up on the canonical circle; nothing here guesses at a second shot it lacks.
//  foil:  a second shot at an angle. Foil is a mirror: its lightness moves with the angle; plastic and ink barely do.
//         Per kept mark, the share of its pixels whose lightness changed by more than FOIL_SIGMA × the plastic's own
//         change noise is its foil share; a mark above FOIL_SHARE is foil.
//  clear: a second shot backlit on black. Through clear plastic the backlight shows how much light the plate passes:
//         opacity = 1 − transmission (backlit plate over the backlight's own level, read at the rim outside the disc's
//         plate). The render colour stays the diffuse shot's, read on the plate where the stamp is not.
// Usage: node twoshot.mjs --self-test   (synthetic pairs: a code check of the handling, never a verdict on a disc)
import {rgbToLab} from '../../public/disc-stamp-extract.mjs';

export const TWO={FOIL_SIGMA:4,FOIL_SHARE:.35};
const L=(d,p)=>rgbToLab(d[p*4],d[p*4+1],d[p*4+2])[0];
export function foilFromPair(diffuse,angled,size,label,keep){
 const N=size*size,dl=new Float32Array(N),plastic=[];
 for(let p=0;p<N;p++){if(diffuse[p*4+3]<250||angled[p*4+3]<250)continue;dl[p]=L(angled,p)-L(diffuse,p);if(label[p]<0)plastic.push(dl[p]);}
 plastic.sort((a,b)=>a-b);const m=plastic[plastic.length>>1],mad=plastic.map(v=>Math.abs(v-m)).sort((a,b)=>a-b)[plastic.length>>1],sigma=Math.max(.5,1.4826*mad);
 const moved=new Map(),all=new Map();
 for(let p=0;p<N;p++){const id=label[p];if(id<0||!keep[id])continue;all.set(id,(all.get(id)||0)+1);if(Math.abs(dl[p]-m)>TWO.FOIL_SIGMA*sigma)moved.set(id,(moved.get(id)||0)+1);}
 const marks=[...all].map(([id,n])=>({id,share:(moved.get(id)||0)/n,foil:(moved.get(id)||0)/n>=TWO.FOIL_SHARE}));
 return {sigma,marks};
}
export function clearFromBacklit(diffuse,backlit,size,{plate=.8,label=null}={}){
 const c=size/2,lin=v=>(v/255)**2.2;let plateSum=0,plateN=0,lightSum=0,lightN=0;const col=[0,0,0];let colN=0;
 for(let p=0;p<size*size;p++){const i=p%size,j=(p-i)/size,r=Math.hypot(i+.5-c,j+.5-c)/c,y=.2126*lin(backlit[p*4])+.7152*lin(backlit[p*4+1])+.0722*lin(backlit[p*4+2]);
  if(r<plate*.95&&(!label||label[p]<0)){plateSum+=y;plateN++;for(let k=0;k<3;k++)col[k]+=lin(diffuse[p*4+k]);colN++;}
  else if(r>1&&r<1.1){lightSum+=y;lightN++;}}
 const transmission=Math.min(1,(plateSum/plateN)/Math.max(1e-6,lightSum/lightN));
 const hex='#'+col.map(v=>Math.round(255*(v/colN)**(1/2.2)).toString(16).padStart(2,'0')).join('');
 return {transmission:+transmission.toFixed(3),opacity:+(1-transmission).toFixed(3),color:hex};
}
if(process.argv.includes('--self-test')){
 // A 256 px disc: grey plastic, a foil bar (moves +30 L in the angled shot) and an ink bar (moves 0).
 const S=256,mk=f=>{const d=new Uint8ClampedArray(S*S*4);for(let p=0;p<S*S;p++){const i=p%S,j=(p-i)/S;const v=f(i,j);d.set([...v,255],p*4);}return d;};
 const foil=(i,j)=>j>80&&j<100&&i>60&&i<200,ink=(i,j)=>j>150&&j<170&&i>60&&i<200,noise=()=>Math.round((Math.random()-.5)*4);
 const diffuse=mk((i,j)=>foil(i,j)?[180,180,185]:ink(i,j)?[30,30,40]:[120+noise(),120+noise(),120+noise()]);
 const angled=mk((i,j)=>foil(i,j)?[245,245,250]:ink(i,j)?[32,31,41]:[121+noise(),120+noise(),119+noise()]);
 const label=new Int32Array(S*S).fill(-1);for(let p=0;p<S*S;p++){const i=p%S,j=(p-i)/S;if(foil(i,j))label[p]=0;else if(ink(i,j))label[p]=1;}
 const f=foilFromPair(diffuse,angled,S,label,[1,1]);
 // Clear: a blue-tinted plate passing 40% of a white backlight, on black.
 const back=mk((i,j)=>{const r=Math.hypot(i-S/2+.5,j-S/2+.5)/(S/2);const t=r<1?.4:r<1.1?1:0,v=Math.round(255*t**(1/2.2));return [v,v,v];});
 const diff=mk(()=>[80,123,129]);
 const cl=clearFromBacklit(diff,back,S,{plate:.85});
 const ok=f.marks[0].foil&&!f.marks[1].foil&&Math.abs(cl.transmission-.4)<.02&&cl.color==='#507b81';
 console.log(JSON.stringify({foil:f.marks,clear:cl,ok}));if(!ok)process.exit(1);
}
