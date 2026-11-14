import {readFileSync} from 'node:fs';
import {shapeForDisc,shapeFrame} from '../../public/disc3d/shape.mjs';
import {isOvermold} from '../../public/disc3d/overmold.mjs';
const {discs}=JSON.parse(readFileSync(new URL('../../public/data.json',import.meta.url)));
for(const id of process.argv.slice(2)){
 const d=discs.find(x=>x.id===id);if(!d){console.log(id,'missing');continue;}
 const r=shapeForDisc({model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade}});
 const {R,Rs,Ri}=shapeFrame(r.shape);
 console.log(id,d.name,(isOvermold({overmold:typeof d.overmold==='boolean'?d.overmold:undefined,manufacturer:d.manufacturer,record:d.name})?Ri:Rs)/R);
}
