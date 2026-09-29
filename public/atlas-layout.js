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
    const top = immersive ? 100 : 36;
    const bottom = immersive ? (width < 700 ? 240 : 205) : 70;
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
  function extent(points) {
    const values = [...points.values()];
    if (!values.length) return null;
    return {minX:Math.min(...values.map(p=>p.x)),maxX:Math.max(...values.map(p=>p.x)),
      minY:Math.min(...values.map(p=>p.y)),maxY:Math.max(...values.map(p=>p.y))};
  }
  function constrain(camera, area, extent, padding = 36) {
    if (!extent) return {...camera, x:0, y:0};
    const axis = (value, low, high) => low > high ? (low + high) / 2 : Math.max(low, Math.min(high, value));
    return {...camera,
      x:axis(camera.x,area.width-extent.maxX*area.width*camera.zoom-padding,-extent.minX*area.width*camera.zoom+padding),
      y:axis(camera.y,extent.minY*area.height*camera.zoom-padding,extent.maxY*area.height*camera.zoom-area.height+padding)};
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
  return {positions, camera, bounds, extent, constrain, spread};
})();
