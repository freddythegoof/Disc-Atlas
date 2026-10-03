import catalog from '../public/data.json' with {type: 'json'};
import plastics from '../source-data/bag-plastics.json' with {type: 'json'};
import models from '../source-data/bag-models.json' with {type: 'json'};
import {validateDiscDetails, validateBagSettings} from '../public/bag-values.js';

const json = (data, status = 200) => Response.json(data, {status, headers: {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
const byId = new Map(catalog.discs.map(d => [d.id, d]));
async function readBody(request) {
 if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new Error('Send JSON.');
 const reader = request.body?.getReader(); if (!reader) throw new Error('Send a bag update.');
 let size = 0, text = ''; const decoder = new TextDecoder();
 while (true) {const {done,value} = await reader.read(); if (done) break; size += value.length; if (size > 4096) {await reader.cancel();throw new Error('Bag update is too large.');} text += decoder.decode(value,{stream:true});}
 const data = JSON.parse(text + decoder.decode());
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Send an object.');
 return data;
}
export function createBag(auth) {
 return {async fetch(request, env) {
  if (!env.DB) return json({error:'Bag storage is unavailable. Please try again.'},503);
  try {
   const user = await auth.session(request,env);
   if (!user) return json({error:'Sign in to save your discs.',code:'sign_in_required'},401);
   const path = new URL(request.url).pathname, method = request.method;
   const single = /^\/api\/bag\/discs\/([^/]+)$/.exec(path), id = single?.[1];
   const root = path === '/api/bag', collection = path === '/api/bag/discs';
   if (!root && !collection && !single) return json({error:'Not found.'},404);
   if (!(root ? ['GET','PUT'] : collection ? ['GET','POST'] : ['GET','PUT','DELETE']).includes(method)) return json({error:'Method not allowed.'},405);
   if (method !== 'GET' && (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('X-Atlas-CSRF') !== user.csrf_token)) return json({error:'Refresh the page and try again.'},403);
   const list = async () => (await env.DB.prepare('SELECT id,mold_id,plastic,wear,weight_g,notes,added_at FROM bag_discs WHERE user_id=? ORDER BY added_at,id').bind(user.id).all()).results;
   const settings = async () => await env.DB.prepare('SELECT bag_model,capacity,updated_at FROM bags WHERE user_id=?').bind(user.id).first() || {bag_model:'Custom bag',capacity:20,updated_at:null};
   if (method === 'GET') {
    if (root) return json({bag:await settings(),discs:await list()});
    if (collection) return json({discs:await list()});
    const disc = await env.DB.prepare('SELECT id,mold_id,plastic,wear,weight_g,notes,added_at FROM bag_discs WHERE user_id=? AND id=?').bind(user.id,id).first();
    return disc ? json({disc}) : json({error:'Saved disc not found.'},404);
   }
   let data;
   if (method !== 'DELETE') {try {data = await readBody(request);} catch {return json({error:'Send a valid bag update (up to 4 KB).'},400);}}
   if (root) {
    let bag; try {bag = validateBagSettings(data,models);} catch (error) {return json({error:error.message},400);}
    await env.DB.prepare('INSERT INTO bags(user_id,bag_model,capacity,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET bag_model=excluded.bag_model,capacity=excluded.capacity,updated_at=excluded.updated_at').bind(user.id,bag.bag_model,bag.capacity,new Date().toISOString()).run();
    return json({bag:await settings()});
   }
   if (method === 'DELETE') {
    const result = await env.DB.prepare('DELETE FROM bag_discs WHERE user_id=? AND id=?').bind(user.id,id).run();
    return result.meta.changes ? json({removed:id}) : json({error:'Saved disc not found.'},404);
   }
   // Check ownership before validating an edit; never reveal another user's row.
   if (single && !await env.DB.prepare('SELECT id FROM bag_discs WHERE user_id=? AND id=?').bind(user.id,id).first()) return json({error:'Saved disc not found.'},404);
   let value; try {value = validateDiscDetails(data,byId.get(data.mold_id),plastics,method === 'POST');} catch (error) {return json({error:error.message},400);}
   const discId = id || crypto.randomUUID(), added_at = new Date().toISOString();
   if (single) {
    const result = await env.DB.prepare('UPDATE bag_discs SET mold_id=?,plastic=?,wear=?,weight_g=?,notes=? WHERE user_id=? AND id=?').bind(value.mold_id,value.plastic,value.wear,value.weight_g,value.notes,user.id,discId).run();
    if (!result.meta.changes) return json({error:'Saved disc not found.'},404);
   } else await env.DB.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,notes,added_at) VALUES (?,?,?,?,?,?,?,?)').bind(discId,user.id,value.mold_id,value.plastic,value.wear,value.weight_g,value.notes,added_at).run();
   const disc = await env.DB.prepare('SELECT id,mold_id,plastic,wear,weight_g,notes,added_at FROM bag_discs WHERE user_id=? AND id=?').bind(user.id,discId).first();
   return json({disc},single ? 200 : 201);
  } catch {return json({error:'Bag storage is unavailable. Please try again.'},503);}
 }};
}
