// Photo stamps (docs/photo-stamp-assets.md): a player's own photo disc can wear its design as a stamp asset (the "game
// asset" look) instead of the photo. The photo stays the default; this is a per-disc choice, made and kept in this
// browser like the rest of display customization (no account storage): a small index in localStorage, read at once by
// every renderer, and the asset bytes in IndexedDB. An asset belongs to one photo version (the disc's texture key), so
// replacing the photo brings the photo look back by itself.
const INDEX='disc-atlas-photo-stamps',DB='disc-atlas-photo-stamps',STORE='assets';
const ROUTE=/^\/api\/bag\/discs\/([^/?#]+)\/photo\?v=([a-f0-9-]+\.webp)$/,ID=/^[A-Za-z0-9_-]{1,64}$/,KEY=/^[a-f0-9-]{1,64}\.webp$/;
// An asset id names the disc, its photo version and the extraction's revision, so redoing it never reuses a cached mask.
// A layered asset (an illustrated stamp's fills, lines and solid elements, disc-stamp-extract.mjs) ends in /l.
export const PHOTO_STAMP=/^photo-stamp\/[A-Za-z0-9_-]{1,64}\/[a-f0-9-]{1,64}\.webp\/[a-z0-9]{1,16}(\/l)?$/;

const valid=e=>e&&KEY.test(e.key)&&/^[a-z0-9]{1,16}$/.test(e.rev)&&(e.look==='asset'||e.look==='photo')&&[e.placement?.diameterFraction,e.placement?.assetInkFraction].every(v=>Number.isFinite(v)&&v>0&&v<=1)&&e.placement.diameterFraction<=e.placement.assetInkFraction;
let index={};
try{const stored=JSON.parse(localStorage.getItem(INDEX)||'null')?.discs||{};for(const [id,e] of Object.entries(stored))if(ID.test(id)&&valid(e))index[id]=e;}catch{/* Storage may be disabled. */}
// Assets that could not be read back this session (cleared site data): their discs show the photo again.
const broken=new Set();

function changed(){
 try{Object.keys(index).length?localStorage.setItem(INDEX,JSON.stringify({v:1,discs:index})):localStorage.removeItem(INDEX);}catch{/* Session only. */}
 // A display choice, like the palette: every surface that draws the player's stamps already redraws on this.
 window.dispatchEvent(new CustomEvent('atlas-palette-change',{detail:window.DisplayPalette?.get?.()??null}));
}
const assetOf=(id,e)=>'photo-stamp/'+id+'/'+e.key+'/'+e.rev+(e.layered?'/l':''),stored=asset=>asset.split('/').slice(1,3).join('/');

// What a disc photo URL draws as: null for the photo (the default), else its stamp asset and placement.
export function photoStampFor(photoURL){
 const m=ROUTE.exec(photoURL||'');if(!m)return null;
 const id=decodeURIComponent(m[1]),e=index[id];
 if(!e||e.look!=='asset'||e.key!==m[2]||broken.has(assetOf(id,e)))return null;
 return {asset:assetOf(id,e),placement:{...e.placement},layered:!!e.layered};
}
// For cache keys: changes whenever any disc's look changes.
export function photoLooksKey(){return Object.entries(index).filter(([,e])=>e.look==='asset').map(([id,e])=>assetOf(id,e)).sort().join(',')+(broken.size?'|'+[...broken].sort().join(','):'');}
// The sheet's view of one disc's photo version: whether an asset exists for it, and which look it wears.
export function photoLook(id,key){const e=index[id];return e&&e.key===key?{available:true,look:e.look,layered:!!e.layered}:{available:false,look:'photo'};}
export function setPhotoLook(id,key,look){
 const e=index[id];if(!e||e.key!==key||(look!=='asset'&&look!=='photo')||e.look===look)return;
 index[id]={...e,look};changed();
}

let db=null;
function open(){
 return db||=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 }).catch(error=>{db=null;throw error;});
}
const run=(mode,work)=>open().then(d=>new Promise((resolve,reject)=>{const t=d.transaction(STORE,mode),out=work(t.objectStore(STORE));t.oncomplete=()=>resolve(out?.result);t.onerror=t.onabort=()=>reject(t.error);}));

// Saves a freshly extracted asset for this photo version and switches the disc to it. Older assets of the disc go.
export async function savePhotoStamp(id,key,{blob,placement,layered=false}){
 if(!ID.test(id)||!KEY.test(key)||!(blob instanceof Blob))throw Error('That photo stamp cannot be saved.');
 const entry={key,rev:Date.now().toString(36),look:'asset',placement:{diameterFraction:placement.diameterFraction,assetInkFraction:placement.assetInkFraction},layered:!!layered,savedAt:new Date().toISOString()};
 if(!valid(entry))throw Error('That photo stamp has no usable placement.');
 const old=index[id]?.key;
 await run('readwrite',store=>{store.put(blob,id+'/'+key);if(old&&old!==key)store.delete(id+'/'+old);});
 index[id]=entry;changed();
}
export async function removePhotoStamp(id){
 const e=index[id];if(!e)return;
 delete index[id];changed();
 await run('readwrite',store=>store.delete(id+'/'+e.key)).catch(()=>{});
}
// The stamp path's loader (stamp.mjs): the asset's PNG bytes. A missing asset marks the disc broken and brings its
// photo back everywhere.
export async function photoStampBlob(asset){
 if(!PHOTO_STAMP.test(asset))throw Error('Not a photo stamp.');
 const blob=await run('readonly',store=>store.get(stored(asset))).catch(()=>null);
 if(blob instanceof Blob)return blob;
 if(!broken.has(asset)){broken.add(asset);changed();}
 throw Error('Photo stamp unavailable.');
}
