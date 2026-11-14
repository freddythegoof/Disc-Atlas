var C=()=>Z(new Float32Array(16));function Z(t){return t.fill(0),t[0]=t[5]=t[10]=t[15]=1,t}function F(t,e,o){let r=new Float32Array(16);for(let a=0;a<4;a++)for(let s=0;s<4;s++)r[a*4+s]=e[s]*o[a*4]+e[4+s]*o[a*4+1]+e[8+s]*o[a*4+2]+e[12+s]*o[a*4+3];return t.set(r),t}function ie(t,e,o,r){return Z(t),t[12]=e,t[13]=o,t[14]=r,t}function Ve(t,e,o,r){return Z(t),t[0]=e,t[5]=o,t[10]=r,t}function O(t,e,o,r){let a=Math.cos(e),s=Math.sin(e),i=Math.cos(o),n=Math.sin(o),l=Math.cos(r),h=Math.sin(r);return Z(t),t[0]=l*i,t[1]=h*i,t[2]=-n,t[4]=l*n*s-h*a,t[5]=h*n*s+l*a,t[6]=i*s,t[8]=l*n*a+h*s,t[9]=h*n*a-l*s,t[10]=i*a,t}function ne(t,e,o){let[r,a,s]=e,i=Math.cos(o),n=Math.sin(o),l=1-i;return Z(t),t[0]=l*r*r+i,t[1]=l*r*a+n*s,t[2]=l*r*s-n*a,t[4]=l*r*a-n*s,t[5]=l*a*a+i,t[6]=l*a*s+n*r,t[8]=l*r*s+n*a,t[9]=l*a*s-n*r,t[10]=l*s*s+i,t}function be(t,e){let[o,r,a,s,i,n,l,h,f,c,m,d,u,y,w,x]=e,E=o*n-r*i,A=o*l-a*i,M=o*h-s*i,N=r*l-a*n,T=r*h-s*n,P=a*h-s*l,v=f*y-c*u,D=f*w-m*u,_=f*x-d*u,I=c*w-m*y,B=c*x-d*y,L=m*x-d*w,H=E*L-A*B+M*I+N*_-T*D+P*v;if(!H)return Z(t);let b=1/H;return t[0]=(n*L-l*B+h*I)*b,t[1]=(a*B-r*L-s*I)*b,t[2]=(y*P-w*T+x*N)*b,t[3]=(m*T-c*P-d*N)*b,t[4]=(l*_-i*L-h*D)*b,t[5]=(o*L-a*_+s*D)*b,t[6]=(w*M-u*P-x*A)*b,t[7]=(f*P-m*M+d*A)*b,t[8]=(i*B-n*_+h*v)*b,t[9]=(r*_-o*B-s*v)*b,t[10]=(u*T-y*M+x*E)*b,t[11]=(c*M-f*T-d*E)*b,t[12]=(n*D-i*I-l*v)*b,t[13]=(o*I-r*D+a*v)*b,t[14]=(y*A-u*N-w*E)*b,t[15]=(f*N-c*A+m*E)*b,t}function ye(t,e){let[o,r,a]=e;return [t[0]*o+t[4]*r+t[8]*a+t[12],t[1]*o+t[5]*r+t[9]*a+t[13],t[2]*o+t[6]*r+t[10]*a+t[14]]}function we(t,e){let[o,r,a]=e;return [t[0]*o+t[4]*r+t[8]*a,t[1]*o+t[5]*r+t[9]*a,t[2]*o+t[6]*r+t[10]*a]}var $=(t,e,o)=>Math.min(o,Math.max(e,t)),re=(t,e,o)=>t+(e-t)*o,ke=(t,e,o)=>{let r=$((o-t)/(e-t),0,1);return r*r*(3-2*r)},je=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;function Q(t){let e=Math.floor(t*4294967295)>>>0||1;return ()=>{e=e+1831565813>>>0;let o=e;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}}var k=class{constructor(e=0){this.x=e;}x;v=0;step(e,o,r,a){let s=r*Math.PI*2;return this.v+=(s*s*(e-this.x)-2*a*s*this.v)*o,this.x+=this.v*o,this.x}};var mt=[{round:0,open:1,weight:.34},{round:.08,open:.55,weight:.26},{round:.7,open:.85,weight:.24},{round:1,open:.5,weight:.16}],le=class{constructor(e){this.random=e;this.silence=.15+e()*.3;}random;open=0;round=0;age=0;length=0;stress=0;silence=0;syllablesLeft=0;wordsLeft=0;reset(){this.age=this.length=this.open=0,this.syllablesLeft=this.wordsLeft=0,this.silence=.12;}update(e){if(this.silence>0){this.silence-=e,this.open=0;return}this.age+=e,this.age>=this.length&&this.next();let o=$(this.age/this.length,0,1);this.open=this.stress*Math.pow(Math.sin(Math.PI*o),.55);}next(){let e=this.random;this.age=0;let o=this.syllablesLeft===0;o&&(this.wordsLeft===0?(this.wordsLeft=3+Math.floor(e()*5),this.silence=this.length>0?.45+e()*.7:0):this.silence=.04+e()*.09,this.wordsLeft--,this.syllablesLeft=1+Math.floor(Math.pow(e(),1.6)*3)),this.syllablesLeft--;let r=o&&e()<.6,a=dt(mt,e());this.length=.12+e()*.13,this.stress=a.open*(r?.85+e()*.15:.5+e()*.35),this.round=a.round;}};function dt(t,e){for(let o of t){if(e<o.weight)return o;e-=o.weight;}return t[0]}var V=["idle","thinking","listening","speaking","sleeping","working","error","surprised","celebrating","sad"],z=[...V,"happy"],ae=Object.fromEntries(z.map((t,e)=>[t,e])),Me={idle:{lid:.06,squint:0,smile:.35,tilt:0,energy:1,flap:.05,glow:[.45,.7,1],exposure:1,wide:0,asym:0},thinking:{lid:.4,squint:0,smile:-0.15,tilt:.22,energy:.6,flap:0,glow:[1,.55,.12],exposure:1,wide:0,asym:0},listening:{lid:0,squint:0,smile:.2,tilt:-0.08,energy:.8,flap:.05,glow:[.25,1,.5],exposure:1,wide:.15,asym:0},speaking:{lid:.04,squint:.1,smile:.45,tilt:0,energy:1.2,flap:.1,glow:[.35,.82,1],exposure:1,wide:0,asym:0},sleeping:{lid:1,squint:0,smile:0,tilt:0,energy:.35,flap:0,glow:[.08,.09,.18],exposure:.84,wide:0,asym:0},working:{lid:.3,squint:.2,smile:.05,tilt:0,energy:1.3,flap:.18,glow:[.6,.45,1],exposure:1,wide:0,asym:0},error:{lid:.12,squint:.15,smile:-0.45,tilt:.1,energy:.9,flap:.25,glow:[1,.16,.12],exposure:.97,wide:.2,asym:1},surprised:{lid:0,squint:0,smile:0,tilt:0,energy:1,flap:.55,glow:[.95,.95,1],exposure:1.04,wide:1,asym:0},celebrating:{lid:0,squint:1,smile:1,tilt:0,energy:1.8,flap:.9,glow:[1,.72,.2],exposure:1.08,wide:0,asym:0},sad:{lid:.42,squint:0,smile:-0.85,tilt:-0.32,energy:.35,flap:-0.12,glow:[.22,.32,.7],exposure:.9,wide:0,asym:0},happy:{lid:0,squint:1,smile:1,tilt:0,energy:1.6,flap:.3,glow:[1,.42,.72],exposure:1.05,wide:0,asym:0}};var ut={float:0,hop:.16,squash:1,snap:1,look:1,snapLook:0,talkSquash:0},ce=.11,vt=1.8,G=class{temperament;state="idle";pointer=null;shown="idle";previous="idle";switched=10;time=0;since=0;random;yaw=new k;pitch=new k;roll=new k;squash=new k;hover;face={lid:new k,squint:new k,smile:new k(.3),tilt:new k,talk:new k,round:new k,gazeX:new k,gazeY:new k,flap:new k,energy:new k(1),exposure:new k(1),wide:new k,asym:new k};weights;glow=[...Me.idle.glow];jump=null;look={yaw:0,pitch:0,x:0,y:0};saccade={x:0,y:0,next:0};nextLook=.6;nextBlink;blinkAge=-1;nextHop;nextSide=4;side=1;nextNod=2.5;shake={start:-10,amount:0,next:0};sigh={start:-10,next:0};reactUntil=-1;speech;lastTalk=0;syllableArmed=true;matrices={a:C(),b:C()};pose;constructor(e={},o=.5){this.temperament={...ut,...e},this.random=Q(o),this.speech=new le(this.random),this.nextBlink=1+this.random()*3,this.nextHop=6+this.random()*6,this.hover=new k(this.temperament.float),this.weights=Object.fromEntries(z.map(r=>[r,new k(r==="idle"?1:0)])),this.pose={root:C(),minScale:1,lift:0,channels:{yaw:0,pitch:0,roll:0,flap:0,talk:0,energy:1},weights:Object.fromEntries(z.map(r=>[r,r==="idle"?1:0])),expression:"idle",faceA:[0,0,0,0],faceB:[0,0,0,0],faceC:[0,0,1,0],faceD:[0,0,0,0],glow:this.glow,exposure:1,events:[]};}setState(e){e!==this.state&&(this.state=e,this.since=0,e==="speaking"&&this.speech.reset(),this.nextLook=0);}poke(){this.hop(this.temperament.hop*1.5,this.random()<.5?1:-1),this.reactUntil=this.time+vt;}update(e){if(!(e>0))return;let o=Math.max(1,Math.ceil(e/(1/120)));for(let r=0;r<o;r++)this.step(e/o);}enter(e,o){let r=this.temperament;e==="surprised"?(this.hop(r.hop*.6,0),this.pitch.v+=1.2,this.startShake(o,.35,1/0)):e==="error"?(this.side=this.random()<.5?1:-1,this.squash.v-=2.5,this.startShake(o,1,o+2+this.random())):e==="celebrating"?this.nextHop=o:e==="sad"&&(this.sigh.next=o+1.2);}startShake(e,o,r){this.shake.start=e,this.shake.amount=o,this.shake.next=r;}hop(e,o){if(this.jump)return;let r=this.temperament.float>0;this.jump={age:r?ce:0,height:e,spin:o,lean:(this.random()-.5)*.3,air:.42+e*.45+(r?.25:0),landed:false};}step(e){this.time+=e,this.since+=e,this.switched+=e;let o=this.time,r=this.random,a=this.temperament,s=this.pose.events,i=o<this.reactUntil?"happy":this.state;i!==this.shown&&(this.previous=this.shown,this.shown=i,this.switched=0,s.push(`enter:${i}`),this.enter(i,o));let n=Me[i];o>this.nextLook&&(this.look.yaw=(r()-.5)*.75,this.look.pitch=(r()-.5)*.24,this.look.x=$(this.look.yaw*2.2,-1,1),this.look.y=r()<.3?.6:r()<.2?-0.6:0,this.nextLook=o+re(1.4+r()*2.6,.45+r()*1.1,a.snapLook)),o>this.saccade.next&&(this.saccade.x=(r()-.5)*.22,this.saccade.y=(r()-.5)*.14,this.saccade.next=o+.25+r()*.7);let l=0,h=0,f=0,c=Math.sin(o*1.9)*.008,m=0,d=0,u=0,y=0,w=n.flap,x=1.3,E=.62,A=a.float,M=this.pointer,N=M&&(i==="idle"||i==="listening"||i==="speaking"||i==="surprised");switch(i){case "idle":l=this.look.yaw,h=this.look.pitch,f=-this.look.yaw*.16,m=this.look.x,d=this.look.y,o>this.nextHop&&(this.hop(a.hop*(.9+r()*.4),r()<.35?r()<.5?1:-1:0),this.nextHop=o+7+r()*7);break;case "thinking":{o>this.nextSide&&(this.side=-this.side,this.nextSide=o+3+r()*2);let g=this.side;l=.24*g+Math.sin(o*.9)*.05,h=.17+Math.sin(o*1.3)*.03,f=-0.13*g,m=.7*g,d=.8,x=.9;break}case "listening":l=-0.14,h=.02,f=.17,m=-0.2,o>this.nextNod&&(this.pitch.v-=.9,this.nextNod=o+2+r()*2.5);break;case "speaking":{l=Math.sin(o*.7)*.12,f=Math.sin(o*.9)*.05,this.speech.update(e),u=this.speech.open,y=this.speech.round,h=.04+u*.07,c+=u*.014,w+=Math.sin(o*2.6)*.1,x=1.8;break}case "sleeping":h=-0.3,f=.13,l=.06,c=Math.sin(o*1.15)*.016,u=.12+.1*Math.sin(o*1.15),y=.7,A*=.65,x=.55,E=.9,o>this.nextNod&&(this.pitch.v-=.5,this.nextNod=o+5+r()*4);break;case "working":l=Math.sin(o*.8)*.07,h=-0.13+Math.abs(Math.sin(o*5.2))*.03,f=Math.sin(o*.6)*.04,m=Math.sin(o*1.6)*.45,d=-0.55,w+=Math.sin(o*11)*.06,x=1.6;break;case "error":{o>this.shake.next&&this.startShake(o,.55,2.4+r()*1.4);let g=this.side;f=.16*g,l=-0.1*g,h=.05,m=.45*g,d=.3,u=.16,x=1.5;break}case "surprised":h=.1,u=.42,y=1,x=2.2,E=.5;break;case "celebrating":l=Math.sin(o*3.1)*.22,f=Math.sin(o*6.2)*.1,h=.14,u=.6+.12*Math.sin(o*7),y=.05,w+=Math.sin(o*9)*.25,x=2,o>this.nextHop&&(this.hop(a.hop*1.25,r()<.3?r()<.5?1:-1:0),this.nextHop=o+.85+r()*.4);break;case "sad":{o>this.sigh.next&&(this.sigh.start=o,this.sigh.next=o+4+r()*2.5);let g=Math.sin($((o-this.sigh.start)/1.7,0,1)*Math.PI);h=-0.24+g*.1,l=Math.sin(o*.3)*.1,f=.08,m=-0.15,d=-0.65+g*.3,c+=g*.018,A*=.7,x=.7,E=.85;break}case "happy":l=Math.sin(o*2.2)*.18,f=Math.sin(o*4.4)*.12,h=.12,u=.5+.15*Math.sin(o*8),y=.2,o>this.nextHop&&(this.hop(a.hop*1.05,0),this.nextHop=o+1.05+r()*.4);break}N&&M&&(l=$(M.x,-1,1)*.55,h=$(-M.y,-1,1)*.32+(i==="speaking"?u*.07:0),f=-l*.12+(i==="listening"?.12:0),m=$(M.x*2,-1,1),d=$(-M.y*1.5,-1,1)),i!=="sleeping"&&(m+=this.saccade.x,d+=this.saccade.y),a.float>0&&(c+=Math.sin(o*1.5)*.035);let T=re(x,x*3.2,a.snapLook)*a.snap,P=re(E,.95,a.snapLook);this.yaw.step(l*a.look,e,T,P),this.pitch.step(h*a.look,e,T,P),this.roll.step(f,e,x*a.snap,E),this.hover.step(A,e,.6,.8);let v=this.face;v.lid.step(n.lid,e,2.2,.9),v.squint.step(n.squint,e,3,.8),v.smile.step(n.smile,e,2.4,.75),v.tilt.step(n.tilt*this.side,e,1.6,.8),v.talk.step(u,e,14,.8),v.round.step(y,e,6,.8),v.gazeX.step(m,e,7,.85),v.gazeY.step(d,e,7,.85),v.flap.step(w,e,2.4*a.snap,.5),v.energy.step(n.energy,e,.8,1),v.exposure.step(n.exposure,e,.4,1),v.wide.step(n.wide,e,5,.6),v.asym.step(n.asym*this.side,e,3,.8);for(let g of z)this.weights[g].step(g===i?1:0,e,1.6*a.snap,.95);let D=1-Math.exp(-e*4),_=i==="thinking"?.55+.45*Math.sin(o*4.2):i==="speaking"?.6+.6*v.talk.x:i==="working"?.75+.25*Math.sin(o*7):i==="error"?Math.sin(o*7)>0?1.1:.45:1;for(let g=0;g<3;g++)this.glow[g]=re(this.glow[g],n.glow[g]*_,D);this.syllableArmed&&v.talk.x>.55&&this.lastTalk<=.55&&i==="speaking"&&(s.push("syllable"),this.syllableArmed=false),v.talk.x<.35&&(this.syllableArmed=true),this.lastTalk=v.talk.x;let I=0,B=0,L=0,H=0,b=this.jump;if(b)if(b.age+=e,b.age<ce)H=.14;else {let g=(b.age-ce)/b.air;g<1?(g<.06&&this.squash.x>.05&&(this.squash.v=-2.6),I=4*b.height*g*(1-g),B=b.spin*Math.PI*2*je($(g*1.08,0,1)),L=b.lean*Math.sin(g*Math.PI),H=g<.5?-0.05:0):b.landed?b.age-ce-b.air>.35&&(this.jump=null):(b.landed=true,a.float===0&&(this.squash.v+=3.2,s.push("land")));}a.float>0&&(H*=.3),this.squash.step(H,e,3.2,.32),o>this.nextBlink&&(this.blinkAge=0,this.nextBlink=o+2.2+r()*3.5,r()<.2&&(this.nextBlink=o+.35));let qe=0;this.blinkAge>=0&&(this.blinkAge+=e,qe=Math.sin($(this.blinkAge/.17,0,1)*Math.PI),this.blinkAge>.17&&(this.blinkAge=-1));let ge=i==="sleeping",Te=Math.sin(o*(ge?1.15:2.1))*(ge?.024:.01),Pe=this.squash.x*a.squash+v.talk.x*.05*a.talkSquash,xe=1+Pe*.55-Te*.5,Ie=1-Pe+Te,Be=I+c+this.hover.x,{a:ht,b:ft}=this.matrices,oe=this.pose.root;ie(oe,0,Be,0),F(oe,oe,O(ht,0,B,L)),F(oe,oe,Ve(ft,xe,Ie,xe));let R=this.pose;R.minScale=Math.min(xe,Ie),R.lift=Be,R.expression=i;let Y=R.channels,Le=this.shake.amount*Math.max(0,1-(o-this.shake.start)/.6);Y.yaw=this.yaw.x+Math.sin(o*31)*.06*Le,Y.pitch=this.pitch.x,Y.roll=this.roll.x+Math.sin(o*38)*.07*Le,Y.flap=v.flap.x,Y.talk=v.talk.x,Y.energy=v.energy.x;let Oe=0;for(let g of z)Oe+=Math.max(0,this.weights[g].x);for(let g of z)R.weights[g]=Math.max(0,this.weights[g].x)/(Oe||1);R.faceA=[ge?0:qe,v.lid.x,v.squint.x,v.smile.x],R.faceB=[v.talk.x,v.gazeX.x,v.gazeY.x,v.tilt.x],R.faceC=[ae[this.shown],ae[this.previous],$(this.switched/.35,0,1),this.switched<.3?1-this.switched/.3:0],R.faceD=[this.since,v.round.x,v.wide.x,v.asym.x],R.exposure=v.exposure.x;}};var J=32,gt={z:0,bubble:1,sparkle:2,heart:3,note:4,arc:5,puff:6,ring:7,drop:8,spark:9,mote:10,feather:11,dot:12,exclaim:13,warning:14,confetti:15,cloud:16,star:17,gear:18},Se={sleeping:[{glyph:"z",anchor:"top",rate:.55,offset:[.12,.04,.05],spread:.02,velocity:[.07,.13,0],jitter:.015,wobble:.05,life:[3,3.6],size:[.045,.12],rotation:-0.2,spin:.12,color:"#7f88ad"}],thinking:[{glyph:"dot",anchor:"top",rate:1.1,offset:[.16,.02,.06],spread:.01,velocity:[.05,.11,0],jitter:.01,wobble:.02,life:[1.5,1.8],size:[.012,.04],color:"#a3abc9"}],listening:[{glyph:"arc",anchor:"ear",rate:1.5,offset:[-0.4,0,.04],velocity:[.3,0,0],life:[1.05,1.2],size:[.1,.05],rotation:0,color:"#5cc489"}],syllable:[{glyph:"arc",anchor:"mouth",rate:2,offset:[.1,0,.06],mirror:true,velocity:[.24,.02,.04],jitter:.02,life:[.55,.7],size:[.03,.085],rotation:0,color:"#6aaee6"}],"enter:happy":[{glyph:"sparkle",anchor:"top",rate:7,spread:.22,velocity:[0,.3,.05],jitter:.4,gravity:.5,drag:1.5,life:[.7,1.1],size:[.06,0],spin:2.4,color:"#ffc94d"},{glyph:"heart",anchor:"top",rate:2,spread:.12,velocity:[0,.32,.05],jitter:.15,wobble:.06,life:[1,1.3],size:[.045,.08],color:"#ff6b8f"}],happy:[{glyph:"sparkle",anchor:"top",rate:2.5,spread:.35,velocity:[0,.14,0],jitter:.1,life:[.6,.9],size:[.045,0],spin:1.6,color:"#ffd166"}],working:[{glyph:"gear",anchor:"top",rate:.7,offset:[.12,.02,.05],spread:.03,velocity:[.05,.1,0],jitter:.02,wobble:.02,life:[2,2.4],size:[.035,.065],spin:2.2,color:"#a99cf0"},{glyph:"dot",anchor:"top",rate:2.2,offset:[-0.16,.06,.05],spread:.02,velocity:[-0.06,.14,0],jitter:.03,life:[.8,1.1],size:[.015,.006],color:"#c7bfff",glow:true}],"enter:error":[{glyph:"warning",anchor:"top",rate:1,offset:[.02,.12,.08],velocity:[0,.16,0],drag:2.2,life:[1.5,1.5],size:[.12,.1],color:"#ff4d3d"},{glyph:"spark",anchor:"top",rate:6,offset:[0,0,.05],velocity:[0,.4,0],jitter:1.3,gravity:1.6,life:[.25,.4],size:[.035,.015],color:"#ffd166",glow:true,align:true}],error:[{glyph:"puff",anchor:"top",rate:2.2,offset:[.02,.02,0],spread:.04,velocity:[0,.16,0],jitter:.05,wobble:.04,drag:.4,life:[1.3,1.7],size:[.04,.13],color:"#8b8fa3"}],"enter:surprised":[{glyph:"exclaim",anchor:"top",rate:1,offset:[.04,.14,.06],velocity:[0,.3,0],drag:3.5,life:[1.1,1.1],size:[.11,.08],rotation:-0.15,color:"#ffcc33"},{glyph:"spark",anchor:"top",rate:8,offset:[0,.02,.04],spread:.04,velocity:[0,.5,0],jitter:1.1,drag:4,life:[.3,.42],size:[.05,.02],color:"#ffe08a",align:true}],celebrating:[{glyph:"confetti",anchor:"top",rate:2.6,spread:.25,velocity:[0,.7,.05],jitter:.7,gravity:.9,drag:1.4,wobble:.06,life:[1.6,2.2],size:[.03,.026],spin:7,color:"#ff5d8f"},{glyph:"confetti",anchor:"top",rate:2.6,spread:.25,velocity:[0,.7,.05],jitter:.7,gravity:.9,drag:1.4,wobble:.06,life:[1.6,2.2],size:[.03,.026],spin:-6,color:"#ffc933"},{glyph:"confetti",anchor:"top",rate:2.6,spread:.25,velocity:[0,.7,.05],jitter:.7,gravity:.9,drag:1.4,wobble:.06,life:[1.6,2.2],size:[.03,.026],spin:8,color:"#4dc3ff"},{glyph:"confetti",anchor:"top",rate:2.6,spread:.25,velocity:[0,.7,.05],jitter:.7,gravity:.9,drag:1.4,wobble:.06,life:[1.6,2.2],size:[.03,.026],spin:-7,color:"#5ee08f"}],"enter:celebrating":[{glyph:"star",anchor:"top",rate:6,spread:.1,velocity:[0,.55,.05],jitter:.9,gravity:.6,drag:1.6,life:[.8,1.2],size:[.06,.02],spin:2,color:"#ffd23f"}],sad:[{glyph:"cloud",anchor:"top",rate:.42,offset:[-0.12,.22,.02],velocity:[0,0,0],wobble:.015,life:[2.6,2.6],size:[.15,.15],color:"#9aa3bd"},{glyph:"drop",anchor:"top",rate:4,offset:[-0.12,.16,.03],spread:.08,velocity:[0,-0.25,0],gravity:1.2,life:[.45,.6],size:[.018,.014],color:"#6aa8ff",align:true}],land:[{glyph:"puff",anchor:"feet",rate:7,spread:.1,velocity:[0,.05,0],jitter:.32,drag:3.5,life:[.45,.7],size:[.05,.12],color:"#c4cad9"}]};function xt(t){let e=parseInt(t.replace("#",""),16);return [(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function Ne(t,e){return t==="drop"?Math.atan2(e[0],-e[1]):Math.atan2(e[1],e[0])}var U=class{constructor(e,o){this.character=e;this.random=o;let r=e.spec.fx??{},a=new Set([...Object.keys(Se),...Object.keys(r)].filter(s=>s!=="replace"));for(let s of a){let i=r[s]??[],n=r.replace?.includes(s)?i:[...Se[s]??[],...i];this.emitters[s]=n.filter(l=>e.anchors[l.anchor]);}}character;random;a=new Float32Array(J*4);b=new Float32Array(J*4);c=new Float32Array(J*4);count=0;emitters={};carry=new Map;particles=[];update(e,o,r){for(let s of this.emitters[o.expression]??[])this.emitContinuous(s,e*o.weights[o.expression],r);for(let s of this.emitters.ambient??[])this.emitContinuous(s,e,r);for(let s of o.events)for(let i of this.emitters[s]??[])this.burst(i,i.rate,r);let a=[];for(let s of this.particles){if(s.age+=e,s.age>=s.life)continue;let i=s.spec;s.vel[1]-=(i.gravity??0)*e;let n=Math.max(0,1-(i.drag??0)*e);for(let l=0;l<3;l++)s.vel[l]*=n,s.pos[l]+=s.vel[l]*e;i.wobble&&(s.pos[0]+=Math.cos(s.age*3.1+s.seed*6.28)*i.wobble*e*3),s.rot=i.align?Ne(i.glyph,s.vel):s.rot+(i.spin??0)*e,a.push(s);}this.particles=a.slice(-J),this.pack();}emitContinuous(e,o,r){let a=(this.carry.get(e)??this.random())+e.rate*o,s=Math.floor(a);this.carry.set(e,a-s),s>0&&this.burst(e,s,r);}burst(e,o,r){let a=this.character.anchors[e.anchor],s=this.random;for(let i=0;i<o;i++){let n=e.mirror&&i%2===1?-1:1,l=e.offset??[0,0,0],h=e.spread??0,f=[a.at[0]+l[0]*n+(s()-.5)*2*h,a.at[1]+l[1]+(s()-.5)*2*h,a.at[2]+l[2]+(s()-.5)*2*h],c=e.jitter??0,m=[e.velocity[0]*n+(s()-.5)*2*c,e.velocity[1]+(s()-.5)*c,e.velocity[2]+(s()-.5)*2*c];this.particles.push({pos:r.point(a.bone,f),vel:m,age:0,life:e.life[0]+(e.life[1]-e.life[0])*s(),size:e.size,rot:e.align?Ne(e.glyph,m):n<0?Math.PI-(e.rotation??0):(e.rotation??0)+(e.spin?s():0),spec:e,color:xt(e.color),seed:s()});}}pack(){this.count=this.particles.length,this.particles.forEach((e,o)=>{let r=e.age/e.life,a=1-(1-r)*(1-r),s=ke(0,.12,r)*(1-ke(.62,1,r)),i=o*4;this.a.set([e.pos[0],e.pos[1],e.pos[2],e.size[0]+(e.size[1]-e.size[0])*a],i),this.b.set([gt[e.spec.glyph],s,e.rot,e.spec.glow?1:0],i),this.c.set([e.color[0],e.color[1],e.color[2],e.seed],i);});}};function j(t){let e=parseInt(t.replace("#",""),16),o=r=>Math.pow(r/255,2.2);return [o(e>>16&255),o(e>>8&255),o(e&255)]}function De(t){return `#${t.map(e=>Math.round(Math.pow(Math.min(Math.max(e,0),1),1/2.2)*255).toString(16).padStart(2,"0")).join("")}`}var p=t=>{let e=Number(t.toFixed(5)).toString();return e.includes(".")||e.includes("e")?e:`${e}.0`},X=t=>`vec2(${p(t[0])}, ${p(t[1])})`,S=t=>`vec3(${p(t[0])}, ${p(t[1])}, ${p(t[2])})`;function _e(t){let e=O(C(),t[0],t[1],t[2]);return `mat3(${[0,1,2].map(r=>[e[r],e[4+r],e[8+r]]).flat().map(p).join(", ")})`}function Ge(t){let e=["vec2 map(vec3 p) {","  vec2 r = vec2(1e9, 0.0);","  vec3 l;"],o=new Set,r=a=>(o.has(a)||(o.add(a),e.push(`  vec3 b${a} = (uBones[${a}] * vec4(p, 1.0)).xyz;`)),`b${a}`);return t.spec.parts.forEach((a,s)=>{let i=r(t.boneIndex(a.bone,`parts[${s}]`)),n=a.at??[0,0,0],l=a.rot?`${_e(a.rot)} * (${i} - ${S(n)})`:`${i} - ${S(n)}`;e.push(`  l = ${l};`);let h=p(t.materialId(a.material,`parts[${s}]`));if(a.shape==="hem"){e.push(`  r.x = smax(r.x, ${p(a.y)} + ${p(a.amplitude)} * sin(atan(l.z, l.x) * ${p(a.waves)} + uTime * ${p(a.speed)}) - l.y, ${p(a.blend)});`);return}let f=a.clip?`max(${He(a)}, dot(l, ${S(bt(a.clip.normal))}) - ${p(a.clip.offset??0)})`:He(a),c=p(a.blend??0);e.push(a.op==="sub"?`  opSub(r, ${f}, ${c});`:`  opAdd(r, ${f}, ${h}, ${c});`);}),e.push(...yt(t,r)),e.push("  r.x *= uScaleFix;","  return r;","}"),e.join(`
`)}function bt(t){let e=Math.hypot(...t)||1;return [t[0]/e,t[1]/e,t[2]/e]}function He(t){switch(t.shape){case "sphere":return `sdSphere(l, ${p(t.radius)})`;case "ellipsoid":return `sdEllipsoid(l, ${S(t.radii)})`;case "roundBox":return `sdRoundBox(l, ${S(t.half)}, ${p(t.round)})`;case "capsule":return `sdCapsule(l, ${S(t.from)}, ${S(t.to)}, ${p(t.radius)})`;case "roundCone":return `sdRoundCone(l, ${S(t.from)}, ${S(t.to)}, ${p(t.r1)}, ${p(t.r2)})`;case "cylinder":return `sdCylinder(l, ${p(t.radius)}, ${p(t.half)}, ${p(t.round)})`;case "frame":return `sdFrame(l, ${X(t.half)}, ${p(t.corner)}, ${p(t.width)}, ${p(t.depth)})`;case "plate":return `sdPlate(l, ${X(t.half)}, ${p(t.corner)}, ${p(t.depth)})`;case "hem":throw new Error("unreachable")}}function yt(t,e){let o=t.spec.eyes;if(!o)return [];let r=e(t.boneIndex(o.bone,"eyes")),a=[];if(o.kind==="ball"){let s=p(t.materialId(o.lid,"eyes.lid")),i=o.radius;o.at.forEach((n,l)=>{let h=l===0?"-1.0":"1.0";a.push(`  l = ${r} - ${S(n)};`,`  opAdd(r, length(l) - ${p(i)}, ${p(t.eyeIds[l])}, 0.0);`,"  {",`    float tilt = uFaceB.w * ${h};`,"    vec3 q = vec3(mat2(cos(tilt), sin(tilt), -sin(tilt), cos(tilt)) * l.xy, l.z);",`    float shell = length(q) - ${p(i*1.1)};`,`    float lid = clamp(uFaceA.y + uFaceD.w * ${h} * 0.38 - uFaceD.z * 0.1, 0.0, 1.0);`,`    float top = mix(${p(i*1.18)}, ${p(-i*.14)}, max(uFaceA.x, lid));`,`    float bottom = mix(${p(-i*1.18)}, ${p(-i*.02)}, uFaceA.z * 0.85);`,`    opAdd(r, min(max(shell, top - q.y), max(shell, q.y - bottom)), ${s}, 0.0);`,"  }");});}else {let s=p(t.materialId(o.material,"eyes.material")),[i,n,l]=o.radii;a.push("  float grow = 1.0 + 0.2 * uFaceD.z;"),o.at.forEach((h,f)=>{let c=f===0?"-1.0":"1.0";a.push(`  float open${f} = max(0.12, (1.0 - max(uFaceA.x, clamp(uFaceA.y + uFaceD.w * ${c} * 0.45, 0.0, 1.0))) * (1.0 - 0.6 * uFaceA.z));`,`  l = ${r} - ${S(h)} - vec3(uFaceB.y * ${p(i*.45)}, uFaceB.z * ${p(n*.3)}, 0.0);`,`  opAdd(r, sdEllipsoid(l, vec3(${p(i)} * grow, ${p(n)} * grow * open${f}, ${p(l)})), ${s}, 0.0);`);});}return a}var q=t=>S(j(t));function wt(t,e){let o=t.glows?`uGlow * ${p(t.emitStrength??1)}`:t.emit?`${q(t.emit)} * ${p(t.emitStrength??1)}`:"vec3(0.0)";return `Material(uAlbedo[${e}], ${p(t.f0??.04)}, ${p(t.spec??.5)}, ${p(t.shininess??40)}, ${p(t.metal??0)}, ${p(t.rim??.5)}, ${p(t.sheen??0)}, ${p(t.sss??0)}, ${t.sssColor?q(t.sssColor):"vec3(0.0)"}, ${o}, ${p(t.gloss??.3)})`}var Ue=t=>t.map(e=>`k == ${e}`).join(" || ");function Xe(t){let e=["Material getMaterial(float id, vec3 p, vec3 n) {","  int k = int(id + 0.5);","  Material m = material(vec3(0.5));"];return t.materials.forEach(({id:o,spec:r},a)=>e.push(`  ${a?"else ":""}if (k == ${o}) m = ${wt(r,a)};`)),t.spec.paints?.forEach((o,r)=>{let a=t.boneIndex(o.bone,`paints[${r}]`),s=o.on.map(l=>t.materialId(l,`paints[${r}]`)),i=p(o.soft??.15),n=o.kind==="sphere"?`(length(q) - ${p(o.radius??.1)}) / ${p(o.radius??.1)}`:`q.z > 0.0 ? length(q.xy / ${X(o.radii??[.1,.1])}) - 1.0 : 1.0`;e.push(`  if (${Ue(s)}) {`,`    vec3 q = (uBones[${a}] * vec4(p, 1.0)).xyz - ${S(o.at)};`,`    float e = ${n};`,`    m.albedo = mix(m.albedo, ${q(o.color)}, (1.0 - smoothstep(-${i}, ${i}, e)) * ${p(o.opacity??1)});`,"  }");}),e.push(...Mt(t),...St(t),"  return m;","}"),e.join(`
`)}function Ke(t){let e=["void surface(float id, vec3 p, inout vec3 n, inout Material m) {","  int k = int(id + 0.5);"];for(let{id:o,spec:r,name:a}of t.materials){let s=r.surface;if(!s)continue;let i=t.boneIndex(s.bone??"root",`materials.${a}.surface`),n=p(s.strength??.5);e.push(`  if (k == ${o}) {`,`    vec3 q = (uBones[${i}] * vec4(p, 1.0)).xyz * ${p(s.scale)};`,`    float detail = ${n} * (1.0 - smoothstep(0.25, 0.9, gPixel * ${p(s.scale)}));`,...kt(s.kind,s.color),"  }");}return e.push("}"),e.join(`
`)}function kt(t,e){let o=r=>[`    vec3 g = vec3(noise3(${r}), noise3(${r} + 17.3), noise3(${r} + 41.7)) - 0.5;`,"    g -= n * dot(g, n);"];switch(t){case "fur":return [...o("q"),"    n = normalize(n + g * 0.5 * detail);","    float clump = noise3(q * 0.23);","    m.albedo *= mix(1.0, 0.9 + 0.2 * clump, detail);"];case "scales":return ["    float c = noise3(q);","    float e = 0.12;","    vec3 grad = vec3(noise3(q + vec3(e, 0, 0)), noise3(q + vec3(0, e, 0)), noise3(q + vec3(0, 0, e))) - c;","    grad -= n * dot(grad, n);","    n = normalize(n - grad * 2.2 * detail);","    float seam = 1.0 - smoothstep(0.03, 0.13, abs(c - 0.5));",`    m.albedo = mix(m.albedo, ${e?q(e):"m.albedo * 0.55"}, seam * 0.7 * detail);`,"    m.albedo *= 0.9 + 0.2 * noise3(q * 0.31) * detail;"];case "speckle":return ["    float spot = smoothstep(0.66, 0.7, noise3(q)) * (0.6 + 0.4 * noise3(q * 0.37));",`    m.albedo = mix(m.albedo, ${e?q(e):"m.albedo * 0.6"}, spot * detail);`];case "ripple":return [...o("q"),"    n = normalize(n + g * 0.35 * detail);"]}}function Mt(t){let e=t.spec.eyes;if(e?.kind!=="ball")return [];let o=t.boneIndex(e.bone,"eyes"),r=[];return e.at.forEach((a,s)=>{r.push(`  if (k == ${t.eyeIds[s]}) {`,`    vec3 q = normalize((uBones[${o}] * vec4(p, 1.0)).xyz - ${S(a)});`,"    vec3 g = normalize(vec3(uFaceB.y * 0.5, uFaceB.z * 0.38, 1.0));","    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), g));","    vec3 up = cross(g, right);","    vec2 s = vec2(dot(q, right), dot(q, up));","    float front = step(0.0, dot(q, g));",`    float aa = gPixel / ${p(e.radius)} + 0.02;`,"    float rr = length(s);",`    float iris = front - front * smoothstep(${p(e.irisSize)} - aa, ${p(e.irisSize)} + aa, rr);`,`    float ps = ${p(e.pupilSize)} * (1.0 - 0.4 * uFaceD.z);`,`    float pupil = front - front * smoothstep(ps - aa, ps + aa, length(s / vec2(${p(e.pupilAspect??1)}, 1.0)));`,`    vec3 irisCol = ${q(e.iris)} * (0.55 + 0.9 * smoothstep(${p(e.irisSize)}, 0.0, rr)) * (0.7 + 0.3 * hash12(floor(vec2(atan(s.y, s.x) * 9.0, rr * 30.0))));`,"    vec3 albedo = mix(vec3(0.82, 0.8, 0.78), irisCol, iris);","    albedo = mix(albedo, vec3(0.004), pupil);","    m = Material(albedo, 0.06, 2.4, 600.0, 0.0, 0.15, 0.0, 0.0, vec3(0.0), vec3(0.0), 1.0);","  }");}),r}function St(t){let e=t.spec.face;if(!e)return [];if(e.kind==="screen"){let s=t.boneIndex(e.bone,"face");return [`  if (k == ${t.materialId(e.material,"face.material")}) {`,`    vec2 q = (uBones[${s}] * vec4(p, 1.0)).xy - ${X(e.center)};`,`    m.emit += screenLight(q, ${q(e.color)}, ${p(e.cell)}, ${X(e.half)}, ${p(e.corner)});`,"  }"]}let o=t.boneIndex(e.bone,"face"),r=e.on.map(s=>t.materialId(s,"face.on")),a=e.width;return [`  if (${Ue(r)}) {`,`    vec3 q = (uBones[${o}] * vec4(p, 1.0)).xyz - ${S(e.at)};`,"    if (q.z > -0.02) {",`      vec3 mo = mouth(q.xy, ${p(a)}, uFaceB.x * ${p(a*1.1)}, uFaceD.y, uFaceA.w, uFaceD.w, ${p(a*.12)}, gPixel * 0.8);`,"      float a = mo.x;",`      vec3 inner = ${q(e.color)} * (1.25 - 0.5 * mo.z);`,`      m.albedo = mix(m.albedo, mix(inner, ${q(e.tongue)}, mo.y), a);`,"      m.spec *= 1.0 - 0.6 * a; m.sss *= 1.0 - a; m.sheen *= 1.0 - a; m.emit *= 1.0 - a;","    }","  }"]}var We=`
const vec3 KEY = vec3(-0.4485, 0.6997, 0.5562);
const vec3 FILL = vec3(0.8521, -0.1504, 0.5013);
const vec3 BACK = vec3(0.5529, 0.5529, -0.6233);

struct Material {
  vec3 albedo;
  float f0;
  float spec;
  float shininess;
  float metal;
  float rim;
  float sheen;
  float sss;
  vec3 sssColor;
  vec3 emit;
  float gloss;
};

Material material(vec3 albedo) {
  return Material(albedo, 0.04, 0.5, 40.0, 0.0, 0.5, 0.0, 0.0, vec3(0.0), vec3(0.0), 0.3);
}

/* the studio as seen in a reflection along r; gloss tightens the edges of the lights */
vec3 environment(vec3 r, float gloss) {
  float up = r.y;
  float horizon = 0.05 + 0.12 * smoothstep(-0.25, 0.3, up);
  float softbox = 1.1 * smoothstep(mix(0.42, 0.66, gloss), mix(0.78, 0.7, gloss), up) * smoothstep(-0.9, mix(-0.2, -0.75, gloss), r.z - 0.6 * abs(r.x));
  float window = 2.6 * smoothstep(mix(0.86, 0.95, gloss), mix(0.97, 0.965, gloss), dot(r, KEY));
  float strip = 0.5 * smoothstep(0.6, 0.85, -r.x) * smoothstep(-0.35, 0.05, up) * (1.0 - smoothstep(0.2, 0.5, up));
  float floorBounce = 0.06 * smoothstep(0.0, -0.6, up);
  return vec3(0.97, 0.99, 1.04) * (horizon + softbox + window + strip) + vec3(1.0, 0.92, 0.85) * floorBounce;
}

float softShadow(vec3 ro, vec3 rd, float tmin, float tmax, float k) {
  float res = 1.0;
  float t = tmin;
  for (int i = ZERO; i < 32; i++) {
    float h = map(ro + rd * t).x;
    res = min(res, k * h / t);
    t += clamp(h, 0.012, 0.2);
    if (res < 0.002 || t > tmax) break;
  }
  res = clamp(res, 0.0, 1.0);
  return res * res * (3.0 - 2.0 * res);
}

float ambientOcclusion(vec3 p, vec3 n) {
  float occ = 0.0, sca = 1.0;
  for (int i = ZERO; i < 5; i++) {
    float h = 0.012 + 0.12 * float(i) / 4.0;
    occ += (h - map(p + h * n).x) * sca;
    sca *= 0.85;
  }
  return clamp(1.0 - 2.2 * occ, 0.0, 1.0);
}

/* 0 where the body is thick behind the surface, 1 where light gets through */
float thinness(vec3 p, vec3 n) {
  float s = 0.0;
  for (int i = ZERO; i < 3; i++) {
    float h = 0.05 + 0.09 * float(i);
    s += clamp((map(p - n * h).x + h) / h, 0.0, 1.0);
  }
  return s / 3.0;
}

vec3 shade(Material m, vec3 p, vec3 n, vec3 v) {
  vec3 key = KEY;
  float sh = softShadow(p + n * 0.004, key, 0.01, 2.5, 9.0);
  float ao = ambientOcclusion(p, n);

  float ndl = dot(n, key);
  /* a little wrap so the terminator is soft, like a moulded part */
  float keyLight = max(0.0, (ndl + 0.12) / 1.12) * sh;
  float fill = max(0.0, dot(n, FILL));
  float sky = 0.5 + 0.5 * n.y;
  float ndv = max(0.0, dot(n, v));
  float fres = m.f0 + (1.0 - m.f0) * pow(1.0 - ndv, 5.0);
  vec3 r = reflect(-v, n);
  float specOcc = mix(ao, 1.0, 0.35) * mix(sh, 1.0, 0.6);
  vec3 env = environment(r, m.gloss) * fres * specOcc;
  float hi = m.spec * pow(max(0.0, dot(n, normalize(key + v))), m.shininess) * sh;
  float back = max(0.0, dot(n, BACK));
  float rim = m.rim * back * back * pow(1.0 - ndv, 1.6);
  float bounce = 0.1 * max(0.0, -n.y);

  float diffuse = (0.06 + 0.12 * sky) * ao + 1.2 * keyLight + 0.16 * fill * ao + bounce * ao;
  vec3 tint = vec3(1.0 - m.metal) + m.metal * m.albedo * 2.2;
  vec3 col = m.albedo * diffuse * (1.0 - fres * 0.6);
  col += (env + hi) * tint;
  col += rim * vec3(0.62, 0.78, 1.0) * (0.35 + m.albedo);
  /* velvet: fibres catch light at grazing angles */
  col += m.sheen * pow(1.0 - ndv, 2.5) * (0.4 + 0.6 * keyLight) * (m.albedo * 0.7 + 0.3);

  if (m.sss > 0.0) {
    float th = thinness(p, n);
    float through = pow(clamp(dot(v, -key) * 0.5 + 0.5, 0.0, 1.0), 2.0);
    col += m.sssColor * m.sss * (0.18 + 0.55 * th + 0.4 * through * th) * (0.55 + 0.45 * ao);
  }
  return col + m.emit;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
`;var Ye=`
vec3 calcNormal(vec3 p) {
  vec3 n = vec3(0.0);
  for (int i = ZERO; i < 4; i++) {
    vec3 e = 0.5773 * (2.0 * vec3(float(((i + 3) >> 1) & 1), float((i >> 1) & 1), float(i & 1)) - 1.0);
    n += e * map(p + 0.0006 * e).x;
  }
  return normalize(n);
}

vec4 over(vec4 top, vec4 under) { return top + under * (1.0 - top.a); }

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  float pitch = uCamera.w;
  vec3 target = vec3(0.0, uCamera.x, 0.0);
  vec3 ro = target + uCamera.y * vec3(0.0, sin(pitch), cos(pitch));
  vec3 fw = normalize(target - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(fw + (uv.x * rt + uv.y * up) * uCamera.z);
  float pixelAngle = 2.0 * uCamera.z / uResolution.y;

  vec4 body = vec4(0.0);
  float hitT = -1.0;
  vec3 oc = ro - uBound.xyz;
  float b = dot(oc, rd);
  float disc = b * b - dot(oc, oc) + uBound.w * uBound.w;
  if (disc > 0.0) {
    float s = sqrt(disc);
    float t = max(-b - s, 0.0);
    float tEnd = -b + s;
    float nearest = 1e9;
    float nearestT = 0.0;
    for (int i = ZERO; i < 140; i++) {
      float d = map(ro + rd * t).x;
      float px = t * pixelAngle;
      if (d < 0.2 * px) { hitT = t; break; }
      float ratio = d / px;
      if (ratio < nearest) { nearest = ratio; nearestT = t; }
      t += d * 0.85;
      if (t > tEnd) break;
    }
    float coverage = hitT > 0.0 ? 1.0 : 1.0 - smoothstep(0.2, 1.0, nearest);
    if (coverage > 0.0) {
      float tt = hitT > 0.0 ? hitT : nearestT;
      vec3 p = ro + rd * tt;
      gPixel = tt * pixelAngle;
      vec3 n = calcNormal(p);
      float id = map(p).y;
      Material m = getMaterial(id, p, n);
      surface(id, p, n, m);
      vec3 col = pow(aces(shade(m, p, n, -rd) * uExposure), vec3(1.0 / 2.2));
      body = vec4(col * coverage, coverage);
      if (hitT < 0.0) hitT = tt;
    }
  }

  vec4 floorLayer = vec4(0.0);
  if (uFloor > 0.0 && body.a < 1.0 && rd.y < 0.0) {
    vec3 fp = ro + rd * (-ro.y / rd.y);
    float r = length(fp.xz - uBound.xz);
    float reach = uBound.w * 1.15;
    if (r < reach) {
      float sky = softShadow(fp + vec3(0.0, 0.002, 0.0), vec3(0.1191, 0.9800, 0.1588), 0.02, 3.0, 3.2);
      float contact = 1.0 - smoothstep(0.0, 0.28, map(fp).x);
      float dark = (1.0 - sky) * 0.4 + contact * contact * 0.32;
      dark *= 1.0 - smoothstep(reach * 0.45, reach, r);
      /* a shadow fades as what casts it rises */
      dark *= mix(1.0, 0.5, smoothstep(0.0, 0.45, uLift));
      /* the state's light pooling on the floor */
      vec3 pool = uGlow * uGlowPool * exp(-r * r * 5.0) * (1.0 - dark);
      floorLayer = vec4(uShadow * dark + pool, dark) * uFloor;
    }
  }

  vec4 front = vec4(0.0);
  vec4 back = vec4(0.0);
  float pixel = 2.0 / uResolution.y;
  for (int i = 0; i < uFxCount; i++) {
    vec4 A = uFxA[i];
    vec4 B = uFxB[i];
    vec3 d = A.xyz - ro;
    float z = dot(d, fw);
    if (z < 0.1) continue;
    float scale = 1.0 / (z * uCamera.z);
    vec2 q = (uv - vec2(dot(d, rt), dot(d, up)) * scale) / (A.w * scale);
    if (dot(q, q) > 2.0) continue;
    float cr = cos(B.z), sr = sin(B.z);
    q = mat2(cr, -sr, sr, cr) * q;
    vec2 g = glyph(int(B.x + 0.5), q, pixel / (A.w * scale));
    float a = g.x * B.y;
    if (a < 0.002) continue;
    vec3 col = mix(uFxC[i].rgb, vec3(1.0), clamp(g.y, 0.0, 1.0)) * (1.0 + min(g.y, 0.0));
    vec4 layer = B.w > 0.5 ? vec4(col * a, 0.0) : vec4(col * a, a);
    if (hitT > 0.0 && hitT < length(d)) back = over(layer, back);
    else front = over(layer, front);
  }

  fragColor = over(front, over(body, over(back, floorLayer)));
}
`;var Ze=`
/* q: point in mouth space (x right, y up); w: half width; open: lip
   separation in the same units; round: 0 for "ah"/"ee", 1 for "oo";
   smile: -1..1; crooked: -1..1 tilts and wobbles the line, as when something
   is wrong; t: half the stroke; px: a pixel in mouth units.
   Returns coverage, tongue coverage, and depth inside the mouth (0 at the lips, 1 deep). */
vec3 mouth(vec2 q, float w, float open, float round, float smile, float crooked, float t, float px) {
  float opened = smoothstep(0.0, 0.25 * w, open);
  w *= 1.0 - 0.3 * round * opened;
  open *= 1.0 + 0.1 * round;
  /* an "oo" pushes the lips forward and flattens the smile out of them */
  float bend = smile * 0.55 * (1.0 - 0.7 * round * opened);

  float u = clamp(q.x / w, -1.0, 1.0);
  float bulge = sqrt(max(1.0 - u * u, 0.0));
  float line = bend * w * u * u + crooked * w * (0.22 * u + 0.12 * sin(u * 6.0));
  float upper = line + open * (0.22 + 0.45 * round) * bulge;
  float lower = line - open * bulge;

  /* vertical distances are cheap and exact along y; the slope converts the
     antialiasing width so the steep sides near the corners stay crisp */
  float steep = abs(u) / max(bulge, 0.08);
  float slope = abs(2.0 * bend * u) + abs(crooked) * 0.9 + open / w * steep;
  float aa = px * sqrt(1.0 + min(slope * slope, 36.0));

  /* the lips taper toward the corners once the mouth is open */
  float lip = t * mix(1.0, sqrt(bulge), opened);
  float inside = max(q.y - upper, lower - q.y);
  float body = abs(q.x) <= w ? inside - lip : 1e3;
  /* round caps finish the closed stroke; an open mouth's lips already meet in a point */
  float cap = length(vec2(abs(q.x) - w, q.y - bend * w - crooked * w * (0.22 * sign(q.x) + 0.12 * sin(6.0 * sign(q.x))))) - t;
  float a = max(1.0 - smoothstep(-aa, aa, body), (1.0 - smoothstep(-px, px, cap)) * (1.0 - opened));

  /* a tongue resting on the lower lip, only inside the opening */
  float hole = 1.0 - smoothstep(-aa, aa, inside);
  vec2 tq = vec2(q.x / (w * (0.5 - 0.1 * round)), (q.y + open * 0.78) / max(0.42 * open, 1e-4));
  float tongue = (1.0 - smoothstep(-0.08, 0.08, length(tq) - 1.0)) * hole * smoothstep(0.08, 0.35, open / w);

  float depth = clamp(-inside / max(0.5 * open, 1e-4), 0.0, 1.0) * hole;
  return vec3(a, tongue, depth);
}
`;var Qe=`
float fxSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float fxDot2(vec2 v) { return dot(v, v); }

float fxHeart(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(fxDot2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(fxDot2(p - vec2(0.0, 1.0)), fxDot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

float fxTeardrop(vec2 p, float r1, float r2, float h) {
  p.x = abs(p.x);
  float b = (r1 - r2) / h;
  float a = sqrt(1.0 - b * b);
  float k = dot(p, vec2(-b, a));
  if (k < 0.0) return length(p) - r1;
  if (k > a * h) return length(p - vec2(0.0, h)) - r2;
  return dot(p, vec2(a, b)) - r1;
}

float fxStar(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

float fxTriangle(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

/* an exclamation mark, tapering toward its dot */
float fxExclaim(vec2 p) {
  float bar = fxSegment(p, vec2(0.0, -0.2), vec2(0.0, 0.8)) - mix(0.11, 0.19, clamp((p.y + 0.2), 0.0, 1.0));
  return min(bar, length(p - vec2(0.0, -0.66)) - 0.15);
}

/* coverage, highlight */
vec2 glyph(int g, vec2 p, float px) {
  float d = 1e9;
  float light = 0.0;
  float soft = 0.0;
  if (g == 0) {
    d = min(min(fxSegment(p, vec2(-0.6, 0.6), vec2(0.6, 0.6)), fxSegment(p, vec2(0.6, 0.6), vec2(-0.6, -0.6))), fxSegment(p, vec2(-0.6, -0.6), vec2(0.6, -0.6))) - 0.16;
  } else if (g == 1) {
    float ring = abs(length(p) - 0.82) - 0.07;
    float shine = length(p - vec2(-0.32, 0.36)) - 0.17;
    d = min(ring, shine);
    light = 1.0 - smoothstep(-px, px, shine);
    soft = 0.14 * (1.0 - smoothstep(0.75, 0.82, length(p)));
  } else if (g == 2) {
    vec2 q = abs(p);
    d = (sqrt(q.x) + sqrt(q.y) - 0.92) * 0.45;
    light = 1.0 - smoothstep(0.0, 0.35, length(p));
  } else if (g == 3) {
    d = fxHeart(p * 0.56 + vec2(0.0, 0.5)) / 0.56;
    light = (1.0 - smoothstep(-px, px, length(p - vec2(-0.38, 0.38)) - 0.13)) * 0.8;
  } else if (g == 4) {
    vec2 h = p - vec2(-0.28, -0.55);
    float head = (length(mat2(0.92, 0.39, -0.39, 0.92) * h / vec2(0.32, 0.23)) - 1.0) * 0.23;
    float stem = fxSegment(p, vec2(0.02, -0.5), vec2(0.02, 0.78)) - 0.07;
    float flag = fxSegment(p, vec2(0.02, 0.78), vec2(0.42, 0.36)) - 0.09;
    d = min(head, min(stem, flag));
  } else if (g == 5) {
    vec2 c = p - vec2(-1.1, 0.0);
    float a = atan(c.y, c.x);
    d = max(abs(length(c) - 1.45) - 0.1, (abs(a) - 0.48) * 1.45);
  } else if (g == 6) {
    float r = length(p);
    return vec2((1.0 - smoothstep(0.15, 1.0, r)) * 0.75, 0.25 + 0.35 * p.y);
  } else if (g == 7) {
    d = abs(length(p) - 0.84) - 0.06;
  } else if (g == 8) {
    d = fxTeardrop(p + vec2(0.0, 0.35), 0.55, 0.06, 1.05);
    light = (1.0 - smoothstep(-px, px, length(p - vec2(-0.2, -0.2)) - 0.12)) * 0.9;
  } else if (g == 9) {
    d = fxSegment(p, vec2(-1.0, 0.0), vec2(1.0, 0.0)) - 0.12 * (1.0 - abs(p.x) * 0.7);
    light = 0.6;
  } else if (g == 10) {
    float r = length(p);
    return vec2(exp(-r * r * 5.0), 1.0 - smoothstep(0.0, 0.3, r));
  } else if (g == 11) {
    d = (length(p / vec2(0.3, 0.95)) - 1.0) * 0.3;
    light = -0.35 * (1.0 - smoothstep(0.0, 0.05 + px, abs(p.x + 0.04 * p.y)));
  } else if (g == 13) {
    d = fxExclaim(p);
    light = 0.3 * (1.0 - smoothstep(-px, px, fxSegment(p, vec2(-0.05, 0.1), vec2(-0.05, 0.7)) - 0.035));
  } else if (g == 14) {
    d = fxTriangle(p - vec2(0.0, -0.12), 0.82) - 0.14;
    /* a white mark on the coloured sign */
    light = 1.0 - smoothstep(-px, px, fxExclaim((p - vec2(0.0, -0.08)) / 0.52) * 0.52);
  } else if (g == 15) {
    vec2 q = abs(p) - vec2(0.32, 0.78);
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.06;
    light = 0.35 * step(0.0, p.x);
  } else if (g == 16) {
    float c = min(min(length(p - vec2(-0.48, -0.08)) - 0.4, length(p - vec2(0.08, 0.18)) - 0.55), length(p - vec2(0.56, -0.1)) - 0.36);
    d = max(c, -p.y - 0.44);
    light = 0.45 * smoothstep(-0.2, 0.7, p.y) - 0.25 * (1.0 - smoothstep(-0.45, -0.1, p.y));
  } else if (g == 17) {
    d = fxStar(p, 0.92, 0.46) - 0.06;
    light = 0.5 * (1.0 - smoothstep(0.0, 0.45, length(p - vec2(-0.12, 0.18))));
  } else if (g == 18) {
    float r = length(p);
    float teeth = 0.66 + 0.2 * smoothstep(-0.25, 0.25, cos(atan(p.y, p.x) * 8.0));
    d = max(r - teeth, 0.26 - r);
    light = 0.3 * (1.0 - smoothstep(0.3, 0.7, length(p - vec2(-0.2, 0.25))));
  } else {
    d = length(p) - 0.9;
    light = 0.35 * (1.0 - smoothstep(0.0, 0.6, length(p - vec2(-0.3, 0.35))));
  }
  return vec2(max(1.0 - smoothstep(-px, px, d), soft), light);
}
`;var Je=`
float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-6);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
  vec3 ba = b - a;
  float l2 = dot(ba, ba);
  float rr = r1 - r2;
  float a2 = l2 - rr * rr;
  float il2 = 1.0 / l2;
  vec3 pa = p - a;
  float y = dot(pa, ba);
  float z = y - l2;
  vec3 xv = pa * l2 - ba * y;
  float x2 = dot(xv, xv);
  float y2 = y * y * l2;
  float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

/* along y, with rounded rims */
float sdCylinder(vec3 p, float r, float h, float rr) {
  vec2 d = vec2(length(p.xz) - r + rr, abs(p.y) - h + rr);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rr;
}

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

/* a rounded-rectangle ring in the xy plane, extruded along z: gaskets, bezels */
float sdFrame(vec3 p, vec2 b, float corner, float w, float depth) {
  float ring = abs(sdRoundRect(p.xy, b, corner)) - w;
  vec2 e = vec2(ring, abs(p.z) - depth);
  return min(max(e.x, e.y), 0.0) + length(max(e, 0.0));
}

float sdPlate(vec3 p, vec2 b, float corner, float depth) {
  vec2 e = vec2(sdRoundRect(p.xy, b, corner), abs(p.z) - depth);
  return min(max(e.x, e.y), 0.0) + length(max(e, 0.0));
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float smax(float a, float b, float k) { return -smin(-a, -b, k); }

/* union that keeps the material of whichever surface is nearer */
void opAdd(inout vec2 r, float d, float id, float k) {
  float m = d < r.x ? id : r.y;
  r.x = k > 0.0 ? smin(r.x, d, k) : min(r.x, d);
  r.y = m;
}

void opSub(inout vec2 r, float d, float k) {
  r.x = k > 0.0 ? smax(r.x, -d, k) : max(r.x, -d);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

/* smooth value noise, 0\u20131 */
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;var et=`
float sdBox2(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float fxStarLed(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

/* how lit a shape is at distance d: 1 inside, falling off over soft */
float lit(float d, float soft) { return 1.0 - smoothstep(-0.35, soft, d); }

float faceEyes(vec2 c, float soft) {
  vec2 g = vec2(uFaceB.y * 2.2, uFaceB.z * 1.4);
  float blink = uFaceA.x;
  float v = 0.0;
  for (int i = 0; i < 2; i++) {
    float side = i == 0 ? -1.0 : 1.0;
    float lid = clamp(uFaceA.y + uFaceD.w * side * 0.4, 0.0, 1.0);
    float closeTop = max(blink * 0.48, lid * 0.42);
    float closeBottom = max(blink * 0.48, uFaceA.z * 0.4);
    float cx = side * 4.5 + g.x;
    float top = 3.5 + 0.8 * uFaceD.z + g.y - 4.0 * closeTop;
    float bottom = -0.5 - 0.5 * uFaceD.z + g.y + 4.0 * closeBottom;
    float h = max((top - bottom) * 0.5, 0.32);
    float d = sdBox2(c - vec2(cx, (top + bottom) * 0.5), vec2(1.5 + 0.3 * uFaceD.z, h)) - 0.15;
    v = max(v, lit(d, soft));
  }
  return v;
}

/* a mouth of two lips, like the painted ones: open is in LED rows */
float faceMouth(vec2 c, float open, float round, float smile, float soft) {
  float opened = smoothstep(0.0, 0.8, open);
  float w = 3.4 - 1.4 * round * opened;
  vec2 m = c - vec2(0.0, -3.7 + 0.25 * open);
  float u = clamp(m.x / w, -1.0, 1.0);
  float bulge = sqrt(max(1.0 - u * u, 0.0));
  float line = smile * 0.9 * u * u;
  float inside = max(m.y - line - open * (0.2 + 0.45 * round) * bulge, line - open * bulge - m.y);
  float body = abs(m.x) <= w ? inside : 1e3;
  float rim = min(abs(body), length(vec2(abs(m.x) - w, m.y - smile * 0.9))) - 0.42;
  return max(lit(rim, soft), lit(body, soft) * 0.12 * opened);
}

float faceZ(vec2 c, vec2 at, float s, float soft) {
  vec2 p = (c - at) / s;
  float d = min(min(sdSegment(p, vec2(-1, 1), vec2(1, 1)), sdSegment(p, vec2(1, 1), vec2(-1, -1))), sdSegment(p, vec2(-1, -1), vec2(1, -1)));
  return lit(d * s - 0.32, soft);
}

bool is(float state, float id) { return abs(state - id) < 0.5; }

float faceFor(float state, vec2 c, float t, float soft) {
  float v = 0.0;
  if (is(state, E_THINKING)) {
    /* heavy-lidded eyes looking up, three dots pulsing in turn */
    v = faceEyes(c, soft);
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float pulse = 0.5 + 0.5 * sin(t * 4.2 - fi * 1.1);
      float d = length(c - vec2(-2.4 + fi * 2.4, -4.4)) - 0.62;
      v = max(v, lit(d, soft) * (0.25 + 0.75 * pulse * pulse));
    }
  } else if (is(state, E_LISTENING)) {
    /* alert eyes over a live equaliser */
    v = faceEyes(c, soft);
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float level = abs(sin(t * (5.0 + fi * 1.3) + fi * 1.7)) * (0.55 + 0.45 * sin(t * 2.3 + fi));
      float d = sdBox2(c - vec2(-4.5 + fi * 1.5, -4.6), vec2(0.42, 0.45 + 1.6 * level));
      v = max(v, lit(d, soft) * 0.9);
    }
  } else if (is(state, E_SPEAKING)) {
    /* the same two-lip mouth as the painted faces; closed, the lips meet in one bar */
    v = max(faceEyes(c, soft), faceMouth(c, uFaceB.x * 3.4, uFaceD.y, 0.0, soft));
  } else if (is(state, E_SLEEPING)) {
    /* closed eyes and rising z's */
    for (int i = 0; i < 2; i++) {
      float cx = i == 0 ? -4.5 : 4.5;
      float d = min(sdSegment(c, vec2(cx - 1.6, 1.4), vec2(cx, 0.6)), sdSegment(c, vec2(cx, 0.6), vec2(cx + 1.6, 1.4))) - 0.38;
      v = max(v, lit(d, soft));
    }
    for (int i = 0; i < 3; i++) {
      float k = fract(t * 0.22 + float(i) / 3.0);
      float fade = smoothstep(0.0, 0.15, k) * (1.0 - smoothstep(0.7, 1.0, k));
      v = max(v, faceZ(c, vec2(7.6 + k * 3.2, 1.2 + k * 5.0), 0.5 + k * 0.55, soft) * fade);
    }
  } else if (is(state, E_WORKING)) {
    /* narrowed eyes over a progress bar that fills, empties and fills again */
    v = faceEyes(c, soft);
    float rim = abs(sdBox2(c - vec2(0.0, -4.6), vec2(4.6, 0.95))) - 0.3;
    float fill = fract(t * 0.3) * 8.4;
    float bar = sdBox2(c - vec2(-4.2 + fill * 0.5, -4.6), vec2(fill * 0.5, 0.35));
    v = max(v, max(lit(rim, soft) * 0.55, lit(bar, soft)));
  } else if (is(state, E_ERROR)) {
    /* X eyes and a zigzag mouth */
    for (int i = 0; i < 2; i++) {
      vec2 e = c - vec2(i == 0 ? -4.5 : 4.5, 1.5);
      float d = min(sdSegment(e, vec2(-1.5, -1.5), vec2(1.5, 1.5)), sdSegment(e, vec2(-1.5, 1.5), vec2(1.5, -1.5))) - 0.42;
      v = max(v, lit(d, soft));
    }
    float zig = 1e3;
    for (int i = 0; i < 4; i++) {
      float x0 = -3.6 + float(i) * 1.8;
      zig = min(zig, sdSegment(c, vec2(x0, -4.6 + (i % 2 == 0 ? 0.6 : -0.6)), vec2(x0 + 1.8, -4.6 + (i % 2 == 0 ? -0.6 : 0.6))));
    }
    v = max(v, lit(zig - 0.4, soft));
  } else if (is(state, E_SURPRISED)) {
    /* round eyes with pinned pupils, and a little "o" */
    for (int i = 0; i < 2; i++) {
      vec2 e = c - vec2(i == 0 ? -4.5 : 4.5, 1.4);
      float ring = abs(length(e) - 2.0) - 0.42;
      v = max(v, max(lit(ring, soft), lit(length(e) - 0.62, soft)));
    }
    v = max(v, lit(abs(length(c - vec2(0.0, -4.7)) - 1.05) - 0.4, soft));
  } else if (is(state, E_CELEBRATING)) {
    /* star eyes that throb, and a wide open grin */
    float throb = 1.0 + 0.12 * sin(t * 9.0);
    for (int i = 0; i < 2; i++) {
      vec2 e = (c - vec2(i == 0 ? -4.5 : 4.5, 1.6)) / throb;
      v = max(v, lit(fxStarLed(e, 2.2, 0.48) * throb - 0.1, soft));
    }
    v = max(v, faceMouth(c - vec2(0.0, 0.6), 2.6, 0.0, 0.7, soft));
  } else if (is(state, E_SAD)) {
    /* eyes cut away at the outer top, a frown, and a tear now and then */
    for (int i = 0; i < 2; i++) {
      float side = i == 0 ? -1.0 : 1.0;
      float cx = side * 4.5;
      float box = sdBox2(c - vec2(cx, 1.0), vec2(1.5, 1.6)) - 0.15;
      float slope = (c.y - 1.9) + 0.55 * (c.x - cx) * side;
      v = max(v, lit(max(box, slope), soft));
    }
    float frown = max(abs(length(c - vec2(0.0, -7.2)) - 2.6) - 0.4, -(c.y + 5.4));
    v = max(v, lit(frown, soft));
    float k = fract(t * 0.35);
    float tear = length((c - vec2(-5.4, -0.6 - k * 5.0)) / vec2(0.8, 1.0)) - 0.6;
    v = max(v, lit(tear, soft) * smoothstep(0.0, 0.1, k) * (1.0 - smoothstep(0.6, 0.9, k)));
  } else if (is(state, E_HAPPY)) {
    /* ^ ^ and a smile */
    for (int i = 0; i < 2; i++) {
      float cx = i == 0 ? -4.5 : 4.5;
      float d = min(sdSegment(c, vec2(cx - 1.7, 0.4), vec2(cx, 2.2)), sdSegment(c, vec2(cx, 2.2), vec2(cx + 1.7, 0.4))) - 0.5;
      v = max(v, lit(d, soft));
    }
    float d = min(min(sdSegment(c, vec2(-3.0, -3.0), vec2(-1.3, -4.6)), sdSegment(c, vec2(-1.3, -4.6), vec2(1.3, -4.6))), sdSegment(c, vec2(1.3, -4.6), vec2(3.0, -3.0))) - 0.45;
    v = max(v, lit(d, soft));
  } else {
    v = faceEyes(c, soft);
  }
  return v;
}

/* the face at c, cross-faded from the previous state and glitched on a switch */
float face(vec2 c, float soft) {
  float row = floor(c.y);
  float tick = floor(uTime * 24.0);
  /* an error keeps glitching now and then */
  float glitch = max(uFaceC.w, is(uFaceC.x, E_ERROR) ? 0.6 * step(0.86, hash12(vec2(floor(uTime * 8.0), 7.7))) : 0.0);
  c.x += (hash12(vec2(row, tick)) - 0.5) * 7.0 * glitch * step(0.6, hash12(vec2(row * 1.7, tick)));
  float now = faceFor(uFaceC.x, c, uFaceD.x, soft);
  float before = faceFor(uFaceC.y, c, uFaceD.x, soft);
  float v = mix(before, now, uFaceC.z);
  return v * (1.0 - glitch * 0.45 * hash12(vec2(tick, 3.1)));
}

/* the emitted light of the matrix at a point on the screen (screen-local, in units) */
vec3 screenLight(vec2 q, vec3 color, float cell, vec2 extent, float corner) {
  vec2 c = q / cell;
  vec2 cellCentre = floor(c) + 0.5;
  vec2 f = fract(c) - 0.5;
  /* round LEDs, averaged out when one is smaller than a couple of pixels */
  float dotMask = 1.0 - smoothstep(0.26, 0.4, length(f));
  float footprint = gPixel / cell;
  dotMask = mix(dotMask, 0.5, smoothstep(0.18, 0.45, footprint));
  float led = face(cellCentre, 0.25);
  float glow = face(c, 1.6);
  float edge = smoothstep(0.0, 0.05, -sdRoundRect(q, extent, corner));
  /* a faint glare across the glass */
  float glare = 0.025 * smoothstep(0.1, 0.0, abs(q.x * 0.7 + q.y - extent.y * 0.35));
  vec3 lit = color * (led * dotMask * 2.1 + glow * 0.2) + glare + vec3(0.012, 0.016, 0.03) * dotMask;
  return lit * edge;
}
`;var pe=class extends Error{constructor(e,o){super(`${e}: ${o}`),this.name="SpecError";}};function tt(t){let e=c=>{throw new pe(t.id,c)},o=[{name:"root",pivot:[0,0,0],index:0,parentIndex:-1}],r=new Map([["root",0]]);t.bones.forEach((c,m)=>{r.has(c.name)&&e(`bone "${c.name}" is declared twice`);let d=c.parent??"root",u=r.get(d);u===void 0&&e(`bone "${c.name}" names parent "${d}", which is not declared before it`),r.set(c.name,m+1),o.push({...c,index:m+1,parentIndex:u});});let a=Object.entries(t.materials).map(([c,m],d)=>({name:c,id:d+1,spec:m})),s=new Map(a.map(c=>[c.name,c.id])),i=[a.length+1,a.length+2],n=(c,m)=>r.get(c)??e(`${m} names bone "${c}", which does not exist`),l=(c,m)=>s.get(c)??e(`${m} names material "${c}", which does not exist`);a.forEach(c=>{c.spec.shadeOf!==void 0&&l(c.spec.shadeOf,`materials.${c.name}.shadeOf`);}),t.parts.forEach((c,m)=>{n(c.bone,`parts[${m}]`),l(c.material,`parts[${m}]`);}),t.paints?.forEach((c,m)=>{n(c.bone,`paints[${m}]`),c.on.forEach(d=>l(d,`paints[${m}]`));});let h=o.map(()=>[]);for(let[c,m]of Object.entries(t.acting??{}))for(let[d,u]of Object.entries(m)){let y=n(d,`acting.${c}`);for(let[w,x]of Object.entries(u))h[y].push([c,w,x]);}let f={};for(let[c,m]of Object.entries(t.anchors??{}))f[c]={bone:n(m.bone,`anchors.${c}`),at:m.at};for(let[c,m]of Object.entries(t.fx??{}))c!=="replace"&&m.forEach((d,u)=>{f[d.anchor]||e(`fx.${c}[${u}] names anchor "${d.anchor}", which does not exist`);});return {spec:t,bones:o,boneIndex:n,materials:a,materialId:l,eyeIds:i,acting:h,anchors:f}}var he={uResolution:"vec2",uTime:"float",uCamera:"vec4",uBound:"vec4",uBones:"mat4[]",uScaleFix:"float",uFaceA:"vec4",uFaceB:"vec4",uFaceC:"vec4",uFaceD:"vec4",uGlow:"vec3",uShadow:"vec3",uFloor:"float",uLift:"float",uGlowPool:"float",uExposure:"float",uAlbedo:"vec3[materials]",uFxA:"vec4[fx]",uFxB:"vec4[fx]",uFxC:"vec4[fx]",uFxCount:"int"};function ot(t,e){return Object.entries(he).map(([o,r])=>r==="mat4[]"?`uniform mat4 ${o}[${t}];`:r==="vec3[materials]"?`uniform vec3 ${o}[${Math.max(1,e)}];`:r==="vec4[fx]"?`uniform vec4 ${o}[${J}];`:`uniform ${r} ${o};`).join(`
`)}var rt=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Et=()=>z.map(t=>`#define E_${t.toUpperCase()} ${p(ae[t])}`).join(`
`)+`
`;function Ee(t){let e=tt(t),o=["#version 300 es","precision highp float;","precision highp int;",ot(e.bones.length,e.materials.length),"out vec4 fragColor;","float gPixel = 0.001;","#define ZERO (min(int(uTime), 0))",Je,Ge(e),We,t.face?.kind==="screen"?Et()+et:"",t.face?.kind==="mouth"?Ze:"",Xe(e),Ke(e),Qe,Ye].join(`
`);return {spec:t,bones:e.bones,acting:e.acting,anchors:e.anchors,fragment:o,materials:e.materials.map(r=>r.name),albedo:new Float32Array(e.materials.flatMap(r=>j(r.spec.color))),stats:{parts:t.parts.length+(t.eyes?2:0),bones:e.bones.length,materials:e.materials.length,shaderLines:o.split(`
`).length}}}var $e=(t,e)=>[t[0]+e[0],t[1]+e[1],t[2]+e[2]],Ce=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],fe=(t,e)=>[t[0]*e,t[1]*e,t[2]*e],at=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],st=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],Ae=t=>Math.hypot(t[0],t[1],t[2]);function se(t){let e=Ae(t)||1;return [t[0]/e,t[1]/e,t[2]/e]}var it=["rx","ry","rz"];function $t(t,e){if(typeof t=="number")return t;let[o,r=0,a=0,s=0]=t;return o+r*Math.sin(e*a*Math.PI*2+s)}var K=class{constructor(e,o=e.map(()=>[])){this.bones=e;this.acting=o;this.world=e.map(()=>C()),this.inverse=new Float32Array(e.length*16),this.tips=e.map(()=>null),this.spun=e.map(()=>({rx:0,ry:0,rz:0}));}bones;acting;world;inverse;tips;spun;scratch={t:C(),r:C(),j:C(),inv:C()};point(e,o){return ye(this.world[e],o)}update(e,o,r,a,s){let{t:i,r:n,j:l,inv:h}=this.scratch;this.world[0].set(e);for(let f=1;f<this.bones.length;f++){let c=this.bones[f],m={rx:c.rest?.rx??0,ry:c.rest?.ry??0,rz:c.rest?.rz??0};for(let u of it){for(let[w,x]of c.drive?.[u]??[])m[u]+=o[w]*x;let y=c.wave?.[u];y&&(m[u]+=y[0]*o.energy*Math.sin(a*y[1]*Math.PI*2+y[2]));}for(let[u,y,w]of this.acting[f]){let x=r[u];x<.001&&!(Array.isArray(w)&&w[4])||(m[y]+=x*$t(w,a),Array.isArray(w)&&w[4]&&(this.spun[f][y]+=x*w[4]*s));}for(let u of it)m[u]+=this.spun[f][u];let d=this.world[f];F(d,this.world[c.parentIndex],ie(i,...c.pivot)),F(d,d,O(n,m.rx,m.ry,m.rz)),c.jiggle&&F(d,d,this.jiggle(f,d,s,l,h));}for(let f=0;f<this.bones.length;f++)this.inverse.set(be(h,this.world[f]),f*16);}jiggle(e,o,r,a,s){let{axis:i,length:n,freq:l,damping:h,maxAngle:f=.9}=this.bones[e].jiggle,c=ye(o,[0,0,0]),m=$e(c,fe(se(we(o,i)),n)),d=this.tips[e];if((!d||!(r>0))&&(d=this.tips[e]=d??{x:m,v:[0,0,0]},!(r>0)))return ne(a,[0,1,0],0);let u=l*Math.PI*2;for(let M=0;M<3;M++)d.v[M]+=(u*u*(m[M]-d.x[M])-2*h*u*d.v[M])*r,d.x[M]+=d.v[M]*r;d.x=$e(c,fe(se(Ce(d.x,c)),n)),be(s,o);let y=se(we(s,Ce(d.x,c))),w=se(i),x=st(w,y),E=Ae(x);if(E<1e-6)return ne(a,[0,1,0],0);let A=$(Math.atan2(E,at(w,y)),0,f);return ne(a,fe(x,1/E),A)}};var Ct=48,me=128,At=null,de=class t{static shared(){return At??=new t}canvas=document.createElement("canvas");gl;programs=new Map;parallel;lastSyncBuild=-1/0;constructor(){let e=this.canvas.getContext("webgl2",{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:"high-performance"});if(!e)throw new Error("WebGL2 is not available");this.gl=e,this.parallel=e.getExtension("KHR_parallel_shader_compile"),e.enable(e.SCISSOR_TEST),e.clearColor(0,0,0,0),this.canvas.addEventListener("webglcontextlost",o=>o.preventDefault()),this.canvas.addEventListener("webglcontextrestored",()=>{this.programs.clear(),e.enable(e.SCISSOR_TEST),e.clearColor(0,0,0,0);});}program(e){let o=this.programs.get(e);if(o==="failed")return null;if(o&&"program"in o)return o;if(!o){if(!this.parallel){let a=performance.now();if(a-this.lastSyncBuild<Ct)return null;this.lastSyncBuild=a;}let r=this.start(e);return this.programs.set(e,r),this.parallel?null:this.finish(e,r)}return this.parallel&&!this.gl.getProgramParameter(o.building,this.parallel.COMPLETION_STATUS_KHR)?null:this.finish(e,o)}reserve(e,o){let r=Math.ceil(e/me)*me,a=Math.ceil(o/me)*me;r>this.canvas.width&&(this.canvas.width=r),a>this.canvas.height&&(this.canvas.height=a);}start(e){let{gl:o}=this,r=(n,l)=>{let h=o.createShader(n);return o.shaderSource(h,l),o.compileShader(h),h},a=r(o.VERTEX_SHADER,rt),s=r(o.FRAGMENT_SHADER,e.fragment),i=o.createProgram();return o.attachShader(i,a),o.attachShader(i,s),o.linkProgram(i),{building:i,vertex:a,fragment:s}}finish(e,{building:o,vertex:r,fragment:a}){let{gl:s}=this;if(!s.getProgramParameter(o,s.LINK_STATUS)){let l=s.getShaderInfoLog(a)||s.getProgramInfoLog(o);throw this.programs.set(e,"failed"),new Error(`${e.spec.id}: shader failed to build
${l}`)}s.deleteShader(r),s.deleteShader(a);let i=Object.fromEntries(Object.keys(he).map(l=>[l,s.getUniformLocation(o,he[l].includes("[")?`${l}[0]`:l)])),n={program:o,uniforms:i,character:e};return this.programs.set(e,n),n}};var nt=.2,Rt=.1,W=class{constructor(e){this.canvas=e;let o=e.getContext("2d");if(!o)throw new Error("Canvas 2D is not available");this.target=o;}canvas;gpu=de.shared();target;character=null;load(e){this.character=e,this.gpu.program(e);}render(e){let o=this.character&&this.gpu.program(this.character);if(!o)return  false;let{gpu:r}=this,{gl:a}=r,{width:s,height:i}=e;(this.canvas.width!==s||this.canvas.height!==i)&&(this.canvas.width=s,this.canvas.height=i),r.reserve(s,i),a.viewport(0,0,s,i),a.scissor(0,0,s,i),a.clear(a.COLOR_BUFFER_BIT),a.useProgram(o.program);let n=o.uniforms,{spec:l}=o.character,h=e.pose,f=h.lift;return a.uniform2f(n.uResolution,e.width,e.height),a.uniform1f(n.uTime,e.time),a.uniform4f(n.uCamera,l.frame.target,l.frame.radius*e.framing/nt,nt,Rt),a.uniform4f(n.uBound,0,l.bound.y+f,0,l.bound.radius),a.uniformMatrix4fv(n.uBones,false,e.bones),a.uniform1f(n.uScaleFix,h.minScale),a.uniform4fv(n.uFaceA,h.faceA),a.uniform4fv(n.uFaceB,h.faceB),a.uniform4fv(n.uFaceC,h.faceC),a.uniform4fv(n.uFaceD,h.faceD),a.uniform3fv(n.uGlow,h.glow),a.uniform3fv(n.uShadow,e.shadow),a.uniform1f(n.uFloor,e.floor),a.uniform1f(n.uLift,f),a.uniform1f(n.uExposure,e.exposure*h.exposure),a.uniform3fv(n.uAlbedo,e.albedo),a.uniform1f(n.uGlowPool,l.glowPool??0),a.uniform4fv(n.uFxA,e.fx.a),a.uniform4fv(n.uFxB,e.fx.b),a.uniform4fv(n.uFxC,e.fx.c),a.uniform1i(n.uFxCount,e.fx.count),a.drawArrays(a.TRIANGLES,0,3),this.target.globalCompositeOperation="copy",this.target.drawImage(r.canvas,0,r.canvas.height-i,s,i,0,0,s,i),true}dispose(){this.character=null;}};var zt=/^#[0-9a-f]{6}$/i;function Ft(t,e,o,r){if(!e.includes(o))throw new Error(`${t}: palette names material "${o}". Materials are: ${e.join(", ")}.`);if(!zt.test(r))throw new Error(`${t}: palette colour for "${o}" must look like #rrggbb, got "${r}".`)}function lt(t,e){let o=Object.keys(t.materials),r=new Map;for(let[a,s]of Object.entries(e))Ft(t.id,o,a,s),r.set(a,j(s));for(let[a,s]of Object.entries(t.materials)){let i=s.shadeOf;if(!i||r.has(a)||!(i in e))continue;let n=j(t.materials[i].color),l=j(s.color),h=r.get(i);r.set(a,[0,1,2].map(f=>Math.min(1,n[f]>.001?h[f]*l[f]/n[f]:l[f])));}return r}function ct(t,e){let o={...t.materials};for(let[r,a]of lt(t,e))o[r]={...o[r],color:r in e?e[r]:De(a)};return {...t,materials:o}}function ee(t,e){let o=t.albedo.slice();if(!e)return o;for(let[r,a]of lt(t.spec,e))o.set(a,t.materials.indexOf(r)*3);return o}function qt(t,e){let{palette:o,...r}=e,a={...t,...r,motion:{...t.motion,...r.motion}};return o?ct(a,o):a}var Tt=t=>t;var Re=class{members=new Set;frame=0;last=0;time=0;quality=1;slow=0;fast=0;add(e){this.members.add(e),this.start();}delete(e){this.members.delete(e),this.members.size||this.stop();}start(){this.frame||typeof requestAnimationFrame>"u"||(this.last=performance.now(),this.frame=requestAnimationFrame(this.loop));}stop(){cancelAnimationFrame(this.frame),this.frame=0;}loop=e=>{this.frame=requestAnimationFrame(this.loop);let o=Math.max(0,e-this.last),r=Math.min(o/1e3,1/20);this.adapt(o),this.last=e,this.time+=r;for(let a of this.members)a.active&&a.tick(r,this.time,this.quality);};adapt(e){e>22&&e<200?this.slow++:this.slow=Math.max(0,this.slow-1),e<17.5?this.fast++:this.fast=0,this.slow>20?(this.quality=Math.max(.55,this.quality*.85),this.slow=0):this.fast>120&&this.quality<1&&(this.quality=Math.min(1,this.quality*1.08),this.fast=0);}},ze=new Re;var pt=new WeakMap;function ue(t){let e=pt.get(t);return e||pt.set(t,e=Ee(t)),e}var te=class{constructor(e,o,r={}){this.canvas=e;if(this.seed=r.seed??Math.random(),this.palette=r.palette,this.options={interactive:r.interactive??true,effects:r.effects??true,speed:r.speed??1,maxPixelRatio:r.maxPixelRatio??2,shadow:r.shadow??[.05,.06,.12],floor:r.floor??1,exposure:r.exposure??1,framing:r.framing??1,respectReducedMotion:r.respectReducedMotion??true},this.renderer=new W(e),this.load(o,r.state??"idle"),e.setAttribute("role","img"),this.reducedMotion=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,typeof IntersectionObserver<"u"){let a=new IntersectionObserver(([s])=>this.visible=s.isIntersecting);a.observe(e),this.cleanup.push(()=>a.disconnect());}this.options.interactive&&this.listen(),ze.add(this);}canvas;character;brain;rig;fx;renderer;options;seed;palette;albedo;visible=true;paused=false;time=0;reducedMotion;stillFrames=0;drawn=false;listeners={poke:new Set,state:new Set,ready:new Set};cleanup=[];source;get state(){return this.brain.state}get spec(){return this.source}get stats(){return this.character.stats}setState(e){if(!V.includes(e))throw new Error(`Unknown state "${e}". Expected one of ${V.join(", ")}.`);e!==this.brain.state&&(this.brain.setState(e),this.stillFrames=0,this.label(),this.emit("state",e));}setSpec(e,o){this.palette=o,this.load(e,this.brain.state);}setPalette(e){this.albedo=ee(this.character,e),this.palette=e,this.stillFrames=0;}setSpeed(e){this.options.speed=Math.max(0,e);}setEffects(e){this.options.effects=e;}poke(){this.brain.poke(),this.stillFrames=0,this.emit("poke",void 0);}pause(){this.paused=true;}play(){this.paused=false;}on(e,o){return this.listeners[e].add(o),()=>this.listeners[e].delete(o)}get active(){return !this.visible||this.paused?false:!this.still||this.stillFrames<2}tick(e,o,r){let a=this.still,s=e*this.options.speed;if(a)for(let f=0;f<90;f++)this.brain.update(1/60);else this.brain.update(s),this.time+=s;let i=a?0:this.time,n=this.brain.pose;this.rig.update(n.root,n.channels,n.weights,i,a?0:s),!a&&this.options.effects?this.fx.update(s,n,this.rig):this.fx.count=0,n.events.length=0;let l=Math.min(devicePixelRatio||1,this.options.maxPixelRatio)*r,h=this.renderer.render({pose:n,bones:this.rig.inverse,fx:this.fx,albedo:this.albedo,time:i,width:Math.max(1,Math.round(this.canvas.clientWidth*l)),height:Math.max(1,Math.round(this.canvas.clientHeight*l)),shadow:this.options.shadow,floor:this.options.floor,exposure:this.options.exposure,framing:this.options.framing});h&&a&&this.stillFrames++,h&&!this.drawn&&(this.drawn=true,this.emit("ready",void 0));}get ready(){return this.drawn}dispose(){ze.delete(this),this.cleanup.forEach(e=>e()),this.listeners.poke.clear(),this.listeners.state.clear(),this.listeners.ready.clear(),this.renderer.dispose();}load(e,o){this.source=e,this.character=ue(e),this.albedo=ee(this.character,this.palette),this.renderer.load(this.character),this.brain=new G(e.motion,this.seed),this.brain.setState(o),this.rig=new K(this.character.bones,this.character.acting),this.fx=new U(this.character,Q(this.seed+.37)),this.stillFrames=0,this.label();}get still(){return this.options.respectReducedMotion&&(this.reducedMotion?.matches??false)}emit(e,o){for(let r of this.listeners[e])r(o);}label(){this.canvas.hasAttribute("data-own-label")||this.canvas.setAttribute("aria-label",`${this.source.name}, ${this.brain.state}`);}listen(){let e=a=>{let s=this.canvas.getBoundingClientRect(),i=Math.max(s.width,1),n=(a.clientX-(s.left+s.width/2))/(i*1.1),l=(a.clientY-(s.top+s.height*.45))/(i*1.1);this.brain.pointer=Math.hypot(n,l)<3?{x:n,y:l}:null;},o=()=>this.brain.pointer=null,r=()=>this.poke();window.addEventListener("pointermove",e,{passive:true}),document.addEventListener("pointerleave",o),this.canvas.addEventListener("click",r),this.cleanup.push(()=>{window.removeEventListener("pointermove",e),document.removeEventListener("pointerleave",o),this.canvas.removeEventListener("click",r);});}};function Pt(t,e,o={}){let r=document.createElement("canvas");r.style.cssText="display:block;width:100%;height:100%;touch-action:manipulation",t.append(r);let a=new te(r,e,o),s=a.dispose.bind(a);return a.dispose=()=>{s(),r.remove();},a}var It=()=>new Promise(t=>requestAnimationFrame(t));async function Bt(t,e={}){let o=e.pixelRatio??Math.min(devicePixelRatio||1,2),r=Math.max(1,Math.round((e.size??256)*o)),a=document.createElement("canvas"),s=ue(t),i=new W(a);i.load(s);let n=new G(t.motion,e.seed??.5);n.setState(e.state??"idle");for(let m=0,d=Math.round((e.settle??1.5)*60);m<d;m++)n.update(1/60);let l=n.pose;e.turn&&F(l.root,O(C(),0,e.turn,0),l.root);let h=new K(s.bones,s.acting);h.update(l.root,l.channels,l.weights,0,0);let f=new U(s,Q(0));f.count=0;let c={pose:l,bones:h.inverse,fx:f,albedo:ee(s,e.palette),time:0,width:r,height:r,shadow:[.05,.06,.12],floor:e.floor??1,exposure:1,framing:e.framing??1};for(;!i.render(c);)await It();return i.dispose(),a}var Lt={submitted:"thinking",streaming:"speaking",error:"error",idle:"idle"};function ve(t,e,o=1400){if(e==="ready"){t.state==="speaking"||t.state==="thinking"?(t.setState("celebrating"),setTimeout(()=>t.state==="celebrating"&&t.setState("idle"),o)):t.setState("idle");return}t.setState(Lt[e]??"idle");}var Ot=["character","state","status","seed","speed","palette","interactive","effects","framing","floor"];function Fe(t){if(!t)return;let e=t.split(";").map(o=>o.split(":").map(r=>r.trim())).filter(([o,r])=>o&&r);return e.length?Object.fromEntries(e):void 0}function Vt(t,e="wobnimo-mascot"){if(typeof customElements>"u"||customElements.get(e))return;let o=new Map(t.map(a=>[a.id,a]));class r extends HTMLElement{static observedAttributes=Ot;instance=null;custom=null;canvas;constructor(){super();let s=this.attachShadow({mode:"open"});s.innerHTML="<style>:host{display:inline-block;width:160px;height:160px;position:relative}canvas{display:block;width:100%;height:100%;touch-action:manipulation}</style>",this.canvas=document.createElement("canvas"),s.append(this.canvas);}get mascot(){return this.instance}get state(){return this.getAttribute("state")??"idle"}set state(s){this.setAttribute("state",s);}get spec(){return this.custom??o.get(this.getAttribute("character")??"")??null}set spec(s){this.custom=s,this.rebuild();}connectedCallback(){this.rebuild();}disconnectedCallback(){this.instance?.dispose(),this.instance=null;}attributeChangedCallback(s,i,n){if(i===n||!this.isConnected)return;let l=this.instance;s==="status"&&l&&n?ve(l,n):s==="state"&&l&&V.includes(n)?l.setState(n):s==="speed"&&l?l.setSpeed(Number(n??1)):s==="effects"&&l?l.setEffects(n!=="false"):s==="palette"&&l?l.setPalette(Fe(n)):s==="character"&&l&&this.spec?l.setSpec(this.spec,Fe(this.getAttribute("palette"))):this.rebuild();}rebuild(){if(!this.isConnected)return;this.instance?.dispose(),this.instance=null;let s=this.spec;if(!s){console.warn(`<${e}>: unknown character "${this.getAttribute("character")}". Registered: ${[...o.keys()].join(", ")}.`);return}let i=this.getAttribute("seed"),n=new te(this.canvas,s,{state:V.includes(this.state)?this.state:"idle",seed:i===null?void 0:Number(i),speed:Number(this.getAttribute("speed")??1),palette:Fe(this.getAttribute("palette")),interactive:this.getAttribute("interactive")!=="false",effects:this.getAttribute("effects")!=="false",framing:Number(this.getAttribute("framing")??1),floor:Number(this.getAttribute("floor")??1)});n.on("poke",()=>this.dispatchEvent(new CustomEvent("poke",{bubbles:true,composed:true}))),n.on("state",h=>this.dispatchEvent(new CustomEvent("statechange",{detail:h,bubbles:true,composed:true}))),n.on("ready",()=>this.dispatchEvent(new CustomEvent("ready",{bubbles:true,composed:true}))),this.instance=n;let l=this.getAttribute("status");l&&ve(n,l);}}customElements.define(e,r);}export{G as Brain,Se as DEFAULT_FX,z as EXPRESSIONS,U as Fx,te as Mascot,K as Rig,V as STATES,pe as SpecError,W as WebGL2Renderer,ee as albedo,Ee as compile,ue as compileCached,Tt as defineCharacter,Vt as defineMascotElement,ve as driveFromStatus,Pt as mount,ct as recolor,Bt as snapshot,qt as variant};