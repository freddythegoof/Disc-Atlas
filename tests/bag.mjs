import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createPublicWorker} from '../workers/public.mjs';

function setup() {
 const db = new DatabaseSync(':memory:');
 for (const file of fs.readdirSync('migrations/accounts').sort()) db.exec(fs.readFileSync('migrations/accounts/' + file, 'utf8'));
 const DB = {prepare(sql) {let args = []; return {bind(...values) {args = values; return this;}, async first() {return db.prepare(sql).get(...args) || null;}, async all() {return {results: db.prepare(sql).all(...args)};}, async run() {return {meta: {changes: db.prepare(sql).run(...args).changes}};}};}};
 const worker = createPublicWorker();
 const call = (path = '/api/bag', method = 'GET', data, {cookie = 'x'.repeat(43), csrf = 'csrf', origin = 'https://atlas.example', contentType = 'application/json'} = {}) => worker.fetch(new Request('https://atlas.example' + path, {method, headers: {Cookie: '__Host-atlas-session=' + cookie, Origin: origin, 'Content-Type': contentType, 'X-Atlas-CSRF': csrf, 'oai-authenticated-user-id': 'u2'}, ...(data === undefined ? {} : {body: JSON.stringify(data)})}), {DB});
 const user = async (id, token) => {
  const hash = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))).toString('base64url');
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run(id, 'google-' + id, id + '@example.com', id, 1, 1);
  db.prepare('INSERT INTO auth_sessions VALUES (?,?,?,?)').run(hash, id, 'csrf', 2000000000);
 };
 return {db, call, user, close: () => db.close()};
}
const item = {mold_id: '7446eb39abe5', plastic: 'ESP', wear: 10, weight_g: 180, notes: ''};
async function fixture() {const s = setup(); await s.user('u1', 'x'.repeat(43)); await s.user('u2', 'y'.repeat(43)); return s;}

test('bag endpoints require a session and origin + CSRF for every mutation', async () => {
 const s = await fixture(); try {
  for (const [path, method, data] of [['/api/bag','GET'],['/api/bag','PUT',{bag_model:'Custom bag',capacity:20}],['/api/bag/discs','GET'],['/api/bag/discs','POST',item],['/api/bag/discs/id','GET'],['/api/bag/discs/id','PUT',item],['/api/bag/discs/id','DELETE']]) {
   assert.equal((await s.call(path,method,data,{cookie:''})).status,401);
   if (method !== 'GET') {
    assert.equal((await s.call(path,method,data,{origin:'https://evil.example'})).status,403);
    assert.equal((await s.call(path,method,data,{csrf:''})).status,403);
   }
  }
  const r = await s.call(); assert.equal(r.status,200); assert.equal(r.headers.get('Cache-Control'),'no-store');
  assert.deepEqual((await r.json()).discs,[]);
 } finally {s.close();}
});

test('physical copies remain independent; CRUD and bag settings are isolated by session user', async () => {
 const s = await fixture(); try {
  const first = await s.call('/api/bag/discs','POST',item); assert.equal(first.status,201);
  const a = (await first.json()).disc;
  const b = (await (await s.call('/api/bag/discs','POST',{...item,plastic:'Z',wear:5,weight_g:175})).json()).disc;
  assert.notEqual(a.id,b.id);
  assert.equal((await (await s.call()).json()).discs.length,2);
  assert.equal((await (await s.call('/api/bag/discs/'+a.id)).json()).disc.plastic,'ESP');
  for (const method of ['GET','PUT','DELETE']) assert.equal((await s.call('/api/bag/discs/'+a.id,method,method==='PUT'?item:undefined,{cookie:'y'.repeat(43)})).status,404);
  assert.deepEqual((await (await s.call('/api/bag','GET',undefined,{cookie:'y'.repeat(43)})).json()).discs,[]);
  const edited = await s.call('/api/bag/discs/'+a.id,'PUT',{...item,plastic:'My custom blend',wear:1,weight_g:130,notes:'  water disc  ',user_id:'u2'});
  assert.equal(edited.status,200); assert.equal((await edited.json()).disc.notes,'water disc');
  assert.equal((await (await s.call('/api/bag/discs/'+b.id)).json()).disc.wear,5);
  assert.equal((await s.call('/api/bag','PUT',{bag_model:'My small bag',capacity:1,user_id:'u2'})).status,200);
  // Capacity is informational, including for additional physical copies.
  assert.equal((await s.call('/api/bag/discs','POST',item)).status,201);
  assert.equal((await (await s.call()).json()).bag.capacity,1);
  assert.equal((await (await s.call('/api/bag','GET',undefined,{cookie:'y'.repeat(43)})).json()).bag.capacity,20);
  assert.equal((await s.call('/api/bag/discs/'+a.id,'DELETE')).status,200);
  assert.equal((await s.call('/api/bag/discs/'+a.id)).status,404);
  assert.equal((await (await s.call('/api/bag/discs')).json()).discs.length,2);
  s.db.prepare('DELETE FROM auth_users WHERE id=?').run('u1');
  assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM bags').get().n,0);
  assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM bag_discs').get().n,0);
 } finally {s.close();}
});

test('wear and weight require bounded integers; plastics, notes and mold IDs are validated', async () => {
 const s = await fixture(); try {
  for (const patch of [{wear:0},{wear:11},{wear:5.5},{wear:'10'},{wear:null},{weight_g:129},{weight_g:181},{weight_g:175.5},{weight_g:'175'},{weight_g:null},{plastic:''},{plastic:' '},{plastic:4},{plastic:'a'.repeat(61)},{notes:'a'.repeat(241)},{notes:[]},{mold_id:'unknown'}]) {
   assert.equal((await s.call('/api/bag/discs','POST',{...item,...patch})).status,400,JSON.stringify(patch));
  }
  for (const patch of [{wear:1,weight_g:130},{wear:10,weight_g:180,plastic:'  Z  ',notes:null}]) assert.equal((await s.call('/api/bag/discs','POST',{...item,...patch})).status,201);
  for (const data of [{bag_model:'',capacity:20},{bag_model:'Custom bag',capacity:0},{bag_model:'Custom bag',capacity:1.5},{bag_model:'Custom bag',capacity:'20'},{bag_model:'a'.repeat(81),capacity:20}]) assert.equal((await s.call('/api/bag','PUT',data)).status,400);
  assert.equal((await s.call('/api/bag/discs','POST',item,{contentType:'text/plain'})).status,400);
  assert.equal((await s.call('/api/bag/discs','POST',{...item,notes:'x'.repeat(9000)})).status,400);
  assert.equal((await s.call('/api/bag','POST',{})).status,405);
  assert.equal((await s.call('/api/bag/discs/id','PATCH',{})).status,405);
 } finally {s.close();}
});

test('default details come from mold references and sane max weights; curated settings use model capacity', async () => {
 const s = await fixture(); try {
  const response = await s.call('/api/bag/discs','POST',{mold_id:'3d60892b6812'}); assert.equal(response.status,201);
  const d = (await response.json()).disc; assert.equal(d.plastic,'Star'); assert.equal(d.wear,10); assert.equal(d.weight_g,175);
  const response2 = await s.call('/api/bag','PUT',{bag_model:'Dynamic Discs Commander',capacity:999}); assert.equal(response2.status,200);
  assert.equal((await response2.json()).bag.capacity,20);
 } finally {s.close();}
});
