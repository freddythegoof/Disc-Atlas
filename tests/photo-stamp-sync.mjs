// Photo stamps v3 (docs/photo-stamp-sync.md): the account's stamp assets and Look, on real SQLite with every migration,
// so the owner predicates, constraints, triggers and the shared cleanup queue are the ones D1 runs.
//   node --test tests/photo-stamp-sync.mjs
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createBag} from '../workers/bag.mjs';
import {cleanupTextures} from '../workers/textures.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const KEY='00000000-0000-0000-0000-000000000000.webp',OTHER='11111111-1111-1111-1111-111111111111.webp';
function fixture(){
 const db=new DatabaseSync(':memory:');
 for(const f of fs.readdirSync('migrations/accounts').sort())db.exec(fs.readFileSync('migrations/accounts/'+f,'utf8'));
 for(const u of ['a','b'])db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run(u,u,u+'@example.com',u,1,1);
 db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at,texture_key) VALUES (?,?,?,?,?,?,?,?)').run('disc','a','7446eb39abe5','ESP',10,180,'now',KEY);
 db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at,texture_key) VALUES (?,?,?,?,?,?,?,?)').run('theirs','b','7446eb39abe5','ESP',10,180,'now',OTHER);
 const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:db.prepare(sql).run(...args).changes}};}};},
  async batch(statements){db.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}};
 const objects=new Map();
 const TEXTURES={async put(k,v){objects.set(k,new Uint8Array(v));},async get(k){return objects.has(k)?{body:objects.get(k)}:null;},async delete(k){objects.delete(k);}};
 const bag=createBag({session:async r=>r.headers.get('User')?{id:r.headers.get('User'),csrf_token:'token'}:null});
 const call=(method,path,{body,user='a',headers={}}={})=>bag.fetch(new Request('https://atlas.example'+path,{method,headers:{User:user,Origin:'https://atlas.example','X-Atlas-CSRF':'token',...headers},body}),{DB,TEXTURES});
 const count=sql=>db.prepare(sql).get().n;
 return {db,DB,TEXTURES,objects,call,count};
}
const png=async(side=64,alpha=true)=>new Uint8Array(await sharp({create:{width:side,height:side,channels:alpha?4:3,background:alpha?{r:255,g:255,b:255,alpha:.5}:{r:200,g:10,b:10}}}).png().toBuffer());
const webp=async(side=48)=>new Uint8Array(await sharp({create:{width:side,height:side,channels:4,background:{r:30,g:90,b:200,alpha:.6}}}).webp({quality:80}).toBuffer());
const P={diameterFraction:.5,assetInkFraction:.9},C={diameterFraction:.52,assetInkFraction:.95};
const form=({meta={},ink,color,inkType='image/png',colorType='image/webp'})=>{
 const f=new FormData();f.set('meta',JSON.stringify({texture_key:KEY,look:color?'color':'asset',placement:P,layered:false,color:color?{placement:C}:null,...meta}));
 if(ink)f.set('ink',new Blob([ink],{type:inkType}),'ink');if(color)f.set('color',new Blob([color],{type:colorType}),'color');return f;
};
// Sent as a finished body, as a browser sends it (Node's own streamed FormData cannot be cancelled midway).
const put=async(s,opts,user='a',id='disc')=>{const r=new Response(form(opts));return s.call('PUT','/api/bag/discs/'+id+'/stamp',{body:await r.blob(),user,headers:{'Content-Type':r.headers.get('Content-Type')}});};

