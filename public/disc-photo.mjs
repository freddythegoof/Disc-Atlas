// Photos never leave the browser until reduced to a bounded, metadata-free circular WebP.
import {delightPixels,rimColor,bandColor,bandModel} from './disc-albedo.mjs';
import {encodeHalo} from './disc3d/halo.mjs';
import {shapeForDisc,shapeFrame} from './disc3d/shape.mjs';
import {isOvermold} from './disc3d/overmold.mjs';
import {photoLook,setPhotoLook,savePhotoStamp} from './disc3d/photo-stamps.mjs';
export const PHOTO_BYTES=512*1024,PHOTO_SIZE=1024;
export const photoURL=item=>item?.texture_key?'/api/bag/discs/'+encodeURIComponent(item.id)+'/photo?v='+encodeURIComponent(item.texture_key):null;
// Inverse projective crop. Aspect repairs mild ellipse foreshortening; perspective adjusts near/far scale.
// `angle` only orients that tilt correction (with aspect 1 and no perspective it moves nothing). `rotate`
// levels the stamp: the crop turns by that many degrees, clockwise as seen in the aligner. At 0 it is skipped
// outright, so an unrotated crop is the same arithmetic, and the same bytes, as before it existed.
export function photoPoint(x,y,{width,height,scale=.94,aspect=1,perspective=0,angle=0,cx=.5,cy=.5,rotate=0}){
 const inside=x*x+y*y<=1;
 if(rotate){const t=rotate*Math.PI/180,c=Math.cos(t),s=Math.sin(t);[x,y]=[x*c+y*s,y*c-x*s];}
 const r=Math.min(width,height)*scale/2,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),u=x*c+y*s,v=-x*s+y*c,k=1+perspective*v;
 return {x:cx*width+(u*c-v*aspect*s)*r/k,y:cy*height+(u*s+v*aspect*c)*r/k,inside};
}
// Labels from phone pickers may be empty or wrong. Only recognized raster bytes get decoded.
export function sniffPhotoFormat(bytes){
 const text=(at,n)=>String.fromCharCode(...bytes.subarray(at,at+n));
 if(bytes[0]===0xff&&bytes[1]===0xd8)return 'image/jpeg';
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(bytes.length>=12&&text(0,4)==='RIFF'&&text(8,4)==='WEBP')return 'image/webp';
 // ISO BMFF ftyp: major brand, minor version (not a brand), compatible brands.
 // Inspect bounded leading boxes as well as the usual ftyp at offset zero.
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 for(let at=0;at+8<=bytes.length;){
  let size=view.getUint32(at),header=8;
  if(size===1){if(at+16>bytes.length)return null;size=Number(view.getBigUint64(at+8));header=16;}
  if(size===0)size=bytes.length-at;
  if(size<header||size>bytes.length-at)return null;
  if(text(at+4,4)==='ftyp'){
   if(size<header+8||(size-header-8)%4)return null;
   const brands=[text(at+header,4)];
   for(let i=at+header+8;i<at+size;i+=4)brands.push(text(i,4));
   if(brands.some(b=>b==='avif'||b==='avis'))return null;
   return brands.some(b=>/^(heic|heix|hevc|hevx|heim|heis|hevm|hevs|mif1|msf1)$/.test(b))?'image/heic':null;
  }
  at+=size;
 }
 return null;
}
function checkPhotoSize(width,height){
 if(width*height>60e6)throw new RangeError('Choose a photo smaller than 60 megapixels.');
}
async function canvasBitmap(canvas){
 try{return await createImageBitmap(canvas);}catch{
  // Some Safari versions decode in <img> but lack bitmap support. A canvas is also a
  // drawable source; give it the same release contract used by the editor.
  canvas.close=()=>{canvas.width=canvas.height=0;};return canvas;
 }
}
async function elementBitmap(file){
 const url=URL.createObjectURL(file),image=new Image();
 try{
  image.src=url;await image.decode();checkPhotoSize(image.naturalWidth,image.naturalHeight);
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  canvas.getContext('2d').drawImage(image,0,0);return await canvasBitmap(canvas);
 }finally{image.removeAttribute('src');URL.revokeObjectURL(url);}
}
let heifModule;
async function heicBitmap(file){
 // No import, download or WASM initialization until both native HEIC paths fail.
 const lib=await (heifModule||=import('./vendor/libheif/libheif-bundle-1.23.5.mjs')
  .then(({default:factory})=>factory()).catch(error=>{heifModule=null;throw error;}));
 const decoder=new lib.HeifDecoder();let images=[];
 try{
  images=decoder.decode(new Uint8Array(await file.arrayBuffer()));
  const image=images.find(i=>i.is_primary())||images[0];
  if(!image)throw Error('No HEIC image');
  const width=image.get_width(),height=image.get_height();checkPhotoSize(width,height);
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(width,height);
  const decoded=await new Promise((resolve,reject)=>image.display(pixels,data=>data?resolve(data):reject(Error('HEIC decode failed'))));
  ctx.putImageData(decoded,0,0);return await canvasBitmap(canvas);
 }finally{
  for(const image of images)image.free();
  if(decoder.decoder)lib.heif_context_free(decoder.decoder);
 }
}
export async function decodePhoto(file){
 if(!file||file.size>30*1024*1024)throw Error('Choose a JPG, PNG, WebP or HEIC photo up to 30 MB.');
 const format=sniffPhotoFormat(new Uint8Array(await file.slice(0,4096).arrayBuffer()));
 if(!format)throw Error('Choose a JPG, PNG, WebP or HEIC photo up to 30 MB.');
 // MIME is only a hint; give native decoders the format the bytes actually contain.
 const source=file.type===format?file:file.slice(0,file.size,format);
 let bitmap;try{bitmap=await createImageBitmap(source);}catch{/* Try the native image element next. */}
 if(bitmap){
  try{checkPhotoSize(bitmap.width,bitmap.height);return bitmap;}catch(error){bitmap.close();throw error;}
 }
 try{return await elementBitmap(source);}catch(error){if(error instanceof RangeError)throw error;}
 if(format==='image/heic'){
  try{return await heicBitmap(source);}catch(error){if(error instanceof RangeError)throw error;}
  throw Error('This HEIC photo could not open in this browser. Try Safari, or set Camera → Formats to Most Compatible and take a new photo.');
 }
 throw Error('This '+format.slice(6).toUpperCase()+' photo could not open. It may be damaged; choose another photo.');
}
// A 2048px working copy bounds memory and sampling cost even for large phone photos. Kept per decoded
// photo (an ImageBitmap never changes), so the aligner's live preview does not re-read millions of pixels
// on every drag. A canvas source can be redrawn, so it is always read afresh. A larger `limit` (a photo stamp's
// read of the original) is made for that one read and never kept.
const workingCopies=new WeakMap();
function workingCopy(image,limit=2048){
 const keep=limit===2048&&typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap;
 let copy=keep&&workingCopies.get(image);if(copy)return copy;
 const input=document.createElement('canvas'),ratio=Math.min(1,limit/Math.max(image.width,image.height));
 input.width=Math.round(image.width*ratio);input.height=Math.round(image.height*ratio);
 const g=input.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,input.width,input.height);
 copy={data:g.getImageData(0,0,input.width,input.height).data,w:input.width,h:input.height};if(keep)workingCopies.set(image,copy);
 return copy;
}
export function photoCanvas(image,options={},size=PHOTO_SIZE,limit=2048){
 const {data:source,w,h}=workingCopy(image,limit),out=document.createElement('canvas');out.width=out.height=size;
 const ctx=out.getContext('2d'),pixels=ctx.createImageData(size,size);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,p=photoPoint(x,y,{...options,width:w,height:h});
  if(!p.inside||p.x<0||p.y<0||p.x>=w-1||p.y>=h-1)continue;
  const a=Math.floor(p.x),b=Math.floor(p.y),fx=p.x-a,fy=p.y-b,k=(j*size+i)*4;
  for(let c=0;c<4;c++)pixels.data[k+c]=(source[(b*w+a)*4+c]*(1-fx)+source[(b*w+a+1)*4+c]*fx)*(1-fy)+(source[((b+1)*w+a)*4+c]*(1-fx)+source[((b+1)*w+a+1)*4+c]*fx)*fy;
  pixels.data[k+3]=Math.round(pixels.data[k+3]*Math.min(1,(1-Math.hypot(x,y))*size/2));
 }
 ctx.putImageData(pixels,0,0);return out;
}
// The crop with the photo's lighting removed (disc-albedo.mjs), and the plate colour it measured.
export function albedoCanvas(image,options={},size=PHOTO_SIZE){
 const canvas=photoCanvas(image,options,size),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,size,size);
 // The rim, like the plate colour, is measured before the glare pass: matched colours never depend on it.
 const {color,rim=null,band=null,halo=null}=delightPixels(pixels.data,size,{rimInner:options.rimInner||null,bandInner:options.bandInner||null});ctx.putImageData(pixels,0,0);
 return {canvas,color,photoRimColor:rim,bandColor:band,haloModel:encodeHalo(halo)};
}
// A saved texture turned for levelling: resampled only, and its rim measured again as on its first save.
function levelCanvas(image,options,size){
 const canvas=photoCanvas(image,options,size);
 const data=options.rimInner||options.bandInner?canvas.getContext('2d').getImageData(0,0,size,size).data:null;
 const halo=options.bandInner?bandModel(data,size,options.bandInner):null;
 return {canvas,color:null,photoRimColor:options.rimInner?rimColor(data,size,options.rimInner):null,bandColor:options.bandInner?(halo?halo.dye:bandColor(data,size,options.bandInner)):null,haloModel:encodeHalo(halo)};
}
let canvasWebP,webpModule;
const canvasBlob=(canvas,quality)=>new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
function supportsCanvasWebP(){
 return canvasWebP||= (async()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
  try{const blob=await canvasBlob(canvas,.86);return blob?blob.type==='image/webp':null;}
  finally{canvas.width=canvas.height=0;}
 })();
}
async function fallbackWebP(canvas,quality){
 let codec;
 try{codec=await (webpModule||=import('./disc-webp.mjs').catch(error=>{webpModule=null;throw error;}));}
 catch(error){throw Error('Local WebP encoder could not load. Check your connection and reload this page.',{cause:error});}
 // Only the already cropped, de-lit pixels reach the encoder. Never original bytes or metadata.
 return codec.encodeWebP(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height),quality);
}
// Resolves to {blob, color, photoRimColor, bandColor, haloModel}. Sample the rim (an overmold, `rimInner`) or the
// Halo band (a one-piece mold, `bandInner`: its dye and, v2, its wash and dye front) once from the first (1024px)
// processed pixels,
// retaining that value even if upload compression needs a smaller image.
// {albedo:false} is for re-levelling a saved photo: its pixels are already the albedo, so they are only
// resampled (no second delighting) and no plate colour is measured. Its rim is sampled again, as it was when
// first saved, so levelling keeps the matched rim. It never encodes larger than the source.
export async function preparePhoto(image,options={},{albedo=true}={}){
 let native=await supportsCanvasWebP(),encoded=0,empty=0,photoRimColor=null,band=null,halo=null;
 const sizes=albedo?[1024,768,512]:[1024,768,512].filter(size=>size<=Math.max(512,image.width));
 for(const size of sizes){
  const first=size===sizes[0],crop=first?options:{...options,rimInner:null,bandInner:null};
  const {canvas,color,photoRimColor:sample,bandColor:bandSample,haloModel:haloSample}=albedo?albedoCanvas(image,crop,size):levelCanvas(image,crop,size);
  if(first){photoRimColor=sample;band=bandSample;halo=haloSample;}
  try{
   for(const quality of [.86,.72,.56,.4]){
    let blob=native===false?await fallbackWebP(canvas,quality):await canvasBlob(canvas,quality);
    // A null result is an encode failure, not evidence that WebP is unsupported.
    if(blob&&blob.type!=='image/webp'){native=false;blob=await fallbackWebP(canvas,quality);}
    if(!blob){empty++;continue;}
    encoded++;if(blob.size<=PHOTO_BYTES)return {blob,color,photoRimColor,bandColor:band,haloModel:halo};
   }
  }finally{canvas.width=canvas.height=0;}
 }
 if(!encoded)throw Error('The browser returned no image data while encoding this photo. Close other tabs and retry.');
 throw Error('The encoded photo still exceeds 512 KiB at 512 pixels and 40% quality.'+(empty?' The browser also returned empty encoding results.':''));
}
export async function processPhoto(image,options={}){return (await preparePhoto(image,options)).blob;}

