// Photos never leave the browser until reduced to a bounded, metadata-free circular WebP.
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
export function photoCanvas(image,options={},size=PHOTO_SIZE){
 // A 2048px working copy bounds memory and sampling cost even for large phone photos.
 const input=document.createElement('canvas'),ratio=Math.min(1,2048/Math.max(image.width,image.height));
 input.width=Math.round(image.width*ratio);input.height=Math.round(image.height*ratio);
 const g=input.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,input.width,input.height);
 const source=g.getImageData(0,0,input.width,input.height).data,out=document.createElement('canvas');out.width=out.height=size;
 const ctx=out.getContext('2d'),pixels=ctx.createImageData(size,size),w=input.width,h=input.height;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,p=photoPoint(x,y,{...options,width:w,height:h});
  if(!p.inside||p.x<0||p.y<0||p.x>=w-1||p.y>=h-1)continue;
  const a=Math.floor(p.x),b=Math.floor(p.y),fx=p.x-a,fy=p.y-b,k=(j*size+i)*4;
  for(let c=0;c<4;c++)pixels.data[k+c]=(source[(b*w+a)*4+c]*(1-fx)+source[(b*w+a+1)*4+c]*fx)*(1-fy)+(source[((b+1)*w+a)*4+c]*(1-fx)+source[((b+1)*w+a+1)*4+c]*fx)*fy;
  pixels.data[k+3]=Math.round(pixels.data[k+3]*Math.min(1,(1-Math.hypot(x,y))*size/2));
 }
 ctx.putImageData(pixels,0,0);return out;
}
export async function processPhoto(image,options={}){
 for(const size of [1024,768,512]){
  const canvas=photoCanvas(image,options,size);
  for(const quality of [.86,.72,.56,.4]){
   const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',quality));
   if(blob?.type==='image/webp'&&blob.size<=PHOTO_BYTES)return blob;
  }
 }
 throw Error('This photo could not be compressed. Try another photo.');
}

export function createPhotoEditor(root){
 root.innerHTML='<button type="button" class="bag-photo-choose">Add photo</button><input class="bag-photo-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden><div class="bag-photo-edit" hidden><p>Photograph straight down in even light. Fill the circle with your disc.</p><div class="bag-photo-frame"><canvas width="240" height="240" tabindex="0" aria-label="Photo crop preview. Drag or use arrow keys to center the disc."></canvas><span aria-hidden="true"></span></div><small>Drag to center · fit the disc inside the guide</small><details><summary>Adjust photo</summary><label>Framing<input type="range" data-photo="scale" min="0.3" max="1" step="0.01" value="0.94"></label><label>Tilt correction<input type="range" data-photo="aspect" min="0.8" max="1.2" step="0.01" value="1"></label><label>Tilt direction<input type="range" data-photo="angle" min="0" max="180" step="5" value="0"></label><label>Perspective<input type="range" data-photo="perspective" min="-0.12" max="0.12" step="0.01" value="0"></label></details></div><button type="button" class="bag-photo-remove" hidden>Remove photo</button><p class="bag-photo-status" role="status"></p>';
 const q=s=>root.querySelector(s),file=q('input[type=file]'),canvas=q('canvas');
 // capture is applied only for coarse pointers; desktop keeps the ordinary file picker.
 if(matchMedia('(pointer:coarse)').matches)file.setAttribute('capture','environment');
 let bitmap=null,current=null,changed=false,serial=0,busy=false,options={};
 const paint=()=>{if(bitmap)canvas.getContext('2d').drawImage(photoCanvas(bitmap,options,240),0,0);};
 const reset=item=>{serial++;bitmap?.close();bitmap=null;current=photoURL(item);changed=false;busy=false;options={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5};file.value='';q('.bag-photo-edit').hidden=true;q('.bag-photo-remove').hidden=!current;q('.bag-photo-choose').textContent=current?'Replace photo':'Add photo';q('.bag-photo-status').textContent='';for(const el of root.querySelectorAll('[data-photo]'))el.value=options[el.dataset.photo];};
 q('.bag-photo-choose').onclick=()=>file.click();
 file.onchange=async()=>{const id=++serial;busy=true;try{const image=await decodePhoto(file.files[0]);if(id!==serial){image.close();return;}bitmap?.close();bitmap=image;changed=true;q('.bag-photo-edit').hidden=false;q('.bag-photo-remove').hidden=false;q('.bag-photo-choose').textContent='Replace photo';q('.bag-photo-status').textContent='';paint();}catch(e){q('.bag-photo-status').textContent=e.message;}finally{if(id===serial)busy=false;}};
 q('.bag-photo-remove').onclick=()=>{reset(null);changed=true;};
 root.addEventListener('input',e=>{if(e.target.dataset.photo){options[e.target.dataset.photo]=+e.target.value;paint();}});
 canvas.onkeydown=e=>{const step=.02,delta={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]}[e.key];if(!delta||!bitmap)return;e.preventDefault();options.cx=Math.max(0,Math.min(1,options.cx+delta[0]));options.cy=Math.max(0,Math.min(1,options.cy+delta[1]));paint();};
 let drag=null;canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,cx:options.cx,cy:options.cy};};
 canvas.onpointermove=e=>{if(!drag||!bitmap)return;options.cx=Math.max(0,Math.min(1,drag.cx-(e.clientX-drag.x)/240*options.scale));options.cy=Math.max(0,Math.min(1,drag.cy-(e.clientY-drag.y)/240*options.scale));paint();};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
 reset(null);
 return {reset,get changed(){return changed||busy;},async value(){if(busy)throw Error('Wait for the photo to finish opening.');return bitmap?processPhoto(bitmap,options):null;}};
}
