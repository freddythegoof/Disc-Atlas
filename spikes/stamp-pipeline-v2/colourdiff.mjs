// Where the post-pass moved the colour asset: ΔE between today's and the post-pass's colour on ink both keep, as heat
// (white 0, yellow 5, red 15 and up), beside both assets on the plate, over one region of the 2048 frame.
// Usage: node colourdiff.mjs <disc> <x0,y0,x1,y1> <out>
import sharp from 'sharp';
import {RUNS,readRaw} from './common.mjs';
import {rgbToLab} from '../../public/disc-stamp-extract.mjs';
const [disc,box,out]=process.argv.slice(2),[x0,y0,x1,y1]=box.split(',').map(Number),S=2048,dir=RUNS+disc+'/';
const a=readRaw(dir+'prod-color.raw.gz'),b=readRaw(dir+'post-color.raw.gz'),plate=JSON.parse((await import('node:fs')).readFileSync(dir+'prod.json')).plateColor;
const P=[1,3,5].map(i=>parseInt(plate.slice(i,i+2),16)),L=Math.round(x0*S),T=Math.round(y0*S),W=Math.round((x1-x0)*S),H=Math.round((y1-y0)*S);
const heat=Buffer.alloc(W*H*3,255),ta=Buffer.alloc(W*H*3),tb=Buffer.alloc(W*H*3);
for(let j=0;j<H;j++)for(let i=0;i<W;i++){const p=((T+j)*S+L+i)*4,k=(j*W+i)*3;
 for(const [src,dst] of [[a,ta],[b,tb]]){const al=src[p+3]/255;for(let c=0;c<3;c++)dst[k+c]=Math.round(al*src[p+c]+(1-al)*P[c]);}
 if(a[p+3]>127&&b[p+3]>127){const x=rgbToLab(a[p],a[p+1],a[p+2]),y=rgbToLab(b[p],b[p+1],b[p+2]),e=Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);
  heat[k]=255;heat[k+1]=Math.round(255*Math.max(0,1-e/15));heat[k+2]=Math.round(255*Math.max(0,1-e/5));}
 else if(a[p+3]>127||b[p+3]>127){heat[k]=heat[k+1]=heat[k+2]=200;}}
const w=Math.min(700,W),h=Math.round(H*w/W),img=buf=>sharp(buf,{raw:{width:W,height:H,channels:3}}).resize(w,h).png().toBuffer();
await sharp({create:{width:3*w+20,height:h,channels:3,background:'#888'}}).composite([{input:await img(ta),left:0,top:0},{input:await img(tb),left:w+10,top:0},{input:await img(heat),left:2*w+20,top:0}]).png().toFile(out);
