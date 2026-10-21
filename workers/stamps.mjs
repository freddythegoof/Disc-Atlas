// Photo stamps v3 (docs/photo-stamp-sync.md): a bag disc's generated stamp assets and its Look, kept with the account
// so every signed-in device draws the same disc. Same storage and trust boundary as the bag photo (textures.mjs): the
// private textures bucket, one D1 row per disc (bag_photo_stamps, migration 0013), owner-only reads, and an upload
// intent queued before R2 so no object can become untracked.
import {cleanupTextures,validateProcessedWebP} from './textures.mjs';

// The v2 size discipline, held on the server: the one-ink asset up to 2 MiB (the largest measured, the DD3's, is
// 1.64 MB), the full-colour one up to 1.5 MiB, both square and at most the extractor's 2048 px.
export const STAMP_LIMITS={ink:2*1024*1024,color:1.5*1024*1024,side:2048};
const BODY_BYTES=STAMP_LIMITS.ink+STAMP_LIMITS.color+64*1024;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const TYPES={png:'image/png',webp:'image/webp'};
const LOOKS=['photo','asset','color'];

// A stamp row as the client knows it: no object keys, only what draws it.
const shape=row=>({disc_id:row.disc_id,texture_key:row.texture_key,look:row.look,rev:row.rev,layered:!!row.layered,
 placement:{diameterFraction:row.ink_diameter,assetInkFraction:row.ink_fraction},
 color:row.color_key?{placement:{diameterFraction:row.color_diameter,assetInkFraction:row.color_fraction}}:null});
const COLUMNS='s.disc_id,s.texture_key,s.look,s.rev,s.ink_key,s.ink_diameter,s.ink_fraction,s.layered,s.color_key,s.color_diameter,s.color_fraction';
const owned=(env,user,id)=>env.DB.prepare(`SELECT ${COLUMNS} FROM bag_photo_stamps s JOIN bag_discs d ON d.id=s.disc_id WHERE d.user_id=? AND s.disc_id=?`).bind(user.id,id).first();

// A PNG as a canvas writes it: one square 8-bit RGB or RGBA image, colour-space chunks allowed, never text or EXIF.
// See the PNG spec, https://www.w3.org/TR/png/#5Chunk-layout
const PNG_CHUNKS=new Set(['IHDR','sRGB','gAMA','cHRM','iCCP','pHYs','IDAT','IEND']);
export function validateStampPNG(bytes,max=STAMP_LIMITS.side){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),text=(a,b)=>String.fromCharCode(...bytes.slice(a,b));
 const invalid=()=>{throw Error('Invalid stamp asset.');};
 if(bytes.length<45||![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))invalid();
 let start=8,seen=new Set(),data=false,end=false;
 while(start<bytes.length){
  if(end||start+12>bytes.length)invalid();
  const length=v.getUint32(start),kind=text(start+4,start+8),next=start+12+length;
  if(length>0x7fffffff||next>bytes.length||!PNG_CHUNKS.has(kind))invalid();
  if(start===8!==(kind==='IHDR'))invalid();
  if(kind==='IHDR'){
   const w=v.getUint32(16),h=v.getUint32(20);
   if(length!==13||w!==h||w<16||w>max||bytes[24]!==8||![2,6].includes(bytes[25])||bytes[26]||bytes[27]||bytes[28])throw Error('Use a square stamp asset up to '+max+' pixels.');
  }else if(kind==='IDAT')data=true;
  else if(kind==='IEND')end=true;
  else if(data||seen.has(kind))invalid();
  seen.add(kind);start=next;
 }
 if(!data||!end)invalid();
}
const validate=(bytes,type)=>type==='image/png'?validateStampPNG(bytes):validateProcessedWebP(bytes,{min:16,max:STAMP_LIMITS.side,what:'stamp asset'});
async function body(request){
 const reader=request.body?.getReader();if(!reader)throw Error('Send the stamp assets.');
 const chunks=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>BODY_BYTES){await reader.cancel();throw Error('The stamp assets are too large.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return bytes;
}
const placed=p=>p&&[p.diameterFraction,p.assetInkFraction].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0&&n<=1)&&p.diameterFraction<=p.assetInkFraction;
// One asset part from the form: its bytes, checked against its budget and as the image it claims to be.
async function part(form,name,limit){
 const file=form.get(name);if(file===null)return null;
 if(typeof file==='string'||!Object.values(TYPES).includes(file.type))throw Error('Send each stamp asset as PNG or WebP.');
 if(file.size>limit)throw Error(name==='color'?'The full-color asset is too large.':'The game asset is too large.');
 const bytes=new Uint8Array(await file.arrayBuffer());validate(bytes,file.type);
 // The bytes must be what they claim: a PNG labelled WebP never reaches the bucket.
 return {bytes,type:file.type,ext:file.type.slice(6)};
}

