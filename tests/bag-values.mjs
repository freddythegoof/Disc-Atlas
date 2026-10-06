import assert from 'node:assert/strict';
import {test} from 'node:test';
import plastics from '../source-data/bag-plastics.json' with {type:'json'};
import {defaultDiscDetails,plasticOptions,wearLabel,bagClass,plasticColor,bagPalette,bagSlots,validateDiscDetails,POCKETS} from '../public/bag-values.js';

test('mold plastic reference wins over brand fallback and remains selectable', () => {
 const details = defaultDiscDetails({id:'ff4bf9e7743c',brand:'Discraft',specs:{'Max weight':'174.3'}},plastics);
 assert.equal(details.plastic,'Putter Line Hard'); assert.equal(details.weight_g,174);
 assert.ok(plasticOptions({id:'ff4bf9e7743c',brand:'Discraft'},plastics).options.includes('Putter Line Hard'));
 assert.equal(defaultDiscDetails({id:'x',brand:'Innova',referencePlastic:'Champion',typicalMaxWeight:175},plastics).plastic,'Champion');
 assert.equal(defaultDiscDetails({id:'x',brand:'Unknown'},plastics).plastic,'');
 assert.equal(defaultDiscDetails({id:'x',brand:'Axiom',specs:{'Max weight':'200'}},plastics).weight_g,180);
 assert.equal(defaultDiscDetails({id:'x',brand:'Innova',specs:{'Max weight':'broken'}},plastics).weight_g,175);
});

