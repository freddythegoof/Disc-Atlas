const MAX_BYTES=512*1024,MAX_SIDE=1024;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});

// No upload can become untracked: queued before put; attachment and dequeue share a D1 transaction.
// Failed R2 deletion retains its queue entry. Triggers include deletion through the account FK cascade.
// Never throws: a cleanup outage must not turn a committed save, removal or account deletion into an
// error response. The queue row stays and the cron retries it.
export async function cleanupTextures(env){
 if(!env.DB||!env.TEXTURES)return;
 let rows;try{rows=(await env.DB.prepare('SELECT key FROM texture_cleanup WHERE not_before<=? AND NOT EXISTS (SELECT 1 FROM bag_discs WHERE texture_key=texture_cleanup.key) LIMIT 100').bind(Math.floor(Date.now()/1000)).all()).results;}catch{return;}
 for(const {key} of rows){try{await env.TEXTURES.delete(key);await env.DB.prepare('DELETE FROM texture_cleanup WHERE key=?').bind(key).run();}catch{/* Durable retry on the next request/cron. */}}
}
async function imageBytes(request){
 if(request.headers.get('Content-Type')!=='image/webp')throw Error('Send a processed WebP photo.');
 const reader=request.body?.getReader();if(!reader)throw Error('Choose a photo.');
 const chunks=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES){await reader.cancel();throw Error('Photo is too large.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 validateProcessedWebP(bytes);
 return bytes;
}

// Check the coded frame as well as the extended canvas: an attacker controls both headers.
// Only the static subset emitted by our canvas encoder is accepted (including its color profile,
// but never EXIF/GPS or XMP). This bounds
// decoding dimensions without decoding pixels in the Worker. See the WebP RIFF container spec:
// https://developers.google.com/speed/webp/docs/riff_container
function validateProcessedWebP(bytes){
 const size=bytes.length,text=(a,b)=>String.fromCharCode(...bytes.slice(a,b)),v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const invalid=()=>{throw Error('Invalid processed photo.');};
 const dimensions=(w,h)=>{if(w<128||w!==h||w>MAX_SIDE)throw Error('Use a square processed photo up to 1024 pixels.');};
 if(size<26||text(0,4)!=='RIFF'||text(8,12)!=='WEBP'||v.getUint32(4,true)!==size-8)invalid();
 let canvas=null,frame=false,alpha=false,alphaFlag=false,profile=false,profileFlag=false;
 for(let start=12;start<size;){
  if(start+8>size)invalid();
  const kind=text(start,start+4),length=v.getUint32(start+4,true),data=start+8,end=data+length,next=end+(length%2);
  if(next>size||length%2&&bytes[end]!==0)invalid();
  if(kind==='VP8X'){
   if(start!==12||length!==10||bytes[data]&~0x30||bytes[data+1]||bytes[data+2]||bytes[data+3])invalid();
   const uint24=p=>bytes[p]+(bytes[p+1]<<8)+(bytes[p+2]<<16);
   canvas=[1+uint24(data+4),1+uint24(data+7)];dimensions(...canvas);alphaFlag=!!(bytes[data]&0x10);profileFlag=!!(bytes[data]&0x20);
  }else if(kind==='ICCP'){
   if(!canvas||!profileFlag||profile||alpha||frame||length<128||length>64*1024||v.getUint32(data,false)!==length||text(data+36,data+40)!=='acsp')invalid();
   profile=true;
  }else if(kind==='ALPH'){
   if(!canvas||!alphaFlag||frame||alpha||length<2||bytes[data]&0xc0||(bytes[data]&3)>1)invalid();
   alpha=true;
  }else if(kind==='VP8L'||kind==='VP8 '){
   if(frame)invalid();
   let width,height;
   if(kind==='VP8L'){
    if(length<5||bytes[data]!==0x2f||alpha)invalid();
    const bits=v.getUint32(data+1,true);if(bits>>>29)invalid();
    width=1+(bits&0x3fff);height=1+((bits>>>14)&0x3fff);
   }else{
    if(length<10||bytes[data]&1||text(data+3,data+6)!=='\x9d\x01\x2a'||canvas&&alphaFlag!==alpha)invalid();
    width=v.getUint16(data+6,true)&0x3fff;height=v.getUint16(data+8,true)&0x3fff;
   }
   dimensions(width,height);if(canvas&&(width!==canvas[0]||height!==canvas[1]))invalid();frame=true;
  }else invalid(); // Includes animation, EXIF/GPS, XMP and unexpected payloads.
  start=next;
 }
 if(!frame||profileFlag!==profile)invalid();
}
export async function photoRoute(request,env,user,id){
 const method=request.method;
 if(!['GET','PUT','DELETE'].includes(method))return json({error:'Method not allowed.'},405);
 if(method!=='GET'&&(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-Atlas-CSRF')!==user.csrf_token))return json({error:'Refresh the page and try again.'},403);
 const row=await env.DB.prepare('SELECT texture_key FROM bag_discs WHERE user_id=? AND id=?').bind(user.id,id).first();
 if(!row)return json({error:'Saved disc not found.'},404);
 if(!env.TEXTURES)return json({error:'Photo storage is unavailable. Please try again.'},503);
 if(method==='GET'){
  const object=row.texture_key&&await env.TEXTURES.get(row.texture_key);
  return object?new Response(object.body,{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}}):json({error:'Photo not found.'},404);
 }
 if(method==='DELETE'){
  await env.DB.prepare('UPDATE bag_discs SET texture_key=NULL,photo_rim_color=NULL,photo_halo=NULL WHERE user_id=? AND id=?').bind(user.id,id).run();
  await cleanupTextures(env);return json({texture_key:null,photo_rim_color:null,photo_halo:null});
 }
 // Same trust boundary as other appearance fields: accept only a plain six-digit hex.
 const supplied=request.headers.get('X-Atlas-Photo-Rim-Color');
 if(supplied && !/^#[0-9a-fA-F]{6}$/.test(supplied))return json({error:'Choose a six-digit hex photo rim color.'},400);
 const photoRimColor=supplied?.toLowerCase()||null;
 // A Halo band's two colours (public/disc3d/halo.mjs): the wash and 16 front radii, '#' + 38 hex, or nothing.
 const halo=request.headers.get('X-Atlas-Photo-Halo');
 if(halo && !/^#[0-9a-fA-F]{38}$/.test(halo))return json({error:'Send the Halo band as # and 38 hex digits.'},400);
 const photoHalo=halo?.toLowerCase()||null;
 let bytes;try{bytes=await imageBytes(request);}catch(error){return json({error:error.message},400);}
 const key=crypto.randomUUID()+'.webp',expires=Math.floor(Date.now()/1000)+3600;
 await env.DB.prepare('INSERT INTO texture_cleanup(key,not_before) VALUES (?,?)').bind(key,expires).run();
 await env.TEXTURES.put(key,bytes,{httpMetadata:{contentType:'image/webp',cacheControl:'private, no-store'}});
 const results=await env.DB.batch([
  env.DB.prepare('UPDATE bag_discs SET texture_key=?,photo_rim_color=?,photo_halo=? WHERE user_id=? AND id=? AND texture_key IS ? AND EXISTS (SELECT 1 FROM texture_cleanup WHERE key=? AND not_before>?)').bind(key,photoRimColor,photoHalo,user.id,id,row.texture_key,key,Math.floor(Date.now()/1000)),
  env.DB.prepare('DELETE FROM texture_cleanup WHERE key=? AND EXISTS (SELECT 1 FROM bag_discs WHERE texture_key=?)').bind(key,key),
  env.DB.prepare('UPDATE texture_cleanup SET not_before=0 WHERE key=?').bind(key),
 ]);
 await cleanupTextures(env);
 return results[0].meta.changes?json({texture_key:key,photo_rim_color:photoRimColor,photo_halo:photoHalo}):json({error:'This disc changed. Try saving its photo again.'},409);
}
