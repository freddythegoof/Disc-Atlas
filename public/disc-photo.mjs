// Photos never leave the browser until reduced to a bounded, metadata-free circular WebP.
import {delightPixels} from './disc-albedo.mjs';
import {shapeForDisc,shapeFrame} from './disc3d/shape.mjs';
import {isOvermold} from './disc3d/overmold.mjs';
export const PHOTO_BYTES=512*1024,PHOTO_SIZE=1024;
export const photoURL=item=>item?.texture_key?'/api/bag/discs/'+encodeURIComponent(item.id)+'/photo?v='+encodeURIComponent(item.texture_key):null;
// Inverse projective crop. Aspect repairs mild ellipse foreshortening; perspective adjusts near/far scale.
export function photoPoint(x,y,{width,height,scale=.94,aspect=1,perspective=0,angle=0,cx=.5,cy=.5}){
 const r=Math.min(width,height)*scale/2,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),u=x*c+y*s,v=-x*s+y*c,k=1+perspective*v;
 return {x:cx*width+(u*c-v*aspect*s)*r/k,y:cy*height+(u*s+v*aspect*c)*r/k,inside:x*x+y*y<=1};
}
export async function decodePhoto(file){
 if(!file||file.size>30*1024*1024||!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type))throw Error('Choose a JPG, PNG or WebP photo up to 30 MB.');
 let bitmap;try{bitmap=await createImageBitmap(file);}catch{throw Error('This photo could not open. Try a JPG, PNG or WebP.');}
 if(bitmap.width*bitmap.height>60e6){bitmap.close();throw Error('Choose a photo smaller than 60 megapixels.');}
 return bitmap;
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
// The crop with the photo's lighting removed (disc-albedo.mjs), and the plate colour it measured.
export function albedoCanvas(image,options={},size=PHOTO_SIZE){
 const canvas=photoCanvas(image,options,size),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,size,size);
 const {color}=delightPixels(pixels.data,size);ctx.putImageData(pixels,0,0);
 return {canvas,color};
}
// Resolves to {blob, color}: the upload and the plate colour the disc should start with.
export async function preparePhoto(image,options={}){
 for(const size of [1024,768,512]){
  const {canvas,color}=albedoCanvas(image,options,size);
  for(const quality of [.86,.72,.56,.4]){
   const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',quality));
   if(blob?.type==='image/webp'&&blob.size<=PHOTO_BYTES)return {blob,color};
  }
 }
 throw Error('This photo could not be compressed. Try another photo.');
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
 for(const [label,r] of [['RIM',R],['FLIGHT PLATE',R*plate]]){const y=c-r-6*u;g.strokeText(label,c+R*.42,y+r*.09);g.fillText(label,c+R*.42,y+r*.09);}
}

const DEFAULTS={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5};
const SLIDERS='<label>Framing<input type="range" data-photo="scale" min="0.3" max="1" step="0.01"></label><label>Tilt correction<input type="range" data-photo="aspect" min="0.8" max="1.2" step="0.01"></label><label>Tilt direction<input type="range" data-photo="angle" min="0" max="180" step="5"></label><label>Perspective<input type="range" data-photo="perspective" min="-0.12" max="0.12" step="0.01"></label>';

