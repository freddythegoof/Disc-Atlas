// Stratified random draw for the stability sampling audit (read-only: writes nothing but stdout/--out).
// Usage: node scripts/sampling-audit-draw.mjs [--seed <hex>] [--out sample.json]
// The seed is printed so a draw can be reproduced; without --seed it comes from crypto.randomBytes.
import fs from 'node:fs';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const seed = opt('--seed') || crypto.randomBytes(8).toString('hex');
const outPath = opt('--out');

// mulberry32 seeded from the first 32 bits of sha256(seed)
let a = crypto.createHash('sha256').update(seed).digest().readUInt32LE(0);
const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = (xs) => { const r = xs.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const SAMPLE = 50, PER_CELL = 4, BRAND_CAP = 8;
const discs = JSON.parse(fs.readFileSync('public/data.json', 'utf8')).discs;
const queue = fs.readFileSync('docs/stability-review-queue.md', 'utf8');
const overrides = JSON.parse(fs.readFileSync('source-data/verified-model-overrides.json', 'utf8')).overrides;

const base = (n) => n.replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase();
const key = (brand, name) => `${brand.trim().toLowerCase()}|${base(name)}`;
const byId = new Map(discs.map((d) => [d.id, d]));

// Exclude: any catalog id mentioned anywhere in the queue, any brand+base-name of a queue heading, and any overridden id.
const excludedIds = new Set((queue.match(/\b[0-9a-f]{12}\b/g) || []).filter((i) => byId.has(i)));
overrides.forEach((o) => excludedIds.add(o.id));
const excludedKeys = new Set([...excludedIds].map((i) => byId.get(i)).filter(Boolean).map((d) => key(d.brand, d.name)));

const speedClass = (s) => (s <= 3 ? 'putter' : s <= 5 ? 'mid' : s <= 8 ? 'fairway' : 'distance');
const stabClass = (d) => { const i = d.turn + d.fade; return i <= -1 ? 'understable' : i < 2 ? 'stable' : 'overstable'; };

const pool = discs
  .filter((d) => d.speed != null && d.turn != null && d.fade != null)
  .filter((d) => !excludedIds.has(d.id) && !excludedKeys.has(key(d.brand, d.name)))
  .map((d) => ({ ...d, sc: speedClass(d.speed), st: stabClass(d) }));

const SC = ['putter', 'mid', 'fairway', 'distance'], ST = ['understable', 'stable', 'overstable'];
const cells = SC.flatMap((s) => ST.map((t) => [s, t]));
const brandCount = {}, picked = [], usedKeys = new Set();
const take = (cand) => {
  for (const d of cand) {
    if (brandCount[d.brand] >= BRAND_CAP || usedKeys.has(key(d.brand, d.name))) continue;
    brandCount[d.brand] = (brandCount[d.brand] || 0) + 1; usedKeys.add(key(d.brand, d.name)); picked.push(d); return true;
  }
  return false;
};
const cellPool = (s, t) => shuffle(pool.filter((d) => d.sc === s && d.st === t));
// 12 cells x 4 = 48, then 2 extra from randomly chosen cells
for (const [s, t] of shuffle(cells)) { for (let n = 0; n < PER_CELL; n++) take(cellPool(s, t)); }
for (const [s, t] of shuffle(cells)) { if (picked.length >= SAMPLE) break; take(cellPool(s, t)); }

const sample = picked.map((d) => ({ id: d.id, name: d.name, brand: d.brand, speed: d.speed, glide: d.glide, turn: d.turn, fade: d.fade, category: d.category ?? null, flightSource: d.flightSourceLabel ?? 'Marshall Street (flights.json)', speedClass: d.sc, stability: d.st }));
const tally = (f) => sample.reduce((m, d) => ((m[f(d)] = (m[f(d)] || 0) + 1), m), {});

console.log(JSON.stringify({ seed, excludedIds: excludedIds.size, eligiblePool: pool.length, n: sample.length, bySpeedClass: tally((d) => d.speedClass), byStability: tally((d) => d.stability), byCell: tally((d) => `${d.speedClass}/${d.stability}`), byBrand: tally((d) => d.brand) }, null, 2));
if (outPath) fs.writeFileSync(outPath, JSON.stringify({ seed, sample }, null, 2));