test('plastic color defaults, fabric palette and physical slot order', () => {
 for(const brand of Object.values(plastics.brands))for(const plastic of brand.options)assert.match(brand.colors[plastic],/^#[0-9a-f]{6}$/);
 assert.ok(plastics.brands.Kastaplast.options.includes('K1'));assert.ok(plastics.brands['Westside Discs'].options.includes('VIP'));
 assert.equal(defaultDiscDetails({id:'x',brand:'Innova'},plastics).color,plasticColor('Innova','Star',plastics));
 assert.deepEqual(bagPalette('#446688'),{primary:'#446688',secondary:'#334d66',accent:'#879db3'});
 const molds={fast:{speed:12,category:'Distance Driver'},slow:{speed:5,category:'Midrange'},putt:{speed:3,category:'Putter'}};
 const rows=[{id:'a',mold_id:'slow',pocket:'main',in_bag:true},{id:'b',mold_id:'fast',pocket:'main',in_bag:true},{id:'c',mold_id:'putt',pocket:'putter',in_bag:true},{id:'d',mold_id:'fast',pocket:'main',in_bag:false}];
 const slots=bagSlots(rows,{main_capacity:3,putter_capacity:2},id=>molds[id]);
 assert.deepEqual(slots.main.map(s=>s.item?.id||null),['b','a',null]);assert.deepEqual(slots.putter.map(s=>s.item?.id||null),['c',null]);
 assert.equal(slots.overflow.length,0);
 const crowded=bagSlots(rows,{main_capacity:1,putter_capacity:0},id=>molds[id]);assert.equal(crowded.overflow.length,2);
});

test('edits require a stored pocket instead of reassigning one from mold type', () => {
 const disc={id:'p',brand:'Innova',speed:2,category:'Putter'};
 const {pocket,...details}=defaultDiscDetails(disc,plastics);
 assert.equal(pocket,'putter');
 assert.throws(()=>validateDiscDetails(details,disc,plastics),/pocket|compartment|Go-to/i);
});

test('pocket overflow stays out of other pockets and missing metadata is never inferred', () => {
 const lookup=()=>({speed:2,category:'Putter'});
 const slots=bagSlots([{id:'full',pocket:'putter'},{id:'missing'}],{main_capacity:2,putter_capacity:0},lookup);
 assert.deepEqual(slots.main.map(s=>s.item),[null,null]);
 assert.deepEqual(slots.overflow.map(i=>i.id),['full','missing']);
});

test('go-to has its own slot, retains its pocket, excludes storage and never borrows putter slots', () => {
 const rows=[{id:'main',pocket:'main'},{id:'putter',pocket:'putter'},{id:'first',pocket:'goto'},{id:'stored',pocket:'goto',in_bag:false}];
 const slots=bagSlots(rows,{main_capacity:2,putter_capacity:2},()=>({speed:2}));
 assert.deepEqual(slots.goto.map(s=>s.item.id),['first']);
 assert.deepEqual(slots.putter.map(s=>s.item?.id ?? null),['putter',null]);
 assert.equal(slots.main[0].item.id,'main');assert.equal(slots.overflow.length,0);
 const noTop=bagSlots(rows,{main_capacity:2,putter_capacity:0},()=>({speed:2}));
 assert.equal(noTop.goto[0].item.id,'first');assert.deepEqual(noTop.overflow.map(i=>i.id),['putter']);
 // A full putter pocket keeps all of its putters when a go-to is assigned.
 const full=[1,2,3,4].map(n=>({id:'p'+n,pocket:'putter'})).concat({id:'go',pocket:'goto'});
 const crowded=bagSlots(full,{main_capacity:1,putter_capacity:4},()=>({speed:2}));
 assert.equal(crowded.putter.filter(s=>s.item).length,4);assert.equal(crowded.goto[0].item.id,'go');assert.equal(crowded.overflow.length,0);
});

test('an empty go-to slot is always available to render', () => {
 const slots=bagSlots([{id:'m',pocket:'main'}],{main_capacity:1,putter_capacity:0},()=>({speed:9}));
 assert.deepEqual(slots.goto,[{item:null,index:0}]);
});

test('any disc type renders wherever its stored pocket says, including go-to', () => {
 const molds={p:{speed:2,category:'Putter'},m:{speed:5,category:'Midrange'},d:{speed:12,category:'Distance Driver'}};
 for(const mold of Object.keys(molds))for(const pocket of ['main','putter','goto']){
  const slots=bagSlots([{id:'x',mold_id:mold,pocket}],{main_capacity:2,putter_capacity:2},id=>molds[id]);
  const where=['main','putter','goto'].filter(area=>slots[area].some(s=>s.item?.id==='x'));
  assert.deepEqual(where,[pocket],`${mold} in ${pocket}`);
 }
});

test('pockets are main, putter and go-to', () => {
 assert.deepEqual(POCKETS.map(([value])=>value),['main','putter','goto']);
});
test('wear labels explain new, midpoint and severely beat discs without changing flight data', () => {
 for (const [wear,label] of [[10,'Factory new'],[9,'Like new'],[5,'Seasoned'],[3,'Well-worn'],[1,'Beat · different stability class'],[2,'Beat · different stability class']]) assert.equal(wearLabel(wear),label);
});
test('bag class follows the disc class before speed; unknown ratings remain honest', () => {
 for (const [disc,want] of [[{category:'Control Driver',speed:10},'fairway'],[{category:'Distance Driver',speed:9},'distance'],[{category:'Midrange',speed:6},'mid'],[{category:'Putter',speed:4},'putter'],[{speed:3},'putter'],[{speed:5},'mid'],[{speed:8},'fairway'],[{speed:12},'distance'],[{},'unknown']]) assert.equal(bagClass(disc),want);
});

test('speed sorts stability ties; stability and custom order drive physical slots', () => {
 const molds={a:{speed:9,turn:-2,fade:1},b:{speed:9,turn:0,fade:3},c:{speed:5,turn:0,fade:4}};
 const rows=['a','b','c'].map((id,index)=>({id,mold_id:id,pocket:'main',sort_order:2-index}));
 const order=sort_mode=>bagSlots(rows,{main_capacity:3,putter_capacity:0,sort_mode},id=>molds[id]).main.map(s=>s.item.id);
 assert.deepEqual(order('speed'),['b','a','c']);
 assert.deepEqual(order('stability'),['c','b','a']);
 assert.deepEqual(order('custom'),['c','b','a']);
 assert.deepEqual(rows.map(i=>i.id),['a','b','c'],'Sorting does not mutate owned copies');
});
test('explicit pocket overrides type and defaults putters into their pocket', () => {
 const molds={p:{speed:2,category:'Putter'},d:{speed:12,category:'Distance Driver'}};
 const slots=bagSlots([{id:'p',mold_id:'p',pocket:'main'},{id:'d',mold_id:'d',pocket:'putter'}],{main_capacity:1,putter_capacity:1},id=>molds[id]);
 assert.equal(slots.main[0].item.id,'p');assert.equal(slots.putter[0].item.id,'d');
 assert.equal(defaultDiscDetails({id:'p',...molds.p,brand:'Innova'},plastics).pocket,'putter');
 assert.equal(defaultDiscDetails({id:'d',...molds.d,brand:'Innova'},plastics).stability_bias,null);
});
