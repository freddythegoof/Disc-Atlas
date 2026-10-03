// Storage/display helpers only. V1 never transforms consensus flight numbers.
export function plasticOptions(disc, catalog) {
 const brand = catalog.brands[disc.brand];
 const reference = disc.referencePlastic || catalog.moldReferences?.[disc.id]?.plastic || brand?.reference || '';
 return {reference, options: [...new Set([...(brand?.options || []), ...(reference ? [reference] : [])])]};
}
export function defaultDiscDetails(disc, catalog) {
 const weight = Number(disc.typicalMaxWeight ?? disc.specs?.['Max weight']);
 return {mold_id: disc.id, plastic: plasticOptions(disc, catalog).reference, wear: 10,
  weight_g: Number.isFinite(weight) && weight >= 130 ? Math.min(180, Math.floor(weight)) : 175, notes: '',
  color:plasticColor(disc.brand,plasticOptions(disc,catalog).reference,catalog),in_bag:true};
}
export function validateDiscDetails(data, disc, catalog, defaults = false) {
 if (!disc) throw new Error('Choose a mold from the Directory.');
 const value = {...(defaults ? defaultDiscDetails(disc, catalog) : {}), ...data};
 if (typeof value.plastic !== 'string' || !value.plastic.trim() || value.plastic.trim().length > 60) throw new Error('Enter a plastic (up to 60 characters).');
 if (!Number.isInteger(value.wear) || value.wear < 1 || value.wear > 10) throw new Error('Wear must be a whole number from 1 to 10.');
 if (!Number.isInteger(value.weight_g) || value.weight_g < 130 || value.weight_g > 180) throw new Error('Weight must be a whole number from 130 to 180 g.');
 if (value.notes != null && (typeof value.notes !== 'string' || value.notes.length > 240)) throw new Error('Notes can be up to 240 characters.');
 const color=data.color===undefined?plasticColor(disc.brand,value.plastic.trim(),catalog):data.color,in_bag=value.in_bag===undefined?true:value.in_bag;
 if(!validColor(color))throw new Error('Choose a six-digit hex disc color.');
 if(typeof in_bag!=='boolean')throw new Error('Choose Bag or Storage.');
 return {mold_id: disc.id, plastic: value.plastic.trim(), wear: value.wear, weight_g: value.weight_g, notes: value.notes?.trim() || null,color:color.toLowerCase(),in_bag};
}
export function validateBagSettings(data, catalog) {
 if (typeof data.bag_model !== 'string' || !data.bag_model.trim() || data.bag_model.trim().length > 80) throw new Error('Enter a bag name (up to 80 characters).');
 const bag_model = data.bag_model.trim(), model = catalog.models.find(m => m.name === bag_model);
 const fixed=model?.presetSplit;
 const main_capacity=fixed?model.main_capacity:(data.main_capacity ?? data.capacity);
 const putter_capacity=fixed?model.putter_capacity:(data.putter_capacity ?? 0);
 const extra_capacity=fixed?(model.extra_capacity ?? 0):0;
 if([main_capacity,putter_capacity,extra_capacity].some(n=>!Number.isInteger(n)||n<0||n>500))throw new Error('Pocket capacities must be whole numbers from 0 to 500.');
 const capacity=main_capacity+putter_capacity+extra_capacity;
 if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) throw new Error('Capacity must be a whole number from 1 to 500.');
 if(!fixed && data.capacity!==undefined && data.capacity!==capacity)throw new Error('Total capacity must match your pocket capacities.');
 const bag_color=data.bag_color===undefined?'#343c49':data.bag_color;if(!validColor(bag_color))throw new Error('Choose a six-digit hex bag color.');
 return {bag_model,capacity,main_capacity,putter_capacity,extra_capacity,bag_color:bag_color.toLowerCase()};
}
export const validColor=color=>typeof color==='string'&&/^#[0-9a-f]{6}$/i.test(color);
export function plasticColor(brand,plastic,catalog){return catalog.brands[brand]?.colors?.[plastic] || catalog.defaultColor || '#e6c668';}
export function bagPalette(color){
 const channels=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const hex=values=>'#'+values.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
 return {primary:color,secondary:hex(channels.map(v=>v*.75)),accent:hex(channels.map(v=>v+(255-v)*.36))};
}
export function bagSlots(items,settings,lookup){
 const bagged=items.filter(i=>i.in_bag!==false && i.in_bag!==0);
 const sort=(a,b)=>(lookup(b.mold_id)?.speed ?? -1)-(lookup(a.mold_id)?.speed ?? -1) || a.id.localeCompare(b.id);
 const main=bagged.filter(i=>bagClass(lookup(i.mold_id))!=='putter').sort(sort),putter=bagged.filter(i=>bagClass(lookup(i.mold_id))==='putter').sort(sort);
 const mainCount=(settings.main_capacity ?? settings.capacity)+(settings.extra_capacity ?? 0),putterCount=settings.putter_capacity ?? 0;
 // Putters beyond their pocket use spare main slots; never lose an owned copy.
 const pocket=putter.splice(0,putterCount);main.push(...putter);main.sort(sort);
 return {main:Array.from({length:mainCount},(_,i)=>({item:main[i]||null,index:i})),putter:Array.from({length:putterCount},(_,i)=>({item:pocket[i]||null,index:i})),overflow:main.slice(mainCount)};
}
export function wearLabel(wear) {
 return wear === 10 ? 'Factory new' : wear >= 8 ? 'Like new' : wear >= 5 ? 'Seasoned' : wear >= 3 ? 'Well-worn' : 'Beat · different stability class';
}
export function bagClass(disc) {
 const category = disc?.category || '';
 if (/distance/i.test(category)) return 'distance';
 if (/control|fairway/i.test(category)) return 'fairway';
 if (/mid/i.test(category)) return 'mid';
 if (/putt|approach/i.test(category)) return 'putter';
 if (disc?.speed == null) return 'unknown';
 return disc.speed <= 3 ? 'putter' : disc.speed <= 5 ? 'mid' : disc.speed <= 9 ? 'fairway' : 'distance';
}
