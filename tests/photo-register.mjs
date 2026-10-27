// One-dot registration (docs/photo-adder-rework.md): the rim fit, the camera's centres, the homography and the level, on
// discs photographed by a known camera, so every answer has a true value to meet.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findDisc,poseCentres,registration,cropThrough,levelAngle,autoRegister,throughH,SQUASH_CAP} from '../public/disc-register.mjs';
import {photoPoint} from '../public/disc-photo.mjs';

// A disc of radius 1 in its own plane, photographed: centre (X, Y, Z) in camera space, tilted by `tilt`° about an axis in
// the image at `axis`°, its pattern turned `spin`° in its plane. The pattern: blue plate, a darker rim band, level and
// plumb ink lines at ±0.3 and ±0.5, a red centre dot. 2×2 supersampled.
function photograph({w=1200,h=1600,f=0.58*Math.hypot(1200,1600),X=0,Y=0,Z=4,tilt=0,axis=0,spin=0,background=[150,150,145]}={}){
 const t=tilt*Math.PI/180,a=axis*Math.PI/180,s=spin*Math.PI/180;
 // Rotation about the in-image axis (cos a, sin a, 0) by t.
 const k=[Math.cos(a),Math.sin(a),0],rot=v=>{const c=Math.cos(t),sn=Math.sin(t),d=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],x=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];return v.map((vi,i)=>vi*c+x[i]*sn+k[i]*d*(1-c));};
 const e1=rot([Math.cos(s),Math.sin(s),0]),e2=rot([-Math.sin(s),Math.cos(s),0]),n=rot([0,0,1]),C=[X,Y,Z],nC=n[0]*C[0]+n[1]*C[1]+n[2]*C[2];
 const data=new Uint8ClampedArray(w*h*4),colour=(u,v)=>{
  const d=[(u-w/2)/f,(v-h/2)/f,1],tt=nC/(n[0]*d[0]+n[1]*d[1]+n[2]*d[2]),P=d.map(x=>x*tt-0),L=[P[0]-C[0],P[1]-C[1],P[2]-C[2]];
  const x=L[0]*e1[0]+L[1]*e1[1]+L[2]*e1[2],y=L[0]*e2[0]+L[1]*e2[1]+L[2]*e2[2],r=Math.hypot(x,y);
  if(r>1)return background;if(r>.9)return [20,60,140];if(r<.04)return [220,30,30];
  for(const g of [-.5,-.3,.3,.5])if(Math.abs(x-g)<.012&&Math.abs(y)<.6||Math.abs(y-g)<.012&&Math.abs(x)<.6)return [15,15,20];
  return [70,140,220];
 };
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){let r=0,g=0,b=0;for(const [dx,dy] of [[.25,.25],[.75,.25],[.25,.75],[.75,.75]]){const c=colour(i+dx,j+dy);r+=c[0];g+=c[1];b+=c[2];}const p=(j*w+i)*4;data[p]=r/4;data[p+1]=g/4;data[p+2]=b/4;data[p+3]=255;}
 // Where the disc's own centre lands in the photo (pixel centres on indices).
 return {data,w,h,f,centre:{x:f*X/Z+w/2-.5,y:f*Y/Z+h/2-.5}};
}
// The red centre dot's centroid in a registered crop, in crop radii.
function redDot(crop,size){let sx=0,sy=0,n=0;for(let p=0;p<size*size;p++){const k=4*p;if(crop[k]>150&&crop[k+1]<90&&crop[k+3]){sx+=p%size+.5;sy+=Math.floor(p/size)+.5;n++;}}return n?{x:sx/n/(size/2)-1,y:sy/n/(size/2)-1}:null;}

test('the rim is found on a disc shot square on, with a hand-sized occlusion',()=>{
 const shot=photograph();
 // A hand over a sixth of the rim.
 for(let j=1000;j<1500;j++)for(let i=0;i<450;i++){const p=(j*shot.w+i)*4;shot.data[p]=225;shot.data[p+1]=180;shot.data[p+2]=150;}
 const disc=findDisc(shot.data,shot.w,shot.h);
 assert.ok(disc,'found');
 const r=shot.f/4;
 assert.ok(Math.hypot(disc.cx-shot.centre.x,disc.cy-shot.centre.y)<.006*r,'centre within 0.6% R: '+JSON.stringify(disc));
 assert.ok(Math.abs(Math.sqrt(disc.a*disc.b)-r)<.01*r,'radius within 1%');
});

test('a tilted close shot: the outline’s centre is off the disc’s, and the camera puts one of its two centres on it',()=>{
 const shot=photograph({tilt:18,axis:10,Z:2.4});
 const disc=findDisc(shot.data,shot.w,shot.h),r=Math.sqrt(disc.a*disc.b);
 const off=Math.hypot(disc.cx-shot.centre.x,disc.cy-shot.centre.y)/r;
 assert.ok(off>.05,'perspective moves the outline’s centre by '+(off*100).toFixed(1)+'% R');
 const candidates=poseCentres(disc,shot.w,shot.h,{focal:shot.f});
 assert.equal(candidates.length,2);
 const miss=Math.min(...candidates.map(c=>Math.hypot(c.x-shot.centre.x,c.y-shot.centre.y)/r));
 assert.ok(miss<.01,'a camera centre within 1% R of the true one: '+(miss*100).toFixed(2));
});

