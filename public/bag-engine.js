// Transparent, catalog-based coverage checks, shared by the map and coach.
export function analyzeBag(profile,items,catalog){
 const p=profile||{},owned=new Set(items.map(i=>i.discId)),bag=items.map(i=>catalog.find(d=>d.id===i.discId)).filter(Boolean),rated=bag.filter(d=>d.speed!=null);
 const mph=p.releaseSpeed==null?null:p.speedUnit==='kmh'?p.releaseSpeed/1.609344:p.releaseSpeed;
 let maxSpeed=9,reason='With throwing measurements unknown, suggestions emphasize controllable putters, mids and fairways.';
 if(p.level==='new'){maxSpeed=7;reason='For a newer player, control discs get priority over high-speed drivers.';}
 else if(p.distance!=null){maxSpeed=p.distance<220?7:p.distance<300?9:p.distance<375?11:14;reason=`Using your reported ${p.distance} ft controlled distance to set a rough speed ceiling of ${maxSpeed}. This is a fitting starting point, not a measured rule.`;}
 else if(mph!=null){maxSpeed=mph<40?7:mph<50?9:mph<60?11:14;reason=`Using your reported release speed to set a rough speed ceiling of ${maxSpeed}. Release angle and technique still matter.`;}
 const roles=[
 {key:'putter',name:'Putting / touch putter',why:'A controllable low-speed option for putting and touch shots.',test:d=>d.speed<=3&&d.fade<=3&&d.turn>=-2,target:2},
 {key:'mid',name:'Straight midrange',why:'A point-and-shoot option for controlled approaches and tight gaps.',test:d=>d.speed>=4&&d.speed<=6&&d.turn>=-2&&d.turn<=0&&d.fade<=2,target:5},
 {key:'fairway',name:'Neutral fairway',why:'A control driver for placement shots without a strong finishing fade.',test:d=>d.speed>=6&&d.speed<=9&&d.turn>=-2&&d.turn<=0&&d.fade<=2,target:7},
 {key:'turnover',name:'Understable control disc',why:'An easier-turning option for hyzer flips and turnover lines.',test:d=>d.speed>=4&&d.speed<=9&&d.turn<=-2&&d.turn+d.fade<=0,target:p.level==='new'?5:7},
 {key:'approach',name:'Overstable approach',why:p.style==='forehand'?'A short forehand option with a dependable finish. Rim feel still needs a hands-on check.':'A short utility option for a stronger finish or moderate wind.',test:d=>d.speed<=5&&d.fade>=3&&d.turn>=-1,target:4}
 ];
 if(maxSpeed>=11)roles.push({key:'distance',name:'Distance driver',why:'An optional distance slot based on your reported throwing profile.',test:d=>d.speed>=10&&d.speed<=maxSpeed&&d.turn>=-3&&d.fade<=3,target:11});
 const available=d=>d.speed!=null&&(d.production?.status==='active'||d.production?.status==='catalog'||d.production?.status==='catalog_listed'||d.production?.status==='retired'&&d.production.retirementAnnouncedAt>='2024-09-23'&&d.production.retirementAnnouncedAt<='2026-09-23');
 // Match the atlas collection's catalog-based availability, never infer production from approval date.
 const candidates=catalog.filter(d=>available(d)&&!owned.has(d.id)&&d.speed<=maxSpeed);
 const checks=roles.map(r=>{const matches=rated.filter(r.test);const options=matches.length?[]:candidates.filter(r.test).sort((a,b)=>Math.abs(a.speed-r.target)-Math.abs(b.speed-r.target)||a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));const seen=new Set(),picks=[];for(const d of options){const key=d.brand+'|'+d.name.toLowerCase();if(!seen.has(key)){picks.push(d);seen.add(key);}if(picks.length===3)break;}return {key:r.key,name:r.name,why:r.why,covered:!!matches.length,matches:matches.map(d=>d.id),candidates:picks.map(d=>d.id)};});
 const duplicates=[...owned].filter(id=>items.filter(i=>i.discId===id).length>1);
 return {checks,maxSpeed,reason,unrated:bag.length-rated.length,duplicates,empty:!bag.length,spinNote:p.rpm==null?'Spin is unknown; no RPM-based adjustment is made.':'RPM is recorded for coaching context. This tool does not translate RPM into a flight-number correction.'};
}
