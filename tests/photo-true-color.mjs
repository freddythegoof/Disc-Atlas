// The plastic's true colour (docs/clear-plastic-true-color.md), in Node: the sampler and its acceptance rule, the clear
// photo's plate-edge circle, retint and cut on a synthetic crop (and on the Raptor's own photo when it sits in the
// ignored work/ folder), migration 0015, and the photo route's storage of the colour (PUT header, PATCH, DELETE).
//   node --test tests/photo-true-color.mjs
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {trueColor,plateColor,rimColor} from '../public/disc-albedo.mjs';
import {clearPhotoPixels,plateEdge,planClearPhoto,EDGE} from '../public/disc-photo-clear.mjs';
import {createBag} from '../workers/bag.mjs';

const hex=rgb=>'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');
const bytes=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toLin=v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const lab=h=>{const [r,g,b]=bytes(h);const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;const R=toLin(r),G=toLin(g),B=toLin(b);const fx=f((.4124*R+.3576*G+.1805*B)/.95047),fy=f(.2126*R+.7152*G+.0722*B),fz=f((.0193*R+.1192*G+.9505*B)/1.08883);return [116*fy-16,500*(fx-fy),200*(fy-fz)];};
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);};

// A clear disc photographed over white: the plate's pale teal inside a circle off the crop's centre, the rim's deep
// blue to the crop's edge, a red foil word, a navy ring, a white ink patch, glare on the rim, transparent outside.
const PLATE='#0984a8',RIM='#004388',RED='#c0182a',NAVY='#1c2a4a',WHITE='#f4f4f0',GLARE='#8fa8d0';
function synthetic(size=1024,{rim=RIM,cx=.03,cy=.015,rho=.8}={}){
 const d=new Uint8ClampedArray(size*size*4);
 const put=(k,h)=>{const [r,g,b]=bytes(h);d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=255;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1,r=Math.hypot(u,v),k=(y*size+x)*4;
  if(r>1)continue;
  const inPlate=Math.hypot(u-cx,v-cy)<rho;
  if(!inPlate){put(k,rim);if(u>.55&&v<-.55)put(k,GLARE);continue;}
  put(k,PLATE);
  const ring=Math.hypot(u,v);if(ring>.64&&ring<.68)put(k,NAVY);
  if(Math.abs(v+.1)<.07&&Math.abs(u)<.35)put(k,RED);
  if(Math.hypot(u-.3,v-.3)<.08)put(k,WHITE);
 }
 return d;
}
const at=(d,size,u,v)=>{const x=Math.floor((u+1)/2*size),y=Math.floor((v+1)/2*size),k=(y*size+x)*4;return {hex:hex([d[k],d[k+1],d[k+2]]),alpha:d[k+3]};};

test('the true colour is the rim band when it is the plastic seen thicker, and nothing when it is not',()=>{
 const d=synthetic();
 assert.equal(plateColor(d,1024),PLATE);
 const t=trueColor(d,1024,PLATE);
 assert.ok(t&&dE(t,RIM)<2,`the rim band, not its glare: ${t}`);
 // Lighter than the plate (a photo on a dark table, the rim catching the light): nothing.
 assert.equal(trueColor(synthetic(1024,{rim:'#8ad0e8'}),1024,PLATE),null);
 // Another colour entirely (a two-colour disc): nothing.
 assert.equal(trueColor(synthetic(1024,{rim:'#8a2020'}),1024,PLATE),null);
 // A rim that has lost the plate's colour (grey): nothing.
 assert.equal(trueColor(synthetic(1024,{rim:'#404448'}),1024,PLATE),null);
 assert.equal(trueColor(d,1024,null),null);
});