// The sheet shows the photo and its actions; choosing a photo opens the aligner, a large pop-out with
// guides. Use photo prepares the upload there (lighting removed, plate colour measured) and returns to
// the sheet with it; Cancel returns with nothing changed. Saving still happens with the sheet.
// onColor(color) reports the plate colour of a newly used photo, onColor(null) its removal.
export function createPhotoEditor(root,{onColor=()=>{}}={}){
 root.innerHTML='<div class="bag-photo-row"><span class="bag-photo-thumb" hidden><img alt="Your disc photo"></span><div class="bag-photo-actions"><button type="button" class="bag-photo-choose"><span>Add photo</span></button><button type="button" class="bag-photo-adjust" hidden>Adjust</button><button type="button" class="bag-photo-remove" hidden>Remove photo</button></div></div><input class="bag-photo-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden><p class="bag-photo-status" role="status"></p>';
 const dialog=document.createElement('dialog');dialog.className='photo-aligner';dialog.setAttribute('aria-labelledby','photoAlignerTitle');
 dialog.innerHTML='<div class="disc3d-dialog-panel"><div class="disc3d-dialog-head"><div><div class="disc3d-dialog-eyebrow">YOUR DISC PHOTO</div><h2 id="photoAlignerTitle">Center the disc</h2></div><button type="button" class="close" data-aligner-cancel aria-label="Cancel photo">×</button></div><div class="photo-aligner-body"><div class="photo-aligner-stage"><div class="photo-aligner-frame"><canvas class="photo-aligner-view" tabindex="0" aria-label="Photo alignment. Drag, or use the arrow keys, to center the disc; plus and minus resize."></canvas><canvas class="photo-aligner-guides" aria-hidden="true"></canvas></div></div><p class="photo-aligner-tip">Drag until the disc’s edge sits on the outer ring and its center on the crosshair.</p><details class="photo-aligner-adjust"><summary>Adjust photo</summary><div class="photo-aligner-sliders">'+SLIDERS+'</div></details><p class="photo-aligner-status" role="status"></p><div class="photo-aligner-actions"><button type="button" class="pill-button" data-aligner-cancel>Cancel</button><button type="button" class="pill-button primary" data-aligner-confirm>Use photo</button></div></div></div>';
 document.body.append(dialog);
 const q=s=>root.querySelector(s),dq=s=>dialog.querySelector(s),file=q('.bag-photo-file'),view=dq('.photo-aligner-view'),guides=dq('.photo-aligner-guides'),frame=dq('.photo-aligner-frame');
 // capture is applied only for coarse pointers; desktop keeps the ordinary file picker.
 if(matchMedia('(pointer:coarse)').matches)file.setAttribute('capture','environment');
 if(matchMedia('(min-width:701px) and (min-height:521px)').matches)dq('.photo-aligner-adjust').open=true;
 // current: the saved photo's URL. used: the photo prepared in this sheet {bitmap,options,blob,color,url}.
 // draft: what the aligner is working on {bitmap,options}.
 let current=null,used=null,draft=null,removed=false,changed=false,serial=0,busy=false,plate=.8,frameId=0,settle=0,dragging=null;
 const releaseUsed=()=>{if(!used)return;URL.revokeObjectURL(used.url);if(used.bitmap!==draft?.bitmap)used.bitmap.close();used=null;};
 const releaseDraft=()=>{if(draft&&draft.bitmap!==used?.bitmap)draft.bitmap.close();draft=null;};
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
 const openAligner=(bitmap,options)=>{
  draft={bitmap,options:{...DEFAULTS,...options}};sync();
  dq('.photo-aligner-status').textContent='';dq('[data-aligner-confirm]').disabled=false;
  if(!dialog.open)dialog.showModal();view.focus({preventScroll:true});paint();
 };
 const closeAligner=()=>{serial++;busy=false;releaseDraft();if(dialog.open)dialog.close();};
 dialog.addEventListener('close',()=>{if(draft){serial++;busy=false;releaseDraft();}});
 new ResizeObserver(()=>{if(draft)paint();}).observe(frame);

 q('.bag-photo-choose').onclick=()=>file.click();
 q('.bag-photo-adjust').onclick=()=>{if(used)openAligner(used.bitmap,used.options);};
 q('.bag-photo-remove').onclick=()=>{serial++;busy=false;releaseUsed();removed=true;changed=true;q('.bag-photo-status').textContent='';renderSheet();onColor(null);};
 file.onchange=async()=>{
  const id=++serial,chosen=file.files[0];file.value='';if(!chosen)return;busy=true;
  try{const image=await decodePhoto(chosen);if(id!==serial){image.close();return;}q('.bag-photo-status').textContent='';openAligner(image,DEFAULTS);}
  catch(e){if(id===serial)q('.bag-photo-status').textContent=e.message;}
  finally{if(id===serial)busy=false;}
 };
 for(const el of dialog.querySelectorAll('[data-aligner-cancel]'))el.onclick=closeAligner;
 dq('[data-aligner-confirm]').onclick=async()=>{
  if(!draft||busy)return;const id=++serial,{bitmap,options}=draft;busy=true;
  dq('[data-aligner-confirm]').disabled=true;dq('.photo-aligner-status').textContent='Preparing your photo…';
  try{
   await new Promise(r=>requestAnimationFrame(()=>setTimeout(r)));
   const {blob,color}=await preparePhoto(bitmap,options);if(id!==serial)return;
   const previous=used;used={bitmap,options:{...options},blob,color,url:URL.createObjectURL(blob)};
   if(previous){URL.revokeObjectURL(previous.url);if(previous.bitmap!==bitmap)previous.bitmap.close();}
   draft=null;removed=false;changed=true;busy=false;dialog.close();renderSheet();onColor(color);
  }catch(e){if(id===serial){busy=false;dq('[data-aligner-confirm]').disabled=false;dq('.photo-aligner-status').textContent=e.message;}}
 };
 dialog.addEventListener('input',e=>{if(draft&&e.target.dataset.photo){draft.options[e.target.dataset.photo]=+e.target.value;paint(true);}});
 const clamp=v=>Math.max(0,Math.min(1,v));
 view.onkeydown=e=>{
  if(!draft)return;const o=draft.options,step=e.shiftKey?.05:.01;
  const delta={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]}[e.key];
  if(delta){e.preventDefault();o.cx=clamp(o.cx+delta[0]);o.cy=clamp(o.cy+delta[1]);paint(true);return;}
  if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();o.scale=Math.max(.3,Math.min(1,o.scale+(e.key==='-'?.01:-.01)));sync();paint(true);}
 };
 view.onwheel=e=>{if(!draft)return;e.preventDefault();const o=draft.options;o.scale=Math.max(.3,Math.min(1,o.scale*Math.exp(e.deltaY*.0012)));sync();paint(true);};
 // Dragging moves the photo under the finger: one crop radius per half the circle's width on screen.
 view.onpointerdown=e=>{if(!draft)return;view.setPointerCapture(e.pointerId);dragging={x:e.clientX,y:e.clientY,cx:draft.options.cx,cy:draft.options.cy};};
 view.onpointermove=e=>{
  if(!dragging||!draft)return;const {w,h}=workingCopy(draft.bitmap),o=draft.options,span=frame.clientWidth/VIEW,radius=Math.min(w,h)*o.scale;
  o.cx=clamp(dragging.cx-(e.clientX-dragging.x)/span*radius/w);o.cy=clamp(dragging.cy-(e.clientY-dragging.y)/span*radius/h);paint(true);
 };
 view.onpointerup=view.onpointercancel=()=>{dragging=null;};

 const reset=(item,mold)=>{
  serial++;busy=false;if(dialog.open)dialog.close();releaseDraft();releaseUsed();
  current=photoURL(item);removed=false;changed=false;plate=plateRatio(mold);
  q('.bag-photo-status').textContent='';renderSheet();
 };
 reset(null);
 return {reset,get changed(){return changed||busy;},
  async value(){if(busy)throw Error('Wait for the photo to finish.');return used?used.blob:null;},
  // For tests: the aligner and what it is working on.
  debug:{dialog,get draft(){return draft;},get used(){return used;}}};
}
