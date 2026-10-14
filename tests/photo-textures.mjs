import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createBag} from '../workers/bag.mjs';

// Real SQLite exercises the owner predicates, migration constraints and cleanup triggers.
function fixture(){
 const db=new DatabaseSync(':memory:');
 for(const f of fs.readdirSync('migrations/accounts').sort())db.exec(fs.readFileSync('migrations/accounts/'+f,'utf8'));
 for(const u of ['a','b'])db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run(u,u,u+'@example.com',u,1,1);
 db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at) VALUES (?,?,?,?,?,?,?)').run('disc','a','7446eb39abe5','ESP',10,180,'now');
 const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:db.prepare(sql).run(...args).changes}};}};},async batch(statements){db.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}};
 const objects=new Map();let failDelete=false,afterPut=null;
 const TEXTURES={async put(k,v){objects.set(k,new Uint8Array(v));await afterPut?.(k);},async get(k){return objects.has(k)?{body:objects.get(k)}:null;},async delete(k){if(failDelete)throw Error('R2 unavailable');objects.delete(k);}};
 const bag=createBag({session:async r=>r.headers.get('User')?{id:r.headers.get('User'),csrf_token:'token'}:null});
 const call=(method='GET',body,user='a',path='/api/bag/discs/disc/photo')=>bag.fetch(new Request('https://atlas.example'+path,{method,headers:{User:user,Origin:'https://atlas.example','X-Atlas-CSRF':'token','Content-Type':'image/webp'},body}),{DB,TEXTURES});
 return {db,DB,TEXTURES,objects,call,setFailDelete:v=>failDelete=v,setAfterPut:fn=>afterPut=fn};
}
// Bounded lossless WebP header. Real codec/alpha tests run in the browser suite.
const webp=()=>{const b=new Uint8Array(32);b.set(Buffer.from('RIFF'));new DataView(b.buffer).setUint32(4,24,true);b.set(Buffer.from('WEBPVP8L'),8);new DataView(b.buffer).setUint32(16,12,true);b[20]=0x2f;new DataView(b.buffer).setUint32(21,1023|(1023<<14),true);return b;};

const chunk=(type,payload)=>{const b=Buffer.alloc(8+payload.length+(payload.length%2));b.write(type);b.writeUInt32LE(payload.length,4);b.set(payload,8);return b;};
const container=(...chunks)=>{const b=Buffer.concat([Buffer.from('RIFF0000WEBP'),...chunks]);b.writeUInt32LE(b.length-8,4);return b;};
const extended=()=>{const b=Buffer.alloc(10);b.writeUIntLE(1023,4,3);b.writeUIntLE(1023,7,3);return chunk('VP8X',b);};

test('processed WebP validates frame dimensions and every chunk before storing bytes',async()=>{
 const s=fixture();try{
  const frame=Buffer.from(webp().slice(12)),large=Buffer.from(frame);large.writeUInt32LE(8191|(8191<<14),9);
  const malformed=Buffer.from(frame);malformed.writeUInt32LE(1000,4);
  const version=Buffer.from(frame);version.writeUInt32LE((1023|(1023<<14)|0x20000000)>>>0,9);
  const badPadding=chunk('ALPH',Buffer.from([1]));badPadding[badPadding.length-1]=255;
  const candidates=[
   ['canvas/frame mismatch',container(extended(),large)],
   ['truncated chunk',container(extended(),malformed)],
   ['missing image',container(extended())],
   ['duplicate image',container(extended(),frame,frame)],
   ['animation without flag',container(extended(),chunk('ANIM',Buffer.alloc(6)),frame)],
   ['raw photo metadata',container(extended(),frame,chunk('EXIF',Buffer.from('GPS location')))],
   ['unknown lossless version',container(version)],
   ['nonzero padding',container(extended(),badPadding,frame)],
  ];
  for(const [name,bytes] of candidates)assert.equal((await s.call('PUT',bytes)).status,400,name);
  assert.equal(s.objects.size,0);assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,0);
  assert.equal((await s.call('PUT',container(extended(),frame))).status,200);
  const lossy=Buffer.alloc(12);lossy.set([0x9d,1,0x2a],3);lossy.writeUInt16LE(1024,6);lossy.writeUInt16LE(1024,8);
  const alphaHeader=extended();alphaHeader[8]=0x10;
  assert.equal((await s.call('PUT',container(alphaHeader,chunk('ALPH',Buffer.from([1,0])),chunk('VP8 ',lossy)))).status,200);
 }finally{s.db.close();}
});

