// The side-by-side sheet per pinned disc: the photo's crop, today's Full color asset and v2's, each laid on a disc of
// the plate colour production measured, on Paper (#f6f2ea) and on Midnight (#080b10) (public/theme.js). A flat 2D
// composite, not the 3D renderer: it shows what each asset holds, side by side, on both backgrounds.
import sharp from 'sharp';
import {readFileSync} from 'node:fs';
import {PINNED,RUNS,SHEETS,readRaw} from './common.mjs';

const THEMES={Paper:[246,242,234],Midnight:[8,11,16]},S=2048,T=560;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
// One tile: the theme background, a disc of the plate colour, the asset over it (straight alpha).
function tile(rgba,plate,bg,photo=false){
 const out=Buffer.alloc(S*S*3),c=S/2;
 for(let p=0;p<S*S;p++){const i=p%S,j=(p-i)/S,inDisc=Math.hypot(i+.5-c,j+.5-c)<=c;let base=inDisc?plate:bg;
  if(photo&&inDisc)base=[rgba[p*4],rgba[p*4+1],rgba[p*4+2]];
  const a=photo||!rgba?0:rgba[p*4+3]/255;for(let k=0;k<3;k++)out[p*3+k]=Math.round(a*(rgba?rgba[p*4+k]:0)+(1-a)*base[k]);}
 return sharp(out,{raw:{width:S,height:S,channels:3}}).resize(T,T,{kernel:'lanczos3'}).png().toBuffer();
}
const label=(text,w,bg='#222',fg='#fff')=>sharp(Buffer.from(`<svg width="${w}" height="30"><rect width="100%" height="100%" fill="${bg}"/><text x="10" y="21" font-family="Helvetica" font-size="17" fill="${fg}">${text}</text></svg>`)).png().toBuffer();
const only=process.argv.slice(2);
for(const [name,disc] of Object.entries(PINNED)){
 if(only.length&&!only.includes(name))continue;
 const dir=RUNS+name+'/',prod=JSON.parse(readFileSync(dir+'prod.json')),plate=hex(prod.plateColor);
 const cols=[['photo crop (2048)',readRaw(dir+'prod-input.raw.gz'),true]];
 if(disc.capture)cols.push(['today, WebKit input',readRaw(dir+'prodcap-color.raw.gz')]);
 cols.push([disc.capture?'today, Node crop':'today (production)',readRaw(dir+'prod-color.raw.gz')],['v2',readRaw(dir+'v2-color2048.raw.gz')]);
 const W=cols.length*T,parts=[{input:await label(`${name} — ${disc.plastic}${disc.control?' (control)':''} — plate ${prod.plateColor}`,W),left:0,top:0}];let y=30;
 for(const [theme,bg] of Object.entries(THEMES)){
  for(let k=0;k<cols.length;k++)parts.push({input:await label(`${theme}: ${cols[k][0]}`,T,theme==='Paper'?'#f6f2ea':'#080b10',theme==='Paper'?'#3a2f25':'#e8e8e8'),left:k*T,top:y});
  y+=30;for(let k=0;k<cols.length;k++)parts.push({input:await tile(cols[k][1],plate,bg,cols[k][2]),left:k*T,top:y});y+=T;
 }
 await sharp({create:{width:W,height:y,channels:3,background:'#444'}}).composite(parts).jpeg({quality:88}).toFile(SHEETS+name+'-sheet.jpg');
 console.log(name);
}
