import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
export function database(){if(!env.DB)throw new Error('Storage is unavailable');return env.DB;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function authenticated(req:Request,write=false){
 const user=await getChatGPTUser();if(!user)return {error:json({error:'Sign in to use your bag.'},401)};
 if(write){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)return {error:json({error:'Request origin was not accepted.'},403)};if(!req.headers.get('content-type')?.includes('application/json'))return {error:json({error:'JSON is required.'},415)};}
 return {user};
}
export async function body(req:Request,max=20000){if(Number(req.headers.get('content-length'))>max)throw new Error('Request is too large');const reader=req.body?.getReader();if(!reader)throw new Error('Request is empty');let size=0,text='';const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new Error('Request is too large');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();return JSON.parse(text);}
export function unavailable(){return json({error:'Could not reach your saved data. Your changes have not been saved. Please try again.'},503);}
type SavedBagRecord={id:string;discId:string;plastic:string;weight:number|null;wear:string;notes:string;color:string;photoKey:string|null};
export async function savedBag(id:string){const r=await database().prepare('SELECT id,disc_id AS discId,plastic,weight,wear,notes,color,photo_key AS photoKey FROM bag_items WHERE user_id = ? ORDER BY created_at,id').bind(id).all<SavedBagRecord>();return r.results.map(row=>{const {photoKey,...item}=row;return {...item,photoUrl:photoKey?'/api/bag/photo?id='+encodeURIComponent(item.id)+'&v='+encodeURIComponent(photoKey.split('/').pop()||''):null};});}
export async function savedProfile(id:string){const row=await database().prepare('SELECT profile FROM profiles WHERE user_id = ?').bind(id).first<{profile:string}>();return row?JSON.parse(row.profile):null;}
