import {env} from 'cloudflare:workers';
import catalog from '../../../public/data.json';
import {authenticated,body,database,json,savedBag,unavailable} from '../../../lib/server';
import {validateItem} from '../../../lib/validation';
function photoBytes(value:unknown){
 if(value==null)return null;
 if(typeof value!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw new Error('Choose a JPEG, PNG or WebP photo using the photo picker.');
 const bytes=Uint8Array.from(atob(value.split(',')[1]),c=>c.charCodeAt(0));
 if(bytes.length>1000000||bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255||bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)throw new Error('Photo is invalid or too large. Please choose another.');return bytes;
}
async function save(req:Request,editing:boolean){
 const a=await authenticated(req,true);if(a.error)return a.error;
 let p:any,raw:any,photo:Uint8Array|null;
 try{raw=await body(req,1400000);p=validateItem(raw,catalog.discs);photo=photoBytes(raw.photo);if(editing&&(typeof raw.id!=='string'||raw.id.length>80))throw new Error('Choose a saved disc.');}catch(e){return json({error:(e as Error).message},400);}
 const user=a.user!.userId,id=editing?raw.id:crypto.randomUUID();let newKey:string|null=null;
 try{
 const old=editing?await database().prepare('SELECT photo_key FROM bag_items WHERE user_id=? AND id=?').bind(user,id).first<{photo_key:string|null}>():null;
 if(editing&&!old)return json({error:'Saved disc not found.'},404);
 let key=raw.removePhoto?null:old?.photo_key||null;
 if(photo){if(!env.DISC_PHOTOS)throw new Error('Photo storage unavailable');newKey='bag/'+crypto.randomUUID()+'.jpg';await env.DISC_PHOTOS.put(newKey,photo,{httpMetadata:{contentType:'image/jpeg'}});key=newKey;}
 const result=editing?await database().prepare('UPDATE bag_items SET plastic=?,weight=?,wear=?,notes=?,color=?,photo_key=? WHERE user_id=? AND id=?').bind(p.plastic,p.weight,p.wear,p.notes,p.color,key,user,id).run():await database().prepare('INSERT INTO bag_items(user_id,id,disc_id,plastic,weight,wear,notes,color,photo_key,created_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM bag_items WHERE user_id=?)<100').bind(user,id,p.discId,p.plastic,p.weight,p.wear,p.notes,p.color,key,new Date().toISOString(),user).run();
 if(!result.meta.changes){if(newKey)await env.DISC_PHOTOS.delete(newKey);return json({error:editing?'Saved disc not found.':'Your bag is full (100 discs). Remove a disc first.'},409);}
 if(old?.photo_key&&old.photo_key!==key){try{await env.DISC_PHOTOS.delete(old.photo_key);}catch(e){console.error('Old photo cleanup failed',e);}}
 return json({bag:await savedBag(user)});
 }catch(e){console.error('Bag save failed',e);if(newKey){const linked=await database().prepare('SELECT id FROM bag_items WHERE photo_key=?').bind(newKey).first().catch(()=>true);if(!linked)await env.DISC_PHOTOS.delete(newKey).catch(()=>{});}return unavailable();}
}
export const POST=(req:Request)=>save(req,false);
export const PUT=(req:Request)=>save(req,true);
export async function DELETE(req:Request){const a=await authenticated(req,true);if(a.error)return a.error;let p;try{p=await body(req);if(typeof p.id!=='string'||p.id.length>80)throw new Error();}catch{return json({error:'Choose a saved disc to remove.'},400);}try{const old=await database().prepare('SELECT photo_key FROM bag_items WHERE user_id=? AND id=?').bind(a.user!.userId,p.id).first<{photo_key:string|null}>();await database().prepare('DELETE FROM bag_items WHERE user_id=? AND id=?').bind(a.user!.userId,p.id).run();if(old?.photo_key)await env.DISC_PHOTOS.delete(old.photo_key).catch(e=>console.error('Photo cleanup failed',e));return json({bag:await savedBag(a.user!.userId)});}catch{return unavailable();}}
