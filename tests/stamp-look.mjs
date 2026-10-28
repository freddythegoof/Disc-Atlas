// Per-disc stamp look (docs/stamp-look-extraction.md), no browser: the curated ids agree everywhere they are held, a
// copy's own ink and finish persist on the account, and a copy that never chose one wears exactly the Appearance setting.
// Run with `node --test tests/stamp-look.mjs`. The sheet and the renderers are tests/stamp-look-browser.mjs.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createPublicWorker} from '../workers/public.mjs';
import {STAMP_INKS,STAMP_FINISHES,stampChoiceOf,validateDiscDetails} from '../public/bag-values.js';
import {bagLayout} from '../public/bag3d/bag-layout.mjs';
import catalog from '../public/data.json' with {type:'json'};
import plastics from '../source-data/bag-plastics.json' with {type:'json'};
import vm from 'node:vm';

const MIGRATION='migrations/accounts/0016_stamp_look.sql';
// display-palette.js on a minimal page, as tests/display-palette.mjs runs it (importing that file would run its suite).
function loadPalette({stored=null}={}){
 const store=new Map(stored==null?[]:[['disc-atlas-display',stored]]);
 const window={dispatchEvent(){},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 const element=()=>({id:'',textContent:'',isConnected:false,remove(){}});
 const document={documentElement:{dataset:{theme:'light'}},createElement:element,head:{append(){}}};
 class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
 vm.runInNewContext(fs.readFileSync('public/display-palette.js','utf8'),{window,document,localStorage:window.localStorage,CustomEvent,JSON,Object});
 return {palette:window.DisplayPalette};
}
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
const item={mold_id:'7446eb39abe5',plastic:'ESP',wear:10,weight_g:180,notes:''};

test('the stamp ids are the Appearance sheet\'s, in the validator and in the migration alike', () => {
 const {palette}=loadPalette();
 assert.deepEqual(STAMP_INKS,Array.from(palette.catalog.inks,i=>i.id));
 assert.deepEqual(STAMP_FINISHES,Array.from(palette.catalog.finishes,f=>f.id));
 const sql=fs.readFileSync(MIGRATION,'utf8'),listed=column=>[...new RegExp(column+" IN \\(([^)]*)\\)").exec(sql)[1].matchAll(/'([a-z]+)'/g)].map(m=>m[1]);
 assert.deepEqual(listed('stamp_ink'),STAMP_INKS);assert.deepEqual(listed('stamp_finish'),STAMP_FINISHES);
});

test('a copy that never chose follows Appearance exactly; a choice wins part by part', () => {
 for(const ink of STAMP_INKS)for(const finish of STAMP_FINISHES){
  const {palette}=loadPalette({stored:JSON.stringify({stamp:{ink,finish}})});
  for(const untouched of [undefined,null,{},{ink:null,finish:null},{ink:'chrome',finish:'glitter'}])
   assert.deepEqual(palette.stampStyleFor(untouched),palette.stampStyle(),ink+'/'+finish);
  const gold=palette.stampStyleFor({ink:'gold',finish:null});
  assert.equal(gold.inkId,'gold');assert.equal(gold.finish.id,finish);
  const foil=palette.stampStyleFor({ink:null,finish:'foil'});
  assert.equal(foil.inkId,ink);assert.equal(foil.finish.id,'foil');
  // A copy may ask for today's stamp (Auto, Flat) under any setting: null, the renderers' old path.
  assert.equal(palette.stampStyleFor({ink:'auto',finish:'flat'}),null);
 }
});

test('the validator keeps null for Appearance and refuses anything off the sets', () => {
 const disc=catalog.discs.find(d=>d.id===item.mold_id),base={...item,color:'#aabbcc',in_bag:true,pocket:'main'};
 const saved=validateDiscDetails(base,disc,plastics);
 assert.equal(saved.stamp_ink,null);assert.equal(saved.stamp_finish,null);
 const chosen=validateDiscDetails({...base,stamp_ink:'gold',stamp_finish:'rainbow'},disc,plastics);
 assert.equal(chosen.stamp_ink,'gold');assert.equal(chosen.stamp_finish,'rainbow');
 for(const stamp_ink of ['Gold','chrome','',1,'#d6a83a'])assert.throws(()=>validateDiscDetails({...base,stamp_ink},disc,plastics),/stamp ink/,String(stamp_ink));
 for(const stamp_finish of ['Foil','holo','',2])assert.throws(()=>validateDiscDetails({...base,stamp_finish},disc,plastics),/stamp finish/,String(stamp_finish));
 assert.equal(stampChoiceOf({stamp_ink:null,stamp_finish:null}),null);assert.equal(stampChoiceOf(null),null);
 assert.deepEqual(stampChoiceOf({stamp_ink:'gold',stamp_finish:null}),{ink:'gold',finish:null});
});

test('a copy\'s stamp look persists on the account through edits, moves and fresh reads', async () => {
 const s=setup();try {
  await s.user('u1','x'.repeat(43));await s.user('u2','y'.repeat(43));
  const plain=(await (await s.call('/api/bag/discs','POST',item)).json()).disc;
  assert.equal(plain.stamp_ink,null);assert.equal(plain.stamp_finish,null);
  const response=await s.call('/api/bag/discs','POST',{...item,stamp_ink:'gold',stamp_finish:'foil'});
  assert.equal(response.status,201);
  const disc=(await response.json()).disc,path='/api/bag/discs/'+disc.id;
  assert.deepEqual([disc.stamp_ink,disc.stamp_finish],['gold','foil']);
  // A move, and an edit that does not mention it (an older client), keep it.
  assert.equal((await s.call(path,'PATCH',{in_bag:false})).status,200);
  assert.equal((await s.call(path,'PUT',{...item,mold_id:disc.mold_id,color:disc.color,notes:'Storage'})).status,200);
  for(const route of ['/api/bag','/api/bag/discs',path]){
   const data=await (await s.call(route)).json(),saved=data.disc||data.discs.find(d=>d.id===disc.id);
   assert.deepEqual([saved.stamp_ink,saved.stamp_finish,saved.in_bag],['gold','foil',false]);
  }
  for(const stamp_ink of ['Gold','chrome',''])assert.equal((await s.call(path,'PUT',{...item,mold_id:disc.mold_id,stamp_ink})).status,400);
  assert.equal((await s.call(path,'PUT',{...item,mold_id:disc.mold_id,stamp_finish:'holo'})).status,400);
  // Back to Appearance: null, for each part on its own.
  assert.equal((await s.call(path,'PUT',{...item,mold_id:disc.mold_id,stamp_ink:null})).status,200);
  assert.deepEqual(Object.values(s.db.prepare('SELECT stamp_ink,stamp_finish FROM bag_discs WHERE id=?').get(disc.id)),[null,'foil']);
  // Another player's request never reaches it.
  assert.equal((await s.call(path,'PUT',{...item,mold_id:disc.mold_id,stamp_ink:'red'},{cookie:'y'.repeat(43)})).status,404);
 }finally{s.close();}
});

test('the migration leaves every existing copy on Appearance and accepts only the curated ids', () => {
 const db=new DatabaseSync(':memory:');try {
  for(const file of fs.readdirSync('migrations/accounts').sort().filter(f=>f<'0016'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('u','g','a@example.com','A',1,1);
  for(const inBag of [0,1])db.prepare("INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,color,added_at,in_bag,finish) VALUES (?,?,?,?,?,?,?,?,?,?)").run('d'+inBag,'u','35a861477cf9','Z',10,174,'#0984a8','before',inBag,inBag?'clear':'opaque');
  const before=db.prepare('SELECT * FROM bag_discs ORDER BY id').all();
  db.exec(fs.readFileSync(MIGRATION,'utf8'));
  db.prepare('SELECT * FROM bag_discs ORDER BY id').all().forEach(({stamp_ink,stamp_finish,...disc},index)=>{assert.equal(stamp_ink,null);assert.equal(stamp_finish,null);assert.deepEqual(disc,{...before[index]});});
  for(const bad of ['Gold','chrome',''])assert.throws(()=>db.prepare('UPDATE bag_discs SET stamp_ink=?').run(bad));
  for(const bad of ['Foil','holo',''])assert.throws(()=>db.prepare('UPDATE bag_discs SET stamp_finish=?').run(bad));
  db.prepare("UPDATE bag_discs SET stamp_ink='pink',stamp_finish='shatter'").run();
 }finally{db.close();}
});

test('the 3D bag hands each placement its copy\'s choice, and nothing for one on Appearance', () => {
 const mold=catalog.discs.find(d=>d.id===item.mold_id);
 const slot=(id,extra)=>({item:{id,mold_id:mold.id,color:'#aabbcc',...extra},mold});
 const {placements}=bagLayout({main:[slot('a',{stamp_ink:'gold',stamp_finish:null}),slot('b',{})]});
 assert.deepEqual(placements.find(p=>p.id==='a').stamp,{ink:'gold',finish:null});
 assert.equal(placements.find(p=>p.id==='b').stamp,null);
});
