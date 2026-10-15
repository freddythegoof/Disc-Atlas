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

// Stamp levelling (docs/photo-stamp-orientation.md): rotate 0 is the old arithmetic exactly; a turn is
// clockwise as seen in the aligner and keeps the crop's circle.
test('photoPoint: rotate 0 is bit-identical to no rotation, and a turn is clockwise about the disc centre',()=>{
 const frames=[{width:1600,height:1200},{width:1600,height:1200,scale:.8,aspect:1.1,angle:35,perspective:.08,cx:.45,cy:.55},{width:1024,height:1024,scale:1,cx:.5-.5/1024,cy:.5-.5/1024}];
 for(const frame of frames)for(let i=0;i<500;i++){
  const x=Math.cos(i*2.4)*((i%37)/36),y=Math.sin(i*2.4)*((i%37)/36),a=photo.photoPoint(x,y,frame),b=photo.photoPoint(x,y,{...frame,rotate:0});
  assert.ok(Object.is(a.x,b.x)&&Object.is(a.y,b.y)&&a.inside===b.inside,'rotate 0 at '+x+','+y);
 }
 // Turned 90°, the output pixel below the centre shows what was right of it: the content turned clockwise.
 const flat={width:1000,height:1000,scale:1},right=photo.photoPoint(.5,0,flat),below=photo.photoPoint(0,.5,{...flat,rotate:90});
 assert.ok(Math.abs(below.x-right.x)<1e-9&&Math.abs(below.y-right.y)<1e-9);
 // A turn moves nothing in or out of the circle, and the centre stays put.
 for(const rotate of [-3,.1,47.5]){
  const p=photo.photoPoint(.6,-.7,{...flat,rotate});assert.equal(p.inside,true);
  const c=photo.photoPoint(0,0,{...flat,rotate});assert.ok(Math.abs(c.x-500)<1e-9&&Math.abs(c.y-500)<1e-9);
  assert.ok(Math.abs(Math.hypot(p.x-500,p.y-500)-500*Math.hypot(.6,.7))<1e-9,'radius kept');
 }
});
