// Compose evidence only: unchanged source bytes and unchanged browser screenshots.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='docs/assets/stamp-scale-fix',rows=JSON.parse(fs.readFileSync(dir+'/measurements.json')),proof=JSON.parse(fs.readFileSync(dir+'/verification.json')).results;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const pct=x=>(x*100).toFixed(2)+'%',uri=file=>'data:image/'+(file.endsWith('.webp')?'webp':'png')+';base64,'+fs.readFileSync(file).toString('base64');
try{
 for(const row of rows)for(const view of row.mold==='hades'?['top']:['top','bag']){
  const wide=view==='bag',width=wide?1900:1440,source=row.mold==='hades'?dir+'/hades-source.webp':'source-data/stamp-sources/'+row.mold+'.png';
  const crop=(src,bounds,sourceSize)=>{const scale=380/Math.max(bounds[2]-bounds[0],bounds[3]-bounds[1]);return `<div class="crop"><img src="${src}" style="width:${sourceSize[0]*scale}px;max-width:none;position:absolute;left:${(440-(bounds[0]+bounds[2])*scale)/2}px;top:${(440-(bounds[1]+bounds[3])*scale)/2}px"></div>`;};
  const sourceTile=crop(uri(source),row.sourceDiscBounds,row.sourceSize);
  const tiles=[`<section><h2>Source photo</h2><p>Stamp / full disc: <b>${pct(row.diameterFraction)}</b></p>${sourceTile}<small>${row.stampDiameterPx} px ink / ${row.sourceDiscDiameterPx} px disc</small></section>`];
  for(const phase of ['before','after']){
   const record=proof[phase][row.mold],measurement=wide?record.bag:record,file=`${dir}/${phase}-${row.mold}-${wide?'bag':'viewer'}.png`;
   const body=wide?`<img class="bag" src="${uri(file)}">`:crop(uri(file),record.discBounds,[994,651]);
   tiles.push(`<section><h2>${phase==='before'?'Before':'After'} · ${wide?'Bag float':'Top viewer'}</h2><p>Stamp / full disc: <b>${pct(measurement.renderedFraction)}</b></p>${body}<small>${phase==='after'?'Applied physical/source fraction: '+pct(row.diameterFraction):'Legacy 6.2 cm texture radius'}</small></section>`);
  }
  const html=`<!doctype html><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:30px;background:#f1f3f4;color:#17222c;font-family:Arial,sans-serif}h1{font-size:32px;margin:0 0 10px}header p{font-size:19px;margin:0 0 24px}.grid{display:grid;grid-template-columns:${wide?'440px 1fr 1fr':'repeat(3,1fr)'};gap:20px}section{background:white;padding:14px;overflow:hidden}h2{font-size:25px;margin:0 0 10px}p{font-size:21px;margin:0 0 12px}small{display:block;font-size:16px;margin-top:12px}.crop{position:relative;width:440px;height:440px;overflow:hidden}.bag{width:100%;height:440px;object-fit:contain}footer{font-size:17px;margin-top:22px;line-height:1.4}</style><header><h1>${row.mold.toUpperCase()} · stock stamp scale recalibration</h1><p>Same approved alpha, ink and mold assignment. Fractions use the FULL outer disc diameter.</p></header><div class="grid">${tiles.join('')}</div><footer>${wide?'Ordinary production desktop staged-disc pose beside the bag.':'Production enlarged Top viewer, 1.6× fitted camera distance. Crops normalize disc size for comparison; original screenshots are retained.'}<br>${row.mold==='hades'?'Hades b0686ac: isolated local verification only; sweep branch unchanged.':'Base d4a4944 → codex/stamp-scale-fix. Source image and extraction unchanged.'} After/source difference: ${((wide?proof.after[row.mold].bag:proof.after[row.mold]).renderedFraction*100-row.diameterFraction*100).toFixed(2)} percentage points.</footer>`;
  const page=await browser.newPage({viewport:{width,height:800},deviceScaleFactor:1});await page.setContent(html);await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));await page.screenshot({path:`${dir}/proof-${row.mold}-${view}.png`,fullPage:true});await page.close();
 }
}finally{await browser.close();}
