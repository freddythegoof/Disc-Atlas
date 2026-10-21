// Photo stamps (docs/photo-stamp-assets.md): a player's own photo disc can wear its design as a stamp asset (the "game
// asset" look) instead of the photo. The photo stays the default; this is a per-disc choice. An asset belongs to one
// photo version (the disc's texture key), so replacing the photo brings the photo look back by itself.
// v2 (docs/photo-stamp-color-assets.md): a third look, "color", wears the stamp's own colours from the original photo
// (a colour layer with alpha) instead of one ink. It is saved beside the one-ink asset, from the same read of the
// original, as an optional `color` part of the disc's entry; an entry without it is exactly a v1 entry.
// v3 (docs/photo-stamp-sync.md): the assets and the look belong to the account (workers/stamps.mjs), so every signed-in
// device draws the same disc. This browser keeps a cache for speed: the index in localStorage, read at once by every
// renderer, and the bytes in IndexedDB. The account wins on conflict; an entry it confirmed carries `server`. A browser
// holding v1/v2 assets the account lacks uploads them once on sign-in ("adopt-up"), and keeps them as its cache.
const INDEX='disc-atlas-photo-stamps',DB='disc-atlas-photo-stamps',STORE='assets';
const ROUTE=/^\/api\/bag\/discs\/([^/?#]+)\/photo\?v=([a-f0-9-]+\.webp)$/,ID=/^[A-Za-z0-9_-]{1,64}$/,KEY=/^[a-f0-9-]{1,64}\.webp$/;
// An asset id names the disc, its photo version and the extraction's revision, so redoing it never reuses a cached mask.
// A layered asset (an illustrated stamp's fills, lines and solid elements, disc-stamp-extract.mjs) ends in /l, a
// full-colour one (disc-stamp-color.mjs) in /c.
export const PHOTO_STAMP=/^photo-stamp\/[A-Za-z0-9_-]{1,64}\/[a-f0-9-]{1,64}\.webp\/[a-z0-9]{1,16}(\/l|\/c)?$/;
export const isColorStamp=asset=>PHOTO_STAMP.test(asset||'')&&asset.endsWith('/c');

const placed=p=>[p?.diameterFraction,p?.assetInkFraction].every(v=>Number.isFinite(v)&&v>0&&v<=1)&&p.diameterFraction<=p.assetInkFraction;
const coloured=c=>!!c&&/^[a-z0-9]{1,16}$/.test(c.rev)&&placed(c.placement);
const valid=e=>e&&KEY.test(e.key)&&/^[a-z0-9]{1,16}$/.test(e.rev)&&(e.look==='asset'||e.look==='photo'||e.look==='color'&&coloured(e.color))&&placed(e.placement)&&(e.color===undefined||coloured(e.color));
let index={};
try{const stored=JSON.parse(localStorage.getItem(INDEX)||'null')?.discs||{};for(const [id,e] of Object.entries(stored))if(ID.test(id)&&valid(e))index[id]=e;}catch{/* Storage may be disabled. */}
// Assets that could not be read back this session (cleared site data, no connection): their discs show the photo again.
const broken=new Set();

function changed(){
 try{Object.keys(index).length?localStorage.setItem(INDEX,JSON.stringify({v:1,discs:index})):localStorage.removeItem(INDEX);}catch{/* Session only. */}
 // A display choice, like the palette: every surface that draws the player's stamps already redraws on this.
 window.dispatchEvent(new CustomEvent('atlas-palette-change',{detail:window.DisplayPalette?.get?.()??null}));
}
const assetOf=(id,e)=>'photo-stamp/'+id+'/'+e.key+'/'+e.rev+(e.layered?'/l':''),colorOf=(id,e)=>'photo-stamp/'+id+'/'+e.key+'/'+e.color.rev+'/c';
// The look a disc wears now: its one-ink or its colour asset.
const wornOf=(id,e)=>e.look==='color'?colorOf(id,e):assetOf(id,e);

// What a disc photo URL draws as: null for the photo (the default), else its stamp asset and placement. A colour
// asset says so (`color`): it carries its own colours, so no ink applies (stamp.mjs colorStyle).
export function photoStampFor(photoURL){
 const m=ROUTE.exec(photoURL||'');if(!m)return null;
 const id=decodeURIComponent(m[1]),e=index[id];
 if(!e||e.look==='photo'||e.key!==m[2]||broken.has(wornOf(id,e)))return null;
 if(e.look==='color')return {asset:colorOf(id,e),placement:{...e.color.placement},layered:false,color:true};
 return {asset:assetOf(id,e),placement:{...e.placement},layered:!!e.layered};
}
// For cache keys: changes whenever any disc's look changes.
export function photoLooksKey(){return Object.entries(index).filter(([,e])=>e.look!=='photo').map(([id,e])=>wornOf(id,e)).sort().join(',')+(broken.size?'|'+[...broken].sort().join(','):'');}
// The sheet's view of one disc's photo version: whether an asset exists for it (`color`: a colour one too), and which
// look it wears.
export function photoLook(id,key){const e=index[id];return e&&e.key===key?{available:true,look:e.look,layered:!!e.layered,color:!!e.color}:{available:false,look:'photo'};}
// Whether any disc wears its colour asset: the Appearance sheet's stamp ink says it does not reach those.
export const anyColorLook=()=>Object.values(index).some(e=>e.look==='color');

// The account (workers/stamps.mjs). Errors carry the server's message and status.
const account=()=>window.AtlasAccount?.current;
async function api(path,{method='GET',body,headers={}}={}){
 const response=await fetch(path,{method,body,credentials:'same-origin',cache:'no-store',headers:method==='GET'?headers:{'X-Atlas-CSRF':account()?.csrfToken||'',...headers}});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Object.assign(Error(data.error||'Your account could not be reached. Check your connection and try again.'),{status:response.status});
 return data;
}
const stampPath=id=>'/api/bag/discs/'+encodeURIComponent(id)+'/stamp';
const fromServer=s=>({key:s.texture_key,rev:s.rev,look:s.look,placement:{...s.placement},layered:!!s.layered,...s.color&&{color:{rev:s.rev,placement:{...s.color.placement}}},server:true});
const same=(a,b)=>!!a&&!!b&&a.key===b.key&&a.rev===b.rev&&a.look===b.look&&!!a.server===!!b.server&&a.color?.rev===b.color?.rev;
// WebKit's canvas writes an eXIf chunk into every PNG (its image I/O's resolution, never camera data), so a PNG made in
// Safari, now or by v1/v2, would be refused: the account takes only image and colour-space chunks (workers/stamps.mjs).
// Each chunk carries its own CRC, so the others are kept byte for byte.
const PNG_KEEP=new Set(['IHDR','sRGB','gAMA','cHRM','iCCP','pHYs','IDAT','IEND']);
async function plainPNG(blob){
 if(blob.type!=='image/png')return blob;
 const b=new Uint8Array(await blob.arrayBuffer()),v=new DataView(b.buffer),parts=[b.subarray(0,8)];let dropped=false;
 for(let at=8;at<b.length;){
  if(at+12>b.length)return blob;
  const end=at+12+v.getUint32(at);if(end>b.length)return blob;
  if(PNG_KEEP.has(String.fromCharCode(...b.subarray(at+4,at+8))))parts.push(b.subarray(at,end));else dropped=true;
  at=end;
 }
 return dropped?new Blob(parts,{type:'image/png'}):blob;
}
// Resolves to the account's stamp and the bytes it now holds.
async function upload(id,{key,look,placement,layered,color},inkBlob,colorBlob){
 const ink=await plainPNG(inkBlob),colour=colorBlob&&await plainPNG(colorBlob),form=new FormData();
 form.set('meta',JSON.stringify({texture_key:key,look,placement,layered:!!layered,color:colour?{placement:color.placement}:null}));
 form.set('ink',ink,'ink');if(colour)form.set('color',colour,'color');
 return {stamp:(await api(stampPath(id),{method:'PUT',body:form})).stamp,ink,color:colour};
}

// The cache. WebKit cannot keep a Blob in IndexedDB in a private or ephemeral profile (it aborts the write), so the
// bytes are kept as an ArrayBuffer with their type and revision. v1/v2 kept the Blob itself, which still reads.
let db=null;
function open(){
 return db||=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||Error('Storage unavailable.'));
 }).catch(error=>{db=null;throw error;});
}
// An aborted transaction may report no error (WebKit, before its abort): never reject with nothing.
const run=(mode,work)=>open().then(d=>new Promise((resolve,reject)=>{const t=d.transaction(STORE,mode),out=work(t.objectStore(STORE));t.oncomplete=()=>resolve(out?.result);t.onerror=e=>e.preventDefault?.();t.onabort=()=>reject(t.error||Error('Storage unavailable.'));}));
const slot=(id,key,color)=>id+'/'+key+(color?'/c':'');
const blobOf=v=>v instanceof Blob?v:v?.bytes instanceof ArrayBuffer?new Blob([v.bytes],{type:v.type}):null;
const cached=(id,key,color)=>run('readonly',store=>store.get(slot(id,key,color))).catch(()=>null);
// Best effort: the account holds the bytes, so a browser that cannot cache only fetches them again.
async function keep(id,key,rev,ink,color){
 try{
  const [a,c]=await Promise.all([ink.arrayBuffer(),color?.arrayBuffer()]);
  await run('readwrite',store=>{store.put({rev,type:ink.type,bytes:a},slot(id,key));if(color)store.put({rev,type:color.type,bytes:c},slot(id,key,true));else store.delete(slot(id,key,true));});
 }catch{/* Fetched from the account when drawn. */}
}
const forget=(id,key)=>run('readwrite',store=>{store.delete(slot(id,key));store.delete(slot(id,key,true));}).catch(()=>{});