// Photo stamps (docs/photo-stamp-assets.md): the disc's printed design as a tintable stamp asset (white, the design in
// alpha), the shape the stock stamps use, with its placement. Read from the original at STAMP_SIZE through a working
// copy as large as the photo allows: the stored texture's 1024 px, cut from a 2048 px working copy, is what blurs an
// illustrated stamp's line work. `plate`: the plate's reach as a share of the radius (plateRatio).
export const STAMP_SIZE=2048;
function extractStamp(pixels,size,plate,color=false){
 const inline=()=>import('./disc-stamp-worker.mjs').then(m=>m.extract(pixels,size,plate,{color}));
 let worker;try{worker=new Worker(new URL('./disc-stamp-worker.mjs',import.meta.url),{type:'module'});}catch{return inline();}
 return new Promise((resolve,reject)=>{
  worker.onmessage=({data})=>{worker.terminate();if(data.error)reject(Error(data.error));else resolve(data.result);};
  // A browser that cannot start a module worker does the same work here.
  worker.onerror=event=>{event.preventDefault?.();worker.terminate();inline().then(resolve,reject);};
  worker.postMessage({pixels:pixels.buffer,size,plate,color});
 });
}
// v2 (docs/photo-stamp-color-assets.md): with `color`, the same read also gives the full-colour asset (`color`: its blob
// and placement), the stamp's own colours flattened like print (disc-stamp-color.mjs). The one-ink asset is made
// exactly as without it.
export async function photoStampAsset(image,options={},{plate=.8,color=false}={}){
 const size=STAMP_SIZE,canvas=photoCanvas(image,options,size,2*STAMP_SIZE);
 const pixels=canvas.getContext('2d').getImageData(0,0,size,size).data;canvas.width=canvas.height=0;
 const result=await extractStamp(pixels,size,plate,color),a=result.alpha,c=size/2;
 // The asset is the smallest centred square holding all of the design: no texture spent on bare plate.
 let reach=0,x0=size,y0=size,x1=-1,y1=-1;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++)if(a[j*size+i]){reach=Math.max(reach,Math.hypot(i+.5-c,j+.5-c));x0=Math.min(x0,i);x1=Math.max(x1,i);y0=Math.min(y0,j);y1=Math.max(y1,j);}
 if(x1<0)throw Error('No stamp showed up on this photo. Try a sharper photo, taken square on.');
 const half=Math.min(c,Math.ceil(reach)+2),side=2*half,from=c-half,out=document.createElement('canvas');out.width=out.height=side;
 // A single-ink stamp is the stock format, white with the design in alpha. A layered one is opaque, its fills, lines and
 // solid elements in red, green and blue (stamp.mjs inks them), so nothing is lost to premultiplied alpha.
 const g=out.getContext('2d'),img=g.createImageData(side,side),L=result.layers,byte=v=>Math.round(255*Math.min(1,Math.max(0,v)));
 for(let j=0;j<side;j++)for(let i=0;i<side;i++){const k=(j*side+i)*4,p=(j+from)*size+i+from;
  if(L){img.data[k]=byte(L.fill[p]);img.data[k+1]=byte(L.line[p]);img.data[k+2]=byte(L.solid[p]);img.data[k+3]=255;}
  else{img.data[k]=img.data[k+1]=img.data[k+2]=255;img.data[k+3]=a[p];}}
 g.putImageData(img,0,0);
 const blob=await new Promise(r=>out.toBlob(r,'image/png'));out.width=out.height=0;
 if(!blob)throw Error('The browser returned no image data for the stamp. Close other tabs and retry.');
 // The stock placement rule (stamp.mjs): the texture spans side/size of the disc's diameter.
 const ink=Math.max(x1-x0+1,y1-y0+1);
 return {blob,placement:{diameterFraction:ink/size,assetInkFraction:ink/side},layered:result.layered,plateColor:result.plateColor,coverage:result.coverage,stats:result.stats,
  ...result.color&&{color:await colorStampBlob(result.color.rgba,size)}};
}
// The colour asset: the smallest centred square holding all of it, as WebP (lossy colour, its alpha kept exact), which
// keeps it near the one-ink asset's size; the bundled encoder stands in where the canvas cannot write WebP.
const COLOR_STAMP_BYTES=1.5*1024*1024;
async function colorStampBlob(rgba,size){
 const c=size/2;let reach=0,x0=size,y0=size,x1=-1,y1=-1;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++)if(rgba[4*(j*size+i)+3]){reach=Math.max(reach,Math.hypot(i+.5-c,j+.5-c));x0=Math.min(x0,i);x1=Math.max(x1,i);y0=Math.min(y0,j);y1=Math.max(y1,j);}
 if(x1<0)throw Error('No stamp showed up on this photo. Try a sharper photo, taken square on.');
 const half=Math.min(c,Math.ceil(reach)+2),side=2*half,from=c-half,out=document.createElement('canvas');out.width=out.height=side;
 const g=out.getContext('2d'),img=g.createImageData(side,side);
 for(let j=0;j<side;j++)img.data.set(rgba.subarray(4*((j+from)*size+from),4*((j+from)*size+from+side)),4*j*side);
 g.putImageData(img,0,0);
 let blob=null;
 try{
  for(const quality of [.9,.8,.7]){
   blob=await supportsCanvasWebP()===false?null:await canvasBlob(out,quality);
   if(!blob||blob.type!=='image/webp')blob=await fallbackWebP(out,quality);
   if(blob.size<=COLOR_STAMP_BYTES)break;
  }
 }finally{out.width=out.height=0;}
 if(!blob)throw Error('The browser returned no image data for the stamp. Close other tabs and retry.');
 const ink=Math.max(x1-x0+1,y1-y0+1);
 return {blob,placement:{diameterFraction:ink/size,assetInkFraction:ink/side}};
}