test('a stamp is stored with the account and read back on any device of the owner, never another account',async()=>{
 const s=fixture();
 const ink=await png(),color=await webp();
 const saved=await put(s,{ink,color});assert.equal(saved.status,200,await saved.clone().text());
 const {stamp}=await saved.json();
 assert.deepEqual({...stamp,rev:'r'},{disc_id:'disc',texture_key:KEY,look:'color',rev:'r',layered:false,placement:P,color:{placement:C}});
 assert.match(stamp.rev,/^[a-z0-9]{1,16}$/);
 assert.equal(s.objects.size,2);assert.equal(s.count('SELECT COUNT(*) AS n FROM texture_cleanup'),0,'attached uploads leave the queue');
 // Another device of the same account: the list, then the bytes, byte for byte, with the right type.
 const list=await (await s.call('GET','/api/bag/stamps')).json();
 assert.deepEqual(list.stamps,[stamp]);assert.deepEqual(list.photos,[{id:'disc',texture_key:KEY}]);
 for(const [part,bytes,type] of [['ink',ink,'image/png'],['color',color,'image/webp']]){
  const r=await s.call('GET','/api/bag/discs/disc/stamp/'+part);assert.equal(r.status,200);
  assert.equal(r.headers.get('Content-Type'),type);assert.equal(r.headers.get('Cache-Control'),'private, no-store');
  assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes);
 }
 // A revision asked for must be the current one (?v=): never newer bytes under an older revision.
 assert.equal((await s.call('GET','/api/bag/discs/disc/stamp/ink?v='+stamp.rev)).status,200);
 const stale=await s.call('GET','/api/bag/discs/disc/stamp/color?v=old1');assert.equal(stale.status,409);assert.equal((await stale.json()).rev,stamp.rev);
 // Another account sees nothing of it, and cannot write it.
 assert.deepEqual((await (await s.call('GET','/api/bag/stamps',{user:'b'})).json()).stamps,[]);
 for(const part of ['ink','color'])assert.equal((await s.call('GET','/api/bag/discs/disc/stamp/'+part,{user:'b'})).status,404);
 assert.equal((await put(s,{ink},'b')).status,404);
 assert.equal((await s.call('PATCH','/api/bag/discs/disc/stamp',{body:'{"look":"photo"}',user:'b'})).status,404);
 assert.equal((await s.call('DELETE','/api/bag/discs/disc/stamp',{user:'b'})).status,404);
 assert.equal((await s.call('GET','/api/bag/stamps',{user:''})).status,401);
 assert.equal(s.count('SELECT COUNT(*) AS n FROM bag_photo_stamps'),1);
 s.db.close();
});

test('the look moves with the account, and Full color needs its asset',async()=>{
 const s=fixture();
 await put(s,{ink:await png()});
 const look=v=>s.call('PATCH','/api/bag/discs/disc/stamp',{body:JSON.stringify({look:v})});
 assert.equal((await look('color')).status,409,'no colour asset yet');
 assert.equal((await look('glitter')).status,400);
 const r=await look('photo');assert.equal(r.status,200);assert.equal((await r.json()).stamp.look,'photo');
 assert.equal((await look('asset')).status,200);
 // CSRF and origin hold as for every other bag write.
 assert.equal((await s.call('PATCH','/api/bag/discs/disc/stamp',{body:'{"look":"photo"}',headers:{'X-Atlas-CSRF':'nope'}})).status,403);
 assert.equal((await s.call('PATCH','/api/bag/discs/disc/stamp',{body:'{"look":"photo"}',headers:{Origin:'https://evil.example'}})).status,403);
 assert.equal(s.db.prepare('SELECT look FROM bag_photo_stamps').get().look,'asset');
 assert.throws(()=>s.db.prepare("UPDATE bag_photo_stamps SET look='color'").run(),/CHECK/,'the database refuses Full color without its asset too');
 s.db.close();
});

