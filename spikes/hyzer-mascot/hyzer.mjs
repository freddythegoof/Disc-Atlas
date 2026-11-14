// Hyzer the Disc: the Atlas Coach's face, as a Wobnimo character spec (plain data, no animation code).
// One body, two personality takes for Freddy's Part 1 pick: `cool` (a little cocky) and `cute` (friendly).
//
// Construction: the disc lies in its bone's xy plane with the flight plate facing +z (the camera), tipped
// back like the brand mark so the plate reads as a disc, then banked at a hyzer angle on the `bank` bone.
// The lime rim sits on its own bone so it can spin about the disc's axis (thinking) while the face holds still.
// Two leaves hide behind the plate and swing out past the rim only in `error` (he hit a tree).

const PLATE_R = 0.33, RIM_R = 0.42, RIM_HALF = 0.055;
// A point on the flight plate's dome (an ellipsoid at z 0.03, depth 0.07), for paints and the mouth.
const onPlate = (x, y) => [x, y, 0.03 + 0.07 * Math.sqrt(Math.max(0, 1 - (x * x + y * y) / (PLATE_R * PLATE_R)))];

function hyzer(take) {
  const cool = take === 'cool';
  const bankAngle = cool ? 0.42 : 0.3;          // the resting hyzer angle, radians (logo is 22°, about 0.38)
  const eye = cool ? 0.085 : 0.1;
  const eyeY = cool ? 0.06 : 0.04, eyeX = cool ? 0.13 : 0.14;
  return {
    id: cool ? 'hyzer-cool' : 'hyzer-cute',
    name: 'Hyzer the Disc',
    tagline: cool
      ? 'A cocky little flying disc with a lime rim, idling at a hyzer angle'
      : 'A friendly little flying disc with a lime rim, idling at a hyzer angle',
    accent: '#bdfc75',
    frame: { target: 0.45, radius: 0.6 },
    bound: { y: 0.45, radius: 0.62 },
    motion: cool
      ? { float: 0.16, hop: 0.1, squash: 0.85, snap: 1.2, look: 1.1, snapLook: 0.6, talkSquash: 0.4 }
      : { float: 0.16, hop: 0.2, squash: 1.25, snap: 0.9, look: 0.9, snapLook: 0, talkSquash: 0.8 },
    materials: {
      // glossy disc plastic in the brand lime; a touch richer than #bdfc75 because studio light lifts it
      rim: { color: '#b2f060', f0: 0.06, spec: 1.4, shininess: 140, rim: 0.5, gloss: 0.8 },
      // the obsidian flight plate of the brand mark, satin: a glossy dome reflects the studio and washes out the face
      plate: { color: '#232831', f0: 0, spec: 0.5, shininess: 160, rim: 0.2, gloss: 0 },
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
    ],
    paints: [
      // two stamp dashes on the rim so a spin reads
      { bone: 'rim', on: ['rim'], kind: 'sphere', at: [0, RIM_R - 0.045, RIM_HALF], radius: 0.035, color: '#3c5a1a', soft: 0.3 },
      { bone: 'rim', on: ['rim'], kind: 'sphere', at: [0, -(RIM_R - 0.045), RIM_HALF], radius: 0.035, color: '#3c5a1a', soft: 0.3 },
      ...(cool
        // one raised lime brow over his left eye: the cocky tell
        ? [0, 1, 2, 3, 4].map(i => ({ bone: 'disc', on: ['plate'], kind: 'sphere', at: onPlate(eyeX - 0.06 + i * 0.03, eyeY + 0.11 + i * 0.012), radius: 0.02, color: '#bdfc75', soft: 0.15 }))
        // soft blush under the eyes
        : [-1, 1].map(s => ({ bone: 'disc', on: ['plate'], kind: 'sphere', at: onPlate(s * 0.2, -0.06), radius: 0.05, color: '#ff8f8f', soft: 0.6, opacity: 0.6 }))),
    ],
    eyes: { kind: 'ball', bone: 'disc', at: [[-eyeX, eyeY, 0.05], [eyeX, eyeY, 0.05]], radius: eye,
      iris: cool ? '#7fc23a' : '#5a9a22', irisSize: cool ? 0.72 : 0.86, pupilSize: cool ? 0.45 : 0.6, lid: 'plate' },
    face: { kind: 'mouth', bone: 'disc', on: ['plate'], at: onPlate(cool ? 0.035 : 0, -0.11), width: cool ? 0.055 : 0.07,
      color: '#d8f7b0', tongue: '#ff7d8a' },
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

export const hyzerCool = hyzer('cool');
export const hyzerCute = hyzer('cute');
