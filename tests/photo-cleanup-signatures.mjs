// Round 2 of the photo cleanup (docs/photo-edge-cleanup.md, "Round 2"): photos shaped like the ones that still
// failed on Freddy's real textures after PR #10. The round-1 fixtures put saturated discs on a dark, busy wood
// table; his failures are bright or pale discs whose background sits close to them in brightness and hue, with
// glare across the rim, shot as phone JPEGs (a little sensor noise, compression). Each one gives its ground truth:
// the disc's circle in the photo and a mask of anything on the disc that is not the disc (fingers), so a test can
// say exactly which texture pixels are foreign. Framings are ones the aligner's own controls reach (steps of 0.01;
// exact is scale 0.72 centred).
//
//   wraith      Wraith (Innova), the 30 stamp: yellow and blue stripes and a white "30" outlined in black over the
//               whole face. On a pale grey concrete floor, glare across the rim, framed 2% left and 2% large, two
//               fingers on the rim. The face shows white, black and greys: the floor is "a colour the face shows".
//   halo        Halo Star Wraith: purple, a pale lilac halo from 0.8 R to the nose. On a white table, framed 2%
//               right, 1% down and 3% large, a thumb on the rim. The halo is a ring all round in a colour the face
//               never shows, touching both the table crescent and the thumb.
//   pink        A pale pink disc with a dark stamp, on a cream table, fingers on the rim and framed 1% up and 2%
//               large: rim remnants on a disc as pale as its background.
//   orange      An orange disc with a white foil stamp, a strong glare arc, on an off-white table, framed 3% right and
//               4% large: a pale crescent on one side. The glare puts near-white on the face.
//   destroyer   Freddy's Destroyer, as in round 1: purple, white stamp, wood table, two fingers and a thumb on
//               the rim, framed exactly. The still-fixed control.
//
// makeSignatures runs in the page (page.evaluate(makeSignatures)): it must stay self-contained.
export async function makeSignatures(){
 const W=1600,H=1200,X=800,Y=600,R=432,TAU=Math.PI*2;
 const canvas=(w=W,h=H)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 let seed=0x2545f491;const rand=()=>{seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)>>>0;seed=Math.imul(seed^seed>>>12,0x297a2d39)>>>0;return ((seed^=seed>>>15)>>>0)/4294967296;};
 // A plain surface lit from the upper left (brighter there), with a fine grain: concrete, laminate, a tablecloth.
 const surface=(g,color,grain)=>{
  g.fillStyle=color;g.fillRect(0,0,W,H);
  const light=g.createLinearGradient(0,0,W,H);light.addColorStop(0,'rgba(255,255,255,.10)');light.addColorStop(1,'rgba(0,0,0,.10)');g.fillStyle=light;g.fillRect(0,0,W,H);
  for(let k=0;k<grain;k++){const v=rand()<.5?0:255;g.fillStyle=`rgba(${v},${v},${v},${.03+rand()*.06})`;g.fillRect(rand()*W,rand()*H,1+rand()*3,1+rand()*3);}
 };
 const wood=g=>{
  g.fillStyle='#8b5a33';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=170){
   g.fillStyle=`hsl(${24+rand()*6},${42+rand()*10}%,${30+rand()*8}%)`;g.fillRect(0,y,W,168);g.fillStyle='#3a2414';g.fillRect(0,y+166,W,4);
   for(let k=0;k<26;k++){g.strokeStyle=`rgba(${50+rand()*40},${28+rand()*20},${12+rand()*10},${.25+rand()*.35})`;g.lineWidth=1+rand()*3;g.beginPath();const y0=y+rand()*166,a=rand()*8,f=.002+rand()*.006,p=rand()*6;for(let x=0;x<=W;x+=20)g.lineTo(x,y0+a*Math.sin(x*f+p));g.stroke();}
  }
 };
 // The disc: its shadow on the surface, then the plastic (paint(g) draws the face in a clip), the light across
 // it, the shoulder rolling away from the camera, and glare arcs ([from°, to°, at R, width px, alpha]).
 const disc=(g,paint,{glare=[[189,261,.955,7,.55]],shadow=.45,x=X,y=Y}={})=>{
  g.save();g.filter='blur(16px)';g.fillStyle=`rgba(20,14,10,${shadow})`;g.beginPath();g.arc(x+14,y+20,R*1.01,0,TAU);g.fill();g.restore();
  g.save();g.beginPath();g.arc(x,y,R,0,TAU);g.clip();g.translate(x,y);paint(g);g.translate(-x,-y);
  const light=g.createLinearGradient(x-R,y-R,x+R,y+R);light.addColorStop(0,'rgba(255,255,255,.18)');light.addColorStop(1,'rgba(0,0,0,.16)');g.fillStyle=light;g.fillRect(x-R,y-R,2*R,2*R);
  const shoulder=g.createRadialGradient(x,y,R*.8,x,y,R);shoulder.addColorStop(0,'rgba(0,0,0,0)');shoulder.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=shoulder;g.fillRect(x-R,y-R,2*R,2*R);
  for(const [a0,a1,at,width,alpha] of glare){g.save();g.filter=`blur(${Math.max(2,width/3)}px)`;g.strokeStyle=`rgba(255,255,255,${alpha})`;g.lineWidth=width;g.beginPath();g.arc(x,y,R*at,a0*Math.PI/180,a1*Math.PI/180);g.stroke();g.restore();}
  g.restore();
 };
 const text=(g,t,color,size,y=0,font='900')=>{g.fillStyle=color;g.font=`${font} ${size}px Arial Black, Arial, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t,0,y);};
 // Fingers come in from outside the disc and stop on its outer annulus: [angle°, reach (share of R), width].
 const fingers=(g,list,fill=true,x=X,y=Y)=>{
  for(const [deg,reach,width] of list){
   const a=deg*Math.PI/180,w=width*R,len=R*.75;
   g.save();g.translate(x+Math.cos(a)*reach*R,y+Math.sin(a)*reach*R);g.rotate(a);
   if(fill){
    g.save();g.filter='blur(6px)';g.fillStyle='rgba(30,15,5,.35)';g.beginPath();g.roundRect(8,-w/2+10,len,w,w/2);g.fill();g.restore();
    const skin=g.createLinearGradient(0,-w/2,0,w/2);skin.addColorStop(0,'#eab79a');skin.addColorStop(.5,'#dda283');skin.addColorStop(1,'#b97a5d');
    g.fillStyle=skin;g.beginPath();g.roundRect(0,-w/2,len,w,w/2);g.fill();
    g.fillStyle='rgba(250,214,206,.9)';g.beginPath();g.ellipse(w*.42,0,w*.3,w*.27,0,0,TAU);g.fill();
   }else{g.fillStyle='#fff';g.beginPath();g.roundRect(0,-w/2,len,w,w/2);g.fill();}
   g.restore();
  }
 };
 // A phone's JPEG: a little sensor noise, then compression.
 const jpeg=async c=>{
  const g=c.getContext('2d'),img=g.getImageData(0,0,W,H),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(rand()+rand()+rand()-1.5)*5;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}
  g.putImageData(img,0,0);
  return [...new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/jpeg',.88))).arrayBuffer())];
 };
 const png=async c=>[...new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/png'))).arrayBuffer())];
 const make=async({background,paint,glare,shadow,hands=[]})=>{
  const c=canvas(),g=c.getContext('2d');background(g);disc(g,paint,{glare,shadow});fingers(g,hands);
  const m=canvas(),mg=m.getContext('2d');mg.fillStyle='#000';mg.fillRect(0,0,W,H);fingers(mg,hands,false);
  return {photo:await jpeg(c),mask:await png(m),hasFingers:hands.length>0};
 };
 const stripes=(g,a,b,w=46)=>{g.save();g.rotate(-Math.PI/4);for(let k=-20;k<20;k++){g.fillStyle=k&1?a:b;g.fillRect(k*w,-2*R,w,4*R);}g.restore();};
 const out={W,H,disc:{x:X,y:Y,r:R},exact:{scale:.72,cx:.5,cy:.5}};
 out.wraith={mold:'e70f48273d7f',options:{scale:.74,cx:.48,cy:.5},...await make({
  background:g=>surface(g,'#b9b6b1',9000),shadow:.35,
  paint:g=>{stripes(g,'#1f418f','#f2c230');g.lineJoin='round';g.font='900 330px Arial Black, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=26;g.strokeStyle='#111';g.strokeText('30',0,10);g.fillStyle='#fff';g.fillText('30',0,10);},
  glare:[[150,250,.94,26,.75],[290,330,.97,14,.6],[200,230,.6,40,.35]],
  hands:[[-25,.9,.16],[10,.88,.16]]})};
 out.halo={mold:'e70f48273d7f',options:{scale:.75,cx:.52,cy:.51},...await make({
  background:g=>surface(g,'#ebe8e4',6000),shadow:.3,
  paint:g=>{g.fillStyle='#ead0f2';g.fillRect(-R,-R,2*R,2*R);const halo=g.createRadialGradient(0,0,R*.76,0,0,R*.84);halo.addColorStop(0,'#5b2a86');halo.addColorStop(1,'rgba(91,42,134,0)');g.fillStyle=halo;g.beginPath();g.arc(0,0,R*.84,0,TAU);g.fill();text(g,'WRAITH','#d8b04a',70,0,'700');},
  glare:[[160,250,.93,22,.7]],
  hands:[[200,.87,.2]]})};
 out.pink={mold:'3d60892b6812',options:{scale:.74,cx:.5,cy:.49},...await make({
  background:g=>surface(g,'#efe6dc',7000),shadow:.3,
  paint:g=>{g.fillStyle='#f3d6de';g.fillRect(-R,-R,2*R,2*R);text(g,'DESTROYER','#4a2a5e',92,-10);text(g,'DISTANCE DRIVER','#4a2a5e',36,90,'700');},
  glare:[[170,260,.95,20,.7],[300,340,.9,10,.5]],
  hands:[[-40,.88,.18],[-12,.91,.17],[150,.89,.22]]})};
 out.orange={mold:'a5ca585ab070',options:{scale:.76,cx:.53,cy:.5},...await make({
  background:g=>surface(g,'#ece7df',5000),shadow:.35,
  paint:g=>{g.fillStyle='#ee7620';g.fillRect(-R,-R,2*R,2*R);text(g,'DD3','#f6f4ee',170,-10);text(g,'DISCMANIA','#f6f4ee',40,95,'700');g.lineWidth=10;g.strokeStyle='#f6f4ee';g.beginPath();g.arc(0,0,R*.6,0,TAU);g.stroke();},
  glare:[[180,280,.92,34,.8],[200,240,.55,60,.4]]})};
 out.destroyer={mold:'3d60892b6812',options:{scale:.72,cx:.5,cy:.5},...await make({
  background:wood,shadow:.55,
  paint:g=>{g.fillStyle='#6a3fb5';g.fillRect(-R,-R,2*R,2*R);text(g,'DESTROYER','#f4f4f0',150,-10);text(g,'DISTANCE DRIVER','#f4f4f0',40,95,'700');},
  hands:[[-38,.86,.18],[-12,.9,.17],[158,.88,.22]]})};
 return out;
}
