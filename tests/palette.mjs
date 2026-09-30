/* Run with PLAYWRIGHT_MODULE set to a Playwright installation and ATLAS_URL
 * pointing at the running atlas. Checks rendered theme colors, not hex literals. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
// Machado et al., full-severity matrices, applied to linear sRGB.
// https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
const matrices={normal:[[1,0,0],[0,1,0],[0,0,1]],protanopia:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],deuteranopia:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]]};
const linear=hex=>hex.match(/[a-f\d]{2}/gi).map(c=>{const v=parseInt(c,16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
const simulate=(rgb,m)=>m.map(row=>Math.max(0,Math.min(1,row.reduce((s,v,i)=>s+v*rgb[i],0))));
const lab=([r,g,b])=>{
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
};
const luminance=rgb=>rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},colorScheme:'light'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report=[];
try{
 await page.goto(process.env.ATLAS_URL||'http://localhost:5173');
 await page.locator('.atlas-marker').first().waitFor();
 for(const theme of ['light','midnight','charcoal']){
  await page.evaluate(theme=>{applyTheme(theme);},theme);
  const palette=await page.evaluate(()=>{
   const css=getComputedStyle(document.documentElement);
   const saved=[...selectedBrands];selectedBrands.clear();
   for(let i=0;i<7;i++)selectedBrands.add(String(i));
   const brands=[...selectedBrands].map(brandColor);selectedBrands.clear();saved.forEach(b=>selectedBrands.add(b));
   return {types:['putter','mid','fairway','distance'].map(k=>colors[k]),brands,background:css.getPropertyValue('--map-bg').trim(),edge:css.getPropertyValue('--marker-edge').trim()};
  });
  for(const [vision,matrix] of Object.entries(matrices)){
   const bg=simulate(linear(palette.background),matrix);
   for(const kind of ['types','brands']){
    const values=palette[kind].map(c=>simulate(linear(c),matrix));
    let min=Infinity;
    for(let i=0;i<values.length;i++){
     const c=contrast(values[i],bg),edge=palette.edge?contrast(simulate(linear(palette.edge),matrix),bg):0;
     assert.ok(Math.max(c,edge)>=3,`${theme}/${vision}/${kind}/${i}: marker boundary needs 3:1 contrast (fill ${c.toFixed(2)})`);
     for(let j=0;j<i;j++)min=Math.min(min,Math.hypot(...lab(values[i]).map((v,k)=>v-lab(values[j])[k])));
    }
    // A regression guard, not a guarantee of individual perception.
    assert.ok(min>=.065,`${theme}/${vision}/${kind}: closest pair OKLab distance ${min.toFixed(3)} < .065`);
    report.push({theme,vision,kind,minDistance:+min.toFixed(3)});
   }
  }
 }
 await page.evaluate(()=>applyTheme('light'));
 await page.locator('#zoomReset').click();
 await page.waitForTimeout(800);
 for(const selector of ['.legend .dot','.atlas-marker.is-dot .map-dot']){
  const edge=await page.locator(selector).first().evaluate(el=>{
   const style=getComputedStyle(el);
   return {width:parseFloat(style.borderTopWidth),style:style.borderTopStyle,opacity:style.opacity};
  });
  assert.ok(edge.width>=1&&edge.style==='solid'&&edge.opacity==='1',`${selector}: contrast edge is actually rendered: ${JSON.stringify(edge)}`);
 }
 assert.match(await page.locator('.atlas-marker').first().getAttribute('aria-label'),/Putter|Midrange|Fairway|Distance/,'Markers identify type without color');
 assert.deepEqual(errors,[]);
 fs.mkdirSync('outputs/palette',{recursive:true});
 fs.writeFileSync('outputs/palette/validation.json',JSON.stringify(report,null,2));
 console.log(report);
}finally{await browser.close();}
