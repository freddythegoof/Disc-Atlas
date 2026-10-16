// Imperfect disc photos for the edge cleanup (docs/photo-edge-cleanup.md), drawn in the page the way a phone
// sees them: a 1600 × 1200 shot of a disc lying on a busy wood table, lit from the upper left, with a soft
// shadow, a darker shoulder and a glare arc. Each fixture also gives its ground truth: the disc's own circle in
// the photo and a mask of what is not the disc (fingers), so a test can say exactly which texture pixels are
// foreign. Framings are ones the aligner's own controls reach (Framing slider and arrow keys, steps of 0.01):
// exact is scale 0.72 centred.
//
//   misaligned  DD3 (Discmania), blue, a white stamp ring at 0.62 R. Framed 2% of the photo right, 1% up and
//               3% large: a typical hand error, so a crescent of table bakes in on one side.
//   generous    Leopard (Innova), red. Centred but 7% large: a thin ring of table all round the disc.
//   fingers     Destroyer (Innova), purple, white stamp. Framed exactly, but two fingers and a thumb hold the
//               rim: skin over the outer annulus inside the disc, and over the table outside it.
//   clean       Thunderbird (Innova), green. Framed exactly, nothing in the way: the control.
//   fresh       Valkyrie (Innova), teal, off centre in the frame and held by fingers: the photo a normal
//               person takes, for the upload side (the aligner snaps to it).
//
// With taxonomy, three more for what the cleanup bounds or cannot do (docs/photo-edge-cleanup.md):
//   plainTable  the generous framing on a plain grey table: a smooth ring all round, like a band of plastic.
//   tanFingers  a tan disc held by fingers: skin is a colour the face shows.
//   faceHand    a finger laid across the face, to 0.45 R: occlusion of real content.
//   band        a band of pale yellow plastic from 0.90 R to the nose on a purple disc, framed exactly: content that
//               must stay (a smooth ring all round in a colour the face never shows).
//
// makeFixtures runs in the page (page.evaluate(makeFixtures, taxonomy)): it must stay self-contained.
export async function makeFixtures(taxonomy=false){
 const W=1600,H=1200,X=800,Y=600,R=432;
 const canvas=(w=W,h=H)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 // A seeded random stream: the same fixtures every run.
 let seed=0x9e3779b9;const rand=()=>{seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)>>>0;seed=Math.imul(seed^seed>>>12,0x297a2d39)>>>0;return ((seed^=seed>>>15)>>>0)/4294967296;};
 const table=g=>{
  g.fillStyle='#8b5a33';g.fillRect(0,0,W,H);
  // Planks with dark seams, grain lines and knots: plenty of edges in every direction near the disc.
  for(let y=0;y<H;y+=170){
   g.fillStyle=`hsl(${24+rand()*6},${42+rand()*10}%,${30+rand()*8}%)`;g.fillRect(0,y,W,168);
   g.fillStyle='#3a2414';g.fillRect(0,y+166,W,4);
   for(let k=0;k<26;k++){
    g.strokeStyle=`rgba(${50+rand()*40},${28+rand()*20},${12+rand()*10},${.25+rand()*.35})`;g.lineWidth=1+rand()*3;g.beginPath();
    const y0=y+rand()*166,a=rand()*8,f=.002+rand()*.006,p=rand()*6;for(let x=0;x<=W;x+=20)g.lineTo(x,y0+a*Math.sin(x*f+p));g.stroke();
   }
  }
  for(let k=0;k<5;k++){const x=rand()*W,y=rand()*H;g.fillStyle='rgba(55,30,15,.55)';g.beginPath();g.ellipse(x,y,14+rand()*16,8+rand()*8,rand()*3,0,Math.PI*2);g.fill();}
  // A sheet of paper and a coffee ring, as on any real table.
  g.save();g.translate(1430,180);g.rotate(.35);g.fillStyle='#ece6da';g.fillRect(-170,-120,340,240);g.restore();
  g.strokeStyle='rgba(60,32,14,.6)';g.lineWidth=9;g.beginPath();g.arc(210,1010,70,0,Math.PI*2);g.stroke();
 };
 const disc=(g,color,{text,ring=true,x=X,y=Y})=>{
  g.save();g.filter='blur(14px)';g.fillStyle='rgba(20,10,4,.55)';g.beginPath();g.arc(x+16,y+22,R*1.01,0,Math.PI*2);g.fill();g.restore();
  g.save();g.beginPath();g.arc(x,y,R,0,Math.PI*2);g.clip();
  g.fillStyle=color;g.fillRect(x-R,y-R,2*R,2*R);
  const light=g.createLinearGradient(x-R,y-R,x+R,y+R);light.addColorStop(0,'rgba(255,255,255,.22)');light.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=light;g.fillRect(x-R,y-R,2*R,2*R);
  // The shoulder rolls away from the camera: darker toward the nose, with a glare arc facing the light.
  const shoulder=g.createRadialGradient(x,y,R*.8,x,y,R);shoulder.addColorStop(0,'rgba(0,0,0,0)');shoulder.addColorStop(1,'rgba(0,0,0,.32)');g.fillStyle=shoulder;g.fillRect(x-R,y-R,2*R,2*R);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=7;g.beginPath();g.arc(x,y,R*.955,Math.PI*1.05,Math.PI*1.45);g.stroke();
  g.fillStyle='#f4f4f0';g.strokeStyle='#f4f4f0';
  if(ring){g.lineWidth=11;g.beginPath();g.arc(x,y,R*.62,0,Math.PI*2);g.stroke();}
  g.font='900 150px Arial Black, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,x,y-10);
  g.font='700 40px Arial, sans-serif';g.fillText('DISTANCE DRIVER',x,y+105);
  g.restore();
 };
 // Fingers come in from outside the disc and stop on its outer annulus: [angle°, reach (share of R), width].
 const FINGERS=[[-38,.86,.18],[-12,.9,.17],[158,.88,.22]];
 const fingers=(g,fill=true,x=X,y=Y,list=FINGERS)=>{
  for(const [deg,reach,width] of list){
   const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),w=width*R,tip=reach*R,len=R*.75;
   g.save();g.translate(x+c*tip,y+s*tip);g.rotate(a);
   if(fill){
    g.save();g.filter='blur(6px)';g.fillStyle='rgba(30,15,5,.45)';g.beginPath();g.roundRect(8,-w/2+10,len,w,w/2);g.fill();g.restore();
    const skin=g.createLinearGradient(0,-w/2,0,w/2);skin.addColorStop(0,'#eab79a');skin.addColorStop(.5,'#dda283');skin.addColorStop(1,'#b97a5d');
    g.fillStyle=skin;g.beginPath();g.roundRect(0,-w/2,len,w,w/2);g.fill();
    g.fillStyle='rgba(250,214,206,.9)';g.beginPath();g.ellipse(w*.42,0,w*.3,w*.27,0,0,Math.PI*2);g.fill();
    g.strokeStyle='rgba(120,70,50,.6)';g.lineWidth=2;for(const k of [.55,.62])g.beginPath(),g.moveTo(w*2.2+k*20,-w*.35),g.lineTo(w*2.2+k*20,w*.35),g.stroke();
   }else{g.fillStyle='#fff';g.beginPath();g.roundRect(0,-w/2,len,w,w/2);g.fill();}
   g.restore();
  }
 };
 const bytes=async c=>[...new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/png'))).arrayBuffer())];
 const shot=draw=>{const c=canvas(),g=c.getContext('2d');draw(g);return bytes(c);};
 const mask=async(x,y)=>{const c=canvas(),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,W,H);fingers(g,false,x,y);return bytes(c);};
 const exact={scale:.72,cx:.5,cy:.5},FX=760,FY=650;
 const extra=taxonomy?{
  plainTable:{mold:'e5c3cc29c5a7',photo:await shot(g=>{g.fillStyle='#9b9d9f';g.fillRect(0,0,W,H);disc(g,'#c23b3b',{text:'DD3'});}),options:{scale:.77,cx:.5,cy:.5},hasFingers:false},
  tanFingers:{mold:'3d60892b6812',photo:await shot(g=>{table(g);disc(g,'#d29a74',{text:'DESTROYER',ring:false});fingers(g);}),options:exact,hasFingers:true},
  band:{mold:'e70f48273d7f',photo:await shot(g=>{table(g);disc(g,'#5b2a86',{text:'WRAITH',ring:false});g.save();g.beginPath();g.arc(X,Y,R,0,Math.PI*2);g.arc(X,Y,R*.9,0,Math.PI*2,true);g.fillStyle='#f2e28a';g.fill();g.restore();}),options:exact,hasFingers:false},
  faceHand:{mold:'3d60892b6812',photo:await shot(g=>{table(g);disc(g,'#6a3fb5',{text:'DESTROYER',ring:false});fingers(g,true,X,Y,[[-30,.45,.2]]);}),options:exact,hasFingers:true},
 }:{};
 return {
  ...extra,W,H,disc:{x:X,y:Y,r:R},fingers:FINGERS,exact,
  misaligned:{mold:'a5ca585ab070',photo:await shot(g=>{table(g);disc(g,'#2f7fd1',{text:'DD3'});}),options:{scale:.74,cx:.52,cy:.49},hasFingers:false},
  generous:{mold:'e5c3cc29c5a7',photo:await shot(g=>{table(g);disc(g,'#c23b3b',{text:'DD3'});}),options:{scale:.77,cx:.5,cy:.5},hasFingers:false},
  fingers:{mold:'3d60892b6812',photo:await shot(g=>{table(g);disc(g,'#6a3fb5',{text:'DESTROYER',ring:false});fingers(g);}),options:exact,hasFingers:true},
  clean:{mold:'e9a88cc4f3b1',photo:await shot(g=>{table(g);disc(g,'#2f9a5a',{text:'THUNDER',ring:false});}),options:exact,hasFingers:false},
  fresh:{mold:'e0a431f84b53',photo:await shot(g=>{table(g);disc(g,'#1f8f8a',{text:'VALK',x:FX,y:FY});fingers(g,true,FX,FY);}),disc:{x:FX,y:FY,r:R},hasFingers:true},
  fingerMask:await mask(X,Y),freshMask:await mask(FX,FY),
 };
}
