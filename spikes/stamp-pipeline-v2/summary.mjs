// Per pinned disc: v2 against today's design (alpha over half, at 2048), and each step's time; into runs/../summary.json.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {PINNED,RUNS,readRaw} from './common.mjs';
const S=2048,c=S/2,out={};
const qa=JSON.parse(readFileSync(RUNS+'../qa.json'));
const sup=existsSync(RUNS+'../supervise/results.json')?JSON.parse(readFileSync(RUNS+'../supervise/results.json')):{};
for(const [name,disc] of Object.entries(PINNED)){
 const dir=RUNS+name+'/',v=readRaw(dir+'v2-alpha2048.raw.gz'),p=readRaw(dir+'prod-design.raw.gz'),pj=JSON.parse(readFileSync(dir+'prod.json')),vj=JSON.parse(readFileSync(dir+'v2.json'));
 let both=0,onlyV=0,onlyP=0;for(let k=0;k<S*S;k++){const a=v[k]>127,b=p[k]>127;both+=a&&b;onlyV+=a&&!b;onlyP+=b&&!a;}
 const s=sup[name];
 out[name]={size:{today:2048,v2:vj.size},iou:+(both/(both+onlyV+onlyP)).toFixed(3),v2Only:onlyV,todayOnly:onlyP,
  marks:vj.marks,ms:{today:{crop:pj.ms.crop,extract:pj.ms.extract},v2:{...vj.ms,qa:qa[name].ms,supervisor:s?.supervisor.ms??null,haikuQa:s?.qa.ms??null}},
  usd:s?{supervisor:s.supervisor.apiEstimate.usd,haikuQa:s.qa.apiEstimate.usd,samMeasured:null,total:+(s.supervisor.apiEstimate.usd+s.qa.apiEstimate.usd).toFixed(5)}:null};
 console.log(name,JSON.stringify({iou:out[name].iou,v2Only:onlyV,todayOnly:onlyP,ms:out[name].ms.v2,usd:out[name].usd?.total}));
}
writeFileSync(RUNS+'../summary.json',JSON.stringify(out,null,1));
