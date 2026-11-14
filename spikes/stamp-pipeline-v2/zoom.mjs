// Small print, close: each variant's alpha (ink on white) over the same region of the 2048 frame, stacked and labelled,
// with the photo's crop on top. Usage: node zoom.mjs <disc> <x0,y0,x1,y1> <out> <label=file.raw.gz>...
import sharp from 'sharp';
import {RUNS,readRaw} from './common.mjs';
const [disc,box,out,...variants]=process.argv.slice(2),[x0,y0,x1,y1]=box.split(',').map(Number),S=2048,dir=RUNS+disc+'/';
const L=Math.round(x0*S),T=Math.round(y0*S),W=Math.round((x1-x0)*S),H=Math.round((y1-y0)*S),scale=Math.max(1,Math.floor(1400/W));
const rows=[];
const label=async(text,img)=>{const svg=Buffer.from(`<svg width="${W*scale}" height="28"><rect width="100%" height="100%" fill="#222"/><text x="8" y="20" font-family="Helvetica" font-size="18" fill="#fff">${text}</text></svg>`);rows.push(await sharp(svg).png().toBuffer(),img);};
{const a=readRaw(dir+'prod-input.raw.gz'),img=Buffer.alloc(W*H*3);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const p=((T+j)*S+L+i)*4;for(let c=0;c<3;c++)img[(j*W+i)*3+c]=a[p+c];}
 await label('photo (2048 crop)',await sharp(img,{raw:{width:W,height:H,channels:3}}).resize(W*scale,H*scale,{kernel:'nearest'}).png().toBuffer());}
for(const v of variants){const [name,file]=v.split('=');const a=readRaw(dir+file),img=Buffer.alloc(W*H);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++)img[j*W+i]=255-a[(T+j)*S+L+i];
 await label(name,await sharp(img,{raw:{width:W,height:H,channels:1}}).resize(W*scale,H*scale,{kernel:'nearest'}).png().toBuffer());}
const metas=await Promise.all(rows.map(b=>sharp(b).metadata()));let y=0;const comp=[];for(let k=0;k<rows.length;k++){comp.push({input:rows[k],left:0,top:y});y+=metas[k].height;}
await sharp({create:{width:W*scale,height:y,channels:3,background:'#fff'}}).composite(comp).png().toFile(out);
