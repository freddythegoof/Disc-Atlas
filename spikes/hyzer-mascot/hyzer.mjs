// Hyzer the Disc: the Atlas Coach's face, as a Wobnimo character spec (plain data, no animation code).
// Freddy picked Take A (cool, a little cocky) and asked for him in red (Nov 14, 2026).
//
// Construction: the disc lies in its bone's xy plane with the flight plate facing +z (the camera), tipped
// back like the brand mark so the plate reads as a disc, then banked at a hyzer angle on the `bank` bone.
// The rim sits on its own bone so it can spin about the disc's axis (thinking) while the face holds still.
// Two leaves hide behind the plate and swing out past the rim only in `error` (he hit a tree).

const PLATE_R = 0.33, RIM_R = 0.42, RIM_HALF = 0.055;
// A point on the flight plate's dome (an ellipsoid at z 0.03, depth 0.07), for paints and the mouth.
const onPlate = (x, y) => [x, y, 0.03 + 0.07 * Math.sqrt(Math.max(0, 1 - (x * x + y * y) / (PLATE_R * PLATE_R)))];

// Ways to read "red" on this body. Colours run a touch richer than they should look: studio light lifts them.
export const COLORWAYS = {
  // red rim around the brand mark's obsidian plate, red eyebrows and warm eyes
  red: { label: 'Red rim', rim: '#c81e2c', dash: '#4a070d', plate: '#232831', brow: '#e8323e', iris: '#d98a2b', mouth: '#ffd9cf' },
  // the same red rim, keeping the brand lime in the eyebrows and eyes
  redLime: { label: 'Red rim, lime face', rim: '#c81e2c', dash: '#4a070d', plate: '#232831', brow: '#bdfc75', iris: '#7fc23a', mouth: '#d8f7b0' },
  // one-colour red disc, as most real discs are: the face sits on red plastic
  allRed: { label: 'All-red disc', rim: '#c81e2c', dash: '#4a070d', plate: '#a8161f', brow: '#2a0a0d', iris: '#3a2418', mouth: '#2a0a0d' },
};

