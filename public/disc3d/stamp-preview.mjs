// The Appearance sheet's stamp preview (docs/display-customization.md): one disc with an official stock stamp,
// built from the viewer's own pieces (lathe, stamp layer, plastic, environment and lights), so what it shows is
// what the viewer and the bag will draw. It rocks gently so a foil can be seen catching the light; with reduced
// motion it holds one angle. It draws only while the sheet is open.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {discGeometry,PLASTICS} from './mesh.mjs';
import {shapeForDisc,normalizeShape} from './shape.mjs';
import {stampTexture,stampGeometry,stampMaterial,catalogStampAsset,catalogStampPlacement} from './stamp.mjs';
import {DETAIL,detailPixelRatio} from './quality.mjs';

// A mid-blue premium plastic: Auto ink shows white on it, and gold, silver and rainbow foils all read.
const PLATE='#4a78a8';

export function createStampPreview(canvas,disc){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(detailPixelRatio());renderer.toneMapping=THREE.NeutralToneMapping;renderer.setClearColor(0,0);
 const scene=new THREE.Scene(),pmrem=new THREE.PMREMGenerator(renderer);
 const env=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
 scene.environment=env;scene.environmentIntensity=DETAIL.environment;
 const key=new THREE.DirectionalLight(0xffffff,1.5);key.position.set(-6,14,10);scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(5,-12,7);scene.add(fill);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8090a0,.5));
 // Mostly from above, so the stamp reads; the rock below still sweeps it through the light.
 const camera=new THREE.PerspectiveCamera(28,1,.5,400);camera.position.set(0,34,14);camera.lookAt(0,0,0);

 const shape=shapeForDisc({model:disc?.model3d,specs:disc?.specs,flight:disc})?.shape||normalizeShape({});
 const {geometry}=discGeometry(shape,{segments:96});geometry.computeBoundingBox();
 const centre=(geometry.boundingBox.min.y+geometry.boundingBox.max.y)/2;geometry.translate(0,-centre,0);
 const body=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color:PLATE,...PLASTICS.premium}));
 const asset=catalogStampAsset(disc),placement=asset?catalogStampPlacement(disc):null;
 const ring=stampGeometry(shape,{placement});ring.translate(0,-centre,0);
 const stamp=new THREE.Mesh(ring,stampMaterial());
 const disc3=new THREE.Group().add(body,stamp);scene.add(disc3);
 camera.position.setLength(shape.diameter*2.45);camera.lookAt(0,0,0);

 let frame=0,running=false,style=null,disposed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const render=(t=performance.now())=>{
  // A slow rock and turn: the stamp sweeps through the key light's highlight and the room's reflections.
  const s=reduced.matches?.9:t/1000;
  disc3.rotation.set(Math.sin(s*.9)*.32,s*.35,Math.cos(s*.7)*.18);
  const {clientWidth:w,clientHeight:h}=canvas;
  if(w&&h&&(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio()))){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  renderer.render(scene,camera);
 };
 const loop=t=>{if(!running||disposed)return;render(t);frame=reduced.matches?0:requestAnimationFrame(loop);};
 function setStyle(next){
  style=next||null;
  stamp.material.map?.dispose();stamp.material.dispose();
  stamp.material=stampMaterial(style);
  stamp.material.map=stampTexture(disc?.catalogName||disc?.name||'Disc',PLATE,{asset,style,onChange:()=>render()});
  stamp.material.needsUpdate=true;render();
 }
 setStyle(null);
 return {
  setStyle,
  get finish(){return stamp.material.userData.stampFinish||'flat';},
  start(){if(running)return;running=true;cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);},
  stop(){running=false;cancelAnimationFrame(frame);frame=0;},
  render,
  dispose(){disposed=true;this.stop();stamp.material.map?.dispose();stamp.material.dispose();ring.dispose();body.material.dispose();geometry.dispose();env.dispose();renderer.dispose();}
 };
}