// Saves a freshly extracted asset for this photo version and switches the disc to it (`look`: 'asset', or 'color' when
// a colour asset came with it). Signed in, it goes to the account first (an upload that fails saves nothing); older
// assets of the disc go, a colour asset with them unless a new one replaces it.
export async function savePhotoStamp(id,key,{blob,placement,layered=false,color=null,look='asset'}){
 if(!ID.test(id)||!KEY.test(key)||!(blob instanceof Blob)||color&&!(color.blob instanceof Blob))throw Error('That photo stamp cannot be saved.');
 const place=p=>({diameterFraction:p.diameterFraction,assetInkFraction:p.assetInkFraction});
 let entry={key,rev:Date.now().toString(36),look:color?look:'asset',placement:place(placement),layered:!!layered,savedAt:new Date().toISOString()};
 if(color)entry.color={rev:entry.rev,placement:place(color.placement)};
 if(!valid(entry))throw Error('That photo stamp has no usable placement.');
 let ink=blob,colour=color?.blob;
 if(account()?.user){const sent=await upload(id,entry,ink,colour);entry={...fromServer(sent.stamp),savedAt:entry.savedAt};({ink,color:colour}=sent);}
 const old=index[id]?.key;
 await keep(id,key,entry.rev,ink,colour);
 if(old&&old!==key)await forget(id,old);
 index[id]=entry;changed();
}
// The look applies at once and is saved to the account; if the account refuses it, the disc goes back to its look.
export function setPhotoLook(id,key,look){
 const e=index[id];if(!e||e.key!==key||!(look==='asset'||look==='photo'||look==='color'&&e.color)||e.look===look)return Promise.resolve();
 index[id]={...e,look};changed();
 if(!e.server)return Promise.resolve();
 return api(stampPath(id),{method:'PATCH',body:JSON.stringify({look}),headers:{'Content-Type':'application/json'}}).then(({stamp})=>{
  if(index[id]?.key===stamp.texture_key){index[id]=fromServer(stamp);changed();}
 },error=>{if(index[id]?.look===look){index[id]={...index[id],look:e.look};changed();}throw error;});
}
export async function removePhotoStamp(id){
 const e=index[id];if(!e)return;
 if(e.server)await api(stampPath(id),{method:'DELETE'});
 delete index[id];changed();
 await forget(id,e.key);
}
// The stamp path's loader (stamp.mjs): the asset's bytes, from this browser's cache or else from the account. A missing
// asset marks the disc broken and brings its photo back everywhere. Surfaces asking at once share one read.
const loading=new Map();
export function photoStampBlob(asset){
 if(!PHOTO_STAMP.test(asset))return Promise.reject(Error('Not a photo stamp.'));
 if(!loading.has(asset))loading.set(asset,load(asset).finally(()=>loading.delete(asset)).catch(error=>{if(!broken.has(asset)){broken.add(asset);changed();}throw error;}));
 return loading.get(asset);
}
async function load(asset){
 const [,id,key,rev,kind]=asset.split('/'),color=kind==='c',e=index[id];
 const v=await cached(id,key,color),blob=blobOf(v);
 // A cached copy of this revision, or (v1/v2) the Blob of an entry this browser made and the account has not replaced.
 if(blob&&(v.rev===rev||v instanceof Blob&&e&&!e.server&&e.key===key))return blob;
 if(!e?.server)throw Error('Photo stamp unavailable.');
 const response=await fetch(stampPath(id)+'/'+(color?'color':'ink')+'?v='+rev,{credentials:'same-origin',cache:'no-store'}).catch(()=>null);
 if(!response?.ok)throw Error('Photo stamp unavailable.');
 const bytes=await response.arrayBuffer(),type=response.headers.get('Content-Type')||'image/png',fetched=new Blob([bytes],{type});
 run('readwrite',store=>store.put({rev,type,bytes},slot(id,key,color))).catch(()=>{});
 return fetched;
}

