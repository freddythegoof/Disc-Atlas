// Deterministic disc-name matching for the coach: the server resolves which catalog discs a player
// named, then hands those records to the model. No model call, no network, no paid service.
//
// Folding: NFKD, lowercase, stroke/ligature letters spelled out (ø→o, æ→ae, ß→ss, ł→l…), combining
// marks dropped. Tokens are runs of letters and digits, so punctuation, spaces and hyphens never
// matter: "stal" = "Stål", "firebird" = "FireBird", "fire bird" = "Firebird", "fd-2" = "FD2".
// Typos: optimal-string-alignment distance ≤ 1 for names of 4–7 letters, ≤ 2 from 8 letters, never
// for shorter names, common words or the first letter; a typo only reaches a rated mold unless the
// player also named the brand. A real English word ("time", "lost", "page") is never a typo for a
// mold ("Tide", "Lots", "Pace") unless that mold's brand is named or only a repeated letter differs
// ("buzz" for the Buzzz), and a typo never changes a number ("roc4" is not the Roc 3). A brand
// named alongside a mold scores that brand's discs higher.
import ENGLISH from './english-words.mjs';

const LETTERS = {ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', ł: 'l', đ: 'd', ð: 'd', þ: 'th', ı: 'i', ŋ: 'n', ħ: 'h', ŧ: 't', ĸ: 'k', ſ: 's'};
export function fold(text) {
 return String(text ?? '').normalize('NFKD').toLowerCase().replace(/[øæœßłđðþıŋħŧĸſ]/g, c => LETTERS[c]).normalize('NFKD').replace(/\p{M}+/gu, '');
}
// Folded tokens with where each came from in the original text, so a reply can quote the player.
export function tokenize(text) {
 const out = [], source = String(text ?? '');
 for (const m of source.matchAll(/[\p{L}\p{N}\p{M}]+/gu)) for (const t of fold(m[0]).match(/[\p{L}\p{N}]+/gu) || []) out.push({t, start: m.index, end: m.index + m[0].length});
 return out;
}
// Optimal string alignment distance (adjacent swaps cost 1), giving up past max.
export function editDistance(a, b, max = 2) {
 if (Math.abs(a.length - b.length) > max) return max + 1;
 let prev2 = null, prev = Array.from({length: b.length + 1}, (_, j) => j);
 for (let i = 1; i <= a.length; i++) {
  const row = [i]; let low = i;
  for (let j = 1; j <= b.length; j++) {
   let v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
   if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
   row.push(v); low = Math.min(low, v);
  }
  if (low > max) return max + 1;
  prev2 = prev; prev = row;
 }
 return prev[b.length];
}
export const typoAllowance = length => length >= 8 ? 2 : length >= 4 ? 1 : 0;

// Everyday and disc-golf words a typo must never turn into a mold ("hook" is not the Hood).
const COMMON = new Set(`a about above after again against all also am an and any are as at be because been before being below
best better between both but by can could did do does doing down during each few for from further had has have having he her here
hers him his how i if in into is it its just like me more most my no nor not now of off on once only or other our out over own
same she should so some such than that the their them then there these they this those through to too under until up very was we
were what when where which while who whom why will with would you your yours
compare comparison versus vs against difference similar same replace replacement instead between which one ones
disc discs driver drivers putter putters putt putting mid mids midrange midranges fairway fairways distance approach approaches
throw throws throwing thrown threw flight flights fly flies flying flew stable overstable understable stability neutral
backhand forehand sidearm hyzer anhyzer flip turn turns turning fade fades fading glide glides speed speeds plastic plastics
bag bags beginner beginners advanced pro pros good great bad nice better worse best worst like likes love need needs want wants
help should would could get got make made does doing use using used try trying tried more less much many some
shot shots line lines hook hooks sharp end ends start field round course hole holes wind windy headwind tailwind rain cold
straight long short far close left right low high hard soft heavy light weight grams gram new old beat beaten seasoned
power arm form release angle nose spin snap grip reach drive drives drop drops roll rolls roller rollers skip skips flat
tunnel upshot flex touch control accuracy consistent consistency fast slow step steps stand standstill run spike spikes grenade
thumber tomahawk scoober overhand range ranges lot lots`.split(/\s+/));
const GENERIC_BRAND = new Set(['disc', 'discs', 'golf', 'discgolf', 'frisbeegolf', 'dg', 'co', 'company', 'inc', 'llc', 'ltd', 'ou', 'oy', 'ab', 'applied', 'technologies', 'sports', 'the']);
const MAX_WINDOW = 5;
// "flips", "fading", "rolled": an everyday word in another form is still an everyday word.
const common = word => COMMON.has(word) || COMMON.has(word.replace(/(?:es|s|ed|ing)$/, '')) || COMMON.has(word.replace(/s$/, ''));
const english = word => /^\p{L}+$/u.test(word) && [word, word.replace(/(?:es|s|ed|d|ing|er|y)$/, ''), word.replace(/ing$/, 'e')].some(w => ENGLISH.has(w));
const runs = word => word.replace(/(.)\1+/g, '$1');
const digits = word => word.replace(/\D+/g, ' ').trim();

const compactOf = tokens => tokens.map(t => t.t ?? t).join('');

export function createDiscMatcher(discs) {
 const exact = new Map(), near = new Map(), brands = new Map(), meta = new Map();
 const addKey = (disc, text, kind, weight) => {
  const tokens = (fold(text).match(/[\p{L}\p{N}]+/gu) || []), key = tokens.join('');
  // Two-character molds ("D2", "H5", "XL") are too short to find inside plain words, so a letter
  // and digit stands alone and anything else needs its brand right before it ("Discraft XL").
  if (key.length < 2) return;
  const entry = {disc, kind, weight, key, tokens: tokens.length, needsBrand: key.length === 2 && !/^\p{L}\d$/u.test(key)};
  if (!exact.has(key)) exact.set(key, []);
  if (exact.get(key).some(e => e.disc === disc)) return;
  exact.get(key).push(entry);
  // Typos never touch the first letter, so each name waits in a bucket for its first letter and length.
  if (typoAllowance(key.length) && tokens.length <= 2) {
   const bucket = key[0] + key.length;
   if (!near.has(bucket)) near.set(bucket, new Map());
   near.get(bucket).set(key, near.get(bucket).get(key) || disc.speed != null);
  }
 };
 discs.forEach((disc, index) => {
  addKey(disc, disc.name, 'name', 0);
  const base = disc.name.replace(/[(（][^)）]*[)）]?/g, ' ').trim();
  if (base && fold(base) !== fold(disc.name)) addKey(disc, base, 'base', -2);
  if (disc.catalogName) addKey(disc, disc.catalogName, 'catalog', 0);
  for (const alias of disc.aliases || []) addKey(disc, alias, 'alias', 0);
  const allBrandTokens = fold(disc.brand).match(/[\p{L}\p{N}]+/gu) || [], brandTokens = allBrandTokens.filter(t => !GENERIC_BRAND.has(t));
  for (const key of new Set([allBrandTokens.join(''), brandTokens.join(''), brandTokens[0]?.length >= 5 ? brandTokens[0] : ''])) if (key.length >= 3) {if (!brands.has(key)) brands.set(key, new Set()); brands.get(key).add(disc.brand);}
  meta.set(disc, {index, rated: disc.speed != null, base: fold(base || disc.name).replace(/[^\p{L}\p{N}]+/gu, '')});
 });

 function typoKeys(word, anyBrand) {
  const allowance = typoAllowance(word.length), found = new Map();
  if (!allowance) return found;
  for (let length = word.length - allowance; length <= word.length + allowance; length++) for (const [key, rated] of near.get(word[0] + length) || []) {
   if (!(rated || anyBrand) || digits(key) !== digits(word)) continue;
   const distance = editDistance(word, key, allowance);
   if (distance > 0 && distance <= Math.min(allowance, typoAllowance(key.length))) found.set(key, distance);
  }
  return found;
 }

 // Every disc the text names, with a score, and each separate mention resolved to its best disc.
 function match(text) {
  const tokens = tokenize(text), source = String(text ?? ''), hits = [], brandsNamed = new Set(), brandSpots = [], brandBefore = new Map(), typos = new Map();
  for (let i = 0; i < tokens.length; i++) for (let n = 1; n <= MAX_WINDOW && i + n <= tokens.length; n++) {
   const key = compactOf(tokens.slice(i, i + n));
   if (brands.has(key)) {for (const brand of brands.get(key)) {brandsNamed.add(brand); if (!brandBefore.has(i + n)) brandBefore.set(i + n, new Set()); brandBefore.get(i + n).add(brand);} brandSpots.push([i, i + n]);}
   const entries = exact.get(key)?.filter(e => !e.needsBrand || brandBefore.get(i)?.has(e.disc.brand));
   if (!entries?.length) continue;
   // Run-together words must spell a real name ("fire bird", "roc3"), not stitch little words together.
   const span = tokens.slice(i, i + n), spaced = entries.filter(e => e.tokens === n || n === 1 || key.length >= 5 || /^\d+$/.test(span[n - 1].t));
   if (spaced.length) hits.push({start: i, end: i + n, kind: span.every(t => common(t.t)) || brands.has(key) ? 'word' : 'exact', entries: spaced.map(e => ({...e, score: 100 + Math.min(key.length, 30) + e.weight - (e.tokens === n ? 0 : 1)}))});
  }
  // A mold named with everyday words ("fly", "putter", "tunnel shot") or another maker's name ("Prodigy") is
  // context, not a mention, unless its own brand is named too.
  for (const hit of hits) if (hit.kind === 'word') {
   hit.entries = hit.entries.filter(e => brandsNamed.has(e.disc.brand)).concat(hit.entries.filter(e => !brandsNamed.has(e.disc.brand)).map(e => ({...e, score: 3, context: true})));
   if (hit.entries.some(e => !e.context)) hit.kind = 'exact';
  }
  const covered = new Set([...hits, ...brandSpots.map(([start, end]) => ({start, end}))].flatMap(h => Array.from({length: h.end - h.start}, (_, k) => h.start + k)));
  for (let i = 0; i < tokens.length; i++) for (let n = 1; n <= 2 && i + n <= tokens.length; n++) {
   const span = tokens.slice(i, i + n);
   if (span.some((t, k) => covered.has(i + k) || common(t.t) || /^\d+$/.test(t.t))) continue;
   const word = compactOf(span);
   if (!typos.has(word)) typos.set(word, typoKeys(word, brandsNamed.size > 0));
   const isWord = english(word);
   // Every name within reach of these words joins one reading, so a close second can make it ambiguous.
   const entries = [...typos.get(word)].flatMap(([key, distance]) => exact.get(key)
    .filter(e => e.tokens <= 2 && (meta.get(e.disc).rated || brandsNamed.has(e.disc.brand)) && (!isWord || brandsNamed.has(e.disc.brand) || key.length > word.length && runs(key) === runs(word)))
    .map(e => ({...e, score: 70 + Math.min(key.length, 20) - 12 * distance + e.weight})));
   if (entries.length) hits.push({start: i, end: i + n, kind: 'typo', entries});
  }
  const scores = new Map();
  for (const hit of hits) for (const e of hit.entries) {
   const score = e.score + (brandsNamed.has(e.disc.brand) ? 30 : 0) + (meta.get(e.disc).rated ? 1 : 0);
   e.final = score;
   if (score > (scores.get(e.disc) || 0)) scores.set(e.disc, score);
  }
  const order = (a, b) => b.final - a.final || meta.get(a.disc).index - meta.get(b.disc).index;
  // Longest, strongest readings claim their words first; a typo never overrides a real name.
  const mentions = [], claimed = new Set();
  for (const hit of hits.filter(h => h.kind !== 'word').map(h => ({...h, entries: h.entries.filter(e => !e.context).sort(order)})).sort((a, b) => (a.kind === 'typo') - (b.kind === 'typo') || b.entries[0].final - a.entries[0].final || (b.end - b.start) - (a.end - a.start) || a.start - b.start)) {
   const spots = Array.from({length: hit.end - hit.start}, (_, k) => hit.start + k);
   if (spots.some(s => claimed.has(s))) continue;
   spots.forEach(s => claimed.add(s));
   const [best, ...rest] = hit.entries, seen = new Set([best.disc]), bestMeta = meta.get(best.disc);
   // A close second that is a different mold (not the same mold's variant) makes the mention ambiguous.
   const alternates = rest.filter(e => {
    if (seen.has(e.disc)) return false; seen.add(e.disc);
    const m = meta.get(e.disc);
    return e.final >= best.final - 1 && !(e.disc.brand === best.disc.brand && m.base === bestMeta.base);
   }).slice(0, 3).map(e => e.disc);
   mentions.push({text: source.slice(tokens[hit.start].start, tokens[hit.end - 1].end), start: tokens[hit.start].start, end: tokens[hit.end - 1].end,
    kind: hit.kind, disc: best.disc, alternates, ambiguous: alternates.length > 0});
  }
  mentions.sort((a, b) => a.start - b.start);
  return {scores, mentions, brands: brandsNamed};
 }
 return {match};
}
