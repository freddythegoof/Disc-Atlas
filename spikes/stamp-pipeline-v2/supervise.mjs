// Step 5, the model as supervisor only: it never touches the asset's pixels. Sonnet 5.5 reads the photo beside v2's
// extracted composite and returns JSON (stamp region, the stamp's text, colour names, confidence, and an "extraction
// looks wrong because…" verdict); Haiku 5.5 answers the cheap capture questions from the photo alone.
// No API key exists on this machine, so each call goes through the `claude` CLI headless (`-p`, JSON output, Read only).
// Cost is reported two ways: the CLI's own total (it carries Claude Code's system prompt, cached), and the API-equivalent
// for the call itself: the images' tokens (w × h / 750) + the prompt + the output, at list price (Sonnet 5.5 $2/$10,
// Haiku 5.5 $0.10/$0.50 per MTok).
import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import sharp from 'sharp';
import {PINNED,RUNS,readRaw} from './common.mjs';

const PRICE={'claude-sonnet-5-5':[2,10],'claude-haiku-5-5':[.1,.5]};
const SUPERVISOR=`You are checking a disc golf stamp extraction. Read the image at IMAGE with the Read tool. Left: the photo of the disc (cropped to the disc). Right: the extracted stamp artwork laid on a flat disc of the plastic's colour. The extraction should hold every printed element of the stamp (lettering, logos, line work, flight numbers) and nothing that is not print (glare, shading, plastic mottling, marks on the back seen through translucent plastic, the injection gate). Reply with ONLY one JSON object, no prose, with these keys:
{"stamp_region":[x0,y0,x1,y1] (the stamp's bounding box on the LEFT photo, 0-1 of its width/height),
"ocr":[every line of printed text you can read on the photo, as printed],
"plastic_colour":"plain colour name","stamp_colours":["plain colour names"],
"missing_in_extraction":[printed text or elements present on the photo but missing or broken on the right],
"extra_in_extraction":[things on the right that are not print on the photo],
"verdict":"ok" or "wrong","because":"one sentence","confidence":0-1}`;
const QA=`Read the image at IMAGE with the Read tool: a photo of a disc golf disc. Reply with ONLY one JSON object, no prose:
{"whole_disc_in_frame":true/false,"stamp_legible":true/false,"side":"top" or "bottom","glare_over_stamp":true/false,"retake":"one plain-words sentence for the user, or null"}`;

const OUT=RUNS+'../supervise/';
const only=process.argv.slice(2);
function call(model,prompt,image){
 const t0=performance.now();
 const r=spawnSync('claude',['-p',prompt.replace('IMAGE',image),'--model',model,'--output-format','json','--allowedTools','Read','--add-dir',OUT,'--max-turns','4'],{encoding:'utf8',timeout:300000});
 const ms=Math.round(performance.now()-t0);let j=null;try{j=JSON.parse(r.stdout);}catch{}
 return {ms,raw:j,stderr:r.stderr?.slice(0,500)};
}
const parse=text=>{try{return JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));}catch{return null;}};
const imageTokens=(w,h)=>{const s=Math.min(1,1568/Math.max(w,h));return Math.ceil(Math.round(w*s)*Math.round(h*s)/750);};
const promptTokens=p=>Math.ceil(p.length/3.5);
const api=(model,inTok,outTok)=>+((inTok*PRICE[model][0]+outTok*PRICE[model][1])/1e6).toFixed(5);
await import('node:fs').then(fs=>fs.mkdirSync(OUT,{recursive:true}));
const results={};
for(const [name,disc] of Object.entries(PINNED)){
 if(only.length&&!only.includes(name))continue;
 const dir=RUNS+name+'/',S=2048,photo=readRaw(dir+'prod-input.raw.gz'),v2=readRaw(dir+'v2-color2048.raw.gz');
 const plate=JSON.parse(readFileSync(dir+'prod.json')).plateColor,P=[1,3,5].map(i=>parseInt(plate.slice(i,i+2),16));
 const left=Buffer.alloc(S*S*3),right=Buffer.alloc(S*S*3),c=S/2;
 for(let p=0;p<S*S;p++){const i=p%S,j=(p-i)/S,inDisc=Math.hypot(i+.5-c,j+.5-c)<=c,a=v2[p*4+3]/255;
  for(let k=0;k<3;k++){left[p*3+k]=inDisc?photo[p*4+k]:255;right[p*3+k]=inDisc?Math.round(a*v2[p*4+k]+(1-a)*P[k]):255;}}
 const L=await sharp(left,{raw:{width:S,height:S,channels:3}}).resize(784,784).png().toBuffer(),R=await sharp(right,{raw:{width:S,height:S,channels:3}}).resize(784,784).png().toBuffer();
 const pair=OUT+name+'-pair.png',single=OUT+name+'-photo.png';
 await sharp({create:{width:1568,height:784,channels:3,background:'#fff'}}).composite([{input:L,left:0,top:0},{input:R,left:784,top:0}]).png().toFile(pair);
 await sharp(L).png().toFile(single);
 const sup=call('claude-sonnet-5-5',SUPERVISOR,pair),qa=call('claude-haiku-5-5',QA,single);
 const one=(model,res,img,prompt)=>{const text=res.raw?.result||'',out=res.raw?.usage?.output_tokens??Math.ceil(text.length/3.5),inTok=img+promptTokens(prompt);
  return {model,ms:res.ms,json:parse(text),cliCostUsd:res.raw?.total_cost_usd??null,cliUsage:res.raw?.usage??null,turns:res.raw?.num_turns??null,
   apiEstimate:{imageTokens:img,inputTokens:inTok,outputTokens:out,usd:api(model,inTok,out)},error:res.raw?null:res.stderr};};
 results[name]={supervisor:one('claude-sonnet-5-5',sup,imageTokens(1568,784),SUPERVISOR),qa:one('claude-haiku-5-5',qa,imageTokens(784,784),QA)};
 writeFileSync(OUT+'results.json',JSON.stringify(Object.assign(existsSync(OUT+'results.json')?JSON.parse(readFileSync(OUT+'results.json')):{},results),null,1));
 console.log(name,JSON.stringify({sup:results[name].supervisor.json?.verdict,because:results[name].supervisor.json?.because,ms:[sup.ms,qa.ms],cli:[results[name].supervisor.cliCostUsd,results[name].qa.cliCostUsd]}));
}