test('processed WebP accepts the color profile emitted by browser canvas',async()=>{
 const s=fixture();try{
  const header=extended();header[8]=0x20;
  const profile=Buffer.alloc(128);profile.writeUInt32BE(128);profile.write('acsp',36);
  const bytes=container(header,chunk('ICCP',profile),Buffer.from(webp().slice(12)));
  assert.equal((await s.call('PUT',bytes)).status,200);
  assert.equal((await s.call('PUT',container(header,Buffer.from(webp().slice(12))))).status,400,'missing declared profile');
 }finally{s.db.close();}
});
test('private photo route stores a key, denies other owners, replaces and removes R2 objects',async()=>{
 const s=fixture();try{
  assert.equal((await s.call('PUT',webp())).status,200);
  const row=s.db.prepare('SELECT * FROM bag_discs').get();assert.match(row.texture_key,/^[a-f0-9-]+\.webp$/);assert.equal(s.objects.size,1);
  assert.equal((await s.call()).status,200);assert.equal((await s.call()).headers.get('Cache-Control'),'private, no-store');
  for(const method of ['GET','PUT','DELETE'])assert.equal((await s.call(method,method==='PUT'?webp():undefined,'b')).status,404);
  assert.equal((await s.call('PUT',webp(),'')).status,401);
  assert.equal((await s.call('PUT',webp())).status,200);assert.equal(s.objects.size,1);assert.ok(!s.objects.has(row.texture_key));
  assert.equal((await s.call('DELETE')).status,200);assert.equal(s.objects.size,0);assert.equal(s.db.prepare('SELECT texture_key FROM bag_discs').get().texture_key,null);
  assert.equal((await s.call()).status,404);
 }finally{s.db.close();}
});
test('malformed, oversized and raw uploads cannot replace a saved photo',async()=>{
 const s=fixture();try{
  for(const bytes of [new Uint8Array(0),new Uint8Array(513*1024),Buffer.from('<svg/>')])assert.equal((await s.call('PUT',bytes)).status,400);
  assert.equal(s.objects.size,0);
 }finally{s.db.close();}
});
test('migration preserves old copies and durably queues removed photos, including account cascades',async()=>{
 const s=fixture();try{
  assert.equal(s.db.prepare('SELECT texture_key FROM bag_discs').get().texture_key,null);
  assert.throws(()=>s.db.prepare("UPDATE bag_discs SET texture_key='../bad'").run());
  await s.call('PUT',webp());s.setFailDelete(true);
  assert.equal((await s.call('DELETE',undefined,'a','/api/bag/discs/disc')).status,200);
  assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,1);
  s.setFailDelete(false);
  const {cleanupTextures}=await import('../workers/textures.mjs');await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});assert.equal(s.objects.size,0);
  s.db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at,texture_key) VALUES (?,?,?,?,?,?,?,?)').run('other','a','7446eb39abe5','ESP',10,180,'now','00000000-0000-0000-0000-000000000000.webp');
  s.db.prepare("DELETE FROM auth_users WHERE id='a'").run();assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,1);
 }finally{s.db.close();}
});

test('a delayed upload cannot resurrect a deleted disc or overwrite a newer photo',async()=>{
 for(const change of ['delete','replace']){
  const s=fixture();try{
   let release,started;const waiting=new Promise(r=>release=r),putStarted=new Promise(r=>started=r);
   s.setAfterPut(async()=>{s.setAfterPut(null);started();await waiting;});
   const late=s.call('PUT',webp());await putStarted;
   if(change==='delete')assert.equal((await s.call('DELETE',undefined,'a','/api/bag/discs/disc')).status,200);
   else assert.equal((await s.call('PUT',webp())).status,200);
   const saved=s.db.prepare('SELECT texture_key FROM bag_discs').get()?.texture_key;
   release();assert.equal((await late).status,409);
   assert.deepEqual([...s.objects.keys()],saved?[saved]:[]);
   assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,0);
  }finally{s.db.close();}
 }
});

test('failed attachment retains durable upload intent and cleanup preserves the current photo',async()=>{
 const s=fixture();try{
  assert.equal((await s.call('PUT',webp())).status,200);
  const saved=s.db.prepare('SELECT texture_key FROM bag_discs').get().texture_key;
  const batch=s.DB.batch;s.DB.batch=async()=>{throw Error('D1 temporarily unavailable');};
  assert.equal((await s.call('PUT',webp())).status,503);s.DB.batch=batch;
  assert.equal(s.objects.size,2);assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,1);
  s.db.prepare('UPDATE texture_cleanup SET not_before=0').run();
  const {cleanupTextures}=await import('../workers/textures.mjs');await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});
  assert.deepEqual([...s.objects.keys()],[saved]);
  assert.equal(s.db.prepare('SELECT texture_key FROM bag_discs').get().texture_key,saved);
  assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,0);
 }finally{s.db.close();}
});

test('a cleanup outage after a committed photo change still reports success',async()=>{
 const s=fixture();try{
  const prepare=s.DB.prepare;s.DB.prepare=sql=>{if(sql.startsWith('SELECT key FROM texture_cleanup'))throw Error('D1 unavailable');return prepare(sql);};
  assert.equal((await s.call('PUT',webp())).status,200);
  const first=s.db.prepare('SELECT texture_key FROM bag_discs').get().texture_key;assert.ok(first);
  assert.equal((await s.call('PUT',webp())).status,200,'replacement committed; cleanup retries later');
  assert.notEqual(s.db.prepare('SELECT texture_key FROM bag_discs').get().texture_key,first);
  assert.equal((await s.call('DELETE')).status,200);
  assert.equal((await s.call('DELETE',undefined,'a','/api/bag/discs/disc')).status,200);
  assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,2,'both detached photos stay queued');
  s.DB.prepare=prepare;
  const {cleanupTextures}=await import('../workers/textures.mjs');await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});
  assert.equal(s.objects.size,0);assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM texture_cleanup').get().n,0);
 }finally{s.db.close();}
});
