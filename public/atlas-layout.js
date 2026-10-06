/* Stable display coordinates. Offsets create breathing room, not new flight ratings. */
window.AtlasLayout = (() => {
  function seed(value) {
    let n = 2166136261;
    for (const c of String(value)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
    return (n >>> 0) / 4294967296;
  }
  // The seeded breathing-room offset (up to .062) every position carries.
  function scatter(id) {
    const angle = seed(id) * Math.PI * 2;
    const radius = .012 + Math.sqrt(seed(id + ':radius')) * .05;
    return {x: Math.cos(angle) * radius, y: Math.sin(angle) * radius};
  }
  // `shift` moves a disc's stability index (My Map's personal lens); the shared atlas passes none.
  function positions(items, shift = () => 0) {
    const result = new Map();
    for (const d of items) {
      if (d.speed == null) continue;
      const offset = scatter(d.id);
      result.set(d.id, {
        x: Math.max(0, Math.min(100, 50 + 10 * (d.turn + d.fade) + shift(d))) / 100 + offset.x,
        y: (d.speed - 1) / 14 + offset.y,
      });
    }
    return result;
  }
  // Every rated disc sits in this envelope: stability index 0–100 and speed 1–15 map to 0–1,
  // and the display scatter adds up to .062 (tests/atlas-layout.mjs checks the catalog fits).
  const FRAME = {minX: .045, maxX: 1.055, minY: -.06, maxY: 1.025};
  // The 1x view fits that envelope to the visible map: disc centers run from just under the
  // search bar (and the type chips, which wrap under it below 1100px) to a name's height above the axis legend, and close to both sides.
  function bounds(width, height, immersive = true) {
    const mobile = width < 700;
    const view = immersive
      ? {left: mobile ? 38 : 62, right: width - (mobile ? 38 : 58), top: mobile ? 132 : width < 1100 ? 138 : 90, bottom: height - (mobile ? 195 : 172)}
      : {left: 48, right: width - 48, top: 60, bottom: height - 70};
    view.right = Math.max(view.left + 80, view.right);view.bottom = Math.max(view.top + 60, view.bottom);
    const w = (view.right - view.left) / (FRAME.maxX - FRAME.minX), h = (view.bottom - view.top) / (FRAME.maxY - FRAME.minY);
    return {left: view.left - FRAME.minX * w, bottom: view.bottom + FRAME.minY * h, width: w, height: h, view};
  }
  function camera(point, width, height, zoom = 2.8) {
    const area = bounds(width, height);
    return {zoom, x: width * .5 - area.left - point.x * area.width * zoom,
      y: height * .48 - area.bottom + point.y * area.height * zoom};
  }
  function extent(points) {
    const values = [...points.values()];
    if (!values.length) return null;
    return {minX:Math.min(...values.map(p=>p.x)),maxX:Math.max(...values.map(p=>p.x)),
      minY:Math.min(...values.map(p=>p.y)),maxY:Math.max(...values.map(p=>p.y))};
  }
  // The camera may not pan the data more than `padding` inside the visible box (bounds'
  // `view`; by default the area's own 0–1 box). Data smaller than the box is centered.
  function constrain(camera, area, extent, padding = 36) {
    if (!extent) return {...camera, x:0, y:0};
    const view = area.view || {left:area.left, right:area.left + area.width, top:area.bottom - area.height, bottom:area.bottom};
    const axis = (value, low, high) => low > high ? (low + high) / 2 : Math.max(low, Math.min(high, value));
    return {...camera,
      x:axis(camera.x,view.right-area.left-extent.maxX*area.width*camera.zoom-padding,view.left-area.left-extent.minX*area.width*camera.zoom+padding),
      y:axis(camera.y,view.bottom-area.bottom+extent.minY*area.height*camera.zoom-padding,view.top-area.bottom+extent.maxY*area.height*camera.zoom+padding)};
  }
  // Only separate a population that can fit comfortably at this zoom level.
  // The stable search starts at each rating coordinate and uses nearby free space.
  function spread(items, base, width, height) {
    const rated=items.filter(d=>base.has(d.id));
    if (!rated.length || rated.length*76*76 > width*height*.72) return null;
    const spacing=Math.min(112,Math.max(76,Math.sqrt(width*height/rated.length)*.65));
    const cells=new Map(),result=new Map();
    for(const d of [...rated].sort((a,b)=>a.id.localeCompare(b.id))){
      const origin=base.get(d.id);let chosen=origin;
      for(let i=0;i<2400;i++){
        const angle=i*2.399963229728653+seed(d.id)*Math.PI*2,radius=12*Math.sqrt(i);
        const x=origin.x*width+Math.cos(angle)*radius,y=origin.y*height+Math.sin(angle)*radius;
        if(x<0||x>width||y<0||y>height)continue;
        const cx=Math.floor(x/spacing),cy=Math.floor(y/spacing);let clear=true;
        for(let dx=-1;dx<=1&&clear;dx++)for(let dy=-1;dy<=1&&clear;dy++)
          for(const p of cells.get((cx+dx)+':'+(cy+dy))||[])if(Math.hypot(x-p.x,y-p.y)<spacing){clear=false;break;}
        if(clear){chosen={x:x/width,y:y/height};break;}
      }
      result.set(d.id,chosen);
      const x=chosen.x*width,y=chosen.y*height,key=Math.floor(x/spacing)+':'+Math.floor(y/spacing);
      if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x,y});
    }
    return result;
  }
  // Filters free space, and the visible discs spread into it. At `reference` visible discs or more
  // (the unfiltered catalog) the positions come back untouched. Below that, strength grows with
  // log(reference / count) and is full at `floor`:
  // - each disc's seeded scatter grows up to `scale` times, so speed moves at most ~1.7 units;
  // - neighbors repel to a spacing that grows with the room per disc, up to `spacing` px at 1x;
  // - past `bands` strength, discs are drawn into their score cohort's own column.
  // Every cohort stays centered on its stability index, so a higher-score cohort never sits left of
  // a lower-score one; at full strength the columns do not overlap at all.
  const ADAPT = {reference: 1000, floor: 40, scale: 2, spacing: 96, bands: .6, iterations: 48};
  function adaptStrength(count) {
    if (count >= ADAPT.reference) return 0;
    return Math.min(1, Math.log(ADAPT.reference / Math.max(1, count)) / Math.log(ADAPT.reference / ADAPT.floor));
  }
  let memo = null;
  function adapt(items, base, width, height, immersive = true) {
    const rated = items.filter(d => base.has(d.id)), u = adaptStrength(rated.length);
    if (!u || !rated.length) return base;
    if (memo && memo.items === items && memo.base === base && memo.width === width && memo.height === height && memo.immersive === immersive) return memo.result;
    const area = bounds(width, height, immersive), view = area.view, W = area.width, H = area.height;
    const k = 1 + (ADAPT.scale - 1) * u, reach = .062 * k, t = Math.max(0, (u - ADAPT.bands) / (1 - ADAPT.bands));
    const spacing = Math.min(ADAPT.spacing, .62 * Math.sqrt((view.right - view.left) * (view.bottom - view.top) / rated.length)) * Math.min(1, u * 2);
    // Anchors are rating coordinates without the scatter. A cohort shares one stability index.
    const discs = rated.map(d => {
      const p = base.get(d.id), s = scatter(d.id), ax = Math.round((p.x - s.x) * 1e6) / 1e6, ay = p.y - s.y;
      return {id: d.id, ax, ay, x: ax + s.x * k, y: Math.max(FRAME.minY, Math.min(FRAME.maxY, ay + s.y * k))};
    }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const anchors = [...new Set(discs.map(d => d.ax))].sort((a, b) => a - b);
    // A column reaches 40% of the way to each visible neighbor cohort; the outermost ones reach out to the frame.
    const cohorts = anchors.map((ax, i) => ({ax, members: [],
      lo: i ? ax - (ax - anchors[i - 1]) * .4 : Math.min(ax, Math.max(FRAME.minX, ax - reach)),
      hi: i < anchors.length - 1 ? ax + (anchors[i + 1] - ax) * .4 : Math.max(ax, Math.min(FRAME.maxX, ax + reach))}));
    const byAnchor = new Map(cohorts.map(c => [c.ax, c]));
    for (const d of discs) byAnchor.get(d.ax).members.push(d);
    const center = c => c.members.reduce((sum, d) => sum + d.x, 0) / c.members.length;
    // Recenter each cohort on its index, then blend toward its column. A column is compressed
    // into, not clamped, so no disc piles up on its edge.
    const project = strength => {
      for (const c of cohorts) {
        const mean = center(c) - c.ax;let left = 0, right = 0;
        for (const d of c.members) {d.dx = d.x - c.ax - mean;left = Math.min(left, d.dx);right = Math.max(right, d.dx);}
        const fitLeft = left < c.lo - c.ax ? (c.lo - c.ax) / left : 1, fitRight = right > c.hi - c.ax ? (c.hi - c.ax) / right : 1;
        for (const d of c.members) d.x = Math.max(FRAME.minX, Math.min(FRAME.maxX, c.ax + d.dx + (d.dx * (d.dx < 0 ? fitLeft : fitRight) - d.dx) * strength));
      }
    };
    project(t);
    for (let iteration = 0, crowded = spacing >= 1; crowded && iteration < ADAPT.iterations; iteration++) {
      const cells = new Map();crowded = false;
      for (const d of discs) {
        d.cx = Math.floor(d.x * W / spacing);d.cy = Math.floor(d.y * H / spacing);d.px = 0;d.py = 0;
        const key = d.cx * 8192 + d.cy;
        if (!cells.has(key)) cells.set(key, []);cells.get(key).push(d);
      }
      for (const d of discs) {
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of cells.get((d.cx + i) * 8192 + d.cy + j) || []) {
          if (o.id <= d.id) continue;
          let dx = (o.x - d.x) * W, dy = (o.y - d.y) * H;const distance = Math.hypot(dx, dy);
          if (distance >= spacing) continue;
          crowded = true;
          if (distance < 1e-6) {const angle = seed(d.id + ':' + o.id) * Math.PI * 2;dx = Math.cos(angle);dy = Math.sin(angle);}
          else {dx /= distance;dy /= distance;}
          const step = (spacing - distance) / 4;
          d.px -= dx * step / W;d.py -= dy * step / H;o.px += dx * step / W;o.py += dy * step / H;
        }
      }
      for (const d of discs) {
        d.x = Math.max(d.ax - reach, Math.min(d.ax + reach, d.x + d.px));
        d.y = Math.max(FRAME.minY, Math.min(FRAME.maxY, Math.max(d.ay - reach, Math.min(d.ay + reach, d.y + d.py))));
      }
      project(t);
    }
    // The frame can only bite the outermost discs; if it ever unsettles the order, use strict columns.
    if (cohorts.some((c, i) => i && center(cohorts[i - 1]) >= center(c))) project(1);
    const result = new Map(discs.map(d => [d.id, {x: d.x, y: d.y}]));
    memo = {items, base, width, height, immersive, result};
    return result;
  }
  return {positions, camera, bounds, extent, constrain, spread, adapt, adaptStrength, FRAME, ADAPT};
})();