test('a clear photo ends at its own plate edge, a circle fitted through the glare, and its plastic takes the tint',()=>{
 const size=1024,d=synthetic(size);
 const circle=plateEdge(d,size,PLATE);
 assert.ok(circle,'the edge is found');
 assert.ok(Math.abs(circle.cx-.03)<.01&&Math.abs(circle.cy-.015)<.01&&Math.abs(circle.rho-.8)<.01,JSON.stringify(circle));
 assert.ok(circle.kept>=EDGE.angles*.9,`most angles fit the circle (${circle.kept})`);
 const before=Uint8ClampedArray.from(d),result=clearPhotoPixels(d,size,{tint:RIM,a:1});
 assert.equal(result.plate,PLATE);
 // The plate takes the tint (a = 1: exactly), the print does not.
 assert.ok(dE(at(d,size,0,.3).hex,RIM)<2,'plate retinted: '+at(d,size,0,.3).hex);
 assert.equal(at(d,size,0,-.1).hex,RED);assert.equal(at(d,size,.66,0).hex,NAVY);assert.equal(at(d,size,.3,.3).hex,WHITE);
 // Outside the plate edge the photo is gone; inside it is whole; the feather lies between.
 assert.equal(at(d,size,.9,0).alpha,0);assert.equal(at(d,size,-.9,0).alpha,0);
 assert.equal(at(d,size,.7,0).alpha,255);assert.equal(at(d,size,0,0).alpha,255);
 assert.ok(at(d,size,.8+.03-.005,0).alpha>0&&at(d,size,.8+.03-.005,0).alpha<255,'feathered at the edge');
 // Transparent pixels stay untouched, and the glare on the rim is cut with the rim.
 assert.equal(at(d,size,.995,.1).alpha,0);
 // With no tint, only the cut: every colour byte inside the plate is as it was.
 const cutOnly=synthetic(size);clearPhotoPixels(cutOnly,size,{});
 for(let i=0;i<cutOnly.length;i+=4)if(Math.hypot((i/4%size+.5)/size*2-1,(Math.floor(i/4/size)+.5)/size*2-1)<.75)for(let c=0;c<3;c++)assert.equal(cutOnly[i+c],before[i+c]);
 // A plate exponent under 1 lands the plate between its colour and the tint.
 const soft=synthetic(size);clearPhotoPixels(soft,size,{tint:RIM,a:.7});
 const l=lab(at(soft,size,0,.3).hex);assert.ok(l[0]>lab(RIM)[0]&&l[0]<lab(PLATE)[0],'a = 0.7 sits between');
 // A crop that is not a disc on a surface (no plate edge found) gets no cut and no retint of what it has not.
 const flat=new Uint8ClampedArray(size*size*4).fill(255);assert.equal(planClearPhoto(flat,size,{}).circle,null);
});

const RAPTOR='work/clear-plastic-true-color/input/raptor-0cef6b2f.webp';
test('the Raptor\'s own photo: the rim band is #004386 and the plate edge is a circle at 0.81 R, 3% off centre',{skip:!fs.existsSync(RAPTOR)&&'the Raptor photo is not in work/'},async()=>{
 const sharp=createRequire(import.meta.url)('sharp');
 const {data,info}=await sharp(RAPTOR).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const d=new Uint8ClampedArray(data.buffer,data.byteOffset,data.length),size=info.width;
 const plate=plateColor(d,size);assert.equal(plate,'#0984a8');
 assert.equal(trueColor(d,size,plate),'#004386');
 for(const inner of [.84,.92])assert.ok(dE(rimColor(d,size,inner),'#004386')<6,'not sensitive to where the band starts: '+rimColor(d,size,inner));
 const circle=plateEdge(d,size,plate);
 assert.ok(Math.abs(circle.rho-.808)<.012&&Math.hypot(circle.cx,circle.cy)>.02&&Math.hypot(circle.cx,circle.cy)<.045,JSON.stringify(circle));
});

test('migration 0015 leaves every copy without a true colour and accepts only a six-digit hex',()=>{
 const db=new DatabaseSync(':memory:');try{
  const files=fs.readdirSync('migrations/accounts').sort();
  for(const file of files.filter(f=>f<'0015'))db.exec(fs.readFileSync('migrations/accounts/'+file,'utf8'));
  db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run('u','g','a@example.com','A',1,1);
  for(const finish of ['opaque','clear'])db.prepare("INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,color,added_at,finish,texture_key) VALUES (?,?,?,?,?,?,?,?,?,?)").run('d-'+finish,'u','35a861477cf9','Z',10,174,'#0984a8','before',finish,(finish==='clear'?'0cef6b2f':'1cef6b2f')+'-a6ab-4f1d-beb5-3961903f8804.webp');
  const before=db.prepare('SELECT * FROM bag_discs ORDER BY id').all();
  db.exec(fs.readFileSync('migrations/accounts/0015_photo_true_color.sql','utf8'));
  const after=db.prepare('SELECT * FROM bag_discs ORDER BY id').all();
  after.forEach(({photo_true_color,...disc},index)=>{assert.equal(photo_true_color,null);assert.deepEqual(disc,{...before[index]});});
  for(const bad of ['004386','#00438','#00438g','blue',''])assert.throws(()=>db.prepare('UPDATE bag_discs SET photo_true_color=?').run(bad),bad);
  db.prepare("UPDATE bag_discs SET photo_true_color='#004386'").run();
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM bag_discs WHERE photo_true_color='#004386'").get().n,2);
 }finally{db.close();}
});

