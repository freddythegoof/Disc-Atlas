import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read=file=>fs.readFileSync(`public/brand/${file}`,'utf8');
test('the master preserves the supplied tilted disc badge',()=>{
 const svg=read('master.svg');
 assert.match(svg,/viewBox="0 0 1024 1024"/);
 assert.match(svg,/<rect[^>]*rx="224"[^>]*fill="#0c0e11"/);
 assert.match(svg,/translate\(512[ ,]512\) rotate\(-22\)/);
 assert.match(svg,/<ellipse[^>]*rx="340"[^>]*ry="196"[^>]*stroke-width="44"/);
 assert.match(svg,/<ellipse[^>]*cx="130"[^>]*cy="50"[^>]*rx="58"[^>]*ry="38"[^>]*fill="#b8ff00"/);
});
test('every variation and theme preserves the tilted four-node identity',()=>{
 for(const folder of ['', 'light/','midnight/','charcoal/','black/','dark/']){
  for(const id of ['primary','secondary','mark','submark']){
   const svg=read(`${folder}${id}.svg`);
   assert.match(svg,/rotate\(-22\)/,`${folder}${id} preserves the tilt`);
   assert.equal((svg.match(/data-brand-node=/g)||[]).length,4,`${folder}${id} has exactly four waypoints`);
   assert.equal((svg.match(/data-brand-axis=/g)||[]).length,['primary','secondary'].includes(id)?2:0,`${folder}${id} has the correct detail level`);
   assert.doesNotMatch(svg,/<(?:image|filter|script|text)\b/,`${folder}${id} is self-contained vector artwork with outlined type`);
  }
 }
});
test('headers and fallback icons use the revised silhouette',()=>{
 const sprite=read('symbols.svg'),mark=sprite.match(/<symbol id="mark"[\s\S]*?<\/symbol>/)?.[0];
 assert.ok(mark);
 assert.match(mark,/rotate\(-22\)/);
 assert.equal((mark.match(/data-brand-node=/g)||[]).length,4);
 for(const file of ['public/icon.svg','public/favicon.svg']){
  const svg=fs.readFileSync(file,'utf8');
  assert.match(svg,/viewBox="0 0 16 16"/);
  assert.match(svg,/rotate\(-22\)/);
  assert.equal((svg.match(/data-brand-node=/g)||[]).length,4);
  assert.match(svg,/<rect[^>]*rx="3.5"[^>]*fill="#0c0e11"/);
 }
});
