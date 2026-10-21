// Photo stamps (docs/photo-stamp-assets.md): a player's own photo disc can wear its design as a stamp asset (the "game
// asset" look) instead of the photo. The photo stays the default; this is a per-disc choice, made and kept in this
// browser like the rest of display customization (no account storage): a small index in localStorage, read at once by
// every renderer, and the asset bytes in IndexedDB. An asset belongs to one photo version (the disc's texture key), so
// replacing the photo brings the photo look back by itself.
// v2 (docs/photo-stamp-color-assets.md): a third look, "color", wears the stamp's own colours from the original photo
// (a colour layer with alpha) instead of one ink. It is saved beside the one-ink asset, from the same read of the
// original, as an optional `color` part of the disc's entry; an entry without it is exactly a v1 entry.
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
// Assets that could not be read back this session (cleared site data): their discs show the photo again.
const broken=new Set();

function changed(){
 try{Object.keys(index).length?localStorage.setItem(INDEX,JSON.stringify({v:1,discs:index})):localStorage.removeItem(INDEX);}catch{/* Session only. */}
 // A display choice, like the palette: every surface that draws the player's stamps already redraws on this.
 window.dispatchEvent(new CustomEvent('atlas-palette-change',{detail:window.DisplayPalette?.get?.()??null}));
}
const assetOf=(id,e)=>'photo-stamp/'+id+'/'+e.key+'/'+e.rev+(e.layered?'/l':''),colorOf=(id,e)=>'photo-stamp/'+id+'/'+e.key+'/'+e.color.rev+'/c';
// The look a disc wears now: its one-ink or its colour asset.
const wornOf=(id,e)=>e.look==='color'?colorOf(id,e):assetOf(id,e);
const stored=asset=>asset.split('/').slice(1,3).join('/')+(isColorStamp(asset)?'/c':'');

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
export function setPhotoLook(id,key,look){
 const e=index[id];if(!e||e.key!==key||!(look==='asset'||look==='photo'||look==='color'&&e.color)||e.look===look)return;
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

// Saves a freshly extracted asset for this photo version and switches the disc to it (`look`: 'asset', or 'color' when
// a colour asset came with it). Older assets of the disc go, a colour asset with them unless a new one replaces it.
export async function savePhotoStamp(id,key,{blob,placement,layered=false,color=null,look='asset'}){
 if(!ID.test(id)||!KEY.test(key)||!(blob instanceof Blob)||color&&!(color.blob instanceof Blob))throw Error('That photo stamp cannot be saved.');
 const rev=Date.now().toString(36),place=p=>({diameterFraction:p.diameterFraction,assetInkFraction:p.assetInkFraction});
 const entry={key,rev,look:color?look:'asset',placement:place(placement),layered:!!layered,...color&&{color:{rev,placement:place(color.placement)}},savedAt:new Date().toISOString()};
 if(!valid(entry))throw Error('That photo stamp has no usable placement.');
 const old=index[id]?.key;
 await run('readwrite',store=>{
  store.put(blob,id+'/'+key);
  if(color)store.put(color.blob,id+'/'+key+'/c');else store.delete(id+'/'+key+'/c');
  if(old&&old!==key){store.delete(id+'/'+old);store.delete(id+'/'+old+'/c');}
 });
 index[id]=entry;changed();
}
export async function removePhotoStamp(id){
 const e=index[id];if(!e)return;
 delete index[id];changed();
 await run('readwrite',store=>{store.delete(id+'/'+e.key);store.delete(id+'/'+e.key+'/c');}).catch(()=>{});
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
