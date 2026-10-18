// Stamp levelling (docs/photo-stamp-orientation.md): a test photo with a known tilt, and the measurement that
// reads a stamp's angle back off any image (a texture, the aligner, a 3D render). Pure JS plus canvas: runs in
// the browser (served to tests/photo-stamp-level-browser.mjs).

// A phone-style photo of a disc on a grey table, lit from the top left. The stamp is a long bar with two
// shorter "text" bars above and below it, dark on an orange plate, turned `tilt` degrees (clockwise
// positive, as on screen) about the disc's centre. The disc fills the default framing (scale .94).
// stamp:false draws the same disc without its stamp (the blank a render is compared with).
export function crookedPhoto({width=1600,height=1200,tilt=-3,stamp=true}={}){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const g=canvas.getContext('2d');
 const table=g.createLinearGradient(0,0,width,height);table.addColorStop(0,'#8b8d90');table.addColorStop(1,'#5d5f62');g.fillStyle=table;g.fillRect(0,0,width,height);
 const cx=width/2,cy=height/2,r=Math.min(width,height)*.94/2;
 const plate=g.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r*1.1);plate.addColorStop(0,'#f2884a');plate.addColorStop(1,'#c9582a');
 g.fillStyle=plate;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.fill();
 if(stamp){
  g.save();g.translate(cx,cy);g.rotate(tilt*Math.PI/180);g.fillStyle='#1d1f2b';
  g.fillRect(-r*.62,-r*.035,r*1.24,r*.07);                                   // the stamp's long bar
  for(const [y,w] of [[-.2,.8],[.2,.56]])g.fillRect(-r*w/2,r*(y-.025),r*w,r*.05); // two lines of "text"
  g.restore();
 }
 return canvas;
}

const luma=(data,k)=>(.2126*data[k]+.7152*data[k+1]+.0722*data[k+2])/255;
// The angle of a set of pixels, in degrees, clockwise positive (y down), from their second moments: 0 when
// the stamp's long bars run level.
function angleOf(width,height,keep){
 let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){if(!keep(x,y,4*(y*width+x)))continue;n++;sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y;}
 if(n<50)return NaN;
 const mx=sx/n,my=sy/n,cxx=sxx/n-mx*mx,cyy=syy/n-my*my,cxy=sxy/n-mx*my;
 return .5*Math.atan2(2*cxy,cxx-cyy)*180/Math.PI;
}

// A flat texture: the dark stamp pixels inside `inner` of the disc's radius.
export function stampAngle(data,width,{inner=.8,dark=.35}={}){
 const height=data.length/4/width,c=width/2,r=Math.min(width,height)/2;
 return angleOf(width,height,(x,y,k)=>Math.hypot(x+.5-c,y+.5-height/2)<=r*inner&&data[k+3]>=200&&luma(data,k)<dark);
}

// A render: the same view drawn with the photo (`stamped`) and with the stamp-free blank (`blank`). Glossy
// plastic lifts the near-black ink to a mid grey, so a stamp pixel is one that lost most of the plate's warmth
// (red over blue) in the same pixel of the blank: the scene's light, the model's shading and the background
// cancel out. Only the middle of the plate counts (`inner` of the blank's orange extent, an ellipse in 3/4).
export function renderedStampAngle(stamped,blank,width,{inner=.8,ratio=.5}={}){
 const height=blank.length/4/width;let lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const k=4*(y*width+x);if(blank[k]-blank[k+2]<60||blank[k]<140)continue;lo=[Math.min(lo[0],x),Math.min(lo[1],y)];hi=[Math.max(hi[0],x),Math.max(hi[1],y)];}
 if(lo[0]===Infinity)return NaN;
 const cx=(lo[0]+hi[0]+1)/2,cy=(lo[1]+hi[1]+1)/2,rx=(hi[0]-lo[0]+1)/2,ry=(hi[1]-lo[1]+1)/2;
 return angleOf(width,height,(x,y,k)=>Math.hypot((x+.5-cx)/rx,(y+.5-cy)/ry)<=inner&&blank[k]-blank[k+2]>40&&stamped[k]-stamped[k+2]<(blank[k]-blank[k+2])*ratio);
}

// Pixels of a canvas or image source as {data,width,height}.
export function pixelsOf(source){
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0);
 return {data:g.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height};
}