// Sync with the account: its stamps replace this browser's (the account wins), stamps it dropped (a photo replaced on
// another device) leave, and a v1/v2 asset it never had goes up once. Runs on sign-in, on load when signed in, and when
// the page comes back into view, so a look chosen on one device reaches the others.
let syncing=null,synced=0;
export function syncPhotoStamps(){
 if(!account()?.user)return Promise.resolve();
 return syncing||=pull().finally(()=>{syncing=null;synced=Date.now();});
}
async function pull(){
 const {stamps,photos}=await api('/api/bag/stamps');
 const server=new Map(stamps.map(s=>[s.disc_id,s])),photo=new Map(photos.map(p=>[p.id,p.texture_key])),adopt=[];
 let dirty=false;
 for(const [id,s] of server){const e=fromServer(s);if(!same(index[id],e)){index[id]={...e,savedAt:index[id]?.savedAt};dirty=true;}}
 for(const [id,e] of Object.entries(index)){
  if(server.has(id))continue;
  if(e.server){delete index[id];dirty=true;void forget(id,e.key);}
  else if(photo.get(id)===e.key&&!e.refused)adopt.push(id);
 }
 if(dirty)changed();
 for(const id of adopt)await adoptUp(id);
}
async function adoptUp(id){
 const e=index[id];
 const ink=blobOf(await cached(id,e.key)),color=e.color?blobOf(await cached(id,e.key,true)):null;
 if(!ink)return;
 // Colour bytes this browser lost leave the one-ink asset to go up alone, in the one-ink look.
 const send=(look,colorBlob)=>upload(id,{...e,look},ink,colorBlob);
 let sent;
 try{sent=await send(e.look==='color'&&!color?'asset':e.look,color);}
 catch(error){
  // Refused for good (not a lost connection): a colour asset the account will not take leaves the one-ink one to go
  // alone, in the one-ink look; otherwise the browser keeps its asset to itself and never asks again.
  if(!(error.status>=400&&error.status<500)||[401,403,409].includes(error.status))return;
  try{if(!color||error.status!==400)throw error;sent=await send(e.look==='color'?'asset':e.look,null);}
  catch{if(index[id]===e){index[id]={...e,refused:true};changed();}return;}
 }
 if(index[id]!==e)return;
 await keep(id,e.key,sent.stamp.rev,sent.ink,sent.color);
 index[id]={...fromServer(sent.stamp),savedAt:e.savedAt};changed();
}
if(typeof window!=='undefined'){
 window.addEventListener('atlas-account-change',event=>{if(event.detail?.user)syncPhotoStamps().catch(()=>{});});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-synced>30000)syncPhotoStamps().catch(()=>{});});
 syncPhotoStamps().catch(()=>{});
}