// GET /api/bag/stamps: every disc's stamp, and the discs with a photo (a browser holding an asset the account lacks
// uploads it, docs/photo-stamp-sync.md "Adopt-up").
export async function stampsRoute(request,env,user){
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 const stamps=(await env.DB.prepare(`SELECT ${COLUMNS} FROM bag_photo_stamps s JOIN bag_discs d ON d.id=s.disc_id WHERE d.user_id=? ORDER BY s.disc_id`).bind(user.id).all()).results;
 const photos=(await env.DB.prepare('SELECT id,texture_key FROM bag_discs WHERE user_id=? AND texture_key IS NOT NULL ORDER BY id').bind(user.id).all()).results;
 return json({stamps:stamps.map(shape),photos});
}

// /api/bag/discs/:id/stamp: PUT the assets (multipart: meta, ink, color), PATCH the look, DELETE them.
// /api/bag/discs/:id/stamp/ink|color: GET the bytes.
export async function stampRoute(request,env,user,id,asset){
 const method=request.method;
 if(asset){
  if(method!=='GET')return json({error:'Method not allowed.'},405);
  const row=await owned(env,user,id),key=row&&(asset==='color'?row.color_key:row.ink_key);
  if(!key)return json({error:'Stamp asset not found.'},404);
  if(!env.TEXTURES)return json({error:'Stamp storage is unavailable. Please try again.'},503);
  const object=await env.TEXTURES.get(key);
  return object?new Response(object.body,{headers:{'Content-Type':TYPES[key.split('.').pop()],'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}}):json({error:'Stamp asset not found.'},404);
 }
 if(!['GET','PUT','PATCH','DELETE'].includes(method))return json({error:'Method not allowed.'},405);
 if(method!=='GET'&&(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-Atlas-CSRF')!==user.csrf_token))return json({error:'Refresh the page and try again.'},403);
 const disc=await env.DB.prepare('SELECT texture_key FROM bag_discs WHERE user_id=? AND id=?').bind(user.id,id).first();
 if(!disc)return json({error:'Saved disc not found.'},404);
 if(method==='GET'){const row=await owned(env,user,id);return row?json({stamp:shape(row)}):json({error:'Stamp not found.'},404);}
 if(method==='DELETE'){
  await env.DB.prepare('DELETE FROM bag_photo_stamps WHERE disc_id=? AND EXISTS (SELECT 1 FROM bag_discs WHERE id=? AND user_id=?)').bind(id,id,user.id).run();
  await cleanupTextures(env);return json({stamp:null});
 }
 if(method==='PATCH'){
  let look;try{look=JSON.parse(new TextDecoder().decode(await body(request)))?.look;}catch{return json({error:'Send a look.'},400);}
  if(!LOOKS.includes(look))return json({error:'Choose Photo, Game asset or Full color.'},400);
  const result=await env.DB.prepare("UPDATE bag_photo_stamps SET look=?,updated_at=? WHERE disc_id=? AND (?<>'color' OR color_key IS NOT NULL) AND EXISTS (SELECT 1 FROM bag_discs WHERE id=? AND user_id=?)").bind(look,new Date().toISOString(),id,look,id,user.id).run();
  if(!result.meta.changes){const row=await owned(env,user,id);return row?json({error:'This disc has no full-color asset yet.'},409):json({error:'Stamp not found.'},404);}
  return json({stamp:shape(await owned(env,user,id))});
 }
 // PUT: the multipart form, read within its budget before anything is parsed.
 if(!request.headers.get('Content-Type')?.startsWith('multipart/form-data'))return json({error:'Send the stamp assets as a form.'},400);
 if(!env.TEXTURES)return json({error:'Stamp storage is unavailable. Please try again.'},503);
 let meta,ink,color;
 try{
  const form=await new Response(await body(request),{headers:{'Content-Type':request.headers.get('Content-Type')}}).formData();
  meta=JSON.parse(form.get('meta')||'null');
  if(!meta||typeof meta!=='object'||typeof meta.texture_key!=='string'||!LOOKS.includes(meta.look)||!placed(meta.placement)||meta.color!=null&&!placed(meta.color.placement))throw Error('Send the stamp’s photo version, look and placement.');
  ink=await part(form,'ink',STAMP_LIMITS.ink);color=await part(form,'color',STAMP_LIMITS.color);
  if(!ink)throw Error('Send the game asset.');
  if(!!color!==(meta.color!=null))throw Error('Send the full-color asset with its placement.');
  if(meta.look==='color'&&!color)throw Error('Full color needs its asset.');
 }catch(error){return json({error:error.message.startsWith('Unexpected')||error instanceof SyntaxError?'Send valid stamp assets.':error.message},400);}
 // Assets belong to the disc's current photo: one read from a photo since replaced is refused, not attached.
 if(meta.texture_key!==disc.texture_key)return json({error:'This disc’s photo changed. Make the game asset again.'},409);
 const now=Math.floor(Date.now()/1000),rev=(Date.now().toString(36)+Math.random().toString(36).slice(2,6)).slice(0,16);
 const inkKey='stamp/'+crypto.randomUUID()+'.'+ink.ext,colorKey=color?'stamp/'+crypto.randomUUID()+'.'+color.ext:null,keys=[inkKey,colorKey].filter(Boolean);
 for(const key of keys)await env.DB.prepare('INSERT INTO texture_cleanup(key,not_before) VALUES (?,?)').bind(key,now+3600).run();
 await env.TEXTURES.put(inkKey,ink.bytes,{httpMetadata:{contentType:ink.type,cacheControl:'private, no-store'}});
 if(color)await env.TEXTURES.put(colorKey,color.bytes,{httpMetadata:{contentType:color.type,cacheControl:'private, no-store'}});
 const p=meta.placement,c=meta.color?.placement;
 const results=await env.DB.batch([
  env.DB.prepare(`INSERT INTO bag_photo_stamps(disc_id,texture_key,look,rev,ink_key,ink_diameter,ink_fraction,layered,color_key,color_diameter,color_fraction,updated_at)
   SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM bag_discs WHERE id=? AND user_id=? AND texture_key=?) AND (SELECT COUNT(*) FROM texture_cleanup WHERE key IN (?,?) AND not_before>?)=?
   ON CONFLICT(disc_id) DO UPDATE SET texture_key=excluded.texture_key,look=excluded.look,rev=excluded.rev,ink_key=excluded.ink_key,ink_diameter=excluded.ink_diameter,ink_fraction=excluded.ink_fraction,layered=excluded.layered,color_key=excluded.color_key,color_diameter=excluded.color_diameter,color_fraction=excluded.color_fraction,updated_at=excluded.updated_at`)
   .bind(id,meta.texture_key,meta.look,rev,inkKey,p.diameterFraction,p.assetInkFraction,meta.layered?1:0,colorKey,c?.diameterFraction??null,c?.assetInkFraction??null,new Date().toISOString(),id,user.id,meta.texture_key,inkKey,colorKey,now,keys.length),
  env.DB.prepare('DELETE FROM texture_cleanup WHERE key IN (?,?) AND EXISTS (SELECT 1 FROM bag_photo_stamps WHERE ink_key=texture_cleanup.key OR color_key=texture_cleanup.key)').bind(inkKey,colorKey),
  env.DB.prepare('UPDATE texture_cleanup SET not_before=0 WHERE key IN (?,?)').bind(inkKey,colorKey),
 ]);
 await cleanupTextures(env);
 return results[0].meta.changes?json({stamp:shape(await owned(env,user,id))}):json({error:'This disc changed. Try making the game asset again.'},409);
}
