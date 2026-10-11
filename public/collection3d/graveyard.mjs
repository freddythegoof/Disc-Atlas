// The Lost tab's graveyard: a small lawn with one headstone per lost disc, newest at the front. Each stone
// is engraved (here lies, the disc's name, its dates, where it went, an epitaph) and the disc itself rests
// on the little mound in front, in its own colour and mold shape. The selected plot gets a pale ring (it
// reads on the green by lightness, not hue), and the selected and hovered stones carry billboard name tags
// that stay readable while the yard turns. A new loss rises out of the lawn; a disc that's found floats up
// and away while its stone sinks.
import {THREE,SceneView,discModel,contactShadow,disposeObject,reduced,ease} from './stage.mjs';
import {plots,graveColumns,PLOT_WIDTH,PLOT_DEPTH} from './graveyard-layout.mjs';

const STONE_W=.46,STONE_H=.6,STONE_D=.09,FACE_W=STONE_W*.86,ENTER_MS=760,LEAVE_MS=1100,MOVE_MS=520;
const STONES=['#e2ded5','#d9d7d0','#e6dfd2'];
// A real lawn green, darker than the stones so they stand out by lightness for every kind of colour vision.
const LAWN='#3c7a33',MOUND='#336c2d',RING='#f7f2e8';
const INK='rgba(26,24,21,1)',LIP='rgba(255,255,255,.62)';
const ABOVE_GROUND=new THREE.Plane(new THREE.Vector3(0,1,0),0);

function stoneShape(variant){
 const w=STONE_W/2,h=STONE_H,s=new THREE.Shape();s.moveTo(-w,0);
 if(variant===1){s.lineTo(-w,h*.62);s.quadraticCurveTo(-w,h*.93,0,h);s.quadraticCurveTo(w,h*.93,w,h*.62);}
 else if(variant===2){const r=.07;s.lineTo(-w,h-r);s.quadraticCurveTo(-w,h,-w+r,h);s.lineTo(w-r,h);s.quadraticCurveTo(w,h,w,h-r);}
 else{s.lineTo(-w,h-w);s.absarc(0,h-w,w,Math.PI,0,true);}
 s.lineTo(w,0);s.lineTo(-w,0);return s;
}
const stoneGeometries=[0,1,2].map(v=>{
 const g=new THREE.ExtrudeGeometry(stoneShape(v),{depth:STONE_D,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:10});
 g.translate(0,0,-STONE_D/2);g.computeVertexNormals();return g;
});

