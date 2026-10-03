// Storage/display helpers only. V1 never transforms consensus flight numbers.
export function plasticOptions(disc, catalog) {
 const brand = catalog.brands[disc.brand];
 const reference = disc.referencePlastic || catalog.moldReferences?.[disc.id]?.plastic || brand?.reference || '';
 return {reference, options: [...new Set([...(brand?.options || []), ...(reference ? [reference] : [])])]};
}
export function defaultDiscDetails(disc, catalog) {
 const weight = Number(disc.typicalMaxWeight ?? disc.specs?.['Max weight']);
 return {mold_id: disc.id, plastic: plasticOptions(disc, catalog).reference, wear: 10,
  weight_g: Number.isFinite(weight) && weight >= 130 ? Math.min(180, Math.floor(weight)) : 175, notes: ''};
}
export function validateDiscDetails(data, disc, catalog, defaults = false) {
 if (!disc) throw new Error('Choose a mold from the Directory.');
 const value = {...(defaults ? defaultDiscDetails(disc, catalog) : {}), ...data};
 if (typeof value.plastic !== 'string' || !value.plastic.trim() || value.plastic.trim().length > 60) throw new Error('Enter a plastic (up to 60 characters).');
 if (!Number.isInteger(value.wear) || value.wear < 1 || value.wear > 10) throw new Error('Wear must be a whole number from 1 to 10.');
 if (!Number.isInteger(value.weight_g) || value.weight_g < 130 || value.weight_g > 180) throw new Error('Weight must be a whole number from 130 to 180 g.');
 if (value.notes != null && (typeof value.notes !== 'string' || value.notes.length > 240)) throw new Error('Notes can be up to 240 characters.');
 return {mold_id: disc.id, plastic: value.plastic.trim(), wear: value.wear, weight_g: value.weight_g, notes: value.notes?.trim() || null};
}
export function validateBagSettings(data, catalog) {
 if (typeof data.bag_model !== 'string' || !data.bag_model.trim() || data.bag_model.trim().length > 80) throw new Error('Enter a bag name (up to 80 characters).');
 const bag_model = data.bag_model.trim(), model = catalog.models.find(m => m.name === bag_model);
 const capacity = model?.capacity ?? data.capacity;
 if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) throw new Error('Capacity must be a whole number from 1 to 500.');
 return {bag_model, capacity};
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
