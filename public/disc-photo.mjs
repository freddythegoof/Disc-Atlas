// Photos never leave the browser until reduced to a bounded, metadata-free circular WebP.
import {delightPixels,rimColor} from './disc-albedo.mjs';
import {shapeForDisc,shapeFrame} from './disc3d/shape.mjs';
import {isOvermold} from './disc3d/overmold.mjs';
import {findDiscCircle,discColours} from './disc3d/photo-clean.mjs';
export const PHOTO_BYTES=512*1024,PHOTO_SIZE=1024;
export const photoURL=item=>item?.texture_key?'/api/bag/discs/'+encodeURIComponent(item.id)+'/photo?v='+encodeURIComponent(item.texture_key):null;
// Inverse projective crop. Aspect repairs mild ellipse foreshortening; perspective adjusts near/far scale.
export function photoPoint(x,y,{width,height,scale=.94,aspect=1,perspective=0,angle=0,cx=.5,cy=.5}){
 const r=Math.min(width,height)*scale/2,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),u=x*c+y*s,v=-x*s+y*c,k=1+perspective*v;
 return {x:cx*width+(u*c-v*aspect*s)*r/k,y:cy*height+(u*s+v*aspect*c)*r/k,inside:x*x+y*y<=1};
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
// on every drag. A canvas source can be redrawn, so it is always read afresh.
const workingCopies=new WeakMap();
function workingCopy(image){
 const keep=typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap;
 let copy=keep&&workingCopies.get(image);if(copy)return copy;
 const input=document.createElement('canvas'),ratio=Math.min(1,2048/Math.max(image.width,image.height));
 input.width=Math.round(image.width*ratio);input.height=Math.round(image.height*ratio);
 const g=input.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,input.width,input.height);
 copy={data:g.getImageData(0,0,input.width,input.height).data,w:input.width,h:input.height};if(keep)workingCopies.set(image,copy);
 return copy;
}
export function photoCanvas(image,options={},size=PHOTO_SIZE){
 const {data:source,w,h}=workingCopy(image),out=document.createElement('canvas');out.width=out.height=size;
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
// The disc's own edge in the photo, near the aligner's circle (photo-clean.mjs finds it: the one circle that
// many rays agree has the disc inside and something else outside). Returns the framing that puts the circle on
// that edge, {cx, cy, scale}, or null when no edge is clear enough. Hand alignment is rarely exact, and every
// pixel of table inside the circle bakes into the texture; the aligner snaps to this and says so.
export function snapToDisc(image,options={}){
 const {data,w,h}=workingCopy(image),o={...DEFAULTS,...options,width:w,height:h};
 const sample=(u,v)=>{
  const p=photoPoint(u,v,o);if(p.x<0||p.y<0||p.x>=w-1||p.y>=h-1)return null;
  const a=Math.floor(p.x),b=Math.floor(p.y),fx=p.x-a,fy=p.y-b,k=(b*w+a)*4,out=[0,0,0,0];
  for(let c=0;c<4;c++)out[c]=(data[k+c]*(1-fx)+data[k+4+c]*fx)*(1-fy)+(data[k+4*w+c]*(1-fx)+data[k+4*w+4+c]*fx)*fy;
  return out;
 };
 const edge=findDiscCircle(sample,{mode:'photo',from:.45,to:1.3,step:1/160,rMin:.7,rMax:1.25,maxOffset:.3,isDisc:discColours(sample,.5,64,1/160)});
 if(!edge)return null;
 // Inset by half a percent, so the edge's own blend with the table stays outside the crop.
 const center=photoPoint(edge.x,edge.y,o),scale=Math.max(.3,Math.min(1,o.scale*edge.r*.995));
 return {cx:Math.max(0,Math.min(1,center.x/w)),cy:Math.max(0,Math.min(1,center.y/h)),scale,edge};
}
// The crop with the photo's lighting removed (disc-albedo.mjs), and the plate colour it measured.
export function albedoCanvas(image,options={},size=PHOTO_SIZE){
 const canvas=photoCanvas(image,options,size),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,size,size);
 const {color}=delightPixels(pixels.data,size);ctx.putImageData(pixels,0,0);
 const photoRimColor=options.rimInner?rimColor(pixels.data,size,options.rimInner):null;
 return {canvas,color,photoRimColor};
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
// Resolves to {blob, color, photoRimColor}. Sample the rim once from the 1024px
// processed pixels, retaining that value even if upload compression needs a smaller image.
export async function preparePhoto(image,options={}){
 let native=await supportsCanvasWebP(),encoded=0,empty=0,photoRimColor=null;
 for(const size of [1024,768,512]){
  const {canvas,color,photoRimColor:sample}=albedoCanvas(image,size===1024?options:{...options,rimInner:null},size);
  if(size===1024)photoRimColor=sample;
  try{
   for(const quality of [.86,.72,.56,.4]){
    let blob=native===false?await fallbackWebP(canvas,quality):await canvasBlob(canvas,quality);
    // A null result is an encode failure, not evidence that WebP is unsupported.
    if(blob&&blob.type!=='image/webp'){native=false;blob=await fallbackWebP(canvas,quality);}
    if(!blob){empty++;continue;}
    encoded++;if(blob.size<=PHOTO_BYTES)return {blob,color,photoRimColor};
   }
  }finally{canvas.width=canvas.height=0;}
 }
 if(!encoded)throw Error('The browser returned no image data while encoding this photo. Close other tabs and retry.');
 throw Error('The encoded photo still exceeds 512 KiB at 512 pixels and 40% quality.'+(empty?' The browser also returned empty encoding results.':''));
}
export async function processPhoto(image,options={}){return (await preparePhoto(image,options)).blob;}

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
function drawGuides(canvas,size,plate){
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
}

const DEFAULTS={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5};
const SLIDERS='<label>Framing<input type="range" data-photo="scale" min="0.3" max="1" step="0.01"></label><label>Tilt correction<input type="range" data-photo="aspect" min="0.8" max="1.2" step="0.01"></label><label>Tilt direction<input type="range" data-photo="angle" min="0" max="180" step="5"></label><label>Perspective<input type="range" data-photo="perspective" min="-0.12" max="0.12" step="0.01"></label>';

// The sheet shows the photo and its actions; choosing a photo opens the aligner, a large pop-out with
// guides. Use photo prepares the upload there (lighting removed, plate colour measured) and returns to
// the sheet with it; Cancel returns with nothing changed. Saving still happens with the sheet.
// onColor(color) reports the plate colour of a newly used photo, onColor(null) its removal.
let sourceChooserId=0;
export function createPhotoEditor(root,{onColor=()=>{}}={}){
 root.innerHTML='<span class="bag-photo-label">Photo<small>Your disc’s own stamp on its 3D model. Only you can see it.</small></span><div class="bag-photo-row"><span class="bag-photo-thumb" hidden><img alt="Your disc photo"></span><div class="bag-photo-actions"><button type="button" class="bag-photo-choose"><svg class="bag-photo-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-1.9A1.5 1.5 0 0 1 10.7 3.5h2.6a1.5 1.5 0 0 1 1.2.6L15.8 6h1.7A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.4"/></svg><span>Add photo</span></button><button type="button" class="bag-photo-adjust" hidden>Adjust</button><button type="button" class="bag-photo-remove" hidden>Remove photo</button></div></div><input class="bag-photo-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden><p class="bag-photo-status" role="status"></p>';
 // Non-camera accept values are presentation hints; the OS may merge library/files into one sheet.
 root.insertAdjacentHTML('beforeend','<div class="rack-style-menu bag-photo-source-menu" popover="auto" role="group" aria-label="Photo source"><button type="button" data-photo-source="camera">Camera</button><button type="button" data-photo-source="library">Photo Library</button><button type="button" data-photo-source="files">Files</button><button type="button" data-photo-source-cancel>Cancel</button></div><input class="bag-photo-source-file" data-photo-input="camera" type="file" accept="image/*" capture="environment" hidden><input class="bag-photo-source-file" data-photo-input="library" type="file" accept="image/*" hidden><input class="bag-photo-source-file" data-photo-input="files" type="file" hidden>');
 const dialog=document.createElement('dialog');dialog.className='photo-aligner';dialog.setAttribute('aria-labelledby','photoAlignerTitle');
 dialog.innerHTML='<div class="disc3d-dialog-panel"><div class="disc3d-dialog-head"><div><div class="disc3d-dialog-eyebrow">YOUR DISC PHOTO</div><h2 id="photoAlignerTitle">Center the disc</h2></div><button type="button" class="close" data-aligner-cancel aria-label="Cancel photo">×</button></div><div class="photo-aligner-body"><div class="photo-aligner-stage"><div class="photo-aligner-frame"><canvas class="photo-aligner-view" tabindex="0" aria-label="Photo alignment. Drag, or use the arrow keys, to center the disc; plus and minus resize."></canvas><canvas class="photo-aligner-guides" aria-hidden="true"></canvas></div></div><p class="photo-aligner-tip">Drag until the disc’s edge sits on the outer ring and its center on the crosshair.</p><p class="photo-aligner-snap" aria-live="polite" hidden><span></span> <button type="button" class="photo-aligner-snap-action"></button></p><details class="photo-aligner-adjust"><summary>Adjust photo</summary><div class="photo-aligner-sliders">'+SLIDERS+'</div></details><p class="photo-aligner-status" role="status"></p><div class="photo-aligner-actions"><button type="button" class="pill-button" data-aligner-cancel>Cancel</button><button type="button" class="pill-button primary" data-aligner-confirm>Use photo</button></div></div></div>';
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
 // current: the saved photo's URL. used: the photo prepared in this sheet {bitmap,options,blob,color,url}.
 // draft: what the aligner is working on {bitmap,options}.
 let current=null,used=null,draft=null,removed=false,changed=false,serial=0,busy=false,plate=.8,rimInner=null,frameId=0,settle=0,gesture=null;
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
 };
 const size=low=>Math.max(64,Math.min(low?360:720,Math.round(frame.clientWidth*Math.min(devicePixelRatio||1,2))));
 const paint=(low=false)=>{
  cancelAnimationFrame(frameId);frameId=requestAnimationFrame(()=>{
   if(!draft)return;const n=size(low);previewInto(view,draft.bitmap,draft.options,n);drawGuides(guides,n,plate);
   clearTimeout(settle);if(low)settle=setTimeout(()=>paint(false),140);
  });
 };
 const sync=()=>{for(const el of dialog.querySelectorAll('[data-photo]'))el.value=draft.options[el.dataset.photo];};
 // Snap: after the ring settles (on opening, and after each drag, pinch, key or slider), it moves onto the disc's
 // own edge when snapToDisc finds one at least 1.5% away (a smaller miss leaves no crescent worth a move, and the
 // load-time cleanup takes care of it), and says so with an Undo. Undo keeps the user's ring and stops snapping
 // for this photo until Snap to edge. Using the photo never snaps on the way out: what is saved is what was shown.
 // <html data-photo-snap="off"> turns the automatic snap off (the gesture tests measure raw gesture maths).
 const snapLine=dq('.photo-aligner-snap'),snapText=snapLine.querySelector('span'),snapAction=snapLine.querySelector('button');
 let snapTimer=0;
 const showSnap=(text,action)=>{snapText.textContent=text;snapAction.textContent=action||'';snapAction.hidden=!action;snapLine.hidden=!text;};
 const snapNow=(asked=false)=>{
  clearTimeout(snapTimer);if(!draft||busy||pointers.size)return;
  const o=draft.options,found=snapToDisc(draft.bitmap,o);
  if(!found){if(asked)showSnap('No clear disc edge near the ring. Line it up by hand.');return;}
  const {w,h}=workingCopy(draft.bitmap),r=Math.min(w,h)*o.scale/2,moved=Math.hypot((found.cx-o.cx)*w,(found.cy-o.cy)*h)/r,resized=Math.abs(found.scale/o.scale-1);
  if(moved<.015&&resized<.015){if(asked)showSnap('The ring is on the disc’s edge.');return;}
  draft.snap.undo={cx:o.cx,cy:o.cy,scale:o.scale};Object.assign(o,{cx:found.cx,cy:found.cy,scale:found.scale});sync();paint();
  showSnap('Snapped the ring to your disc’s edge.','Undo');
 };
 const scheduleSnap=()=>{clearTimeout(snapTimer);if(draft?.snap.auto&&document.documentElement.dataset.photoSnap!=='off')snapTimer=setTimeout(snapNow,350);};
 snapAction.onclick=()=>{
  if(!draft||busy)return;
  if(draft.snap.undo){Object.assign(draft.options,draft.snap.undo);draft.snap={auto:false,undo:null};sync();paint();showSnap('Ring back where you put it.','Snap to edge');}
  else{draft.snap.auto=true;snapNow(true);}
  view.focus({preventScroll:true});
 };
 const openAligner=(bitmap,options)=>{
  closeSources();clearGesture();draft={bitmap,options:{...DEFAULTS,...options},snap:{auto:true,undo:null}};sync();
  dq('.photo-aligner-status').textContent='';dq('[data-aligner-confirm]').disabled=false;showSnap('');
  if(!dialog.open)dialog.showModal();view.focus({preventScroll:true});paint();scheduleSnap();
 };
 const closeAligner=()=>{clearTimeout(snapTimer);serial++;busy=false;releaseDraft();if(dialog.open)dialog.close();};
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
 q('.bag-photo-adjust').onclick=()=>{if(used)openAligner(used.bitmap,used.options);};
 q('.bag-photo-remove').onclick=()=>{serial++;busy=false;releaseUsed();removed=true;changed=true;q('.bag-photo-status').textContent='';renderSheet();onColor(null);};
 for(const input of root.querySelectorAll('input[type="file"]'))input.onchange=async()=>{
  const chosen=input.files[0];input.value='';if(!chosen)return;const id=++serial;busy=true;
  try{const image=await decodePhoto(chosen);if(id!==serial){image.close();return;}q('.bag-photo-status').textContent='';openAligner(image,DEFAULTS);}
  catch(e){if(id===serial)q('.bag-photo-status').textContent=e.message;}
  finally{if(id===serial)busy=false;}
 };
 for(const el of dialog.querySelectorAll('[data-aligner-cancel]'))el.onclick=closeAligner;
 dq('[data-aligner-confirm]').onclick=async()=>{
  if(!draft||busy)return;clearTimeout(snapTimer);const id=++serial,{bitmap}=draft,options={...draft.options};clearGesture();busy=true;
  dq('[data-aligner-confirm]').disabled=true;dq('.photo-aligner-status').textContent='Preparing your photo…';
  try{
   await new Promise(r=>requestAnimationFrame(()=>setTimeout(r)));
   const {blob,color,photoRimColor}=await preparePhoto(bitmap,{...options,rimInner});if(id!==serial)return;
   const previous=used;used={bitmap,options:{...options},blob,color,photoRimColor,url:URL.createObjectURL(blob)};
   if(previous){URL.revokeObjectURL(previous.url);if(previous.bitmap!==bitmap)previous.bitmap.close();}
   draft=null;removed=false;changed=true;busy=false;dialog.close();renderSheet();onColor(color);
  }catch(e){if(id===serial){busy=false;dq('[data-aligner-confirm]').disabled=false;dq('.photo-aligner-status').textContent=e.message;}}
 };
 // Any hand adjustment replaces a snap's Undo: the ring is the user's again until it settles.
 const adjusted=()=>{if(draft.snap.undo){draft.snap.undo=null;showSnap('');}scheduleSnap();};
 dialog.addEventListener('input',e=>{if(draft&&!busy&&e.target.dataset.photo){draft.options[e.target.dataset.photo]=+e.target.value;reanchor();paint(true);adjusted();}});
 const clamp=v=>Math.max(0,Math.min(1,v));
 view.onkeydown=e=>{
  if(!draft||busy)return;const o=draft.options,step=e.shiftKey?.05:.01;
  const delta={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]}[e.key];
  if(delta){e.preventDefault();o.cx=clamp(o.cx+delta[0]);o.cy=clamp(o.cy+delta[1]);reanchor();paint(true);adjusted();return;}
  if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();o.scale=Math.max(.3,Math.min(1,o.scale+(e.key==='-'?.01:-.01)));reanchor();sync();paint(true);adjusted();}
 };
 view.addEventListener('wheel',e=>{if(!draft)return;e.preventDefault();if(busy)return;const o=draft.options;o.scale=Math.max(.3,Math.min(1,o.scale*Math.exp(e.deltaY*.0012)));reanchor();sync();paint(true);adjusted();},{passive:false});
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
  if(!draft||busy||e.button!==0)return;e.preventDefault();
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});view.setPointerCapture(e.pointerId);reanchor();clearTimeout(snapTimer);
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
  if(!pointers.size&&draft)adjusted();
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
  current=photoURL(item);removed=false;changed=false;plate=plateRatio(mold);
  rimInner=mold&&isOvermold({...mold,record:mold.name})?plate:null;
  q('.bag-photo-status').textContent='';renderSheet();
 };
 reset(null);
 return {reset,get changed(){return changed||busy;},
  get photoRimColor(){return used?.photoRimColor??null;},
  async value(){if(busy)throw Error('Wait for the photo to finish.');return used?used.blob:null;},
  // For tests: the aligner and what it is working on.
  debug:{dialog,get draft(){return draft;},get used(){return used;}}};
}
