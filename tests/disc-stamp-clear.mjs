// The clean stamp mode (public/disc-stamp-clear.mjs, docs/clear-plastic-discs.md) on synthetic clear discs: a blue
// plate over a light surface, a red foil word and a navy word, and the soft shadow both cast on the surface under the
// plastic, moved by one vector. The shadow goes; the print stays exactly; a disc with no shadow is left byte for byte.
//   node --test tests/disc-stamp-clear.mjs
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {unshadow,shoulder} from '../public/disc-stamp-clear.mjs';
import {extract} from '../public/disc-stamp-worker.mjs';

const N=512,PLATE=[10,132,168],RED=[170,20,30],NAVY=[10,30,60],SHIFT=[-14,13];
const inBox=(x,y,[x0,y0,x1,y1])=>x>=x0&&x<x1&&y>=y0&&y<y1;
// Two "words": a red bar with gaps (letters) and a navy one, each a few strokes.
const RED_BOX=[150,200,360,236],NAVY_BOX=[190,140,320,160];
const stroke=(x,y,box)=>inBox(x,y,box)&&((x-box[0])%26<18);
function disc({shadow=true,soft=4}={}){
 const d=new Uint8ClampedArray(N*N*4),c=N/2,r=N/2-2;
 const ink=(x,y)=>stroke(x,y,RED_BOX)?RED:stroke(x,y,NAVY_BOX)?NAVY:null;
 // The shadow: the print moved by SHIFT and blurred, darkening the plate by up to 30%.
 const dark=new Float32Array(N*N);
 if(shadow)for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0,n=0;for(let j=-soft;j<=soft;j++)for(let i=-soft;i<=soft;i++){n++;if(ink(x-SHIFT[0]+i,y-SHIFT[1]+j))s++;}dark[y*N+x]=s/n;}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const p=y*N+x,inside=Math.hypot(x+.5-c,y+.5-c)<r,col=ink(x,y)||PLATE.map(v=>v*(1-.3*dark[p]));
  // A little grain, like plastic over a surface.
  const g=((x*73856093^y*19349663)>>>0)%5-2;
  d[4*p]=col[0]+g;d[4*p+1]=col[1]+g;d[4*p+2]=col[2]+g;d[4*p+3]=inside?255:0;
 }
 return d;
}
const lum=(d,p)=>.2126*d[4*p]+.7152*d[4*p+1]+.0722*d[4*p+2];

test('the shadow is found at its offset and lifted back to the plate; the print is not touched', () => {
 const d=disc(),before=d.slice(),r=unshadow(d,N,{plate:.95});
 assert.ok(r.strength>=1.6,`a shadow stands out (${r.strength})`);
 assert.ok(Math.abs(r.offset[0]-SHIFT[0])<=2&&Math.abs(r.offset[1]-SHIFT[1])<=2,`offset ${r.offset}`);
 // Print pixels keep their exact bytes.
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=y*N+x;if(stroke(x,y,RED_BOX)||stroke(x,y,NAVY_BOX))for(let k=0;k<3;k++)assert.equal(d[4*p+k],before[4*p+k]);}
 // Inside the shadow's core (off the print): within a few levels of the plate, where it was 30% darker.
 const plate=.2126*PLATE[0]+.7152*PLATE[1]+.0722*PLATE[2];let worst=0,sum=0,n=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=y*N+x,sx=x-SHIFT[0],sy=y-SHIFT[1];if((stroke(sx,sy,RED_BOX)&&stroke(sx+3,sy,RED_BOX)&&stroke(sx-3,sy,RED_BOX))&&!stroke(x,y,RED_BOX)&&!stroke(x,y,NAVY_BOX)&&!stroke(x+2,y,RED_BOX)&&!stroke(x-2,y,RED_BOX)&&!inBox(x,y,[RED_BOX[0]-3,RED_BOX[1]-3,RED_BOX[2]+3,RED_BOX[3]+3])){worst=Math.max(worst,plate-lum(d,p));sum+=plate-lum(d,p);n++;}}
 // The lift reaches the local plate field, which the shadow's own soft edge pulls a little low (refitting it without
 // the shadow was tried, and on the Raptor let a glare streak lift a band brighter than the plate): about four fifths
 // of the shadow's depth goes.
 assert.ok(n>500&&sum/n<.25*.3*plate&&worst<10,`the shadow is lifted (mean ${(sum/n).toFixed(1)}, worst ${worst.toFixed(1)} below the plate, from ~${(.3*plate).toFixed(0)})`);
});

test('a dark ink in the plate\'s own hue keeps its strokes, while its shadow goes', () => {
 const d=disc(),r=unshadow(d,N,{plate:.95});
 assert.ok(r.shadowed>0);
 // The navy word's own strokes are all still navy.
 let kept=0,total=0;for(let y=NAVY_BOX[1];y<NAVY_BOX[3];y++)for(let x=NAVY_BOX[0];x<NAVY_BOX[2];x++)if(stroke(x,y,NAVY_BOX)){total++;if(lum(d,y*N+x)<40)kept++;}
 assert.equal(kept,total);
});

test('a clear disc with no shadow (or an opaque photo) comes through byte for byte', () => {
 const d=disc({shadow:false}),before=d.slice(),r=unshadow(d,N,{plate:.95});
 assert.equal(r.shadowed,0);assert.deepEqual(d,before);
});

test('the shoulder drops only plate-hued design past its radius; foil stays', () => {
 const d=disc({shadow:false}),plateLab=unshadow(d.slice(),N,{plate:.95}).plate??null;
 const pl=plateLab||[49.9,-15,-27],drop=shoulder(d,N,.95,pl),c=N/2,r=.87*.95*N/2;
 for(let p=0;p<N*N;p+=97){const inner=Math.hypot(p%N+.5-c,(p/N|0)+.5-c)<r;if(inner)assert.equal(drop[p],0);}
 // Plate-coloured pixels out past the shoulder are dropped.
 let out=0,dropped=0;for(let p=0;p<N*N;p++){if(d[4*p+3]<255)continue;if(Math.hypot(p%N+.5-c,(p/N|0)+.5-c)>r+2){out++;dropped+=drop[p];}}
 assert.ok(dropped/out>.95);
});

test('extract: clear off is today\'s extraction exactly; clear on reports the shadow it took out', () => {
 const a=disc(),b=disc();
 const off=extract(a,N,.95,{stored:true}),on=extract(b,N,.95,{stored:true,clear:true});
 assert.equal(off.shadow,undefined);assert.ok(on.shadow.shadowed>0);
 // The shadow below the red word reads as design without the clean mode, and not with it.
 const under=r=>{let n=0;for(let y=RED_BOX[3]+4;y<RED_BOX[3]+SHIFT[1];y++)for(let x=RED_BOX[0]+SHIFT[0];x<RED_BOX[2]+SHIFT[0];x++)if(r.alpha[y*N+x]>127)n++;return n;};
 assert.ok(under(on)<under(off)/4,`shadow read as design: ${under(off)} without, ${under(on)} with`);
});
