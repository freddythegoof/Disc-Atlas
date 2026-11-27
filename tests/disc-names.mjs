import assert from 'node:assert/strict';
import {test} from 'node:test';
import catalog from '../public/data.json' with {type: 'json'};
import {createDiscMatcher, editDistance, fold, tokenize, typoAllowance} from '../workers/disc-names.mjs';

const matcher = createDiscMatcher(catalog.discs);
const read = text => matcher.match(text).mentions.map(m => ({text: m.text, kind: m.kind, disc: `${m.disc.brand} ${m.disc.name}`, also: m.alternates.map(d => `${d.brand} ${d.name}`)}));
const discs = text => read(text).map(m => m.disc);

test('folding drops accents, case and stroke letters', () => {
 for (const [raw, folded] of [['Stål', 'stal'], ['STÅL', 'stal'], ['Järn', 'jarn'], ['Älva', 'alva'], ['Løft', 'loft'], ['Æsir', 'aesir'],
  ['Straße', 'strasse'], ['Łódź', 'lodz'], ['Níðhöggr', 'nidhoggr'], ['FireBird', 'firebird'], ['ﬁre', 'fire']]) assert.equal(fold(raw), folded, raw);
 assert.deepEqual(tokenize('Tee-bird, (FL)!').map(t => t.t), ['tee', 'bird', 'fl']);
});
test('edit distance counts a swap as one, and typo allowance grows with length', () => {
 assert.equal(editDistance('firbird', 'firebird'), 1);
 assert.equal(editDistance('destoryer', 'destroyer'), 1);
 assert.equal(editDistance('stal', 'stig', 1), 2);
 assert.deepEqual([3, 4, 7, 8].map(typoAllowance), [0, 1, 1, 2]);
});
test('stal finds the Stål and firebird finds the Firebird, in any case, accent or spacing', () => {
 for (const ask of ['compare my stal to a firebird', 'compare my Stål to a FireBird', 'COMPARE MY STAL TO A FIRE-BIRD', 'compare my stal to a fire bird', 'Kastaplast Stal vs Innova Firebird']) {
  assert.deepEqual(discs(ask), ['Kastaplast Stål', 'Innova Firebird'], ask);
  assert.ok(read(ask).every(m => !m.also.length), `${ask} is not ambiguous`);
 }
 // "firebird" no longer drags in the Latitude 64 Fire from inside the word.
 assert.ok(!matcher.match('compare my stal to a firebird').scores.has(catalog.discs.find(d => d.brand === 'Latitude 64' && d.name === 'Fire')));
});
test('a one-letter typo still resolves, and says it was a typo', () => {
 assert.deepEqual(read('compare my stal to a firbird'), [
  {text: 'stal', kind: 'exact', disc: 'Kastaplast Stål', also: []}, {text: 'firbird', kind: 'typo', disc: 'Innova Firebird', also: []}]);
 assert.deepEqual(discs('How does the Destoryer fly?'), ['Innova Destroyer']);
 assert.deepEqual(discs('is the buzz good'), ['Discraft Buzzz']);
 assert.deepEqual(discs('compare my stl to a firebird'), ['Innova Firebird'], 'Three letters are too short to guess');
});
test('a brand named with the mold settles a name two brands share', () => {
 assert.deepEqual(read('How does the Vortex fly?'), [{text: 'Vortex', kind: 'exact', disc: 'DGA Vortex', also: ['Discraft Vortex']}]);
 assert.deepEqual(read('How does the Discraft Vortex fly?'), [{text: 'Vortex', kind: 'exact', disc: 'Discraft Vortex', also: []}]);
 assert.deepEqual(discs('Loft Discs neon or løft xenon'), ['Løft Discs Neon', 'Løft Discs Xenon']);
 assert.deepEqual(discs('Prodigy H5 or the D2'), ['Prodigy H5', 'Prodigy D2']);
 assert.deepEqual(discs('Discraft XL'), ['Discraft XL']);
 assert.deepEqual(discs('I need a stable fairway xl'), [], 'Two letters need their brand');
});
test('names run together or split apart still match whole names', () => {
 assert.deepEqual(discs('teebird vs leopard3 vs roc3'), ['Innova TeeBird', 'Innova Leopard 3', 'Innova Roc 3']);
 assert.deepEqual(discs('compare the md3 and md 4'), ['Discmania MD3 (new)', 'Discmania MD4 (new)']);
});
test('everyday words and shots never become disc mentions', () => {
 for (const ask of ['How do I make my approach shots more consistent?', 'My forehand has a sharp hook at the end, why?', 'I am looking for an overstable driver',
  'My drives hyzer out too fast, what am I doing wrong?', 'My standstill is longer than my x-step, why?', 'What should I throw into a headwind on a long par 4?',
  'Is a midrange good for hyzer flips?', 'how to throw a skip shot and grenade', 'What disc should I use for a long tunnel shot?'])
  assert.deepEqual(read(ask), [], ask);
 assert.deepEqual(discs('is the DGA putter any good'), ['DGA Putter'], 'An everyday-word mold counts once its brand is named');
});
test('every rated mold is reached by its brand and name', () => {
 const missed = catalog.discs.filter(d => d.speed != null).filter(d => !matcher.match(`how does the ${d.brand} ${d.name} fly`).mentions.some(m => m.disc === d || m.alternates.includes(d)));
 assert.deepEqual(missed.map(d => `${d.brand} ${d.name}`), []);
});
// QA on PR #71 found everyday questions read as molds ("best time of day" as the Westside Tide).
const NO_DISC = [
 'What is the best time of day to practice putting?',
 'Can you check my form if I describe it?',
 'Should I stay with my mid-range or move up to a fairway?',
 'I lost my disc in the pond, any tips for finding it?',
 'How should I warm up before a round?',
 'What kind of grip is best for a forehand?',
 'Is stock plastic better than premium for beginners?',
 'How do I throw in open fields with lots of wind?',
 'What page of the rules covers out of bounds?',
 'How do I play a mandatory gate on a tight hole?',
 'Why does my drive stall out and drop early?',
 'My old discs feel stale, should I replace them?',
 'What stat matters most for a new player?',
 'How do I throw over a rock wall?',
 'Is a heavier disc better in the wind?',
 'How far should a beginner throw after a year?',
 'What does a high glide rating mean?',
 'How do I stop rounding my backhand?',
 'What is a good weekly practice routine?',
 'How many discs should I carry in my bag?',
 'Should I learn a roller shot?',
 'How do I read a fairway before I throw?',
 'What is the difference between a stable and an overstable disc?',
 'How do I get more snap in my throw?',
 'When should I throw a hyzer instead of a flat release?',
 'How do I keep my nose angle down?',
 'What should I do when my putts keep missing left?',
 'How do I aim on an uphill hole?',
 'Is it worth buying a practice basket?',
 'How do I throw farther without hurting my shoulder?',
 'What are good drills for footwork?',
 'How do I play in the rain without slipping?',
 'What weight should a kid throw?',
 'How do I pick a disc for a tailwind?',
 'My throws keep turning over, why?',
 'What is a good score for a first round?',
 'How long does it take to break in a new disc?',
 'Should I walk or run up on my drive?',
 'How do I keep score in a doubles round?',
 'What does the turn number tell me about a disc?'];
test('a disc-golf question that names no disc reaches no mold, not even as a typo', () => {
 for (const ask of NO_DISC) {
  const {mentions, scores} = matcher.match(ask);
  assert.deepEqual(mentions.map(m => `${m.text} as ${m.disc.brand} ${m.disc.name}`), [], ask);
  assert.deepEqual([...scores].filter(([, score]) => score >= 50).map(([d]) => d.name), [], `${ask} sends no matched records`);
 }
});
test('an English word is never a typo for a mold unless its brand is named or only a repeated letter differs', () => {
 for (const word of ['time', 'check', 'stay', 'lost', 'warm', 'kind', 'stock', 'open', 'page', 'gate', 'stall', 'stale', 'stat', 'rock'])
  assert.deepEqual(discs(`how does the ${word} fly`), [], word);
 assert.deepEqual(discs('is the buzz good'), ['Discraft Buzzz']);
 assert.deepEqual(discs('how does the Westside time fly'), ['Westside Discs Tide'], 'Its brand makes the word a typo again');
 assert.deepEqual(discs('my stal vs stall'), ['Kastaplast Stål']);
});
test('a typo never changes a number', () => {
 assert.deepEqual(discs('compare roc4 and roc3'), ['Innova Roc 3']);
});
