import assert from 'node:assert/strict';
import {test} from 'node:test';
import plastics from '../source-data/bag-plastics.json' with {type:'json'};
import {defaultDiscDetails,plasticOptions,wearLabel,bagClass,plasticColor,bagPalette,bagSlots} from '../public/bag-values.js';

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
 const rows=[{id:'a',mold_id:'slow',in_bag:true},{id:'b',mold_id:'fast',in_bag:true},{id:'c',mold_id:'putt',in_bag:true},{id:'d',mold_id:'fast',in_bag:false}];
 const slots=bagSlots(rows,{main_capacity:3,putter_capacity:2},id=>molds[id]);
 assert.deepEqual(slots.main.map(s=>s.item?.id||null),['b','a',null]);assert.deepEqual(slots.putter.map(s=>s.item?.id||null),['c',null]);
 assert.equal(slots.overflow.length,0);
 const crowded=bagSlots(rows,{main_capacity:1,putter_capacity:0},id=>molds[id]);assert.equal(crowded.overflow.length,2);
});
test('wear labels explain new, midpoint and severely beat discs without changing flight data', () => {
 for (const [wear,label] of [[10,'Factory new'],[9,'Like new'],[5,'Seasoned'],[3,'Well-worn'],[1,'Beat · different stability class'],[2,'Beat · different stability class']]) assert.equal(wearLabel(wear),label);
});
test('bag class follows the disc class before speed; unknown ratings remain honest', () => {
 for (const [disc,want] of [[{category:'Control Driver',speed:10},'fairway'],[{category:'Distance Driver',speed:9},'distance'],[{category:'Midrange',speed:6},'mid'],[{category:'Putter',speed:4},'putter'],[{speed:3},'putter'],[{speed:5},'mid'],[{speed:8},'fairway'],[{speed:12},'distance'],[{},'unknown']]) assert.equal(bagClass(disc),want);
});