export function hyzer(colorway = 'red') {
  const c = COLORWAYS[colorway];
  const bankAngle = 0.42;                       // the resting hyzer angle, radians (24°; the logo is 22°)
  const eye = 0.085, eyeY = 0.06, eyeX = 0.13;
  const sunk = (x, y) => { const p = onPlate(x, y); p[2] -= 0.006; return p; };
  const brow = (x1, y1, x2, y2) => ({ bone: 'disc', shape: 'capsule', from: sunk(x1, y1), to: sunk(x2, y2), radius: 0.019, material: 'brow' });
  return {
    id: colorway === 'red' ? 'hyzer' : `hyzer-${colorway.toLowerCase()}`,
    name: 'Hyzer the Disc',
    tagline: 'A cocky little red flying disc, idling at a hyzer angle',
    accent: c.rim,
    frame: { target: 0.45, radius: 0.6 },
    bound: { y: 0.45, radius: 0.62 },
    motion: { float: 0.16, hop: 0.1, squash: 0.85, snap: 1.2, look: 1.1, snapLook: 0.6, talkSquash: 0.4 },
    materials: {
      // glossy disc plastic
      rim: { color: c.rim, f0: 0.06, spec: 1.4, shininess: 140, rim: 0.5, gloss: 0.8 },
      // the flight plate, satin: a glossy dome reflects the studio and washes out the face
      plate: { color: c.plate, f0: 0, spec: 0.5, shininess: 160, rim: 0.2, gloss: 0 },
      brow: { color: c.brow, f0: 0.02, spec: 0.4, shininess: 60, rim: 0.3 },
      leaf: { color: '#3fa34d', f0: 0.04, spec: 0.7, shininess: 50, rim: 0.6, sss: 0.25, sssColor: '#b8f0a0' },
    },
    bones: [
      { name: 'bank', pivot: [0, 0.45, 0], rest: { rz: bankAngle },
        drive: { rx: [['pitch', -0.5]], ry: [['yaw', 0.6]], rz: [['roll', 0.4]] },
        wave: { rz: [0.04, 0.45, 0] } },
      { name: 'disc', parent: 'bank', pivot: [0, 0, 0], rest: { rx: -0.6 } },
      { name: 'rim', parent: 'disc', pivot: [0, 0, 0] },
      // leaves rest behind the plate pointing inward; error swings them half a turn, out past the edge
      { name: 'leafL', parent: 'disc', pivot: [-0.28, 0.23, -0.075], rest: { rz: -2.27 } },
      { name: 'leafR', parent: 'disc', pivot: [0.32, 0.15, -0.075], rest: { rz: 1.99 } },
    ],
    parts: [
      { bone: 'rim', shape: 'cylinder', rot: [Math.PI / 2, 0, 0], radius: RIM_R, half: RIM_HALF, round: 0.05, material: 'rim' },
      { bone: 'disc', shape: 'ellipsoid', at: [0, 0, 0.03], radii: [PLATE_R, PLATE_R, 0.07], blend: 0.02, material: 'plate' },
      { bone: 'leafL', shape: 'ellipsoid', at: [0, 0.12, 0], radii: [0.06, 0.13, 0.014], material: 'leaf' },
      { bone: 'leafR', shape: 'ellipsoid', at: [0, 0.09, 0], radii: [0.045, 0.1, 0.014], material: 'leaf' },
      // eyebrows, half sunk into the plate: a flat one, and one raised and kicked up at the end, the cocky tell
      brow(-eyeX - 0.05, eyeY + 0.12, -eyeX + 0.05, eyeY + 0.11),
      brow(eyeX - 0.05, eyeY + 0.135, eyeX + 0.055, eyeY + 0.165),
    ],
    paints: [
      // two stamp dashes on the rim so a spin reads
      { bone: 'rim', on: ['rim'], kind: 'sphere', at: [0, RIM_R - 0.045, RIM_HALF], radius: 0.035, color: c.dash, soft: 0.3 },
      { bone: 'rim', on: ['rim'], kind: 'sphere', at: [0, -(RIM_R - 0.045), RIM_HALF], radius: 0.035, color: c.dash, soft: 0.3 },
    ],
    eyes: { kind: 'ball', bone: 'disc', at: [[-eyeX, eyeY, 0.05], [eyeX, eyeY, 0.05]], radius: eye,
      iris: c.iris, irisSize: 0.72, pupilSize: 0.45, lid: 'plate' },
    // the smirk, set off-centre
    face: { kind: 'mouth', bone: 'disc', on: ['plate'], at: onPlate(0.035, -0.11), width: 0.055, color: c.mouth, tongue: '#ff7d8a' },
    anchors: {
      top: { bone: 'disc', at: [0.18, 0.44, 0] },
      mouth: { bone: 'disc', at: [0, -0.1, 0.12] },
      ear: { bone: 'disc', at: [-0.45, 0.05, 0] },
      feet: { bone: 'root', at: [0, 0.02, 0.15] },
    },
    acting: {
      // spins the rim about the disc's own axis while the face keeps thinking
      thinking: { rim: { rz: [0, 0, 0, 0, 7] }, bank: { rz: 0.08 } },
      working: { rim: { rz: [0, 0, 0, 0, 4] } },
      listening: { disc: { rx: 0.18 }, bank: { rz: -0.08 } },
      speaking: { bank: { rz: [0, 0.05, 1.6, 0] } },
      // flattens out of the hyzer and cheers, rim whirling
      celebrating: { bank: { rz: [-bankAngle, 0.08, 2.4, 0] }, rim: { rz: [0, 0, 0, 0, 14] } },
      happy: { rim: { rz: [0, 0, 0, 0, 10] } },
      // hit a tree: a dazed shiver, leaves stuck out past the rim
      error: { bank: { rz: [0.12, 0.06, 10, 0] }, leafL: { rz: 3.14 }, leafR: { rz: -3.14 } },
      surprised: { disc: { rx: 0.12 } },
      sad: { disc: { rx: 0.25 }, bank: { rz: 0.15 } },
      sleeping: { disc: { rx: -0.35 }, bank: { rz: 0.2 } },
    },
    fx: {
      // a few leaves knocked loose when he hits the tree
      'enter:error': [{ glyph: 'feather', anchor: 'top', rate: 4, velocity: [0, 0.12, 0.04], jitter: 0.12, gravity: 0.35,
        wobble: 0.08, drag: 1.2, spin: 2, life: [1.4, 1.9], size: [0.05, 0.04], color: '#3fa34d' }],
    },
  };
}

export default hyzer();