test('registration through the disc’s centre puts it in the middle and the rim on the edge, without warping the design',()=>{
 const shot=photograph({tilt:18,axis:10,Z:2.4});
 const disc=findDisc(shot.data,shot.w,shot.h),reg=registration(disc,shot.centre,shot.w,shot.h),N=400;
 const crop=cropThrough(shot.data,shot.w,shot.h,reg.H,N),dot=redDot(crop,N);
 assert.ok(Math.hypot(dot.x,dot.y)<.01,'centre dot within 1% R of the middle: '+JSON.stringify(dot));
 // The ink lines at ±0.3 and ±0.5 land there (an affine fit would bend them by the perspective).
 const darkAt=(x,y)=>{const i=Math.round((x+1)*N/2-.5),j=Math.round((y+1)*N/2-.5),k=4*(j*N+i);return crop[k]<60&&crop[k+2]<80;};
 for(const g of [-.5,-.3,.3,.5])for(const along of [-.45,0,.45]){
  const near=v=>[-.006,0,.006].some(d=>v(d));
  assert.ok(near(d=>darkAt(g+d,along)),'plumb line at '+g+' through '+along);
  assert.ok(near(d=>darkAt(along,g+d)),'level line at '+g+' through '+along);
 }
 // The rim band is a ring at the crop's edge all round.
 for(let a=0;a<360;a+=15){const t=a*Math.PI/180,i=Math.round((1+.95*Math.cos(t))*N/2-.5),j=Math.round((1+.95*Math.sin(t))*N/2-.5),k=4*(j*N+i);assert.ok(crop[k+2]>110&&crop[k]<60,'rim band at '+a+'°');}
 assert.ok(reg.stretch>1.15&&reg.stretch<2,'a close shot’s own perspective: stretch '+reg.stretch.toFixed(3));
});

test('the affine fit is the registration through the outline’s centre: a square-on disc registers as before',()=>{
 const shot=photograph(),disc=findDisc(shot.data,shot.w,shot.h),reg=registration(disc,{x:disc.cx,y:disc.cy},shot.w,shot.h);
 assert.ok(reg.offset<1e-9&&Math.abs(reg.stretch-Math.max(disc.a,disc.b)/Math.min(disc.a,disc.b))<1e-6,'pure affine');
 // The same crop as photoPoint's affine options for that ellipse.
 const r=Math.min(shot.w,shot.h)/2,angle=disc.theta*180/Math.PI,o={cx:disc.cx/shot.w,cy:disc.cy/shot.h,scale:disc.a/r,aspect:disc.b/disc.a,angle,width:shot.w,height:shot.h};
 for(const [x,y] of [[0,0],[.7,0],[0,-.7],[-.5,.5]]){
  const p=throughH(reg.H,x,y,shot.w,shot.h),q=photoPoint(x,y,o);
  assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<.5,'same point for '+x+','+y+': '+JSON.stringify([p,q]));
 }
 // photoPoint takes the registration as is.
 const viaH=photoPoint(.3,.4,{H:reg.H,width:shot.w,height:shot.h}),direct=throughH(reg.H,.3,.4,shot.w,shot.h);
 assert.ok(Math.hypot(viaH.x-direct.x,viaH.y-direct.y)<1e-9);
});

test('auto: the camera centre that centres the design wins, and the stamp is levelled',async()=>{
 const shot=photograph({tilt:16,axis:-80,Z:2.6,spin:4});
 const auto=await autoRegister(shot.data,shot.w,shot.h);
 assert.ok(!auto.refused,'registered');
 const r=Math.sqrt(auto.disc.a*auto.disc.b),miss=Math.hypot(auto.centre.x-shot.centre.x,auto.centre.y-shot.centre.y)/r;
 assert.ok(miss<.02,'dot within 2% R of the disc’s centre (default focal, not the true one): '+(miss*100).toFixed(2));
 // Levelled: the pattern was turned 4°; the crop turned by `rotate` brings its lines level within 0.5°.
 const crop=cropThrough(shot.data,shot.w,shot.h,auto.registration.H,512,auto.rotate),after=levelAngle(crop,512);
 assert.ok(Math.abs(after.rotate)<=.5,'residual tilt '+after.rotate+'° (turned '+auto.rotate+'°)');
});

test('past the squash cap the auto fit refuses, by name',async()=>{
 const shot=photograph({tilt:45,axis:0,Z:2.6});
 const auto=await autoRegister(shot.data,shot.w,shot.h);
 assert.equal(auto.refused,'squash');assert.ok(auto.squash<SQUASH_CAP);
});

test('no disc, no rim: the auto fit refuses rather than guessing',async()=>{
 const w=600,h=800,data=new Uint8ClampedArray(w*h*4);for(let p=0;p<w*h;p++){data[4*p]=data[4*p+1]=data[4*p+2]=(p%w>300?200:60);data[4*p+3]=255;}
 assert.equal((await autoRegister(data,w,h)).refused,'rim');
});
