import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createPublicWorker} from '../workers/public.mjs';
import {bagSlots} from '../public/bag-values.js';
import catalog from '../public/data.json' with {type:'json'};

function setup() {
 const db = new DatabaseSync(':memory:');
 for (const file of fs.readdirSync('migrations/accounts').sort()) db.exec(fs.readFileSync('migrations/accounts/' + file, 'utf8'));
 const DB = {async batch(statements) {db.exec('BEGIN');try {const results=[];for(const s of statements)results.push(await s.run());db.exec('COMMIT');return results;}catch(error){db.exec('ROLLBACK');throw error;}},prepare(sql) {let args = []; return {bind(...values) {args = values; return this;}, async first() {return db.prepare(sql).get(...args) || null;}, async all() {return {results: db.prepare(sql).all(...args)};}, async run() {return {meta: {changes: db.prepare(sql).run(...args).changes}};}};}};
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

test('new putter defaults once, then main persists through edits and every read route', async () => {
 const s=await fixture();try {
  const created=await s.call('/api/bag/discs','POST',{mold_id:'761c90d342f5'});
  assert.equal(created.status,201);const disc=(await created.json()).disc;assert.equal(disc.pocket,'putter');
  const moved=await s.call('/api/bag/discs/'+disc.id,'PUT',{...disc,pocket:'main'});
  assert.equal(moved.status,200);assert.equal((await moved.json()).disc.pocket,'main');
  for(const [method,details] of [['PUT',{...disc,pocket:undefined,wear:5}],['PATCH',{in_bag:false}],['PATCH',{in_bag:true}]]){
   const edited=await s.call('/api/bag/discs/'+disc.id,method,details);assert.equal(edited.status,200);assert.equal((await edited.json()).disc.pocket,'main');
  }
  for(const path of ['/api/bag','/api/bag/discs','/api/bag/discs/'+disc.id]){
   const body=await (await s.call(path)).json(),rows=body.discs || [body.disc];assert.equal(rows[0].pocket,'main');
   const slots=bagSlots(rows,{main_capacity:2,putter_capacity:2},id=>catalog.discs.find(d=>d.id===id));
   assert.equal(slots.main[0].item.id,disc.id);assert.ok(slots.putter.every(s=>!s.item));
  }
  assert.equal(s.db.prepare('SELECT pocket FROM bag_discs WHERE id=?').get(disc.id).pocket,'main');
 }finally{s.close();}
});

test('go-to supports create and both edits, persists on reads and remains account scoped', async () => {
 const s=await fixture();try {
  const created=await s.call('/api/bag/discs','POST',{...item,pocket:'goto'});assert.equal(created.status,201);
  const disc=(await created.json()).disc;assert.equal(disc.pocket,'goto');
  for(const pocket of ['putter','main','goto']){
   const edited=await s.call('/api/bag/discs/'+disc.id,'PATCH',{pocket});assert.equal(edited.status,200);assert.equal((await edited.json()).disc.pocket,pocket);
  }
  assert.equal((await s.call('/api/bag/discs/'+disc.id,'PUT',{...item,wear:6})).status,200);
  assert.equal((await (await s.call('/api/bag/discs/'+disc.id)).json()).disc.pocket,'goto');
  assert.equal((await (await s.call()).json()).discs[0].pocket,'goto');
  assert.equal((await s.call('/api/bag/discs/'+disc.id,'PATCH',{pocket:'main'},{cookie:'y'.repeat(43)})).status,404);
  assert.throws(()=>s.db.prepare("UPDATE bag_discs SET pocket='other'").run());
 }finally{s.close();}
});

test('go-to migration preserves every existing column, indexes and account cascade', () => {
 const db=new DatabaseSync(':memory:');try {
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f<'0006'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('u','g','a@example.com','A',1,1);
  for(const [id,pocket] of [['p','main'],['d','putter']])db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,notes,added_at,color,in_bag,pocket,stability_bias,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,'u','761c90d342f5','Other',5,175,'Keep me','before','#123456',0,pocket,'less_stable',7);
  const before=db.prepare('SELECT * FROM bag_discs ORDER BY id').all();
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f>='0006'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  assert.deepEqual(db.prepare('SELECT * FROM bag_discs ORDER BY id').all(),before);
  db.prepare("UPDATE bag_discs SET pocket='goto' WHERE id='p'").run();
  assert.equal(db.prepare("SELECT pocket FROM bag_discs WHERE id='p'").get().pocket,'goto');
  assert.deepEqual(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='bag_discs' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r=>r.name),['bag_discs_user_added','bag_discs_user_location']);
  db.prepare("DELETE FROM auth_users WHERE id='u'").run();assert.equal(db.prepare('SELECT COUNT(*) AS n FROM bag_discs').get().n,0);
 }finally{db.close();}
});

