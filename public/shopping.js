(() => {
 const stores=[
  {id:'infinite',name:'Infinite Discs'},
  {id:'dgc',name:'Disc Golf Center',browse:'https://www.discgolfcenter.com/disc_golf_search.php'},
  {id:'paxi',name:'Paxi Disc Golf',search:'https://paxidiscgolf.com/search',param:'q',extra:{type:'product'}},
  {id:'otb',name:'OTB Discs',search:'https://otbdiscs.com/',param:'s',extra:{post_type:'product'}},
  {id:'marshall',name:'Marshall Street',search:'https://www.marshallstreetdiscgolf.com/',param:'s',extra:{post_type:'product'}},
  {id:'deals',name:'Disc Golf Deals USA',search:'https://discgolfdealsusa.com/search',param:'q'},
  {id:'g3t',name:'Gotta Go Gotta Throw',search:'https://gottagogottathrow.com/search',param:'q'},
  {id:'reaper',name:'Reaper Discs',search:'https://reaperdiscs.com/search',param:'q',extra:{type:'product'}},
  {id:'foundation',name:'Foundation',search:'https://foundationdiscs.com/search',param:'q'},
  {id:'discstore',name:'Disc Store',search:'https://www.discstore.com/search',param:'q'}
 ];
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function tracking(store,url){
  const c=window.AtlasAffiliateConfig?.[store.id];let target=url,affiliate=false;
  if(c?.approved){
   const issued=c.links?.[url];
   if(issued){try{if(new URL(issued).protocol==='https:'){target=issued;affiliate=true;}}catch{}}
   else if(Object.keys(c.queryParams||{}).length){const u=new URL(url);for(const [k,v]of Object.entries(c.queryParams))u.searchParams.set(k,v);target=u.href;affiliate=true;}
  }
  return {url:target,affiliate,code:c?.approved?c.discountCode:''};
 }
 function offers(d){
  const exact=window.AtlasRetailerProducts?.[d.id]||{};
  return stores.flatMap(s=>{
   let url=exact[s.id],matched=!!url;
   if(!url&&s.search){const u=new URL(s.search);u.searchParams.set(s.param,`${d.brand} ${d.catalogName||d.name}`.trim());for(const [k,v]of Object.entries(s.extra||{}))u.searchParams.set(k,v);url=u.href;}
   if(!url&&s.browse)url=s.browse;
   return url?[{...s,matched,...tracking(s,url)}]:[];
  });
 }
 function row(o){return `<a class="shop-link" href="${escape(o.url)}" target="_blank" rel="noopener${o.affiliate?' sponsored':''}"><span><strong>${escape(o.name)}</strong><small>${o.matched?'View disc catalog':o.browse?'Browse retailer catalog':'Search retailer'}${o.affiliate?' · Affiliate link':''}${o.code?' · Code: '+escape(o.code):''}</small></span><span aria-hidden="true">↗</span></a>`;}
 function render(d){const list=offers(d),matched=list.filter(o=>o.matched),search=list.filter(o=>!o.matched),paid=list.some(o=>o.affiliate||o.code);
  return `<section class="disc-shopping" aria-label="Find this disc"><div class="shop-heading"><h3>Find this disc</h3><span>${list.length} retailers</span></div><p class="shop-note">${paid?'We may earn a commission when you buy through affiliate links or use our codes, at no extra cost to you.':'Independent retailer links. No affiliate commission is currently earned.'}</p>${matched.map(row).join('')}<details class="shop-searches" ${matched.length?'':'open'}><summary>${window.DropdownIndicator?.indicator('lg')??''}Explore ${search.length} ${matched.length?'more ':''}retailers</summary>${search.map(row).join('')}</details><p class="shop-note">Stock and prices are checked at the retailer. Confirm the mold, version, plastic and weight; search results may include related discs.</p></section>`;
 }
 window.AtlasShopping={offers,render};
})();
