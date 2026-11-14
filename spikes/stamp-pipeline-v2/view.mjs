// Alpha as ink on white (and optional overlay of two alphas: red A only, blue B only, black both), downsized.
import sharp from 'sharp';
import {readRaw} from './common.mjs';
const [a,b,out,size='2048',outSize='1024']=process.argv.slice(2);const S=+size,O=+outSize;
const A=readRaw(a),B=b!=='-'?readRaw(b):null,img=new Uint8Array(S*S*3).fill(255);
for(let p=0;p<S*S;p++){const x=A[p]>127,y=B?B[p]>127:false;
 if(x&&(y||!B)){img[p*3]=img[p*3+1]=img[p*3+2]=0;}else if(x){img[p*3]=220;img[p*3+1]=0;img[p*3+2]=0;}else if(y){img[p*3]=0;img[p*3+1]=80;img[p*3+2]=255;}}
await sharp(Buffer.from(img),{raw:{width:S,height:S,channels:3}}).resize(O,O,{kernel:'lanczos3'}).png().toFile(out);
