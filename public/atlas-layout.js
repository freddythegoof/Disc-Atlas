/* Stable display coordinates. Offsets create breathing room, not new flight ratings. */
window.AtlasLayout = (() => {
  function seed(value) {
    let n = 2166136261;
    for (const c of String(value)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
    return (n >>> 0) / 4294967296;
  }
  function positions(items) {
    const result = new Map();
    for (const d of items) {
      if (d.speed == null) continue;
      const angle = seed(d.id) * Math.PI * 2;
      const radius = .012 + Math.sqrt(seed(d.id + ':radius')) * .05;
      result.set(d.id, {
        x: Math.max(0, Math.min(100, 50 + 10 * (d.turn + d.fade))) / 100 + Math.cos(angle) * radius,
        y: (d.speed - 1) / 14 + Math.sin(angle) * radius,
      });
    }
    return result;
  }
  function bounds(width, height, immersive = true) {
    const top = immersive ? Math.min(135, height * .26) : 36;
    const bottom = immersive ? Math.min(width < 700 ? 285 : 260, height * .40) : 70;
    const usableWidth = Math.max(80, width - 96), usableHeight = Math.max(60, height - top - bottom);
    // Include the entire scatter envelope and room for disc names at the edges.
    return {left:48 + usableWidth * .06, bottom:height - bottom - usableHeight * .06,
      width:usableWidth * .88, height:usableHeight * .88};
  }
  function camera(point, width, height, zoom = 2.8) {
    const area = bounds(width, height);
    return {zoom, x: width * .5 - area.left - point.x * area.width * zoom,
      y: height * .48 - area.bottom + point.y * area.height * zoom};
  }
  return {positions, camera, bounds};
})();
