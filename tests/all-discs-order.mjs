import assert from 'node:assert/strict';
import {test} from 'node:test';
import {albumItems} from '../public/all-discs-gallery.js';

// Catches lost entries leaking in, copies collapsed by mold, and unstable speed/name ties.
test('owned copies are unique by ID and read by class, descending speed, then name',()=>{
 const molds={d:{category:'Distance Driver',speed:12,name:'Zeus'},a:{category:'Distance Driver',speed:12,name:'Alpha'},f:{category:'Fairway Driver',speed:7,name:'TeeBird'},m:{category:'Midrange',speed:5,name:'Buzzz'},p:{category:'Putter',speed:2,name:'Aviar'}};
 const bag={id:'bag',mold_id:'d',in_bag:true,added_at:'2026-01-01'},stored={id:'spare',mold_id:'d',in_bag:false,added_at:'2026-02-01'};
 const input=[{id:'p',mold_id:'p'},stored,{id:'lost',mold_id:'a',status:'lost',in_bag:true},{id:'m',mold_id:'m'},bag,{...bag},{id:'a',mold_id:'a'},{id:'f',mold_id:'f'},{id:'unknown',mold_id:'missing'}];
 const lookup=id=>molds[id];
 assert.deepEqual(albumItems(input,lookup).map(i=>i.id),['a','bag','spare','f','m','p','unknown']);
 assert.deepEqual(albumItems(input,lookup,'distance').map(i=>i.id),['a','bag','spare']);
 assert.deepEqual(albumItems(input,lookup,'putter').map(i=>i.id),['p']);
 assert.deepEqual(albumItems([],lookup),[]);
 assert.equal(input[0].id,'p','Sorting does not mutate the saved collection');
});
