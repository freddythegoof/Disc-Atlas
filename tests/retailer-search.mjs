// Retailer search queries drop a trailing generation year. Display names and id-keyed product links stay.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={URL,URLSearchParams};
runtime.window=runtime;
vm.createContext(runtime);
vm.runInContext(fs.readFileSync('public/shopping.js','utf8'),runtime);
const {searchName,offers}=runtime.AtlasShopping;

const query=(disc,store='marshall')=>new URL(offers(disc).find(s=>s.id===store).url).searchParams.get(store==='marshall'?'s':'q');

test('a trailing 19xx or 20xx year is not part of the retailer query',()=>{
 assert.equal(searchName('M5 (2014)'),'M5');
 assert.equal(searchName('Lynx (1990)'),'Lynx');
 assert.equal(searchName('DD2 (2025)'),'DD2');
 assert.equal(searchName('Mystery Box (2023)'),'Mystery Box');
 assert.equal(searchName('Destroyer'),'Destroyer');
});

test('other parentheses stay, including a year that is not its own trailing marker',()=>{
 for(const name of [
  "Captain's Raptor (modified overstable Raptor)",
  'Pizza (renamed from Mystery Box (2025))',
  'Eagle (old)',
  'Hammer (Chui, 战锤)',
  'Kea (MR2) (retooled)',
  'Slipstream-GT (Ace Race 2005)',
  'Foo (1899)',
  'Foo (2100)',
  'Foo (bar (2014)',
  '(2014)',
 ]) assert.equal(searchName(name),name,name);
});

test('Marshall Street searches the base mold, and an id-keyed Infinite link is unchanged',()=>{
 const original={id:'e905af456041',brand:'Prodigy',name:'M5',catalogName:'M5 (2014)'};
 runtime.AtlasRetailerProducts={'e905af456041':{infinite:'https://infinitediscs.com/prodigy-m5'}};
 const links=offers(original);
 const infinite=links.find(s=>s.id==='infinite');
 assert.equal(infinite.matched,true);
 assert.equal(infinite.url,'https://infinitediscs.com/prodigy-m5');
 assert.equal(query(original),'Prodigy M5');
 assert.equal(query({id:'plain',brand:'Innova',name:'Lynx'}),'Innova Lynx');
 assert.equal(query({id:'kept',brand:'Discraft',name:"Captain's Raptor (modified overstable Raptor)"}),"Discraft Captain's Raptor (modified overstable Raptor)");
 delete runtime.AtlasRetailerProducts;
});
