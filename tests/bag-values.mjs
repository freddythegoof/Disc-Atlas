import assert from 'node:assert/strict';
import {test} from 'node:test';
import plastics from '../source-data/bag-plastics.json' with {type:'json'};
import {defaultDiscDetails,plasticOptions,wearLabel,bagClass} from '../public/bag-values.js';

test('mold plastic reference wins over brand fallback and remains selectable', () => {
 const details = defaultDiscDetails({id:'ff4bf9e7743c',brand:'Discraft',specs:{'Max weight':'174.3'}},plastics);
 assert.equal(details.plastic,'Putter Line Hard'); assert.equal(details.weight_g,174);
 assert.ok(plasticOptions({id:'ff4bf9e7743c',brand:'Discraft'},plastics).options.includes('Putter Line Hard'));
 assert.equal(defaultDiscDetails({id:'x',brand:'Innova',referencePlastic:'Champion',typicalMaxWeight:175},plastics).plastic,'Champion');
 assert.equal(defaultDiscDetails({id:'x',brand:'Unknown'},plastics).plastic,'');
 assert.equal(defaultDiscDetails({id:'x',brand:'Axiom',specs:{'Max weight':'200'}},plastics).weight_g,180);
 assert.equal(defaultDiscDetails({id:'x',brand:'Innova',specs:{'Max weight':'broken'}},plastics).weight_g,175);
});
test('wear labels explain new, midpoint and severely beat discs without changing flight data', () => {
 for (const [wear,label] of [[10,'Factory new'],[9,'Like new'],[5,'Seasoned'],[3,'Well-worn'],[1,'Beat · different stability class'],[2,'Beat · different stability class']]) assert.equal(wearLabel(wear),label);
});
test('bag class follows the disc class before speed; unknown ratings remain honest', () => {
 for (const [disc,want] of [[{category:'Control Driver',speed:10},'fairway'],[{category:'Distance Driver',speed:9},'distance'],[{category:'Midrange',speed:6},'mid'],[{category:'Putter',speed:4},'putter'],[{speed:3},'putter'],[{speed:5},'mid'],[{speed:8},'fairway'],[{speed:12},'distance'],[{},'unknown']]) assert.equal(bagClass(disc),want);
});
