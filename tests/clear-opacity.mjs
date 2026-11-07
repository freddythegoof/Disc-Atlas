// Clear finish opacity (docs/clear-opacity.md), no browser: finish_opacity persists on a clear copy and on no other, an older
// client keeps it, and the migration leaves every row on today's look.
// Run with `node --test tests/clear-opacity.mjs`. The sheet and the renderers are tests/clear-opacity-browser.mjs.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createPublicWorker} from '../workers/public.mjs';
import {FINISH_OPACITY,renderFinish,validateDiscDetails} from '../public/bag-values.js';
import catalog from '../public/data.json' with {type:'json'};
import plastics from '../source-data/bag-plastics.json' with {type:'json'};

const MIGRATION='migrations/accounts/0018_finish_opacity.sql';
function setup() {
 const db=new DatabaseSync(':memory:');
 for(const file of fs.readdirSync('migrations/accounts').sort())db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
 const DB={async batch(statements){const results=[];for(const s of statements)results.push(await s.run());return results;},prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:db.prepare(sql).run(...args).changes}};}};}};
 const worker=createPublicWorker();
 const call=(path='/api/bag',method='GET',data,{cookie='x'.repeat(43)}={})=>worker.fetch(new Request('https://atlas.example'+path,{method,headers:{Cookie:'__Host-atlas-session='+cookie,Origin:'https://atlas.example','Content-Type':'application/json','X-Atlas-CSRF':'csrf'},...(data===undefined?{}:{body:JSON.stringify(data)})}),{DB});
 const user=async(id,token)=>{
  const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('base64url');
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run(id,'google-'+id,id+'@example.com',id,1,1);
  db.prepare('INSERT INTO auth_sessions VALUES (?,?,?,?)').run(hash,id,'csrf',2000000000);
 };
 return {db,call,user,close:()=>db.close()};
}
const item={mold_id:'7446eb39abe5',plastic:'Z',wear:10,weight_g:175,notes:'',color:'#0984a8',finish:'clear',pocket:'main'};
const row=(s,id)=>s.db.prepare('SELECT finish,finish_opacity FROM bag_discs WHERE id=?').get(id);

test('the validator takes 0 to 100 on a clear copy and stores null on an opaque one', () => {
 const disc=catalog.discs.find(d=>d.id===item.mold_id),base={...item,in_bag:true};
 assert.equal(validateDiscDetails(base,disc,plastics).finish_opacity,null);
 for(const value of [0,1,FINISH_OPACITY.today,99,100])assert.equal(validateDiscDetails({...base,finish_opacity:value},disc,plastics).finish_opacity,value);
 for(const value of [-1,101,50.5,'50','',true,{}])assert.throws(()=>validateDiscDetails({...base,finish_opacity:value},disc,plastics),/opacity/,String(value));
 assert.equal(validateDiscDetails({...base,finish:'opaque',finish_opacity:60},disc,plastics).finish_opacity,null);
});

test('a copy\'s opacity persists through edits, moves and fresh reads; going opaque clears it', async () => {
 const s=setup();try {
  await s.user('u1','x'.repeat(43));await s.user('u2','y'.repeat(43));
  const plain=(await (await s.call('/api/bag/discs','POST',item)).json()).disc;
  assert.equal(plain.finish_opacity,null);
  const response=await s.call('/api/bag/discs','POST',{...item,finish_opacity:60});
  assert.equal(response.status,201);
  const disc=(await response.json()).disc,path='/api/bag/discs/'+disc.id;
  assert.equal(disc.finish_opacity,60);
  // A move, and an edit that does not mention it (an older client), keep it.
  assert.equal((await s.call(path,'PATCH',{in_bag:false})).status,200);
  assert.equal((await s.call(path,'PUT',{...item,notes:'Storage'})).status,200);
  for(const route of ['/api/bag','/api/bag/discs',path]){
   const data=await (await s.call(route)).json(),saved=data.disc||data.discs.find(d=>d.id===disc.id);
   assert.equal(saved.finish_opacity,60,route);
  }
  for(const finish_opacity of [-1,101,1.5,'60'])assert.equal((await s.call(path,'PUT',{...item,finish_opacity})).status,400);
  // Back to today's look: null. Then opaque stores null whatever it is sent, and Clear again starts at today's.
  assert.equal((await s.call(path,'PUT',{...item,finish_opacity:null})).status,200);
  assert.deepEqual({...row(s,disc.id)},{finish:'clear',finish_opacity:null});
  assert.equal((await s.call(path,'PUT',{...item,finish_opacity:80})).status,200);
  assert.equal((await s.call(path,'PUT',{...item,finish:'opaque',finish_opacity:80})).status,200);
  assert.deepEqual({...row(s,disc.id)},{finish:'opaque',finish_opacity:null});
  assert.equal((await s.call(path,'PUT',{...item,finish:'clear'})).status,200);
  assert.deepEqual({...row(s,disc.id)},{finish:'clear',finish_opacity:null});
  // Another player's request never reaches it.
  assert.equal((await s.call(path,'PUT',{...item,finish_opacity:10},{cookie:'y'.repeat(43)})).status,404);
 }finally{s.close();}
});

test('the migration leaves every row on today\'s look and accepts only whole numbers from 0 to 100', () => {
 const db=new DatabaseSync(':memory:');try {
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f<'0018'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('u','g','a@example.com','A',1,1);
  for(const finish of ['opaque','clear'])db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,color,added_at,finish) VALUES (?,?,?,?,?,?,?,?,?)').run(finish,'u','35a861477cf9','Z',10,175,'#0984a8','2026-11-06T00:00:00Z',finish);
  const before=db.prepare('SELECT * FROM bag_discs ORDER BY id').all();
  db.exec(fs.readFileSync(MIGRATION,'utf8'));
  db.prepare('SELECT * FROM bag_discs ORDER BY id').all().forEach(({finish_opacity,...disc},index)=>{assert.equal(finish_opacity,null);assert.deepEqual(disc,{...before[index]});});
  for(const bad of [-1,101,1.5,'high'])assert.throws(()=>db.prepare('UPDATE bag_discs SET finish_opacity=?').run(bad),String(bad));
  for(const good of [0,100,null])db.prepare('UPDATE bag_discs SET finish_opacity=?').run(good);
 }finally{db.close();}
});

test('full opacity draws as an opaque disc everywhere; every other value and finish draws as saved', () => {
 assert.equal(renderFinish({finish:'clear',finish_opacity:100}),'opaque');
 for(const finish_opacity of [null,undefined,0,99])assert.equal(renderFinish({finish:'clear',finish_opacity}),'clear');
 assert.equal(renderFinish({finish:'opaque',finish_opacity:null}),'opaque');
 assert.equal(renderFinish({}),undefined);assert.equal(renderFinish(null),undefined);
});