// The flight plate's edge as a share of the disc's radius: where the photo stops on the model (the shoulder,
// or an overmold's inner seam). Drawn as a guide so the user can see what will land on the plate.
function plateRatio(d){
 try{
  const resolved=d&&shapeForDisc({model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade}});
  if(!resolved)return .8;
  const {R,Rs,Ri}=shapeFrame(resolved.shape);
  return (isOvermold({overmold:typeof d.overmold==='boolean'?d.overmold:undefined,manufacturer:d.manufacturer,record:d.name})?Ri:Rs)/R;
 }catch{return .8;}
}
// Where a Halo copy's dyed band begins, as a share of the radius: the rim seam (R − PDGA rim width), the
// same seam the model splits the band at. The photo itself still stops at the shoulder.
function bandRatio(d){
 try{
  const resolved=d&&shapeForDisc({model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade}});
  if(!resolved)return null;
  const {R,Ri}=shapeFrame(resolved.shape);return Ri/R;
 }catch{return null;}
}

// The aligner's live view, in the crop's own coordinates but reaching a little past the circle so an
// off-centre disc shows what is being cut off. Editor chrome only: processing never reads it.
const VIEW=1.2;
function previewInto(canvas,image,options,size){
 const {data:source,w,h}=workingCopy(image);if(canvas.width!==size)canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(size,size),out=pixels.data,o={...options,width:w,height:h};
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const p=photoPoint(((i+.5)/size*2-1)*VIEW,((j+.5)/size*2-1)*VIEW,o);
  if(p.x<0||p.y<0||p.x>=w-1||p.y>=h-1)continue;
  const a=Math.floor(p.x),b=Math.floor(p.y),fx=p.x-a,fy=p.y-b,k=(j*size+i)*4;
  for(let c=0;c<4;c++)out[k+c]=(source[(b*w+a)*4+c]*(1-fx)+source[(b*w+a+1)*4+c]*fx)*(1-fy)+(source[((b+1)*w+a)*4+c]*(1-fx)+source[((b+1)*w+a+1)*4+c]*fx)*fy;
 }
 ctx.putImageData(pixels,0,0);
}
// Guides, on their own canvas over the view: a light grid, a crosshair with a centre point, the rim
// circle (the crop's edge) and the flight-plate circle. Outside the rim is dimmed: that part is cut off.
// `level` adds level lines: amber horizontals edge to edge (past the rim, so a long stamp edge or a line of
// text can be laid along one), denser than the grid so one always sits near the stamp.
function drawGuides(canvas,size,plate,level=false){
 if(canvas.width!==size)canvas.width=canvas.height=size;
 const g=canvas.getContext('2d'),c=size/2,R=c/VIEW,u=size/400,TAU=Math.PI*2;
 g.clearRect(0,0,size,size);
 g.fillStyle='rgba(8,11,16,.58)';g.beginPath();g.rect(0,0,size,size);g.arc(c,c,R,0,TAU,true);g.fill();
 // Every guide is a light line over a dark one, so it reads on a white disc and a black one alike.
 const stroke=(path,width,alpha=.95,dash=[])=>{
  g.setLineDash(dash.map(v=>v*u));
  g.lineWidth=(width+2)*u;g.strokeStyle=`rgba(0,0,0,${alpha*.45})`;g.beginPath();path();g.stroke();
  g.lineWidth=width*u;g.strokeStyle=`rgba(255,255,255,${alpha})`;g.beginPath();path();g.stroke();
 };
 g.save();g.beginPath();g.arc(c,c,R,0,TAU);g.clip();
 for(let k=-3;k<=3;k++){if(!k)continue;const v=c+k*R/4;stroke(()=>{g.moveTo(v,c-R);g.lineTo(v,c+R);g.moveTo(c-R,v);g.lineTo(c+R,v);},.75,.28);}
 g.restore();
 stroke(()=>{g.moveTo(c-R,c);g.lineTo(c+R,c);g.moveTo(c,c-R);g.lineTo(c,c+R);},1.25,.85);
 stroke(()=>g.arc(c,c,R*plate,0,TAU),1.5,.9,[7,5]);
 stroke(()=>g.arc(c,c,R,0,TAU),2.25);
 stroke(()=>g.arc(c,c,10*u,0,TAU),1.5);
 g.setLineDash([]);g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.5*u;g.beginPath();g.arc(c,c,3.2*u,0,TAU);g.fill();g.stroke();
 g.font=`600 ${11*u}px system-ui,sans-serif`;g.textAlign='center';g.lineWidth=3*u;g.strokeStyle='rgba(0,0,0,.6)';g.fillStyle='#fff';
 // RIM just outside its ring at upper right, FLIGHT PLATE just inside its own at upper left, so the two
 // never collide however close a mold's plate edge sits to its rim.
 g.textBaseline='middle';
 for(const [label,r,angle,offset] of [['RIM',R,-55,13],['FLIGHT PLATE',R*plate,-125,-14]]){
  const a=angle*Math.PI/180,x=c+(r+offset*u)*Math.cos(a),y=c+(r+offset*u)*Math.sin(a);g.strokeText(label,x,y);g.fillText(label,x,y);
 }
 if(level)for(let k=-7;k<=7;k++){
  const v=c+k*R/8,width=k?1.25:2;g.setLineDash([]);
  g.lineWidth=(width+2)*u;g.strokeStyle='rgba(0,0,0,.5)';g.beginPath();g.moveTo(0,v);g.lineTo(size,v);g.stroke();
  g.lineWidth=width*u;g.strokeStyle=k?'rgba(255,196,64,.85)':'rgb(255,196,64)';g.beginPath();g.moveTo(0,v);g.lineTo(size,v);g.stroke();
 }
}