test('bag endpoints require a session and origin + CSRF for every mutation', async () => {
 const s = await fixture(); try {
  for (const [path, method, data] of [['/api/bag','GET'],['/api/bag','PUT',{bag_model:'Custom bag',capacity:20}],['/api/bag/discs','GET'],['/api/bag/discs','POST',item],['/api/bag/discs/id','GET'],['/api/bag/discs/id','PUT',item],['/api/bag/discs/id','PATCH',{in_bag:false}],['/api/bag/discs/id','DELETE']]) {
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
  assert.equal((await s.call('/api/bag/discs/id','PATCH',{})).status,404);
 } finally {s.close();}
});

test('default details come from mold references and sane max weights; curated settings use model capacity', async () => {
 const s = await fixture(); try {
  const response = await s.call('/api/bag/discs','POST',{mold_id:'3d60892b6812'}); assert.equal(response.status,201);
  const d = (await response.json()).disc; assert.equal(d.plastic,'Star'); assert.equal(d.wear,10); assert.equal(d.weight_g,175);
  const response2 = await s.call('/api/bag','PUT',{bag_model:'Dynamic Discs Commander',capacity:999}); assert.equal(response2.status,200);
  assert.equal((await response2.json()).bag.capacity,24);
 } finally {s.close();}
});

test('v1.1 colors, pocket totals and storage persist without changing another account', async () => {
 const s=await fixture();try {
  const created=await s.call('/api/bag/discs','POST',{...item,color:'#AB34EF'});
  const disc=(await created.json()).disc;assert.equal(disc.color,'#ab34ef');assert.equal(disc.in_bag,true);
  const defaultColor=(await (await s.call('/api/bag/discs','POST',{...item,plastic:'Z'})).json()).disc.color;
  assert.equal(defaultColor,'#70b7cd');
  const moved=await s.call('/api/bag/discs/'+disc.id,'PATCH',{in_bag:false});assert.equal(moved.status,200);
  assert.equal((await moved.json()).disc.in_bag,false);
  assert.equal((await s.call('/api/bag/discs/'+disc.id,'PATCH',{in_bag:true},{cookie:'y'.repeat(43)})).status,404);
  for(const patch of [{in_bag:'false'},{in_bag:2},{in_bag:null},{color:null},{color:'red'},{color:'#123'},{color:'#ffffff;'}])assert.equal((await s.call('/api/bag/discs','POST',{...item,...patch})).status,400);
  assert.equal((await s.call('/api/bag/discs/'+disc.id,'PATCH',{in_bag:0})).status,400);
  assert.equal((await s.call('/api/bag/discs/'+disc.id,'PATCH',{in_bag:true},{csrf:''})).status,403);
  assert.equal((await s.call('/api/bag/discs/'+disc.id,'PUT',{...item,wear:6})).status,200);
  const updated=(await (await s.call('/api/bag/discs/'+disc.id)).json()).disc;
  assert.equal(updated.color,'#ab34ef');assert.equal(updated.in_bag,false,'legacy edits preserve storage');
  const settings=await s.call('/api/bag','PUT',{bag_model:'Grip BX3',capacity:999,bag_color:'#436752'});
  const bag=(await settings.json()).bag;assert.equal(bag.capacity,21);assert.equal(bag.main_capacity,18);assert.equal(bag.putter_capacity,3);assert.equal(bag.bag_color,'#436752');
  const custom=await s.call('/api/bag','PUT',{bag_model:'My bag',capacity:20,main_capacity:16,putter_capacity:4,bag_color:'#223344'});
  assert.equal(custom.status,200);assert.equal((await custom.json()).bag.capacity,20);
  assert.equal((await s.call('/api/bag','PUT',{bag_model:'My bag',main_capacity:16,putter_capacity:4,capacity:21})).status,400);
  assert.equal((await s.call('/api/bag','PUT',{bag_model:'My bag',capacity:20,bag_color:'red'})).status,400);
  assert.equal((await (await s.call('/api/bag','GET',undefined,{cookie:'y'.repeat(43)})).json()).bag.bag_color,'#343c49');
  assert.throws(()=>s.db.prepare('UPDATE bag_discs SET in_bag=2').run());
  assert.throws(()=>s.db.prepare("UPDATE bag_discs SET color='red'").run());
  assert.throws(()=>s.db.prepare('UPDATE bags SET main_capacity=-1').run());
 }finally{s.close();}
});

test('upgrade migration preserves existing copies, notes and custom capacity', () => {
 const db=new DatabaseSync(':memory:');try {
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f<'0004'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('u','g','a@example.com','A',1,1);
  db.prepare('INSERT INTO bags VALUES (?,?,?,?)').run('u','My sling',9,'before');
  db.prepare('INSERT INTO bag_discs VALUES (?,?,?,?,?,?,?,?)').run('d','u',item.mold_id,'ESP',8,175,'Keep me','before');
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f>='0004'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  const saved=db.prepare('SELECT * FROM bag_discs').get();assert.equal(saved.in_bag,1);assert.match(saved.color,/^#[0-9a-f]{6}$/);assert.equal(saved.notes,'Keep me');
  const bag=db.prepare('SELECT * FROM bags').get();assert.equal(bag.capacity,9);assert.equal(bag.main_capacity+bag.putter_capacity,9);assert.equal(bag.bag_color,'#343c49');
 }finally{db.close();}
});

test('v1.2 fields default by mold, validate strictly and remain independent per copy', async () => {
 const s=await fixture();try {
  const a=(await (await s.call('/api/bag/discs','POST',{mold_id:'761c90d342f5'})).json()).disc;
  assert.equal(a.pocket,'putter');assert.equal(a.stability_bias,null);assert.equal(a.sort_order,0);
  const b=(await (await s.call('/api/bag/discs','POST',{mold_id:a.mold_id,pocket:'main',stability_bias:'less_stable',notes:'Putting practice'})).json()).disc;
  assert.equal(b.pocket,'main');assert.equal(b.stability_bias,'less_stable');assert.equal(b.sort_order,1);
  for(const patch of [{pocket:'storage'},{pocket:null},{stability_bias:'neutral'},{stability_bias:0},{sort_order:-1},{sort_order:1.5}])assert.equal((await s.call('/api/bag/discs','POST',{...item,...patch})).status,400,JSON.stringify(patch));
  assert.equal((await s.call('/api/bag/discs/'+b.id,'PUT',{...item,mold_id:b.mold_id})).status,200);
  const edited=(await (await s.call('/api/bag/discs/'+b.id)).json()).disc;
  assert.equal(edited.pocket,'main');assert.equal(edited.stability_bias,'less_stable');
  assert.equal((await s.call('/api/bag/discs/'+b.id,'PATCH',{pocket:'putter',stability_bias:null})).status,200);
  assert.equal((await s.call('/api/bag/discs/'+b.id,'PATCH',{pocket:'main'},{cookie:'y'.repeat(43)})).status,404);
  assert.equal((await (await s.call('/api/bag/discs/'+a.id)).json()).disc.stability_bias,null);
  assert.throws(()=>s.db.prepare("UPDATE bag_discs SET pocket='other'").run());
  assert.throws(()=>s.db.prepare("UPDATE bag_discs SET stability_bias='neutral'").run());
  assert.throws(()=>s.db.prepare('UPDATE bag_discs SET sort_order=-1').run());
 }finally{s.close();}
});
test('sort preference persists by account and reorder accepts only the complete owned bag', async () => {
 const s=await fixture();try {
  assert.equal((await (await s.call()).json()).bag.sort_mode,'speed');
  for(const sort_mode of ['stability','custom'])assert.equal((await s.call('/api/bag','PATCH',{sort_mode})).status,200);
  assert.equal((await s.call('/api/bag','PATCH',{sort_mode:'name'})).status,400);
  assert.equal((await s.call('/api/bag','PATCH',{sort_mode:'speed'},{csrf:''})).status,403);
  assert.equal((await (await s.call('/api/bag','GET',undefined,{cookie:'y'.repeat(43)})).json()).bag.sort_mode,'speed');
  await s.call('/api/bag','PUT',{bag_model:'Custom bag',capacity:20});
  assert.equal((await (await s.call()).json()).bag.sort_mode,'custom','Legacy settings edits preserve sort');
  const a=(await (await s.call('/api/bag/discs','POST',item)).json()).disc;
  const b=(await (await s.call('/api/bag/discs','POST',item)).json()).disc;
  const stored=(await (await s.call('/api/bag/discs','POST',{...item,in_bag:false})).json()).disc;
  for(const ids of [[a.id],[a.id,a.id],[a.id,stored.id]])assert.equal((await s.call('/api/bag/order','PUT',{ids})).status,409);
  assert.equal((await s.call('/api/bag/order','PUT',{ids:[b.id,a.id]},{cookie:'y'.repeat(43)})).status,409);
  assert.equal((await s.call('/api/bag/order','PUT',{ids:[b.id,a.id]},{csrf:''})).status,403);
  assert.equal((await s.call('/api/bag/order','PUT',{ids:[b.id,a.id]})).status,200);
  assert.equal((await (await s.call('/api/bag/discs/'+b.id)).json()).disc.sort_order,0);
  assert.equal((await (await s.call('/api/bag/discs/'+a.id)).json()).disc.sort_order,1);
  assert.equal((await (await s.call('/api/bag/discs/'+stored.id)).json()).disc.sort_order,2);
 }finally{s.close();}
});
test('v1.2 migration assigns existing putters and preserves notes, storage and order', () => {
 const db=new DatabaseSync(':memory:');try {
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f<'0005'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('u','g','a@example.com','A',1,1);
  for(const [id,mold_id,date] of [['b',item.mold_id,'2026-02-01'],['a','761c90d342f5','2026-01-01']])db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,notes,added_at,in_bag) VALUES (?,?,?,?,?,?,?,?,?)').run(id,'u',mold_id,'Other',5,175,'Keep this copy',date,0);
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f>='0005'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  const rows=db.prepare('SELECT * FROM bag_discs ORDER BY added_at').all();
  assert.equal(rows[0].pocket,'putter');assert.equal(rows[1].pocket,'main');
  assert.deepEqual(rows.map(r=>r.sort_order),[0,1]);assert.equal(rows[0].in_bag,0);assert.equal(rows[0].notes,'Keep this copy');assert.equal(rows[0].stability_bias,null);
 }finally{db.close();}
});
