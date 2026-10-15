import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as photo from '../public/disc-photo.mjs';

test('photo bytes determine format despite missing or misleading MIME labels',()=>{
 for(const [name,want] of [['disc-photo.heic','image/heic'],['disc-photo.jpg','image/jpeg'],['disc-photo.png','image/png'],['stamped-disc.webp','image/webp']]){
  const bytes=readFileSync(new URL('./fixtures/'+name,import.meta.url));
  assert.equal(photo.sniffPhotoFormat?.(bytes),want,name);
 }
});

test('HEIF sniffing reads major and compatible brands, never the version field',()=>{
 const ftyp=(major,compatible=[],version='\0\0\0\0')=>{
  const b=Buffer.from('0000ftyp'+major+version+compatible.join(''));b.writeUInt32BE(b.length);return b;
 };
 for(const brand of ['heic','heix','hevc','hevx','heim','heis','hevm','hevs','mif1','msf1']){
  assert.equal(photo.sniffPhotoFormat?.(ftyp(brand)),'image/heic',brand);
  assert.equal(photo.sniffPhotoFormat?.(ftyp('xxxx',[brand])),'image/heic','compatible '+brand);
 }
 for(const b of [ftyp('avif',['mif1']),ftyp('avis',['msf1']),ftyp('xxxx',[],'heic'),ftyp('xxxx'),Buffer.from('<svg/>'),Buffer.from('RIFF0000WAVE'),Buffer.from([137,80,78,71]),Buffer.alloc(0),ftyp('heic').subarray(0,15)])assert.equal(photo.sniffPhotoFormat?.(b),null);
 const badSize=ftyp('heic');badSize.writeUInt32BE(9000);assert.equal(photo.sniffPhotoFormat?.(badSize),null);
 const basic=ftyp('heic'),extended=Buffer.concat([Buffer.from([0,0,0,1]),basic.subarray(4,8),Buffer.alloc(8),basic.subarray(8)]);
 extended.writeBigUInt64BE(BigInt(extended.length),8);assert.equal(photo.sniffPhotoFormat(extended),'image/heic');
 const leading=Buffer.from([0,0,0,8,102,114,101,101]);
 assert.equal(photo.sniffPhotoFormat(Buffer.concat([leading,basic])),'image/heic');
 assert.equal(photo.sniffPhotoFormat(extended.subarray(0,12)),null,'truncated extended header');
});

test('decode accepts empty MIME types and keeps the 30 MB and 60 MP limits',async t=>{
 const jpeg=readFileSync(new URL('./fixtures/disc-photo.jpg',import.meta.url));
 let closed=0,calls=0;
 globalThis.createImageBitmap=()=>{};t.after(()=>{delete globalThis.createImageBitmap;});
 t.mock.method(globalThis,'createImageBitmap',async()=>{calls++;return {width:10000,height:6000,close(){closed++;}};});
 const file=new File([jpeg],'photo.heic',{type:''});
 const image=await photo.decodePhoto(file);assert.equal(image.width*image.height,60e6);image.close();
 assert.equal(calls,1);assert.equal(closed,1);
 await assert.rejects(photo.decodePhoto(new Blob([new Uint8Array(30*1024*1024+1)],{type:'image/jpeg'})),/30 MB/);
 assert.equal(calls,1,'oversized source never reaches a decoder');
 t.mock.method(globalThis,'createImageBitmap',async()=>({width:10001,height:6000,close(){closed++;}}));
 await assert.rejects(photo.decodePhoto(file),/60 megapixels/);assert.equal(closed,2,'oversized bitmap released');
 await assert.rejects(photo.decodePhoto(new File(['<svg/>'],'photo.jpg',{type:'image/jpeg'})),/JPG.*HEIC/);
});
test('photo crop keeps a centered circular mask and corrects modest foreshortening',async()=>{
 const m=await import('../public/disc-photo.mjs');
 assert.equal(typeof m.photoPoint,'function');
 assert.deepEqual(m.photoPoint(0,0,{width:1200,height:1000}),{x:600,y:500,inside:true});
 assert.equal(m.photoPoint(1,1,{width:1200,height:1000}).inside,false);
 assert.deepEqual(m.photoPoint(0,1,{width:1200,height:1000,aspect:.8,scale:1}),{x:600,y:900,inside:true});
 assert.deepEqual(m.photoPoint(-1,0,{width:1200,height:1000,scale:1}),{x:100,y:500,inside:true});
 const horizontal=m.photoPoint(1,0,{width:1000,height:1000,scale:1,aspect:.8,angle:90});
 assert.ok(Math.abs(horizontal.x-900)<1e-8);assert.ok(Math.abs(horizontal.y-500)<1e-8);
});
