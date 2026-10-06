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
  return {positions, camera, bounds, extent, constrain, spread, FRAME};
})();
