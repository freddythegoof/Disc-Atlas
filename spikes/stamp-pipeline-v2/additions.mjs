// What v2's segmentation would ADD to today's production asset (main's extract(), veto on): each v2 mark (alpha over
// half, at 2048) is split into the part today already covers (within NEAR px at 1024) and the part it lacks. A mark whose
// lacking part is most of it is print today missed whole (the Berg's PROAC); a mark mostly covered is today's stroke
// with v2's heavier edge (the Destroyer's halos), and adds nothing. Writes runs/<disc>/add-*.raw.gz + prints per disc.
import {PINNED,EXTRA,RUNS,readRaw,saveRaw,exists} from './common.mjs';

const SIZE=2048,NEAR=+(process.env.NEAR||3),NEW=+(process.env.NEW||.8),only=process.argv.slice(2);
// A separable max filter of radius r (in px at SIZE).
export function grow(bin,size,r){
 const N=size*size,row=new Uint8Array(N),out=new Uint8Array(N);
 for(let j=0;j<size;j++){let last=-1e9;for(let i=0;i<size;i++){if(bin[j*size+i])last=i;row[j*size+i]=i-last<=r;}last=1e9;for(let i=size-1;i>=0;i--){if(bin[j*size+i])last=i;if(last-i<=r)row[j*size+i]=1;}}
 for(let i=0;i<size;i++){let last=-1e9;for(let j=0;j<size;j++){if(row[j*size+i])last=j;out[j*size+i]=j-last<=r;}last=1e9;for(let j=size-1;j>=0;j--){if(row[j*size+i])last=j;if(last-j<=r)out[j*size+i]=1;}}
 return out;
}
// 8-connected components of a binary image: labels and areas.
export function components(bin,size){
 const N=size*size,label=new Int32Array(N),stack=new Int32Array(N),areas=[0];let n=0;
 for(let p0=0;p0<N;p0++){if(!bin[p0]||label[p0])continue;n++;let top=0,area=0;stack[top++]=p0;label[p0]=n;
  while(top){const p=stack[--top];area++;const i=p%size,j=(p-i)/size;
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const x=i+di,y=j+dj;if(x<0||y<0||x>=size||y>=size)continue;const q=y*size+x;if(bin[q]&&!label[q]){label[q]=n;stack[top++]=q;}}}
  areas.push(area);}
 return {label,areas,n};
}
if(import.meta.url===`file://${process.argv[1]}`)for(const name of Object.keys({...PINNED,...EXTRA})){
 if(only.length&&!only.includes(name))continue;
 const dir=RUNS+name+'/';if(!exists(dir+'v2-alpha2048.raw.gz'))continue;
 const v2=readRaw(dir+'v2-alpha2048.raw.gz'),today=readRaw(dir+'prod-design.raw.gz');
 const ink=Uint8Array.from(v2,a=>a>127),near=grow(Uint8Array.from(today,a=>a>127),SIZE,Math.round(NEAR*SIZE/1024));
 const {label,areas,n}=components(ink,SIZE),lack=new Float64Array(n+1);
 for(let p=0;p<label.length;p++)if(label[p]&&!near[p])lack[label[p]]++;
 const add=new Uint8ClampedArray(SIZE*SIZE);let marks=0,px=0,partial=0;
 for(let p=0;p<label.length;p++){const l=label[p];if(l&&lack[l]/areas[l]>=NEW){add[p]=255;px++;}}
 for(let l=1;l<=n;l++){if(lack[l]/areas[l]>=NEW)marks++;else if(lack[l]>0)partial+=lack[l];}
 saveRaw(dir+'add-alpha.raw.gz',add);
 let todayPx=0;for(const a of today)todayPx+=a>127;
 console.log(name.padEnd(14),`today ${todayPx} px | v2 marks ${n} | whole-new marks ${marks}, ${px} px | v2 edge beyond today (not added) ${partial} px`);
}