// The photo route on real SQLite, as tests/photo-textures.mjs drives it.
function fixture(){
 const db=new DatabaseSync(':memory:');
 for(const f of fs.readdirSync('migrations/accounts').sort())db.exec(fs.readFileSync('migrations/accounts/'+f,'utf8'));
 for(const u of ['a','b'])db.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').run(u,u,u+'@example.com',u,1,1);
 db.prepare('INSERT INTO bag_discs(id,user_id,mold_id,plastic,wear,weight_g,added_at,finish) VALUES (?,?,?,?,?,?,?,?)').run('disc','a','35a861477cf9','Z',10,174,'now','clear');
 const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:db.prepare(sql).run(...args).changes}};}};},async batch(statements){db.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}};
 const objects=new Map();
 const TEXTURES={async put(k,v){objects.set(k,new Uint8Array(v));},async get(k){return objects.has(k)?{body:objects.get(k)}:null;},async delete(k){objects.delete(k);}};
 const bag=createBag({session:async r=>r.headers.get('User')?{id:r.headers.get('User'),csrf_token:'token'}:null});
 const call=(method='GET',body,user='a',path='/api/bag/discs/disc/photo',headers={})=>bag.fetch(new Request('https://atlas.example'+path,{method,headers:{User:user,Origin:'https://atlas.example','X-Atlas-CSRF':'token','Content-Type':method==='PATCH'?'application/json':'image/webp',...headers},body}),{DB,TEXTURES});
 return {db,call};
}
const webp=()=>{const b=new Uint8Array(32);b.set(Buffer.from('RIFF'));new DataView(b.buffer).setUint32(4,24,true);b.set(Buffer.from('WEBPVP8L'),8);new DataView(b.buffer).setUint32(16,12,true);b[20]=0x2f;new DataView(b.buffer).setUint32(21,1023|(1023<<14),true);return b;};

test('the true colour is stored with the photo, set by the game asset for the photo it read, read by the bag, and cleared with the photo',async()=>{
 const s=fixture();try{
  const disc=async()=>(await (await s.call('GET',undefined,'a','/api/bag/discs/disc')).json()).disc;
  // Use photo: the header, lower-cased; an empty header is nothing; a bad one is refused.
  assert.equal((await s.call('PUT',webp(),'a',undefined,{'X-Atlas-Photo-True-Color':'#004386'})).status,200);
  let d=await disc();assert.equal(d.photo_true_color,'#004386');assert.equal(d.color??null,d.color??null);
  assert.equal((await s.call('PUT',webp(),'a',undefined,{'X-Atlas-Photo-True-Color':'#00438G'})).status,400);
  assert.equal((await s.call('PUT',webp(),'a',undefined,{'X-Atlas-Photo-True-Color':''})).status,200);
  d=await disc();assert.equal(d.photo_true_color,null,'a replaced photo without a sample has none');
  // The game asset, from the stored photo: it names the photo it read.
  const patch=(body,user='a')=>s.call('PATCH',JSON.stringify(body),user);
  assert.equal((await patch({photo_true_color:'#004386',texture_key:d.texture_key})).status,200);
  assert.equal((await disc()).photo_true_color,'#004386');
  assert.equal((await patch({photo_true_color:'#004386',texture_key:'another.webp'})).status,409,'a photo replaced meanwhile');
  assert.equal((await patch({photo_true_color:'blue',texture_key:d.texture_key})).status,400);
  assert.equal((await patch({photo_true_color:'#004386'})).status,400,'the photo read is named');
  assert.equal((await patch({photo_true_color:'#004386',texture_key:d.texture_key},'b')).status,404,'another player');
  assert.equal((await patch({photo_true_color:null,texture_key:d.texture_key})).status,200);
  assert.equal((await disc()).photo_true_color,null,'the make can clear it when the band is no true colour');
  // The bag list carries it; a finish change does not touch it; removing the photo clears it.
  assert.equal((await patch({photo_true_color:'#004386',texture_key:d.texture_key})).status,200);
  assert.equal((await (await s.call('GET',undefined,'a','/api/bag')).json()).discs[0].photo_true_color,'#004386');
  const edit=finish=>s.call('PUT',JSON.stringify({mold_id:'35a861477cf9',plastic:'Z',wear:10,weight_g:174,color:'#0984a8',finish}),'a','/api/bag/discs/disc',{'Content-Type':'application/json'});
  assert.equal((await edit('opaque')).status,200);assert.equal((await disc()).photo_true_color,'#004386');
  assert.equal((await edit('clear')).status,200);assert.equal((await disc()).photo_true_color,'#004386');
  assert.equal((await s.call('DELETE')).status,200);
  d=await disc();assert.equal(d.photo_true_color,null);assert.equal(d.texture_key,null);
 }finally{s.db.close();}
});
