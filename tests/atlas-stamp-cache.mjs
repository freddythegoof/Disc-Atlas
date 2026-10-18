import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';

// Execute the production cache logic with controlled image-completion boundaries.
// Texture decoding is the async double; cache decisions and disposal are production code.
function cache(){
 const source=fs.readFileSync(new URL('../public/disc3d/atlas-art.mjs',import.meta.url),'utf8');
 const start=source.indexOf(' const STAMPS_LIVE='),end=source.indexOf(' // Decoded photos',start);
 assert.ok(start>=0&&end>start);
 const textures=[],stamps=new Map(),decoded=new Set();
 const context={stamps,stats:{},Event:class{},window:{dispatchEvent(){}},
  stampTexture(_name,_color,{asset,onChange}){
   const texture={userData:{},disposed:false,dispose(){this.disposed=true;},finish(){this.userData.stampAsset=asset;decoded.add(asset);onChange(this);}};
   textures.push(texture);if(decoded.has(asset))texture.finish();return texture;
  },catalogStampAsset:d=>d.stampAsset};
 vm.createContext(context);vm.runInContext(source.slice(start,end)+'\nglobalThis.stampOf=stampOf;',context);
 const add=(asset,color='#dcac60')=>context.stampOf({name:'Disc',stampAsset:asset},color,asset);
 return {add,stamps,textures,decoded};
}

test('completed async stamp bursts return to eight retained textures',()=>{
 const c=cache();
 for(let i=0;i<33;i++)c.add('stamps/discraft/test-'+i+'.png');
 assert.equal(c.stamps.size,33,'pending loads are allowed to finish');
 for(const texture of c.textures)texture.finish();
 assert.equal(c.stamps.size,8,'completed loads cannot remain above the retention cap');
 assert.equal(c.textures.filter(t=>!t.disposed).length,8);
});

test('a decoded mask stays owned while older textures are all pending',()=>{
 const c=cache();
 for(let i=0;i<8;i++)c.add('stamps/discraft/pending-'+i+'.png');
 c.decoded.add('stamps/discraft/decoded.png');
 const current=c.add('stamps/discraft/decoded.png');
 assert.equal(current.disposed,false,'the texture returned for this render must stay live');
 assert.equal(c.stamps.get('stamps/discraft/decoded.png|#dcac60'),current);
 assert.equal(c.stamps.size,9,'eight in-flight loads plus the protected ready texture');
});
