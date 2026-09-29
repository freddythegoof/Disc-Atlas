const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={window:{},URL};vm.createContext(ctx);for(const f of ['affiliate-config.js','retailer-products.js','shopping.js'])vm.runInContext(fs.readFileSync('public/'+f,'utf8'),ctx);
const discs=JSON.parse(fs.readFileSync('public/data.json')).discs;
for(const d of discs){const offers=ctx.window.AtlasShopping.offers(d);assert(offers.length>=9);assert(new Set(offers.map(o=>o.id)).size===offers.length);for(const o of offers){assert.equal(new URL(o.url).protocol,'https:');assert.equal(o.affiliate,false);if(!o.matched&&!o.browse)assert(new URL(o.url).searchParams.get(o.param).includes((d.catalogName||d.name).trim()));}}
const d=discs.find(d=>ctx.window.AtlasRetailerProducts[d.id]?.infinite);const base=ctx.window.AtlasShopping.offers(d).find(x=>x.id==='infinite').url;
ctx.window.AtlasAffiliateConfig.infinite={approved:true,queryParams:{partner:'test-only'}};assert.equal(new URL(ctx.window.AtlasShopping.offers(d)[0].url).searchParams.get('partner'),'test-only');assert(ctx.window.AtlasShopping.render(d).includes('sponsored'));assert(ctx.window.AtlasShopping.render(d).includes('We may earn a commission'));
ctx.window.AtlasAffiliateConfig.infinite={approved:false,queryParams:{partner:'test-only'}};assert.equal(ctx.window.AtlasShopping.offers(d)[0].url,base);
ctx.window.AtlasAffiliateConfig.infinite={approved:true,links:{[base]:'javascript:alert(1)'}};assert.equal(ctx.window.AtlasShopping.offers(d)[0].url,base);
console.log('Verified retailer coverage for all '+discs.length+' approvals; affiliate opt-in and disclosure gates pass.');