// The engraving, on a transparent plane over the stone's face. Sized to be read at the yard's normal
// distance: the name large, the dates and the hole and course in bold beneath it, the epitaph in up to three
// lines. The name and HERE LIES are carved (a dark cut with a light lower lip); the smaller lines are plain
// dark ink, which stays crisp where a lip would blur.
function engraving(lines,variant,size){
 const w=size,h=Math.round(size*1.25),c=document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d'),k=w/256,serif="Georgia,'Times New Roman',serif";
 g.textAlign='center';g.textBaseline='alphabetic';
 const fontOf=(font,px)=>`${font.style||''} ${font.weight||400} ${px*k}px ${serif}`;
 const write=(text,y,font,max,carved=false)=>{
  let px=font.size;g.font=fontOf(font,px);
  while(px>font.min&&g.measureText(text).width>max*k){px-=1;g.font=fontOf(font,px);}
  let shown=text;while(g.measureText(shown).width>max*k&&shown.length>3)shown=shown.slice(0,-2).trimEnd()+'…';
  if(carved){g.fillStyle=LIP;g.fillText(shown,w/2+.8*k,y*k+1.2*k);}
  g.fillStyle=INK;g.fillText(shown,w/2,y*k);
 };
 const top=variant===1?84:variant===2?54:64,width=variant===1?196:222;
 g.save();g.font=`700 ${15*k}px ${serif}`;if('letterSpacing' in g)g.letterSpacing=`${3.5*k}px`;
 g.fillStyle=LIP;g.fillText('HERE LIES',w/2+.8*k,top*k+1.2*k);g.fillStyle=INK;g.fillText('HERE LIES',w/2,top*k);g.restore();
 write(lines.name,top+52,{size:56,min:26,weight:700},width-6,true);
 g.fillStyle=INK;g.fillRect(w/2-34*k,(top+66)*k,68*k,2.6*k);
 write(lines.dates,top+98,{size:27,min:16,weight:700},width);
 if(lines.place)write(lines.place,top+128,{size:25,min:15,weight:700},width);
 // The epitaph wraps to at most three lines.
 const words=String(lines.epitaph||'').split(/\s+/).filter(Boolean),rows=[];let row='';
 g.font=fontOf({style:'italic',weight:600},22);
 for(const word of words){const next=row?row+' '+word:word;if(g.measureText(next).width>width*k&&row){rows.push(row);row=word;}else row=next;}
 if(row)rows.push(row);
 rows.slice(0,3).forEach((text,i)=>write(i===2&&rows.length>3?text+'…':text,top+(lines.place?162:134)+i*26,{size:22,min:15,style:'italic',weight:600},width));
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/** Mount into a sized host. update(entries): {id, d, color, rimColor, name, lines:{name,dates,place,epitaph}}, newest first. */
export async function mountGraveyard(host,{onPick=()=>{},onHover=()=>{},onCamera=()=>{},onZoom=()=>{}}={}){
 const plotsById=new Map();let selected=null,hovered=null,columns=0,first=true,order=[];
 const view=new SceneView(host,{label:'Lost disc graveyard',yaw:-.12,pitch:.42,yawLimit:.7,maxZoom:3.5,onTap:p=>tap(p),onHover:p=>hover(p),onCamera});
 view.onZoom=onZoom;view.stage.renderer.localClippingEnabled=true;
 view.light({keyShadow:view.stage.quality==='fine'?2048:1024});
 const lawnMaterial=new THREE.MeshStandardMaterial({color:LAWN,roughness:1});
 const moundMaterial=new THREE.MeshStandardMaterial({color:MOUND,roughness:1});moundMaterial.userData.shared=true;
 const moundGeometry=new THREE.SphereGeometry(1,20,8,0,Math.PI*2,0,Math.PI/2);
 let lawn=null;const shadow=contactShadow(1,1,.9);view.scene.add(shadow);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.212,.242,56),new THREE.MeshBasicMaterial({color:RING,transparent:true,opacity:.95,depthWrite:false}));
 ring.rotation.x=-Math.PI/2;ring.scale.set(1,1.22,1);ring.visible=false;view.scene.add(ring);
 const yard=new THREE.Group();view.scene.add(yard);
 const anisotropy=Math.min(8,view.stage.renderer.capabilities.getMaxAnisotropy());
 // Billboard names over the selected stone and the hovered one (which stays put through a drag).
 const selectedTag=view.tag(),hoverTag=view.tag(),top=new THREE.Vector3();
 function tagStone(tag,id){
  const plot=id&&plotsById.get(id);if(!plot||plot.state==='leaving'||!plot.name){tag.hide();return;}
  tag.set(plot.name);top.set(0,STONE_H+.012,0);plot.headstone.localToWorld(top);
  tag.at(top,plot.state==='entering'?Math.max(0,(performance.now()-plot.t0)/ENTER_MS*2-1):1);
 }
 function placeTags(){tagStone(selectedTag,selected);if(hovered!==selected)tagStone(hoverTag,hovered);else hoverTag.hide();}

 function makePlot(e,spot){
  const group=new THREE.Group(),stoneMaterial=new THREE.MeshStandardMaterial({color:STONES[spot.variant],roughness:.92,clippingPlanes:[ABOVE_GROUND]});
  const stone=new THREE.Mesh(stoneGeometries[spot.variant],stoneMaterial);stone.castShadow=true;stone.receiveShadow=true;stone.userData.sharedGeometry=true;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(FACE_W,FACE_W*1.25),new THREE.MeshStandardMaterial({transparent:true,roughness:.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,clippingPlanes:[ABOVE_GROUND]}));
  face.position.set(0,STONE_H*.5,STONE_D/2+.0125);
  const headstone=new THREE.Group();headstone.add(stone,face);headstone.rotation.set(THREE.MathUtils.degToRad(-spot.lean*.5),THREE.MathUtils.degToRad(spot.turn),THREE.MathUtils.degToRad(spot.lean));
  const mound=new THREE.Mesh(moundGeometry,moundMaterial);mound.scale.set(.19,.045,.27);mound.position.set(0,0,.3);mound.receiveShadow=true;mound.userData.sharedGeometry=true;
  group.add(headstone,mound);yard.add(group);
  const plot={id:e.id,group,headstone,stone,face,mound,disc:null,key:'',x:spot.x,z:spot.z,from:null,t0:0,state:'here'};
  plotsById.set(e.id,plot);return plot;
 }
 function dress(plot,e){
  const key=JSON.stringify([e.lines,e.color,e.rimColor,e.d?.id,plotsById.size>12]);if(plot.key===key)return;plot.key=key;
  plot.name=e.lines.name;
  const texture=engraving(e.lines,stoneVariant(plot),plotsById.size>12?320:512);texture.anisotropy=anisotropy;
  plot.face.material.map?.dispose();plot.face.material.map=texture;plot.face.material.needsUpdate=true;
  if(plot.disc){plot.group.remove(plot.disc);disposeObject(plot.disc);}
  const disc=discModel(e.d,{color:e.color,rimColor:e.rimColor,name:e.name});
  const t=disc.userData.parts.thickness;disc.position.set(.01,.045+t/2-.004,.3);disc.rotation.set(-.12,THREE.MathUtils.degToRad((plot.x*97)%40-20),.06);
  plot.disc=disc;plot.group.add(disc);
 }
 const stoneVariant=plot=>stoneGeometries.indexOf(plot.stone.geometry);
 function layout(){
  const n=order.length;columns=graveColumns(view.size.w||host.clientWidth||360,n);
  const spots=plots(order,Math.max(1,columns)),rows=spots.length?spots[0].rows:1;
  const width=Math.max(1,Math.min(n,columns))*PLOT_WIDTH+PLOT_WIDTH*.55,depth=rows*PLOT_DEPTH+.25;
  // The lawn: a softly bevelled slab, just big enough for the plots.
  if(lawn){yard.remove(lawn);lawn.geometry.dispose();}
  const shape=new THREE.Shape(),r=.12,w=width/2,d=depth/2;
  shape.moveTo(-w+r,-d);shape.lineTo(w-r,-d);shape.quadraticCurveTo(w,-d,w,-d+r);shape.lineTo(w,d-r);shape.quadraticCurveTo(w,d,w-r,d);shape.lineTo(-w+r,d);shape.quadraticCurveTo(-w,d,-w,d-r);shape.lineTo(-w,-d+r);shape.quadraticCurveTo(-w,-d,-w+r,-d);
  const g=new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:2,curveSegments:6});
  g.rotateX(Math.PI/2);lawn=new THREE.Mesh(g,lawnMaterial);lawn.receiveShadow=true;
  const zMid=-(rows-1)*PLOT_DEPTH/2+.12;// The bevel lifts the slab's top .015 above its depth; sink it so the lawn's top is y = 0.
  lawn.position.set(0,-.016,zMid);yard.add(lawn);
  shadow.scale.set(width+.5,depth+.5,1);shadow.position.set(0,-.08,zMid);
  const now=performance.now(),animate=!first&&!reduced();
  for(const spot of spots){
   const plot=plotsById.get(spot.id);if(!plot)continue;
   if(animate&&plot.state==='here'&&(plot.x!==spot.x||plot.z!==spot.z)){plot.from=[plot.group.position.x,plot.group.position.z];plot.t0=now;}
   plot.x=spot.x;plot.z=spot.z;
   if(!plot.t0||plot.state!=='here')plot.group.position.set(spot.x,0,spot.z);
  }
  const box=new THREE.Box3(new THREE.Vector3(-w,-.07,zMid-d),new THREE.Vector3(w,STONE_H+.04,zMid+d));
  view.aimShadow(box);return box;
 }
 function update(entries){
  const now=performance.now(),animate=!first&&!reduced(),ids=new Set(entries.map(e=>e.id));
  // Found discs leave: the disc floats up and away, the stone sinks into the lawn.
  for(const plot of plotsById.values())if(!ids.has(plot.id)&&plot.state!=='leaving'){
   if(!animate){remove(plot);continue;}
   plot.state='leaving';plot.t0=now;
   plot.disc?.traverse(o=>{if(o.isMesh){o.material.transparent=true;}});
  }
  order=entries.map(e=>e.id);
  for(const e of entries){
   let plot=plotsById.get(e.id);
   if(!plot){const spot=plots([e.id],1)[0];plot=makePlot(e,spot);if(animate){plot.state='entering';plot.t0=now;}}
   dress(plot,e);
  }
  const box=layout();
  if(first||!view.rig.box.equals(box))view.frame(box,{instant:first||reduced()});
  if(selected&&(!ids.has(selected)))selected=null;
  placeRing();first=false;view.shadowsDirty=true;view.request();
  host.dataset.graves=String(entries.length);
 }
 function remove(plot){yard.remove(plot.group);plot.face.material.map?.dispose();disposeObject(plot.group);plotsById.delete(plot.id);}
 function placeRing(){
  const plot=selected&&plotsById.get(selected);
  ring.visible=!!plot&&plot.state!=='leaving';if(!ring.visible)return;
  ring.position.set(plot.group.position.x,.003,plot.group.position.z+.3);
 }
 view.resized=()=>{if(order.length&&graveColumns(view.size.w,order.length)!==columns){const box=layout();view.frame(box);}};
 view.ticks.add(now=>{
  let more=false;
  for(const plot of [...plotsById.values()]){
   if(!plot.t0)continue;
   if(plot.state==='entering'){
    const t=Math.min(1,(now-plot.t0)/ENTER_MS),e=ease(t);
    plot.headstone.position.y=-STONE_H*(1-e);if(plot.disc)plot.disc.visible=t>.55;
    if(t<1)more=true;else{plot.state='here';plot.t0=0;plot.headstone.position.y=0;}
   }else if(plot.state==='leaving'){
    const t=Math.min(1,(now-plot.t0)/LEAVE_MS),e=ease(t);
    plot.headstone.position.y=-STONE_H*1.05*ease(Math.max(0,(t-.25)/.75));
    if(plot.disc){plot.disc.position.y=.07+e*1.1;plot.disc.rotation.y=e*Math.PI*3;plot.disc.traverse(o=>{if(o.isMesh)o.material.opacity=1-Math.max(0,(t-.45)/.55);});}
    if(t<1)more=true;else remove(plot);
   }else if(plot.from){
    const t=Math.min(1,(now-plot.t0)/MOVE_MS),e=ease(t);
    plot.group.position.set(plot.from[0]+(plot.x-plot.from[0])*e,0,plot.from[1]+(plot.z-plot.from[1])*e);
    if(t<1)more=true;else{plot.from=null;plot.t0=0;}
   }
  }
  placeRing();placeTags();return more;
 });
 function idAt(p){
  const hit=view.pick(p,[yard])[0];if(!hit)return null;
  for(let o=hit.object;o;o=o.parent)for(const plot of plotsById.values())if(plot.group===o)return plot.state==='leaving'?null:plot.id;
  return null;
 }
 function tap(p){const id=idAt(p);if(id){select(id);onPick(id);}}
 function hover(p){const id=p?idAt(p):null;if(id!==hovered){hovered=id;host.style.cursor=id?'pointer':'';view.request();}onHover(id,p);}
 function select(id){selected=plotsById.has(id)?id:null;placeRing();view.request();}
 return {
  update,select,
  show(){view.show();},hide(){view.hide();},
  zoomBy(f){view.setZoom(view.zoom*f);},zoomTo(z){view.setZoom(z);},get zoom(){return view.zoom;},
  turnBy(rad){view.turnBy(rad);},
  // The billboard names on show, with their canvas positions (tests).
  get tags(){return [selectedTag,hoverTag].filter(t=>t.shown).map(t=>({text:t.text,...view.project(t.sprite.position)}));},
  // Each headstone's top centre in canvas CSS px, for the keyboard targets over the canvas.
  anchors(){return [...plotsById.values()].filter(p=>p.state!=='leaving').map(p=>{const at=new THREE.Vector3(0,STONE_H*.5,0);p.headstone.localToWorld(at);const s=view.project(at);const top=new THREE.Vector3(0,STONE_H,0);p.headstone.localToWorld(top);const t=view.project(top);const base=new THREE.Vector3(0,0,.42);p.group.localToWorld(base);const b=view.project(base);return {id:p.id,x:s.x,y:s.y,top:t.y,bottom:b.y,width:Math.abs(b.y-t.y)*.75,visible:s.visible};});},
  get state(){return {graves:[...plotsById.values()].filter(p=>p.state!=='leaving').length,leaving:[...plotsById.values()].filter(p=>p.state==='leaving').length,selected,columns,zoom:view.zoom,quality:view.stage.quality,frames:view.frames||0,moving:[...plotsById.values()].some(p=>p.t0)};},
  get info(){const i=view.stage.renderer.info.render;return {calls:i.calls,triangles:i.triangles};},
  dispose(){for(const plot of [...plotsById.values()])remove(plot);view.dispose();moundGeometry.dispose();moundMaterial.dispose();},
 };
}