const DEFAULTS={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5,rotate:0};
const SLIDERS='<label>Framing<input type="range" data-photo="scale" min="0.3" max="1" step="0.01"></label><label>Tilt correction<input type="range" data-photo="aspect" min="0.8" max="1.2" step="0.01"></label><label>Tilt direction<input type="range" data-photo="angle" min="0" max="180" step="5"></label><label>Perspective<input type="range" data-photo="perspective" min="-0.12" max="0.12" step="0.01"></label><label class="photo-aligner-rotate">Rotate<input type="range" data-photo="rotate" min="-180" max="180" step="0.1"></label>';
// Levelling a photo already saved: its stored crop, sampled pixel for pixel (pixel centres on pixel centres,
// so 0° is an exact copy), turning only.
const levelOptions=image=>({...DEFAULTS,scale:1,cx:.5-.5/image.width,cy:.5-.5/image.height});
// Rotation readout: one decimal, a true minus sign, clockwise positive.
const degrees=v=>(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(1)+'°';
// Lucide's rotate-ccw and rotate-cw.
const TURN={ccw:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',cw:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'};
const LEVEL='<div class="photo-aligner-level" role="group" aria-label="Level the stamp"><button type="button" data-rotate="-1" aria-label="Rotate 1 degree counterclockwise">'+TURN.ccw+'1°</button><button type="button" data-rotate="-0.1" aria-label="Rotate 0.1 degree counterclockwise">'+TURN.ccw+'0.1°</button><output class="photo-aligner-angle" aria-label="Rotation">0.0°</output><button type="button" data-rotate="0.1" aria-label="Rotate 0.1 degree clockwise">0.1°'+TURN.cw+'</button><button type="button" data-rotate="1" aria-label="Rotate 1 degree clockwise">1°'+TURN.cw+'</button><button type="button" data-rotate-zero aria-label="Reset rotation to 0 degrees">0°</button><button type="button" data-level-lines aria-pressed="false">Level lines</button></div>';
const TEXT={frame:['Center the disc','Drag until the disc’s edge sits on the outer ring and its center on the crosshair.'],level:['Level the stamp','Turn the photo until the stamp runs along a level line. Only the angle changes.'],
 asset:['Frame the original','Center the disc and level its stamp, as for its photo. The game asset is read from this original at full detail.']};
// Photo stamps (docs/photo-stamp-assets.md): a saved photo can also be worn as a game asset, its stamp drawn in the
// player's ink and finish. Like the rest of Appearance it is a display choice kept in this browser: it applies at once,
// without Save, and the photo on the account is untouched.
let lookGroupId=0;
// v2 (docs/photo-stamp-color-assets.md): Full color wears the stamp's own colours from the original instead of one ink,
// so the note under the row says the stamp ink does not reach it.
const LOOK_NOTE={asset:'Game asset draws this disc’s stamp from your original photo, in your stamp ink and finish. Only in this browser; the photo stays saved.',
 color:'Full color keeps the stamp’s own colors from your original photo, so your stamp ink doesn’t apply; a foil finish adds only a light sheen. Only in this browser; the photo stays saved.'};
const LOOK=name=>'<div class="bag-photo-look" hidden><div class="bag-photo-look-row" role="radiogroup" aria-label="How this disc looks"><span class="bag-photo-look-title" aria-hidden="true">Look</span><label><input type="radio" name="'+name+'" value="photo" checked>Photo</label><label><input type="radio" name="'+name+'" value="asset">Game asset</label><label><input type="radio" name="'+name+'" value="color">Full color</label></div><small class="bag-photo-look-note">'+LOOK_NOTE.asset+'</small><button type="button" class="bag-photo-asset-make">Make from original photo</button><input class="bag-photo-asset-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden></div>';

// The sheet shows the photo and its actions; choosing a photo opens the aligner, a large pop-out with
// guides. Use photo prepares the upload there (lighting removed, plate colour measured) and returns to
// the sheet with it; Cancel returns with nothing changed. Saving still happens with the sheet.
// onColor(color) reports the plate colour of a newly used photo, onColor(null) its removal.
let sourceChooserId=0;
export function createPhotoEditor(root,{onColor=()=>{}}={}){
 root.innerHTML='<span class="bag-photo-label">Photo<small>Your disc’s own stamp on its 3D model. Only you can see it.</small></span><div class="bag-photo-row"><span class="bag-photo-thumb" hidden><img alt="Your disc photo"></span><div class="bag-photo-actions"><button type="button" class="bag-photo-choose"><svg class="bag-photo-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-1.9A1.5 1.5 0 0 1 10.7 3.5h2.6a1.5 1.5 0 0 1 1.2.6L15.8 6h1.7A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.4"/></svg><span>Add photo</span></button><button type="button" class="bag-photo-adjust" hidden>Adjust</button><button type="button" class="bag-photo-level" hidden>Level stamp</button><button type="button" class="bag-photo-remove" hidden>Remove photo</button></div></div><input class="bag-photo-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden>'+LOOK('photoLook-'+(++lookGroupId))+'<p class="bag-photo-status" role="status"></p>';
 // Non-camera accept values are presentation hints; the OS may merge library/files into one sheet.
 root.insertAdjacentHTML('beforeend','<div class="rack-style-menu bag-photo-source-menu" popover="auto" role="group" aria-label="Photo source"><button type="button" data-photo-source="camera">Camera</button><button type="button" data-photo-source="library">Photo Library</button><button type="button" data-photo-source="files">Files</button><button type="button" data-photo-source-cancel>Cancel</button></div><input class="bag-photo-source-file" data-photo-input="camera" type="file" accept="image/*" capture="environment" hidden><input class="bag-photo-source-file" data-photo-input="library" type="file" accept="image/*" hidden><input class="bag-photo-source-file" data-photo-input="files" type="file" hidden>');
 const dialog=document.createElement('dialog');dialog.className='photo-aligner';dialog.setAttribute('aria-labelledby','photoAlignerTitle');
 dialog.innerHTML='<div class="disc3d-dialog-panel"><div class="disc3d-dialog-head"><div><div class="disc3d-dialog-eyebrow">YOUR DISC PHOTO</div><h2 id="photoAlignerTitle">Center the disc</h2></div><button type="button" class="close" data-aligner-cancel aria-label="Cancel photo">×</button></div><div class="photo-aligner-body"><div class="photo-aligner-stage"><div class="photo-aligner-frame"><canvas class="photo-aligner-view" tabindex="0" aria-label="Photo alignment. Drag, or use the arrow keys, to center the disc; plus and minus resize."></canvas><canvas class="photo-aligner-guides" aria-hidden="true"></canvas></div></div>'+LEVEL+'<p class="photo-aligner-tip">Drag until the disc’s edge sits on the outer ring and its center on the crosshair.</p><details class="photo-aligner-adjust"><summary>'+(window.DropdownIndicator?.indicator('lg')||'')+'Adjust photo</summary><div class="photo-aligner-sliders">'+SLIDERS+'</div></details><p class="photo-aligner-status" role="status"></p><div class="photo-aligner-actions"><button type="button" class="pill-button" data-aligner-cancel>Cancel</button><button type="button" class="pill-button primary" data-aligner-confirm>Use photo</button></div></div></div>';
 document.body.append(dialog);
 const q=s=>root.querySelector(s),dq=s=>dialog.querySelector(s),file=q('.bag-photo-file'),view=dq('.photo-aligner-view'),guides=dq('.photo-aligner-guides'),frame=dq('.photo-aligner-frame'),stage=dq('.photo-aligner-stage');
 const choose=q('.bag-photo-choose'),sources=q('.bag-photo-source-menu');
 file.dataset.photoInput='default';sources.id='photoSources-'+(++sourceChooserId);
 const closeSources=(focus=false)=>{if(sources.matches(':popover-open'))sources.hidePopover();choose.setAttribute('aria-expanded','false');if(focus)choose.focus({preventScroll:true});};
 const placeSources=()=>{
  if(!sources.matches(':popover-open'))return;
  const r=choose.getBoundingClientRect(),width=sources.offsetWidth,height=sources.offsetHeight,w=document.documentElement.clientWidth,h=document.documentElement.clientHeight,below=r.bottom+height+14<=h;
  sources.style.left=Math.max(8,Math.min(r.left,w-width-8))+'px';sources.style.top=(below?r.bottom+6:Math.max(8,r.top-height-6))+'px';
  sources.style.setProperty('--menu-origin',below?'top left':'bottom left');
 };
 sources.addEventListener('toggle',e=>{choose.setAttribute('aria-expanded',String(e.newState==='open'));});
 (root.closest('dialog')||document).addEventListener('keydown',e=>{
  if(e.key==='Escape'&&sources.matches(':popover-open')){e.preventDefault();e.stopPropagation();closeSources(true);}
 },true);
 addEventListener('resize',placeSources);
 // Scrolling the sheet dismisses its source popover; scrolling the popover itself stays native.
 root.closest('dialog')?.addEventListener('scroll',e=>{if(!sources.contains(e.target))closeSources();},{capture:true,passive:true});
 if(matchMedia('(pointer:coarse)').matches){choose.popoverTargetElement=sources;choose.setAttribute('aria-expanded','false');}
 if(matchMedia('(min-width:701px) and (min-height:521px)').matches)dq('.photo-aligner-adjust').open=true;
 // current: the saved photo's URL. used: the photo prepared in this sheet {bitmap,options,blob,color,photoRimColor,bandColor,haloModel,mode,url}.
 // draft: what the aligner is working on {bitmap,options,mode}. levelLines: the level guide is showing.
 // owned: the saved photo's disc and version {id,key}, which a game asset belongs to (photo-stamps.mjs).
 // making: the look a game asset is being made for ('asset' or 'color'); one read of the original makes both.
 let current=null,used=null,draft=null,removed=false,changed=false,serial=0,busy=false,plate=.8,rimInner=null,bandInner=null,frameId=0,settle=0,gesture=null,levelLines=false,owned=null,making='asset';
 const pointers=new Map();
 const clearGesture=()=>{
  const ids=[...pointers.keys()];pointers.clear();gesture=null;
  for(const id of ids)if(view.hasPointerCapture(id))view.releasePointerCapture(id);
 };
 const releaseUsed=()=>{if(!used)return;URL.revokeObjectURL(used.url);if(used.bitmap!==draft?.bitmap)used.bitmap.close();used=null;};
 const releaseDraft=()=>{clearGesture();if(draft&&draft.bitmap!==used?.bitmap)draft.bitmap.close();draft=null;};
 const renderSheet=()=>{
  const src=used?.url||(removed?null:current);
  q('.bag-photo-thumb').hidden=!src;if(src&&q('.bag-photo-thumb img').getAttribute('src')!==src)q('.bag-photo-thumb img').src=src;if(!src)q('.bag-photo-thumb img').removeAttribute('src');
  q('.bag-photo-choose span').textContent=src?'Replace photo':'Add photo';
  q('.bag-photo-adjust').hidden=!used;q('.bag-photo-remove').hidden=!src;
  // A saved photo can be levelled again without the original (it was never uploaded): its own texture.
  q('.bag-photo-level').hidden=!(current&&!used&&!removed);
  // The look belongs to the saved photo, so it shows only while that photo is the one in the sheet.
  const look=q('.bag-photo-look'),shown=!!(owned&&current&&!used&&!removed);look.hidden=!shown;
  if(shown){const state=photoLook(owned.id,owned.key);for(const input of look.querySelectorAll('input[type="radio"]'))input.checked=input.value===state.look;q('.bag-photo-asset-make').textContent=state.available?'Make again from original photo':'Make from original photo';q('.bag-photo-look-note').textContent=LOOK_NOTE[state.look==='color'?'color':'asset'];}
 };
 const size=low=>Math.max(64,Math.min(low?360:720,Math.round(frame.clientWidth*Math.min(devicePixelRatio||1,2))));
 const paint=(low=false)=>{
  cancelAnimationFrame(frameId);frameId=requestAnimationFrame(()=>{
   if(!draft)return;const n=size(low);previewInto(view,draft.bitmap,draft.options,n);drawGuides(guides,n,plate,levelLines);
   clearTimeout(settle);if(low)settle=setTimeout(()=>paint(false),140);
  });
 };
 const showAngle=()=>{dq('.photo-aligner-angle').value=degrees(draft.options.rotate);};
 const sync=()=>{for(const el of dialog.querySelectorAll('[data-photo]'))el.value=draft.options[el.dataset.photo];showAngle();};
 // mode 'frame' (a new photo: everything adjustable) or 'level' (a saved photo: the angle only).
 const openAligner=(bitmap,options,mode='frame')=>{
  closeSources();clearGesture();draft={bitmap,options:{...DEFAULTS,...options},mode};sync();
  dialog.dataset.mode=mode;[dq('h2').textContent,dq('.photo-aligner-tip').textContent]=TEXT[mode];dq('[data-aligner-confirm]').textContent=mode==='asset'?'Make game asset':'Use photo';
  dq('.photo-aligner-status').textContent='';dq('[data-aligner-confirm]').disabled=false;
  if(!dialog.open)dialog.showModal();view.focus({preventScroll:true});paint();
 };
 const closeAligner=()=>{serial++;busy=false;releaseDraft();if(dialog.open)dialog.close();};
 dialog.addEventListener('close',()=>{if(draft){serial++;busy=false;releaseDraft();}});
 new ResizeObserver(()=>{if(draft){reanchor();paint();}}).observe(frame);

 choose.onclick=e=>{
  e.preventDefault();if(!matchMedia('(pointer:coarse)').matches){file.click();return;}
  choose.popoverTargetElement=sources;window.AtlasDropdown?.close(false);sources.togglePopover();placeSources();
  if(sources.matches(':popover-open'))sources.querySelector('button').focus({preventScroll:true});
 };
 sources.onclick=e=>{
  const source=e.target.closest('[data-photo-source]');
  if(source){closeSources(true);q('[data-photo-input="'+source.dataset.photoSource+'"]').click();}
  else if(e.target.closest('[data-photo-source-cancel]'))closeSources(true);
 };
 q('.bag-photo-adjust').onclick=()=>{if(used)openAligner(used.bitmap,used.options,used.mode);};
 q('.bag-photo-level').onclick=async()=>{
  if(!current||busy)return;const id=++serial;busy=true;q('.bag-photo-status').textContent='Opening your photo…';
  try{
   const response=await fetch(current,{credentials:'same-origin',cache:'no-store'}).catch(()=>null);
   if(!response?.ok)throw Error('Your saved photo could not open. Check your connection and try again.');
   const image=await decodePhoto(await response.blob());if(id!==serial){image.close();return;}
   q('.bag-photo-status').textContent='';openAligner(image,levelOptions(image),'level');
  }catch(e){if(id===serial)q('.bag-photo-status').textContent=e.message.startsWith('Choose')?'Your saved photo could not open. Try again.':e.message;}
  finally{if(id===serial)busy=false;}
 };
 q('.bag-photo-remove').onclick=()=>{serial++;busy=false;releaseUsed();removed=true;changed=true;q('.bag-photo-status').textContent='';renderSheet();onColor(null);};
 for(const input of root.querySelectorAll('input[type="file"]:not(.bag-photo-asset-file)'))input.onchange=async()=>{
  const chosen=input.files[0];input.value='';if(!chosen)return;const id=++serial;busy=true;
  try{const image=await decodePhoto(chosen);if(id!==serial){image.close();return;}q('.bag-photo-status').textContent='';openAligner(image,DEFAULTS);}
  catch(e){if(id===serial)q('.bag-photo-status').textContent=e.message;}
  finally{if(id===serial)busy=false;}
 };
 // The look: an existing asset switches at once; the first time, the original photo is framed and read.
 const pickOriginal=look=>{if(owned&&!busy){making=look;q('.bag-photo-asset-file').click();}};
 q('.bag-photo-look').addEventListener('change',e=>{
  if(!owned||e.target.type!=='radio')return;
  const want=e.target.value,state=photoLook(owned.id,owned.key);
  // An asset made before full colour existed has no colour layer: the original is read again for it.
  if(want==='asset'&&!state.available||want==='color'&&!state.color){renderSheet();pickOriginal(want);return;}
  setPhotoLook(owned.id,owned.key,want);q('.bag-photo-status').textContent=want==='asset'?'Showing the game asset, in this browser.':want==='color'?'Showing the full-color asset, in this browser.':'Showing the photo.';renderSheet();
 });
 q('.bag-photo-asset-make').onclick=()=>pickOriginal(owned&&photoLook(owned.id,owned.key).look==='color'?'color':'asset');
 q('.bag-photo-asset-file').onchange=async()=>{
  const input=q('.bag-photo-asset-file'),chosen=input.files[0];input.value='';if(!chosen||!owned)return;const id=++serial;busy=true;
  try{const image=await decodePhoto(chosen);if(id!==serial){image.close();return;}q('.bag-photo-status').textContent='';openAligner(image,DEFAULTS,'asset');}
  catch(e){if(id===serial)q('.bag-photo-status').textContent=e.message;}
  finally{if(id===serial)busy=false;}
 };
 for(const el of dialog.querySelectorAll('[data-aligner-cancel]'))el.onclick=closeAligner;
 dq('[data-aligner-confirm]').onclick=async()=>{
  if(!draft||busy)return;const id=++serial,{bitmap,mode}=draft,options={...draft.options};clearGesture();busy=true;
  dq('[data-aligner-confirm]').disabled=true;dq('.photo-aligner-status').textContent=mode==='asset'?'Making the game asset…':'Preparing your photo…';
  if(mode==='asset'){
   const target=owned;
   try{
    await new Promise(r=>requestAnimationFrame(()=>setTimeout(r)));
    const asset=await photoStampAsset(bitmap,options,{plate,color:true}),look=making;if(id!==serial)return;
    await savePhotoStamp(target.id,target.key,{...asset,look});if(id!==serial)return;
    closeAligner();q('.bag-photo-status').textContent=look==='color'?'Full-color asset made. Kept in this browser.':'Game asset made. Kept in this browser.';renderSheet();
   }catch(e){if(id===serial){busy=false;dq('[data-aligner-confirm]').disabled=false;dq('.photo-aligner-status').textContent=e.message||'The game asset could not be made. Try again.';}}
   return;
  }
  try{
   await new Promise(r=>requestAnimationFrame(()=>setTimeout(r)));
   // Levelling only resamples the saved texture; it keeps the disc's colour as it is.
   // An overmold's rim piece (rimColor) or, on a one-piece mold, the outer band a Halo copy would show
   // (bandColor, kept apart so only a Halo copy ever stores it; see the bandColor getter).
   const level=mode==='level',{blob,color,photoRimColor,bandColor,haloModel}=await preparePhoto(bitmap,{...options,rimInner,bandInner},{albedo:!level});if(id!==serial)return;
   const previous=used;used={bitmap,options:{...options},blob,color,photoRimColor,bandColor,haloModel,mode,url:URL.createObjectURL(blob)};
   if(previous){URL.revokeObjectURL(previous.url);if(previous.bitmap!==bitmap)previous.bitmap.close();}
   draft=null;removed=false;changed=true;busy=false;dialog.close();renderSheet();if(!level)onColor(color);
  }catch(e){if(id===serial){busy=false;dq('[data-aligner-confirm]').disabled=false;dq('.photo-aligner-status').textContent=e.message;}}
 };
 dialog.addEventListener('input',e=>{if(draft&&!busy&&e.target.dataset.photo){draft.options[e.target.dataset.photo]=+e.target.value;showAngle();reanchor();paint(true);}});
 // Levelling: nudges of 0.1° and 1°, a snap back to exactly 0°, and the level lines (chrome only).
 const turn=v=>{if(!draft||busy)return;draft.options.rotate=Math.max(-180,Math.min(180,Math.round(v*10)/10))||0;sync();reanchor();paint(true);};
 dq('.photo-aligner-level').onclick=e=>{
  const button=e.target.closest('button');if(!button||!draft)return;
  if(button.dataset.rotate)turn(draft.options.rotate+ +button.dataset.rotate);
  else if('rotateZero' in button.dataset)turn(0);
  else if('levelLines' in button.dataset){levelLines=!levelLines;button.setAttribute('aria-pressed',String(levelLines));paint();}
 };
 const clamp=v=>Math.max(0,Math.min(1,v));
 view.onkeydown=e=>{
  if(!draft||busy)return;const o=draft.options,step=e.shiftKey?.05:.01;
  if(e.code==='BracketLeft'||e.code==='BracketRight'){e.preventDefault();turn(o.rotate+(e.code==='BracketLeft'?-1:1)*(e.shiftKey?1:.1));return;}
  if(draft.mode==='level')return;
  const delta={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]}[e.key];
  if(delta){e.preventDefault();o.cx=clamp(o.cx+delta[0]);o.cy=clamp(o.cy+delta[1]);reanchor();paint(true);return;}
  if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();o.scale=Math.max(.3,Math.min(1,o.scale+(e.key==='-'?.01:-.01)));reanchor();sync();paint(true);}
 };
 view.addEventListener('wheel',e=>{if(!draft)return;e.preventDefault();if(busy||draft.mode==='level')return;const o=draft.options;o.scale=Math.max(.3,Math.min(1,o.scale*Math.exp(e.deltaY*.0012)));reanchor();sync();paint(true);},{passive:false});
 const midpoint=points=>points.length===1?points[0]:{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2};
 const distance=points=>points.length<2?0:Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
 const atMidpoint=(point,options,rect,w,h)=>photoPoint(((point.x-rect.left)/rect.width*2-1)*VIEW,((point.y-rect.top)/rect.height*2-1)*VIEW,{...options,width:w,height:h});
 const reanchor=()=>{
  if(!draft||!pointers.size){gesture=null;return;}
  const points=[...pointers.values()].slice(0,2),mid=midpoint(points),rect=view.getBoundingClientRect(),{w,h}=workingCopy(draft.bitmap),options={...draft.options};
  gesture={mid,rect,w,h,options,span:frame.clientWidth/VIEW,distance:distance(points),source:atMidpoint(mid,options,rect,w,h)};
 };
 // Gesture state belongs to this editor, never to its preview/guide canvases' pixels.
 view.onpointerdown=e=>{
  if(!draft||busy||e.button!==0)return;e.preventDefault();if(draft.mode==='level')return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});view.setPointerCapture(e.pointerId);reanchor();
 };
 view.onpointermove=e=>{
  if(!gesture||!draft||busy||!pointers.has(e.pointerId))return;e.preventDefault();
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const points=[...pointers.values()].slice(0,2),mid=midpoint(points),o=draft.options,g=gesture;
  if(points.length===1){
   // Preserve the existing mouse/single-finger pan semantics.
   const radius=Math.min(g.w,g.h)*g.options.scale;
   o.cx=clamp(g.options.cx-(mid.x-g.mid.x)/g.span*radius/g.w);o.cy=clamp(g.options.cy-(mid.y-g.mid.y)/g.span*radius/g.h);
  }else{
   o.scale=Math.max(.3,Math.min(1,g.options.scale*(g.distance||1)/Math.max(1,distance(points))));
   const source=atMidpoint(mid,{...g.options,scale:o.scale},g.rect,g.w,g.h);
   o.cx=clamp(g.options.cx+(g.source.x-source.x)/g.w);o.cy=clamp(g.options.cy+(g.source.y-source.y)/g.h);sync();
  }
  paint(true);
 };
 view.onpointerup=view.onpointercancel=view.onlostpointercapture=e=>{
  if(!pointers.delete(e.pointerId))return;reanchor();
  if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);
 };
 // Safari's legacy gesture/double-tap handling must not steal a captured stage gesture.
 // Explicit passive:false is essential on iOS; controls retain their native taps and sliders.
 const prevent=e=>{if(e.cancelable)e.preventDefault();};
 for(const type of ['gesturestart','gesturechange','gestureend'])dialog.addEventListener(type,prevent,{passive:false});
 for(const type of ['touchstart','touchmove','touchend'])dialog.addEventListener(type,e=>{
  if(stage.contains(e.target)||e.touches.length>1)prevent(e);
 },{passive:false});
 dialog.addEventListener('dblclick',e=>{if(stage.contains(e.target))prevent(e);});

 const reset=(item,mold)=>{
  closeSources();serial++;busy=false;if(dialog.open)dialog.close();releaseDraft();releaseUsed();
  current=photoURL(item);owned=item?.id&&item?.texture_key?{id:String(item.id),key:item.texture_key}:null;removed=false;changed=false;plate=plateRatio(mold);
  rimInner=mold&&isOvermold({...mold,record:mold.name})?plate:null;bandInner=rimInner?null:bandRatio(mold);
  q('.bag-photo-status').textContent='';renderSheet();
 };
 reset(null);
 return {reset,get changed(){return changed||busy;},
  get photoRimColor(){return used?.photoRimColor??null;},
  // The prepared photo's outer band (one-piece molds only). The sheet stores it as photo_rim_color only for a
  // Halo copy (disc3d/halo.mjs), since only the sheet knows the plastic at save time.
  get bandColor(){return used?.bandColor??null;},
  // The band's two-colour model (disc3d/halo.mjs encodeHalo), stored with bandColor for a Halo copy only.
  get haloModel(){return used?.haloModel??null;},
  async value(){if(busy)throw Error('Wait for the photo to finish.');return used?used.blob:null;},
  // For tests: the aligner and what it is working on.
  debug:{dialog,get draft(){return draft;},get used(){return used;}}};
}
