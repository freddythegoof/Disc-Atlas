// Clay mode's cross-section (Prompt 4): the full slice through the disc's axis, both halves, the way mold
// diagrams are drawn. It is drawn from the very points the viewer's lathe spins (mesh.mjs lathePoints), never
// from a second shape source, at true scale on the same fixed 22 cm frame as the 3D camera, so a 21.7 cm
// Buzzz draws wider than a 21.1 cm Destroyer here too. Static SVG, rebuilt only when the disc or the width
// changes. Pure JS, no three.js, so Node tests read it.
import {shapeFrame,topHeight} from './shape.mjs';
//
// Dimensions are annotated only when the shape comes from the mold's PDGA dimensions, and the numbers are the
// spec strings the detail panel shows (data.json `specs`), never values measured off the model. A generic shape
// from flight numbers is drawn unannotated and labelled as such.

// The clay tones, shared with the 3D materials: a mid-grey plate and, on overmold discs, a darker rim piece.
export const CLAY_TONES=Object.freeze({plate:'#b3b3af',rim:'#6c6c6a'});
export const PROFILE_FRAME=22;   // cm across the drawing's width, as the viewer's FRAME_DIAMETER
const SPEC={diameter:'Diameter',height:'Height',rimWidth:'Rim width',rimDepth:'Rim depth'};
const LABELS={model:'its mold profile',pdga:'its PDGA dimensions, to scale',flight:'a generic shape from its flight numbers'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const n=v=>+v.toFixed(1);

// The spec values to print, as the panel prints them ("2.2 cm"), or null when a value is missing.
export function profileDimensions(specs){
 if(!specs||typeof specs!=='object')return null;
 const out={};
 for(const [key,label] of Object.entries(SPEC)){const v=specs[label];if(v==null||String(v).trim()==='')return null;out[key]=`${String(v).trim()} cm`;}
 return out;
}

// {points, rim} from lathePoints; `shape` the params they were traced from (for where the dimension lines go);
// `source` the viewer's shape source; `specs` the record's PDGA specs; `width` the drawing's CSS width in px.
// Returns {svg, label, caption, dims}.
export function profileSVG({points,rim},{shape,source,specs,width=320,mold='disc'}={}){
 const dims=source==='pdga'?profileDimensions(specs):null;
 const W=Math.max(200,Math.round(width)),padX=dims?22:14,s=(W-2*padX)/PROFILE_FRAME,cx=W/2;
 const R=Math.max(...points.map(p=>p.x)),top=Math.max(...points.map(p=>p.y)),bottom=Math.min(...points.map(p=>p.y));
 const discTop=dims?32:10,base=discTop+(top-bottom)*s,H=Math.ceil(base+(dims?34:10));
 const X=x=>n(cx+x*s),Y=y=>n(base-(y-bottom)*s);
 const right=points.map(p=>[X(p.x),Y(p.y)]),left=points.map(p=>[X(-p.x),Y(p.y)]);
 const path=list=>'M'+list.map(([x,y])=>`${x} ${y}`).join('L')+'Z';
 // The whole silhouette: the right half axis to axis, then the left half back.
 const outline=path([...right,...left.slice().reverse()]);
 let rims='';
 if(rim){const [a,b]=rim;rims=[right,left].map(side=>`<path class="disc3d-profile-rim" d="${path(side.slice(a,b+1))}" fill="${CLAY_TONES.rim}"/>`).join('');}
 let marks='';
 if(dims){
  const line=(x1,y1,x2,y2,dash)=>`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"${dash?' class="ext"':''}/>`;
  const text=(x,y,t,anchor)=>`<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}">${esc(t)}</text>`;
  // The inner rim wall (R − rim width) and the underside of the plate there (rim depth), from the same shape.
  const f=shapeFrame(shape),wall=f.Ri,depthTop=bottom+f.p.rimDepth;
  const yTop=discTop,yDim=yTop-8,yDia=base+11,xH=cx-R*s-10;
  marks=[
   // Height: a vertical dimension left of the nose, foot line to the top of the dome.
   line(xH,Y(bottom),xH,yTop),line(xH-3,Y(bottom),xH+3,Y(bottom)),line(xH-3,yTop,xH+3,yTop),line(xH,yTop,cx,yTop,true),
   text(xH-3,yDim-4,`Height ${dims.height}`,'start'),
   // Rim width: nose to the inner rim wall, above the right rim.
   line(cx+wall*s,yDim,cx+R*s,yDim),line(cx+wall*s,yDim-3,cx+wall*s,yDim+3),line(cx+R*s,yDim-3,cx+R*s,yDim+3),
   line(cx+wall*s,yDim+3,cx+wall*s,Y(bottom+topHeight(shape,wall))-2,true),line(cx+R*s,yDim+3,cx+R*s,Y(bottom+f.plh)-2,true),
   text(cx+R*s+3,yDim-4,`Rim width ${dims.rimWidth}`,'end'),
   // Rim depth: the foot up the inner wall to the underside of the flight plate, inside the cavity.
   line(cx+wall*s-5,Y(bottom),cx+wall*s-5,Y(depthTop)),line(cx+wall*s-8,Y(depthTop),cx+wall*s-2,Y(depthTop)),
   text(cx+wall*s-10,(Y(bottom)+Y(depthTop))/2+3.5,`Rim depth ${dims.rimDepth}`,'end'),
   // Diameter: nose to nose, under the slice.
   line(cx-R*s,yDia,cx+R*s,yDia),line(cx-R*s,yDia-3,cx-R*s,yDia+3),line(cx+R*s,yDia-3,cx+R*s,yDia+3),
   text(cx,yDia+15,`Diameter ${dims.diameter}`,'middle'),
  ].join('');
 }
 const label=`Cross-section of the ${mold}, from ${LABELS[source]||LABELS.flight}${dims?`: diameter ${dims.diameter}, height ${dims.height}, rim width ${dims.rimWidth}, rim depth ${dims.rimDepth}`:''}.`;
 const svg=`<svg class="disc3d-profile-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" data-scale="${s}" data-cx="${cx}" data-base="${base}" data-bottom="${bottom}">`+
  `<path class="disc3d-profile-outline" d="${outline}" fill="${CLAY_TONES.plate}"/>${rims}`+
  (marks?`<g class="disc3d-profile-dims">${marks}</g>`:'')+'</svg>';
 return {svg,label,caption:`Cross-section · ${LABELS[source]||LABELS.flight}`,dims};
}