test('uploads are checked: real PNG or WebP, square, within budget, for the current photo',async()=>{
 const s=fixture();
 const ink=await png(),color=await webp(),text=Buffer.from(ink);
 // A PNG with a text chunk (metadata) before its image data.
 const tEXt=Buffer.concat([Buffer.alloc(4),Buffer.from('tEXtComment\0gps'),Buffer.alloc(4)]);tEXt.writeUInt32BE(15,0);
 const withText=Buffer.concat([text.subarray(0,33),tEXt,text.subarray(33)]);
 const wide=new Uint8Array(await sharp({create:{width:64,height:32,channels:4,background:'#fff'}}).png().toBuffer());
 const cases=[
  ['no ink',{color,meta:{look:'asset',color:{placement:C}}}],
  ['PNG labelled WebP',{ink,inkType:'image/webp'}],
  ['WebP labelled PNG',{ink:color}],
  ['a JPEG',{ink,inkType:'image/jpeg'}],
  ['metadata chunk',{ink:new Uint8Array(withText)}],
  ['not square',{ink:wide}],
  ['colour without placement',{ink,color,meta:{color:null}}],
  ['Full color without its asset',{ink,meta:{look:'color'}}],
  ['bad placement',{ink,meta:{placement:{diameterFraction:.9,assetInkFraction:.5}}}],
  ['a look that is not one',{ink,meta:{look:'gold'}}],
 ];
 for(const [name,opts] of cases)assert.equal((await put(s,opts)).status,400,name);
 assert.equal((await put(s,{ink,meta:{texture_key:OTHER}})).status,409,'assets read from a replaced photo');
 const huge=new Uint8Array(await sharp({create:{width:2048,height:2048,channels:4,noise:{type:'gaussian',mean:128,sigma:60}}}).png({compressionLevel:0}).toBuffer());
 assert.ok(huge.length>2*1024*1024);assert.equal((await put(s,{ink:huge})).status,400,'over the one-ink budget');
 const big=new Uint8Array(await sharp({create:{width:2056,height:2056,channels:4,background:'#fff'}}).png().toBuffer());
 assert.equal((await put(s,{ink:big})).status,400,'over the extractor’s 2048 px');
 assert.equal(s.objects.size,0);assert.equal(s.count('SELECT COUNT(*) AS n FROM texture_cleanup'),0);assert.equal(s.count('SELECT COUNT(*) AS n FROM bag_photo_stamps'),0);
 // An opaque (layered) one-ink asset is a PNG without alpha; a colour asset may be a PNG where WebP cannot be written.
 assert.equal((await put(s,{ink:await png(64,false),color:await png(48),colorType:'image/png',meta:{layered:true}})).status,200);
 assert.equal((await (await s.call('GET','/api/bag/discs/disc/stamp/color')).headers.get('Content-Type')),'image/png');
 s.db.close();
});

test('replacing assets, the photo, the disc or the account sends the old bytes to cleanup',async()=>{
 const s=fixture();
 await put(s,{ink:await png(),color:await webp()});const first=[...s.objects.keys()];
 // Made again: the new bytes replace the old ones, which leave the bucket.
 await put(s,{ink:await png(80)});
 assert.equal(s.objects.size,1);assert.ok(first.every(k=>!s.objects.has(k)));
 assert.equal(s.db.prepare('SELECT color_key FROM bag_photo_stamps').get().color_key,null,'no stale colour asset survives a one-ink remake');
 // The photo replaced: the stamp belonged to the old one.
 s.db.prepare('UPDATE bag_discs SET texture_key=? WHERE id=?').run(OTHER.replace(/1/g,'2'),'disc');
 assert.equal(s.count('SELECT COUNT(*) AS n FROM bag_photo_stamps'),0);
 await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});assert.equal(s.objects.size,0);
 // The photo removed through the photo route.
 s.db.prepare('UPDATE bag_discs SET texture_key=? WHERE id=?').run(KEY,'disc');
 await put(s,{ink:await png()});assert.equal(s.objects.size,1);
 assert.equal((await s.call('DELETE','/api/bag/discs/disc/photo')).status,200);
 assert.equal(s.count('SELECT COUNT(*) AS n FROM bag_photo_stamps'),0);assert.equal(s.objects.size,0);
 // The disc deleted, then the account deleted: the cascade reaches the stamp and its bytes are queued.
 s.db.prepare('UPDATE bag_discs SET texture_key=? WHERE id=?').run(KEY,'disc');
 await put(s,{ink:await png(),color:await webp()});assert.equal(s.objects.size,2);
 assert.equal((await s.call('DELETE','/api/bag/discs/disc')).status,200);assert.equal(s.objects.size,0);
 s.db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at,texture_key) VALUES (?,?,?,?,?,?,?,?)').run('disc','a','7446eb39abe5','ESP',10,180,'now',KEY);
 await put(s,{ink:await png()});
 s.db.prepare("DELETE FROM auth_users WHERE id='a'").run();
 assert.equal(s.count('SELECT COUNT(*) AS n FROM bag_photo_stamps'),0);
 // Two queued: the stamp's ink and the photo's texture key (the photo bytes this fixture never uploaded).
 assert.equal(s.count('SELECT COUNT(*) AS n FROM texture_cleanup'),2);
 await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});assert.equal(s.objects.size,0);assert.equal(s.count('SELECT COUNT(*) AS n FROM texture_cleanup'),0);
 s.db.close();
});

