import {env} from 'cloudflare:workers';
import {authenticated,body,database,json,savedBag,savedProfile,unavailable} from '../../../lib/server';
export async function GET(req:Request){
 const a=await authenticated(req);if(a.error)return a.error;
 try{const id=a.user!.userId;const [profile,bag,usage]=await Promise.all([savedProfile(id),savedBag(id),database().prepare('SELECT day,count FROM coach_usage WHERE user_id=? ORDER BY day').bind(id).all()]);
 return json({exportedAt:new Date().toISOString(),account:{name:a.user!.fullName,email:a.user!.email},profile,bag,coachUsage:usage.results,photoNote:'Photo bytes are not included. Download each photo from Your data while signed in, before deleting saved data. Photo URLs require your account.',scope:'Disc Atlas application data only; excludes authentication-provider account, infrastructure logs and backups.'});
 }catch{return unavailable();}
}
export async function DELETE(req:Request){
 const a=await authenticated(req,true);if(a.error)return a.error;
 try{const p=await body(req);if(p.confirmation!=='DELETE MY DATA')return json({error:'Type DELETE MY DATA to confirm.'},400);}catch{return json({error:'Confirmation is required.'},400);}
 try{const id=a.user!.userId;const photos=await database().prepare('SELECT photo_key FROM bag_items WHERE user_id=? AND photo_key IS NOT NULL').bind(id).all<{photo_key:string}>();
 // Keep database references until object deletion succeeds, so failed deletions can be retried.
 for(const row of photos.results)await env.DISC_PHOTOS.delete(row.photo_key);
 await database().batch(['bag_items','profiles','coach_usage'].map(table=>database().prepare(`DELETE FROM ${table} WHERE user_id=?`).bind(id)));
 return json({deleted:true});
 }catch{return json({error:'Deletion did not finish. Some photos may already be removed. Please retry to finish deleting your saved data.'},503);}
}
