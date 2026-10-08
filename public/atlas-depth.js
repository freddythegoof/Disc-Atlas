/* Background depth dots for the main Atlas: faint specks in shells of depth behind the disc plane.
   Zooming flies the camera toward the discs, so each shell spreads more slowly than the discs do and
   nearer shells faster than farther ones: parallax, not decoration. Decoration only: the dots carry
   no data, never sit under a disc or its name, and the same camera always draws the same field. */
window.AtlasDepth = (() => {
  // A shell `e` behind the discs (in units where the 1x camera is 1 from them) draws at
  // scale zoom/(1+e*zoom): always below the discs' own zoom, approaching 1/e as you fly in.
  // Shells repeat every `spacing`. Scales below `fadeFrom` fade into the distance; nothing draws
  // below `fadeTo`. A shell's dot sites are `cell` x (1+e) apart, so every shell is equally sparse
  // at 1x and nearer shells thin out as you fly in. `chance` is the odds that a site has a dot.
  const DEPTH = {spacing: .4, shells: 9, fadeTo: .3, fadeFrom: .55, cell: 150, chance: .5, radius: .75, growth: .6, maxRadius: 2.2, gap: 6};
  function random(shell, i, j, salt) {
    let n = Math.imul(shell + 1, 0x27d4eb2d) ^ Math.imul(i, 0x165667b1) ^ Math.imul(j, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
    n ^= n >>> 15; n = Math.imul(n, 0x2c1b3c6d); n ^= n >>> 12; n = Math.imul(n, 0x297a2d39); n ^= n >>> 15;
    return (n >>> 0) / 4294967296;
  }
  const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  // How far behind the discs a shell is, and its scale at this zoom.
  const depth = shell => (shell + 1) * DEPTH.spacing;
  function scale(shell, zoom) { return zoom / (1 + depth(shell) * zoom); }
  // Is a dot of radius r at (x,y) clear of every circle {x,y,r} and box {x,y,w,h}, with the gap?
  function clear(x, y, r, avoid) {
    const g = r + DEPTH.gap;
    for (const a of avoid) {
      if (a.w != null) { if (x > a.x - g && x < a.x + a.w + g && y > a.y - g && y < a.y + a.h + g) return false; }
      else if ((x - a.x) ** 2 + (y - a.y) ** 2 < (a.r + g) ** 2) return false;
    }
    return true;
  }
  // The dots for a camera, in map pixels: {x, y, r, alpha, shell, key}, where `key` names a dot across
  // cameras. `area` and `pan` are the map's own (AtlasLayout.bounds, the pan the discs use); the view's
  // center is the world point the camera faces.
  function field({width: w, height: h, zoom, pan, area, avoid = []}) {
    const cx = w / 2, cy = h / 2, qx = (cx - area.left - pan.x) / zoom, qy = (cy - area.bottom - pan.y) / zoom, dots = [];
    for (let shell = 0; shell < DEPTH.shells; shell++) {
      const s = scale(shell, zoom), fade = smooth(DEPTH.fadeTo, DEPTH.fadeFrom, s);
      if (fade <= 0) continue;
      const G = DEPTH.cell * (1 + depth(shell)), ox = random(shell, 0, 0, 1) * G, oy = random(shell, 0, 0, 2) * G;
      const margin = DEPTH.maxRadius;
      const x0 = Math.floor((qx + (-margin - cx) / s - ox) / G), x1 = Math.floor((qx + (w + margin - cx) / s - ox) / G);
      const y0 = Math.floor((qy + (-margin - cy) / s - oy) / G), y1 = Math.floor((qy + (h + margin - cy) / s - oy) / G);
      for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) {
        if (random(shell, i, j, 3) >= DEPTH.chance) continue;
        const x = cx + (ox + (i + random(shell, i, j, 4)) * G - qx) * s, y = cy + (oy + (j + random(shell, i, j, 5)) * G - qy) * s;
        const r = Math.min(DEPTH.maxRadius, (DEPTH.radius + DEPTH.growth * s) * (.8 + .4 * random(shell, i, j, 6)));
        if (x < -r || x > w + r || y < -r || y > h + r || !clear(x, y, r, avoid)) continue;
        dots.push({x, y, r, alpha: fade * (.6 + .4 * random(shell, i, j, 7)), shell, key: shell + ":" + i + ":" + j});
      }
    }
    return dots;
  }
  return {field, scale, clear, DEPTH};
})();