test('cleanup never takes a stamp asset still in use, and an upload that failed midway stays queued',async()=>{
 const s=fixture();
 await put(s,{ink:await png(),color:await webp()});
 s.db.prepare('INSERT INTO texture_cleanup(key,not_before) SELECT ink_key,0 FROM bag_photo_stamps').run();
 await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});assert.equal(s.objects.size,2,'a referenced asset is never deleted');
 // An upload whose D1 attach fails leaves its intent row for the cron.
 const batch=s.DB.batch;s.DB.batch=async()=>{throw Error('D1 unavailable');};
 assert.equal((await put(s,{ink:await png(72)})).status,503);s.DB.batch=batch;
 assert.equal(s.objects.size,3);assert.ok(s.count('SELECT COUNT(*) AS n FROM texture_cleanup WHERE not_before>0')>=1);
 s.db.prepare('UPDATE texture_cleanup SET not_before=0').run();
 await cleanupTextures({DB:s.DB,TEXTURES:s.TEXTURES});assert.equal(s.objects.size,2,'only the orphan goes');
 assert.equal((await s.call('DELETE','/api/bag/discs/disc/stamp')).status,200);assert.equal(s.objects.size,0);
 s.db.close();
});

test('migration 0013 leaves every existing disc and photo as it was',()=>{
 const db=new DatabaseSync(':memory:');
 for(const f of fs.readdirSync('migrations/accounts').sort().filter(f=>f<'0013'))db.exec(fs.readFileSync('migrations/accounts/'+f,'utf8'));
 db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('a','a','a@example.com','A',1,1);
 db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at,texture_key,photo_rim_color) VALUES (?,?,?,?,?,?,?,?,?)').run('d','a','m','p',10,175,'now',KEY,'#abcdef');
 const before=db.prepare('SELECT * FROM bag_discs').all();
 db.exec(fs.readFileSync('migrations/accounts/0013_photo_stamps.sql','utf8'));
 assert.deepEqual(db.prepare('SELECT * FROM bag_discs').all(),before);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM bag_photo_stamps').get().n,0);
 const row=(o={})=>db.prepare('INSERT INTO bag_photo_stamps(disc_id,texture_key,look,rev,ink_key,ink_diameter,ink_fraction,color_key,color_diameter,color_fraction,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(...Object.values({disc:'d',key:KEY,look:'asset',rev:'abc',ink:'stamp/x.png',d:.5,f:.9,ck:null,cd:null,cf:null,at:'now',...o}));
 for(const bad of [{look:'gold'},{rev:'ABC'},{ink:'x.png'},{ink:'stamp/x.gif'},{d:1.2},{d:.95,f:.9},{look:'color'},{ck:'stamp/c.webp'},{disc:'missing'}])assert.throws(()=>row(bad),undefined,JSON.stringify(bad));
 row({look:'color',ck:'stamp/c.webp',cd:.5,cf:.9});
 db.close();
});
